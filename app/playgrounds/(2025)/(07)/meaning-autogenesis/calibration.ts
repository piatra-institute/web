import type { CalibrationResult } from '@/components/CalibrationPanel';

import { checkReaction, createMolecule, distanceBetween } from './logic';


/**
 * The simulation is spatial and stochastic (random velocities, proximity-based
 * encounters), so it cannot be reproduced step for step. These cases instead
 * check the deterministic rules underneath, computed here, not stored: the
 * distance metric and the reaction table that makes the set autocatalytic
 * (a C catalyst regenerates itself from an A substrate; an F catalyst turns a D
 * into a G), and the fact that reactions switch off beyond level 3.
 */
export function buildCalibration(): CalibrationResult[] {
    const a = createMolecule(0, 0, 'A');
    const c = createMolecule(10, 0, 'C');
    const d = createMolecule(0, 0, 'D');
    const f = createMolecule(10, 0, 'F');
    const acReaction = checkReaction(a, c, 0);
    const dfReaction = checkReaction(d, f, 0);
    const inertReaction = checkReaction(a, c, 3);

    return [
        {
            name: 'distance (3,4)',
            description: 'the Euclidean distance of a 3-4-5 triangle.',
            predicted: Number(distanceBetween({ x: 0, y: 0 }, { x: 3, y: 4 }).toFixed(4)),
            expected: 5,
            source: 'sqrt(3^2 + 4^2) = 5',
        },
        {
            name: 'distance (6,8)',
            description: 'and of a 6-8-10 triangle.',
            predicted: Number(distanceBetween({ x: 0, y: 0 }, { x: 6, y: 8 }).toFixed(4)),
            expected: 10,
            source: 'sqrt(6^2 + 8^2) = 10',
        },
        {
            name: 'autocatalysis: A + C regenerates a catalyst',
            description: 'a C catalyst turns an A substrate into another C, so the catalyst count is preserved.',
            predicted: acReaction ? acReaction.products.filter((p) => p.type === 'C').length : 0,
            expected: 1,
            source: 'reaction rule A + C -> C',
        },
        {
            name: 'D + F produces a G',
            description: 'an F catalyst turns a D substrate into a G product.',
            predicted: dfReaction ? dfReaction.products.filter((p) => p.type === 'G').length : 0,
            expected: 1,
            source: 'reaction rule D + F -> G',
        },
        {
            name: 'reactions off beyond level 3',
            description: 'past the third level the local reaction rule returns nothing.',
            predicted: inertReaction === null ? 1 : 0,
            expected: 1,
            source: 'checkReaction returns null for level >= 3',
        },
    ];
}
