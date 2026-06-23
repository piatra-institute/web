import type { CalibrationResult } from '@/components/CalibrationPanel';

import { betti1, connectedComponents, distance, eulerCharacteristic } from './logic';


/**
 * Point positions are interactive, so the metric picture changes continuously.
 * The topological invariants do not: they depend only on the connection pattern.
 * Each case computes an invariant here (not stored) on a small graph whose
 * topology is known by hand, plus one metric check, so the contrast between
 * geometry (coordinate-dependent) and topology (deformation-invariant) is exact.
 */

// triangle: 3 vertices, 3 edges, one loop
const triangle = [[1, 2], [0, 2], [0, 1]];
// two disjoint edges: 4 vertices in two components, no loops
const twoEdges = [[1], [0], [3], [2]];
// square with one diagonal: 4 vertices, 5 edges, two independent loops
const squareDiagonal = [[1, 3, 2], [0, 2], [1, 3, 0], [2, 0]];

export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'metric distance (3-4-5)',
            description: 'the geometric quantity: Euclidean distance, which changes as points move.',
            predicted: Number(distance({ x: 0, y: 0 }, { x: 3, y: 4 }).toFixed(4)),
            expected: 5,
            source: 'sqrt(3^2 + 4^2)',
        },
        {
            name: 'components of two disjoint edges',
            description: 'b0: two separate edges form two connected components.',
            predicted: connectedComponents(twoEdges),
            expected: 2,
            source: 'b0 = number of connected components',
        },
        {
            name: 'loops in a triangle',
            description: 'b1: a triangle has exactly one independent loop.',
            predicted: betti1(triangle),
            expected: 1,
            source: 'b1 = E - V + components = 3 - 3 + 1',
        },
        {
            name: 'loops in a square with a diagonal',
            description: 'b1: adding a diagonal to a square gives two independent loops.',
            predicted: betti1(squareDiagonal),
            expected: 2,
            source: 'b1 = 5 - 4 + 1',
        },
        {
            name: 'Euler characteristic of the triangle graph',
            description: 'V - E for the triangle is 3 - 3 = 0, matching b0 - b1 = 1 - 1.',
            predicted: eulerCharacteristic(triangle),
            expected: 0,
            source: 'chi = V - E = b0 - b1',
        },
    ];
}
