import type { CalibrationResult } from '@/components/CalibrationPanel';

import { L, P, R, sharedPcs, triadEquals, triadPcs, type Triad } from './logic';


/**
 * Neo-Riemannian theory gives exact, integer ground truth. Each case computes a
 * transform here (not stored) and checks it: the pitch classes of C major, the
 * three named transforms applied to C major, the fact that each transform is an
 * involution, and the parsimony property that P, L, and R each preserve exactly
 * two of the three notes.
 */
const C_MAJOR: Triad = { root: 0, q: 'M' };

export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'C major pitch classes sum',
            description: 'C major is {0, 4, 7}; the sum of its pitch classes is 11.',
            predicted: triadPcs(C_MAJOR).reduce((a, b) => a + b, 0),
            expected: 11,
            source: '0 + 4 + 7',
        },
        {
            name: 'R(C major) is A minor (root 9)',
            description: 'the relative transform sends C major to its relative minor, A minor.',
            predicted: R(C_MAJOR).root,
            expected: 9,
            source: 'R: C major -> A minor, root 9',
        },
        {
            name: 'L(C major) is E minor (root 4)',
            description: 'the leading-tone exchange sends C major to E minor.',
            predicted: L(C_MAJOR).root,
            expected: 4,
            source: 'L: C major -> E minor, root 4',
        },
        {
            name: 'P is an involution',
            description: 'applying the parallel transform twice returns the original triad.',
            predicted: triadEquals(P(P(C_MAJOR)), C_MAJOR) ? 1 : 0,
            expected: 1,
            source: 'P(P(t)) = t',
        },
        {
            name: 'L preserves two of three notes',
            description: 'parsimonious voice leading: L holds two pitch classes fixed and moves one.',
            predicted: sharedPcs(C_MAJOR, L(C_MAJOR)),
            expected: 2,
            source: 'C major and E minor share {4, 7}',
        },
    ];
}
