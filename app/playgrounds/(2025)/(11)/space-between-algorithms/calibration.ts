import type { CalibrationResult } from '@/components/CalibrationPanel';
import type { SimulationParams } from './constants';

import { FREEDOM_WEIGHTS, computeFreedomScore } from './logic';


/**
 * The freedom score is a deterministic weighted blend, so these cases reproduce
 * it exactly (the predicted values are computed here, not stored): the all-zero
 * floor, the all-one ceiling, the fact that the weights form a convex combination
 * (they sum to one), and a worked intermediate case.
 */
const zero: SimulationParams = {
    intraEntropy: 0, empowerment: 0, policyVolume: 0, causalEmergence: 0, descriptiveRegularity: 0,
};
const one: SimulationParams = {
    intraEntropy: 1, empowerment: 1, policyVolume: 1, causalEmergence: 1, descriptiveRegularity: 1,
};
// only the two 0.25-weighted components on -> 0.5 * 100 = 50
const halfFromMajor: SimulationParams = {
    intraEntropy: 1, empowerment: 1, policyVolume: 0, causalEmergence: 0, descriptiveRegularity: 0,
};

export function buildCalibration(): CalibrationResult[] {
    const weightSum = Object.values(FREEDOM_WEIGHTS).reduce((a, b) => a + b, 0);
    return [
        {
            name: 'freedom score floor',
            description: 'all indicators at zero give a score of zero.',
            predicted: computeFreedomScore(zero),
            expected: 0,
            source: 'weighted sum of zeros',
        },
        {
            name: 'freedom score ceiling',
            description: 'all indicators at one give the maximum score of 100.',
            predicted: computeFreedomScore(one),
            expected: 100,
            source: 'weights sum to 1, times 100',
        },
        {
            name: 'weights form a convex combination',
            description: 'the five component weights sum to exactly one, so the score is a true weighted average.',
            predicted: Number(weightSum.toFixed(4)),
            expected: 1,
            source: '0.25 + 0.25 + 0.2 + 0.2 + 0.1',
        },
        {
            name: 'two major components contribute 50',
            description: 'turning on only the two 0.25-weighted indicators yields a score of 50.',
            predicted: computeFreedomScore(halfFromMajor),
            expected: 50,
            source: '(0.25 + 0.25) * 100',
        },
    ];
}
