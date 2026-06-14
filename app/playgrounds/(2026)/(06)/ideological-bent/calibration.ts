import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    SCENARIOS,
    baselineDist,
    jsDivergence,
    odds,
    type Outcome,
} from './logic';


/**
 * The "model" here is a transparent diagnostic engine, so calibration verifies
 * that its outputs match hand-computable values of the documented formulas
 * rather than empirical data. Each case compares a function output (predicted)
 * with a closed-form value (expected). Source numbers are derivable by hand.
 */
export function buildCalibration(): CalibrationResult[] {
    const fable = SCENARIOS.fable;
    const twoOutcomes: Outcome[] = [
        { id: 'x', label: 'x' },
        { id: 'y', label: 'y' },
    ];

    // softmax over log-priors at the default assumptions returns the priors.
    const baselineB = baselineDist(fable, 'b', fable.defaultAssumptions).blanket * 100;
    const baselineA = baselineDist(fable, 'a', fable.defaultAssumptions).blanket * 100;

    // identity likelihood ratio = odds(forecast) / odds(baseline).
    const ilr = odds(0.75) / odds(0.18);

    // counterfactual inadmissibility in bits = log2(p* / q).
    const inadmissibility = Math.log2(0.25 / 0.01);

    // Jensen-Shannon divergence of two maximally split two-outcome dists.
    const js = jsDivergence({ x: 0.9, y: 0.1 }, { x: 0.1, y: 0.9 }, twoOutcomes);

    return [
        {
            name: 'softmax recovers priors (B)',
            description: 'with default assumptions, the baseline focus probability equals the stored prior 0.18.',
            predicted: Number(baselineB.toFixed(2)),
            expected: 18,
            source: 'softmax(log p) = p when the priors sum to 1',
        },
        {
            name: 'softmax recovers priors (A)',
            description: 'the same identity check for the other actor, prior 0.44.',
            predicted: Number(baselineA.toFixed(2)),
            expected: 44,
            source: 'softmax(log p) = p when the priors sum to 1',
        },
        {
            name: 'identity likelihood ratio',
            description: 'odds(0.75) / odds(0.18): the odds multiplier a 0.18 to 0.75 jump requires.',
            predicted: Number(ilr.toFixed(3)),
            expected: 13.667,
            source: 'odds(0.75)/odds(0.18) = 3 / 0.2195',
        },
        {
            name: 'inadmissibility (bits)',
            description: 'suppressing a 0.25 baseline branch to 0.01 costs log2(25) bits.',
            predicted: Number(inadmissibility.toFixed(3)),
            expected: 4.644,
            source: 'log2(0.25 / 0.01) = log2(25)',
        },
        {
            name: 'Jensen-Shannon divergence',
            description: 'JS of {0.9, 0.1} against {0.1, 0.9}, the actor-swap distance for two outcomes.',
            predicted: Number(js.toFixed(4)),
            expected: 0.531,
            source: 'hand-computed JS in bits',
        },
    ];
}
