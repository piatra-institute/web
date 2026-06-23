import type { CalibrationResult } from '@/components/CalibrationPanel';

import { accumulationCV, expectedTimeToThreshold, intervalStd, pulseProbability } from './logic';


/**
 * Pulse generation is stochastic, but the timing relationships are exact. Each
 * case computes one here (not stored): the mean interval N/r, the per-step pulse
 * probability, the scalar property (CV = 1/sqrt(N), independent of rate), and the
 * resulting standard deviation that grows in proportion to the interval.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'mean interval at rate 10, threshold 100',
            description: 'accumulating 100 pulses at 10 per second takes 10 seconds on average.',
            predicted: Number(expectedTimeToThreshold(10, 100).toFixed(4)),
            expected: 10,
            source: 'mean interval = threshold / rate = 100 / 10',
        },
        {
            name: 'halving the rate doubles the interval',
            description: 'the same threshold at rate 5 takes twice as long.',
            predicted: Number(expectedTimeToThreshold(5, 100).toFixed(4)),
            expected: 20,
            source: '100 / 5',
        },
        {
            name: 'per-step pulse probability',
            description: 'over a step dt = 0.01 at rate 10, the pulse probability is rate * dt = 0.1.',
            predicted: Number(pulseProbability(10, 0.01).toFixed(4)),
            expected: 0.1,
            source: 'Poisson thinning: rate * dt',
        },
        {
            name: 'scalar property: CV = 1/sqrt(N)',
            description: 'with threshold 100, the coefficient of variation of the interval is 0.1.',
            predicted: Number(accumulationCV(100).toFixed(4)),
            expected: 0.1,
            source: 'Gamma(N, r) has CV = 1/sqrt(N)',
        },
        {
            name: 'interval standard deviation scales with the mean',
            description: 'at rate 10, threshold 100: std = mean (10) times CV (0.1) = 1 second.',
            predicted: Number(intervalStd(10, 100).toFixed(4)),
            expected: 1,
            source: 'std = (N/r) * (1/sqrt(N)) = sqrt(N)/r',
        },
    ];
}
