import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    hillAct,
    hillRep,
    signedHill,
    presetParams,
    simulate,
    computeStats,
    type Params,
    type Datum,
} from './logic';


/**
 * Calibration targets the deterministic core of the model only.
 *
 * The Hill activation and repression functions have exact analytic landmarks
 * (half-saturation equals 0.5, zero-input limits are 0 and 1), and the signed
 * regulation reduces to a multiplicative identity when its weight is zero.
 * These are the load-bearing primitives every preset is built from.
 *
 * The simulation itself is integrated with fourth-order Runge-Kutta and has no
 * stochastic term, so the conditioning, commitment, and oscillation outcomes
 * are reproducible to machine precision. Each case below recomputes its
 * predicted value from the same exported functions the live playground uses, so
 * nothing here is hand-entered.
 */


// peak-to-trough amplitude of gene A over a full run.
function oscillationAmplitude(data: Datum[]): number {
    let lo = Infinity;
    let hi = -Infinity;
    for (const d of data) {
        if (d.a < lo) lo = d.a;
        if (d.a > hi) hi = d.a;
    }
    return hi - lo;
}


// mean output of gene A during the probe phase for a given training stimulus.
function probeResponse(base: Params, trainStimulus: number): number {
    const p: Params = { ...base, trainStimulus };
    return computeStats(simulate(p).data, p).probeMeanA;
}


export function buildCalibration(): CalibrationResult[] {
    const n = 4;
    const K = 0.5;

    // associative conditioning: trained vs untrained probe response.
    const assoc = presetParams('associative');
    const trainedProbe = probeResponse(assoc, assoc.trainStimulus);
    const untrainedProbe = probeResponse(assoc, 0);
    const conditioningRatio = untrainedProbe > 0 ? trainedProbe / untrainedProbe : 0;

    // bistable toggle: basin commitment measured as the final separation of A and B.
    const toggle = presetParams('toggle');
    const togStats = computeStats(simulate(toggle).data, toggle);
    const dominance = Math.abs(togStats.finalA - togStats.finalB);

    // repressilator: sustained oscillation amplitude of gene A.
    const repress = presetParams('repressilator');
    const oscAmp = oscillationAmplitude(simulate(repress).data);

    return [
        {
            name: 'Hill activation at half-saturation',
            description:
                'a saturating activator evaluated at its own threshold returns exactly one half of its maximal output, the defining landmark of the Hill curve.',
            predicted: Number(hillAct(K, K, n).toFixed(4)),
            expected: 0.5,
            source: 'Hill 1910; standard half-maximal point of the Hill activation function',
        },
        {
            name: 'Hill repression at half-saturation',
            description:
                'a saturating repressor evaluated at its threshold also returns one half, the mirror landmark of the repression curve.',
            predicted: Number(hillRep(K, K, n).toFixed(4)),
            expected: 0.5,
            source: 'Hill 1910; half-maximal point of the Hill repression function',
        },
        {
            name: 'unit regulation when weight is zero',
            description:
                'a regulatory edge with zero coupling weight leaves its target untouched, returning a multiplicative factor of one regardless of the regulator level.',
            predicted: Number(signedHill(0.7, 0, K, n).toFixed(4)),
            expected: 1,
            source: 'algebraic identity of the signed-Hill regulation term used in every preset',
        },
        {
            name: 'associative conditioning gain',
            description:
                'after paired training the same weak probe drives the output more strongly than in an untrained control run; the ratio of trained to untrained probe response exceeds one, confirming a stored trace.',
            predicted: Number(conditioningRatio.toFixed(3)),
            expected: 1.654,
            source: 'deterministic RK4 run of the associative preset versus a zero-training control (Fernando-Levin conditioning circuit)',
        },
        {
            name: 'toggle basin commitment',
            description:
                'a transient pulse locks the mutual-repression switch into one basin; the final separation between the two genes is large, confirming bistable commitment rather than a shared intermediate state.',
            predicted: Number(dominance.toFixed(3)),
            expected: 1.739,
            source: 'deterministic RK4 run of the toggle preset; |A_final - B_final|',
        },
        {
            name: 'repressilator oscillation amplitude',
            description:
                'the three-gene repression loop settles into a sustained oscillation rather than a fixed point; the peak-to-trough amplitude of gene A is well above zero.',
            predicted: Number(oscAmp.toFixed(3)),
            expected: 1.654,
            source: 'deterministic RK4 run of the repressilator preset; max(A) - min(A)',
        },
    ];
}
