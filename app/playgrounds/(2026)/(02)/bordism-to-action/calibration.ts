import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    computeAcceleration,
    computeTQFT,
    complexMagnitude,
    type ClassicalParams,
} from './logic';


/**
 * Both cores of this playground are deterministic and have closed-form ground
 * truths, so calibration compares the model's own functions against the exact
 * physics and TQFT identities they are meant to implement.
 *
 * Classical side: at rest (velocity 0) the air-drag term vanishes, so the
 * Newtonian acceleration reduces to a = g sin(theta) - mu g cos(theta), clamped
 * at 0 when static friction holds the block. TQFT side: the SU(2)_k partition
 * function on the three-sphere is Z(S^3) = sqrt(2/(k+2)) sin(pi/(k+2)); the
 * conformal weight of a spin-j primary is h = j(j+1)/(k+2); and the braiding
 * R-matrix is a pure phase, so the unknotted two-strand amplitude has unit
 * modulus for any level and any number of crossings.
 */

const FROZEN = { position: 0, velocity: 0 } as const;

function classicalAcceleration(p: ClassicalParams): number {
    return computeAcceleration(p, { ...FROZEN });
}

export function buildCalibration(): CalibrationResult[] {
    // Case 1: frictionless plane at rest. a = g sin(theta).
    const c1: ClassicalParams = {
        gravity: 9.8,
        angle: 30,
        mass: 1,
        friction: 0,
        direction: 'downhill',
    };
    const expected1 = c1.gravity * Math.sin((c1.angle * Math.PI) / 180);

    // Case 2: shallow plane with strong friction. g sin(theta) <= mu g cos(theta),
    // so static friction holds the block and the acceleration is exactly zero.
    const c2: ClassicalParams = {
        gravity: 9.8,
        angle: 10,
        mass: 1,
        friction: 0.3,
        direction: 'downhill',
    };

    // Case 3: SU(2)_1 partition function on S^3. Closed form sqrt(2/3) sin(pi/3).
    const t3 = computeTQFT({ level: 1, braids: 0 }, 1);
    const expected3 = Math.sqrt(2 / 3) * Math.sin(Math.PI / 3);

    // Case 4: braiding is unitary, so the unknotted two-strand amplitude has
    // modulus 1 regardless of level or crossing count.
    const t4 = computeTQFT({ level: 3, braids: 7 }, 1);

    // Case 5: conformal weight of a spin-1 primary (mass 2 -> j = 1) at k = 2.
    // h = j(j+1)/(k+2) = 1 * 2 / 4 = 0.5.
    const t5 = computeTQFT({ level: 2, braids: 0 }, 2);
    const expected5 = 0.5;

    return [
        {
            name: 'frictionless slide · a = g sin θ',
            description:
                'a block at rest on a 30 degree plane with no friction. air drag vanishes at zero velocity, so the acceleration is the textbook g sin(theta).',
            predicted: Number(classicalAcceleration(c1).toFixed(4)),
            expected: Number(expected1.toFixed(4)),
            source: 'Newton, second law on an inclined plane: a = g sin(θ) − μ g cos(θ)',
        },
        {
            name: 'static hold · friction wins',
            description:
                'a 10 degree plane with μ = 0.3. since g sin(θ) ≤ μ g cos(θ), static friction holds the block and the net acceleration is exactly zero.',
            predicted: Number(classicalAcceleration(c2).toFixed(4)),
            expected: 0,
            source: 'static friction condition tan(θ) ≤ μ on an inclined plane',
        },
        {
            name: 'Z(S³) at level k = 1',
            description:
                'the SU(2) level-1 Chern-Simons partition function on the three-sphere, against its closed form sqrt(2/3) sin(pi/3).',
            predicted: Number(t3.s3Amplitude.toFixed(6)),
            expected: Number(expected3.toFixed(6)),
            source: 'Witten 1989, Jones-Witten invariants: Z(S³) = √(2/(k+2)) sin(π/(k+2))',
        },
        {
            name: 'unitary braiding · |Z| = 1',
            description:
                'the unknotted two-strand braid amplitude at k = 3 with 7 crossings. the R-matrix is a pure phase, so the modulus is 1 for any level and any crossing count.',
            predicted: Number(complexMagnitude(t4.amplitude).toFixed(6)),
            expected: 1,
            source: 'unitarity of the modular braid group representation (Reshetikhin-Turaev)',
        },
        {
            name: 'conformal weight · spin-1 at k = 2',
            description:
                'the conformal weight of a spin-1 primary (mass 2 gives j = 1) at level 2: h = j(j+1)/(k+2) = 2/4 = 0.5.',
            predicted: Number(t5.h.toFixed(6)),
            expected: Number(expected5.toFixed(6)),
            source: 'WZW conformal weight h_j = j(j+1)/(k+2) for SU(2)_k primaries',
        },
    ];
}
