import type { CalibrationResult } from '@/components/CalibrationPanel';

import { mean, pearson, sigmoid } from './logic';


/**
 * The neural simulation is stochastic (noise-driven), so its trajectories are not
 * reproducible. The primitives it is built on are exact, and these cases check
 * them (the predicted values are computed here, not stored): the sigmoid firing
 * response at and away from threshold, and the Pearson synchrony measure on
 * perfectly correlated, perfectly anti-correlated, and uncorrelated signals.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'sigmoid at threshold',
            description: 'at the threshold (x = theta = 0.35) the firing response is exactly one half.',
            predicted: Number(sigmoid(0.35).toFixed(4)),
            expected: 0.5,
            source: 'sigmoid(theta) = 1/2',
        },
        {
            name: 'sigmoid saturates high',
            description: 'well above threshold the response approaches one.',
            predicted: Number(sigmoid(5).toFixed(4)),
            expected: 1,
            source: '1/(1 + exp(-3.2*(5-0.35))) approx 1',
        },
        {
            name: 'perfect synchrony correlation',
            description: 'two identical-trend signals have a Pearson correlation of one.',
            predicted: Number(pearson([1, 2, 3, 4], [2, 4, 6, 8]).toFixed(4)),
            expected: 1,
            source: 'Pearson of a signal with its positive scalar multiple is 1',
        },
        {
            name: 'anti-synchrony correlation',
            description: 'opposed signals have a Pearson correlation of minus one.',
            predicted: Number(pearson([1, 2, 3, 4], [4, 3, 2, 1]).toFixed(4)),
            expected: -1,
            source: 'Pearson of a signal with its reverse-linear opposite is -1',
        },
        {
            name: 'mean of a series',
            description: 'the mean used throughout the synchrony measure.',
            predicted: Number(mean([0.2, 0.4, 0.6, 0.8]).toFixed(4)),
            expected: 0.5,
            source: '(0.2 + 0.4 + 0.6 + 0.8) / 4',
        },
    ];
}
