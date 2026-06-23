import type { CalibrationResult } from '@/components/CalibrationPanel';
import type { CellData } from './data';

import { computeAggregationValue, computeSortednessValue } from './logic/metrics';


/**
 * The cell simulation is interactive and stochastic, but the order metrics it
 * reports are exact functions of a distribution. Each case computes a metric here
 * (not stored) on a hand-built distribution whose value is known: sortedness as
 * the fraction of adjacent pairs in increasing order, and aggregation as the
 * fraction of adjacent pairs sharing an algotype.
 */
const cells = (values: number[], algotypes: CellData['algotype'][]): CellData[] =>
    values.map((value, i) => ({ value, algotype: algotypes[i] } as CellData));

const bubble = (n: number): CellData['algotype'][] => Array(n).fill('bubble');

export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'sortedness of an ascending array',
            description: 'all adjacent pairs increase: 3 of 4 pairs over length 4 gives 0.75.',
            predicted: Number(computeSortednessValue(cells([1, 2, 3, 4], bubble(4))).toFixed(4)),
            expected: 0.75,
            source: 'increasing adjacent pairs / length = 3 / 4',
        },
        {
            name: 'sortedness of a reversed array',
            description: 'no adjacent pair increases, so sortedness is zero.',
            predicted: Number(computeSortednessValue(cells([4, 3, 2, 1], bubble(4))).toFixed(4)),
            expected: 0,
            source: 'reversed order has no increasing adjacent pairs',
        },
        {
            name: 'sortedness of a length-5 sorted array',
            description: 'four increasing pairs over length five gives 0.8.',
            predicted: Number(computeSortednessValue(cells([1, 2, 3, 4, 5], bubble(5))).toFixed(4)),
            expected: 0.8,
            source: '4 / 5',
        },
        {
            name: 'aggregation of one algotype',
            description: 'every adjacent pair shares an algotype: 3 of 4 over length 4 gives 0.75.',
            predicted: Number(computeAggregationValue(cells([1, 2, 3, 4], bubble(4))).toFixed(4)),
            expected: 0.75,
            source: 'matching adjacent pairs / length = 3 / 4',
        },
        {
            name: 'aggregation of alternating algotypes',
            description: 'no adjacent pair shares an algotype, so aggregation is zero.',
            predicted: Number(computeAggregationValue(cells([1, 2, 3, 4], ['bubble', 'insertion', 'bubble', 'insertion'])).toFixed(4)),
            expected: 0,
            source: 'alternating algotypes have no matching adjacent pairs',
        },
    ];
}
