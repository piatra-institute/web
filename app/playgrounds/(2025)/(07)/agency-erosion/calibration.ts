import type { CalibrationResult } from '@/components/CalibrationPanel';

import { rollingExpectation, sigmoid } from './logic';


/**
 * The full simulation is stochastic (random agent preferences and a Bernoulli
 * outcome), so it cannot be reproduced point for point. These cases instead check
 * the deterministic core the model is built on: the logistic response used
 * throughout, and the rolling ordinary-least-squares expectation that the
 * substitution index is measured against. The predicted values are computed here
 * by those functions, not stored.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'logistic midpoint',
            description: 'the logistic response used for coalition, purity, and success is one half at zero.',
            predicted: Number(sigmoid(0).toFixed(4)),
            expected: 0.5,
            source: 'sigmoid(0) = 1/2',
        },
        {
            name: 'logistic at 2',
            description: 'a known value of the logistic curve.',
            predicted: Number(sigmoid(2).toFixed(4)),
            expected: 0.8808,
            source: 'sigmoid(2) = 1/(1 + e^-2)',
        },
        {
            name: 'rolling expectation recovers a line',
            description: 'on a perfectly linear series S = 2B + 1, the OLS expectation returns the exact value at the last B.',
            predicted: Number(rollingExpectation([1, 3, 5, 7, 9], [0, 1, 2, 3, 4]).toFixed(4)),
            expected: 9,
            source: 'OLS of S = 2B + 1 evaluated at B = 4',
        },
        {
            name: 'rolling expectation of a flat series',
            description: 'with no dependence on B, the expectation collapses to the series mean.',
            predicted: Number(rollingExpectation([5, 5, 5], [1, 2, 3]).toFixed(4)),
            expected: 5,
            source: 'zero slope leaves the intercept equal to the mean',
        },
    ];
}
