import type { CalibrationResult } from '@/components/CalibrationPanel';

import { gini, oneHot, topShare } from './logic';


/**
 * Each case runs a concentration metric (the predicted value is computed here,
 * not stored) on a distribution whose inequality is known in closed form. These
 * are the same measures the Viewer reports for the fitness landscape; here they
 * are checked against equality, total monodominance, and a small worked example.
 */
export function buildCalibration(): CalibrationResult[] {
    const equal50 = Array.from({ length: 50 }, () => 1);
    return [
        {
            name: 'Gini of perfect equality',
            description: 'when every strategy has equal fitness, the Gini coefficient is zero.',
            predicted: Number(gini(equal50).toFixed(4)),
            expected: 0,
            source: 'Gini = 0 for a uniform distribution',
        },
        {
            name: 'Gini of total monodominance (n=50)',
            description: 'when one strategy takes everything, the Gini coefficient approaches (n-1)/n.',
            predicted: Number(gini(oneHot(50)).toFixed(4)),
            expected: Number((49 / 50).toFixed(4)),
            source: 'Gini = (n-1)/n for a one-hot distribution',
        },
        {
            name: 'Gini of [1,2,3,4]',
            description: 'a small worked example with a known Gini coefficient.',
            predicted: Number(gini([1, 2, 3, 4]).toFixed(4)),
            expected: 0.25,
            source: 'Gini([1,2,3,4]) = 0.25',
        },
        {
            name: 'top-5% share under equality',
            description: 'with 50 equal strategies the top 5% (2 of them) hold 4% of fitness.',
            predicted: Number(topShare(equal50, 0.05).toFixed(4)),
            expected: 0.04,
            source: 'k = floor(50 * 0.05) = 2; share = 2/50',
        },
    ];
}
