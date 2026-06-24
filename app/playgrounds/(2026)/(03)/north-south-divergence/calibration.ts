import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    DEFAULT_SCENARIO,
    DEFAULT_TIMELINE,
    normalizeWeights,
    scoreRegion,
    gapScore,
    type TimeBin,
} from './logic';


/**
 * The playground has a deterministic aggregation core (scoreRegion and
 * gapScore) and a stochastic attribution layer (Monte Carlo Shapley). Only the
 * deterministic core is closed-form, so the calibration verifies that and
 * leaves the sampled Shapley values out of scope.
 *
 * Every `predicted` below is produced by calling the live logic functions.
 * Every `expected` is an independent closed-form value worked out by hand (the
 * defining identity of each aggregator), never copied from the prediction. If a
 * function were edited to break one of these identities, the matching row would
 * diverge.
 *
 * The fixed test bin is "industrial takeoff" (id ir1, 1750-1850), the period
 * where the North-South gap opens in the default timeline. Weights are the
 * default accelerant weights, which renormalise to sum to 1.
 */

const W = DEFAULT_SCENARIO.weights;
const NW = normalizeWeights(W);
const IR1: TimeBin = DEFAULT_TIMELINE.find((b) => b.id === 'ir1')!;
const ANCIENT: TimeBin = DEFAULT_TIMELINE.find((b) => b.id === 'ancient')!;

// Independent closed-form: weighted arithmetic mean of the North values.
function additiveClosed(values: Record<string, number>): number {
    let s = 0;
    for (const k of Object.keys(NW)) s += NW[k] * values[k];
    return s;
}

// Independent closed-form: weighted geometric mean of the North values.
function geometricClosed(values: Record<string, number>): number {
    let logSum = 0;
    for (const k of Object.keys(NW)) logSum += NW[k] * Math.log(values[k]);
    return Math.exp(logSum);
}


export function buildCalibration(): CalibrationResult[] {
    // Case 1: additive aggregator with all inputs equal to 0.5.
    // Because normalised weights sum to 1, the weighted mean of a constant is
    // that constant, so the score must equal 0.5 exactly.
    const flat: Record<string, number> = Object.fromEntries(
        Object.keys(W).map((k) => [k, 0.5]),
    );
    const additiveFlat = scoreRegion('additive', flat, W, 0);

    // Case 2: CES at rho = 1 reduces to the additive form. Predicted is the CES
    // branch, expected is the independent weighted arithmetic mean.
    const cesAtOne = scoreRegion('ces', IR1.values.north, W, 1);
    const additiveNorth = additiveClosed(IR1.values.north);

    // Case 3: the multiplicative (Cobb-Douglas) aggregator is the weighted
    // geometric mean. Predicted is the live multiplicative branch, expected is
    // the independent geometric mean.
    const multiplicativeNorth = scoreRegion('multiplicative', IR1.values.north, W, 0);
    const geomNorth = geometricClosed(IR1.values.north);

    // Case 4: ratio gap mode returns North score over South score. Predicted is
    // gapScore in ratio mode, expected is the ratio of the two region scores
    // computed separately.
    const ratioGap = gapScore({ kind: 'additive', cesRho: 0, gapMode: 'ratio' }, IR1, W);
    const sn = scoreRegion('additive', IR1.values.north, W, 0);
    const ss = scoreRegion('additive', IR1.values.south, W, 0);
    const ratioClosed = sn / ss;

    // Case 5: divergence test. At industrial takeoff the North is ahead, so the
    // difference-mode gap is strictly positive; in the ancient bin the two
    // regions are identical, so the gap is zero. We encode "positive divergence
    // at takeoff but none in antiquity" as a boolean indicator that must be 1.
    const gapTakeoff = gapScore({ kind: 'ces', cesRho: 0.25, gapMode: 'difference' }, IR1, W);
    const gapAncient = gapScore({ kind: 'ces', cesRho: 0.25, gapMode: 'difference' }, ANCIENT, W);
    const divergenceIndicator = gapTakeoff > 0 && Math.abs(gapAncient) < 1e-9 ? 1 : 0;

    return [
        {
            name: 'additive · normalisation identity',
            description:
                'with all nine accelerants set to 0.5 and weights renormalised to sum to one, the additive score is the weighted mean of a constant, which is that constant.',
            predicted: Number(additiveFlat.toFixed(4)),
            expected: 0.5,
            source: 'weighted arithmetic mean with weights summing to 1',
        },
        {
            name: 'CES · rho = 1 nests additive',
            description:
                'the constant-elasticity aggregator at rho = 1 must collapse onto the additive form for the same North inputs at industrial takeoff.',
            predicted: Number(cesAtOne.toFixed(4)),
            expected: Number(additiveNorth.toFixed(4)),
            source: 'CES limit identity: f = (sum w x^rho)^(1/rho) becomes sum w x at rho = 1',
        },
        {
            name: 'multiplicative · geometric mean',
            description:
                'the Cobb-Douglas aggregator is the weighted geometric mean of the inputs; tested against an independently computed geometric mean of the North values.',
            predicted: Number(multiplicativeNorth.toFixed(4)),
            expected: Number(geomNorth.toFixed(4)),
            source: 'weighted geometric mean: exp(sum w_i ln x_i)',
        },
        {
            name: 'gap · ratio identity',
            description:
                'ratio gap mode returns the North composite divided by the South composite; tested against the two region scores computed and divided separately.',
            predicted: Number(ratioGap.toFixed(4)),
            expected: Number(ratioClosed.toFixed(4)),
            source: 'gap ratio definition: score(North) / score(South)',
        },
        {
            name: 'divergence · takeoff vs antiquity',
            description:
                'difference-mode gap is strictly positive at industrial takeoff (North ahead) and exactly zero in the ancient bin (identical regions); the combined indicator is 1.',
            predicted: divergenceIndicator,
            expected: 1,
            source: 'Great Divergence framing: gap opens after 1750, near-zero before',
        },
    ];
}
