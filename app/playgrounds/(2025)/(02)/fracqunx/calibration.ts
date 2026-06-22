import type { CalibrationResult } from '@/components/CalibrationPanel';

import { binomialPmf, distributionMean, distributionStd, massWithinOneStd } from './logic';


/**
 * Each case computes a statistic of the bin distribution directly from the
 * binomial law (the predicted value is computed here by the logic functions, not
 * stored) and compares it to the closed-form or normal-theory target. A fair
 * board with n rows lands beads in Binomial(n, 1/2): mean n/2, standard
 * deviation sqrt(n)/2, and by the central limit theorem roughly 68% of beads
 * within one standard deviation of centre.
 */
const NORMAL_WITHIN_1SD = 0.6827;


export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'centre, 16 rows, fair',
            description: 'mean bin of a fair 16-row board equals n/2.',
            predicted: Number(distributionMean(binomialPmf(16, 0.5)).toFixed(3)),
            expected: 8,
            source: 'Binomial(n, 1/2) mean = n/2',
        },
        {
            name: 'spread, 16 rows, fair',
            description: 'standard deviation of a fair 16-row board equals sqrt(n)/2.',
            predicted: Number(distributionStd(binomialPmf(16, 0.5)).toFixed(3)),
            expected: 2,
            source: 'Binomial(n, 1/2) std = sqrt(n)/2',
        },
        {
            name: 'centre, 16 rows, biased p=0.6',
            description: 'biasing the pegs to p=0.6 shifts the centre of mass to n*p.',
            predicted: Number(distributionMean(binomialPmf(16, 0.6)).toFixed(3)),
            expected: 9.6,
            source: 'Binomial(n, p) mean = n*p',
        },
        {
            name: 'within 1 std, 16 rows',
            description: 'central-limit check: fraction of beads within one std of centre vs the normal 68%.',
            predicted: Number(massWithinOneStd(16, 0.5).toFixed(3)),
            expected: NORMAL_WITHIN_1SD,
            source: 'de Moivre-Laplace CLT; normal mass within 1 std = 0.6827',
        },
        {
            name: 'within 1 std, 100 rows',
            description: 'with more rows the binomial hugs the normal more closely.',
            predicted: Number(massWithinOneStd(100, 0.5).toFixed(3)),
            expected: NORMAL_WITHIN_1SD,
            source: 'de Moivre-Laplace CLT; normal mass within 1 std = 0.6827',
        },
    ];
}
