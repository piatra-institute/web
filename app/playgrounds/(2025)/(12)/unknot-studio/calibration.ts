import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    torusCrossingNumber,
    torusUnknottingNumber,
    isBHCounterexample,
    type KnotSpec,
} from './logic/knot';


/**
 * Calibration of the closed-form torus-knot invariants against textbook values.
 *
 * Every `predicted` value is produced by the same functions the playground uses
 * (torusCrossingNumber, torusUnknottingNumber, isBHCounterexample). Nothing is
 * hard-coded: each case calls the model and compares against a value that is
 * established in knot theory (a crossing number, an unknotting number, or a
 * boolean invariance check encoded as 1).
 *
 * The stochastic projection scan (random rotations searching for a minimal
 * crossing diagram) is deliberately NOT calibrated here; only the exact,
 * deterministic invariants are.
 */
const UNKNOT: KnotSpec = { p: 1, q: 5, mirror: false, R: 2.25, r: 0.85 };


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // The unknot T(1,q) has crossing number 0. The formula
    // min((p-1)q, (q-1)p) yields min(0, q-1) = 0 for p = 1.
    results.push({
        name: 'unknot crossing number',
        description:
            'the unknot T(1,5) has no essential crossings; the minimal-diagram crossing number of the trivial knot is 0.',
        predicted: torusCrossingNumber(UNKNOT.p, UNKNOT.q) ?? -1,
        expected: 0,
        source: 'standard: the unknot is the unique knot with crossing number 0',
    });

    // The unknot is unknotting-trivial: u = 0. The formula
    // (p-1)(q-1)/2 yields 0 for p = 1.
    results.push({
        name: 'unknot unknotting number',
        description:
            'the trivial knot needs no crossing changes to untie, so its unknotting number is 0.',
        predicted: torusUnknottingNumber(UNKNOT.p, UNKNOT.q) ?? -1,
        expected: 0,
        source: 'standard: u(unknot) = 0',
    });

    // The (2,3) torus knot is the trefoil: crossing number 3, the simplest
    // non-trivial knot.
    results.push({
        name: 'trefoil crossing number',
        description:
            'T(2,3) is the trefoil, the simplest non-trivial knot, drawn minimally with 3 crossings.',
        predicted: torusCrossingNumber(2, 3) ?? -1,
        expected: 3,
        source: 'Rolfsen table: 3_1 trefoil, crossing number 3',
    });

    // The trefoil has unknotting number 1: a single crossing change unties it.
    results.push({
        name: 'trefoil unknotting number',
        description:
            'one crossing change converts the trefoil to the unknot, so u(T(2,3)) = 1.',
        predicted: torusUnknottingNumber(2, 3) ?? -1,
        expected: 1,
        source: 'classical: u(3_1) = 1',
    });

    // The (2,7) torus knot has unknotting number 3, the value used in the
    // Brittenham-Hermiller (2025) additivity counterexample.
    results.push({
        name: 'T(2,7) unknotting number',
        description:
            'the (2,7) torus knot has unknotting number 3, the summand value in the 2025 non-additivity result.',
        predicted: torusUnknottingNumber(2, 7) ?? -1,
        expected: 3,
        source: 'u(T(2,7)) = (2-1)(7-1)/2 = 3; Brittenham and Hermiller 2025',
    });

    // Invariance check: the playground recognises the K # mirror(K) pair for
    // K = T(2,7) as the additivity counterexample. Encoded as a boolean,
    // expected to hold (1).
    const bh = isBHCounterexample(
        { p: 2, q: 7, mirror: false, R: 2.25, r: 0.85 },
        { p: 2, q: 7, mirror: true, R: 2.25, r: 0.85 },
    );
    results.push({
        name: 'counterexample detection',
        description:
            'T(2,7) summed with its mirror is the Brittenham-Hermiller pair where u(K # mirror K) < u(K) + u(mirror K); the detector flags exactly this configuration.',
        predicted: bh ? 1 : 0,
        expected: 1,
        source: 'Brittenham and Hermiller 2025, unknotting number is not additive',
    });

    return results;
}
