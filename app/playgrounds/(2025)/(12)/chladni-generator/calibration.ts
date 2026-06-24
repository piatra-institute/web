import type { CalibrationResult } from '@/components/CalibrationPanel';

import { chladni } from './logic';


/**
 * Calibration for the square-plate Chladni nodal function
 *   S(x,y) = cos(m pi x) cos(n pi y) +/- cos(n pi x) cos(m pi y),  x,y in [0,1].
 *
 * Every `predicted` value below is COMPUTED by the same `chladni` function the
 * Viewer uses per pixel, never hardcoded. The `expected` values are exact
 * analytic facts about the function (corner amplitude, nodal lines, the m<->n
 * permutation symmetry of the symmetric mode). Where a fact is "this point lies
 * on a nodal line", the expected value is 0 and the runner scores the absolute
 * residual; floats are rounded with toFixed so a clean theoretical zero reads
 * as zero.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Corner amplitude. At (0,0) every cosine is 1, so the symmetric mode is
    //    term1 + term2 = 1 + 1 = 2 for any (m,n).
    results.push({
        name: 'corner amplitude (3,2) symmetric',
        description:
            'at the free corner (0,0) all cosines equal 1, so the symmetric mode reaches its maximum value of exactly 2.',
        predicted: Number(chladni(0, 0, 3, 2, true).toFixed(6)),
        expected: 2,
        source: 'analytic: cos(0)=1 for every factor; symmetric mode = 1 + 1 = 2',
    });

    // 2. Diagonal nodal line of the antisymmetric mode. With the minus sign,
    //    term2 is term1 with the cosine pairs swapped, so on the line x = y the
    //    two terms are identical and S = 0 everywhere along the diagonal.
    results.push({
        name: 'antisymmetric diagonal node (4,3)',
        description:
            'the antisymmetric mode vanishes on the whole main diagonal x = y; the value sampled at the plate center (0.5, 0.5) is exactly zero.',
        predicted: Number(chladni(0.5, 0.5, 4, 3, false).toFixed(6)),
        expected: 0,
        source: 'analytic: on x = y the swapped-cosine terms cancel, S(x,x) = 0',
    });

    // 3. Center node of the fundamental symmetric (1,1) mode. cos(pi/2) = 0, so
    //    both terms vanish at the plate center.
    results.push({
        name: 'fundamental (1,1) center node',
        description:
            'the (1,1) symmetric mode has a nodal point at the plate center because cos(pi/2) = 0 kills both terms.',
        predicted: Number(chladni(0.5, 0.5, 1, 1, true).toFixed(6)),
        expected: 0,
        source: 'analytic: cos(pi/2) = 0, so S(0.5, 0.5) = 0 for (m,n) = (1,1)',
    });

    // 4. m <-> n permutation symmetry of the symmetric mode. Swapping (m,n)
    //    swaps term1 and term2, leaving their sum unchanged, so the value at an
    //    arbitrary asymmetric point must match. `predicted` is computed at
    //    (5,2); `expected` is the independently computed (2,5) value.
    results.push({
        name: 'm<->n symmetry of symmetric mode',
        description:
            'swapping the mode numbers permutes the two terms of the symmetric mode, so S(x,y;5,2) equals S(x,y;2,5) at the off-diagonal sample (0.3, 0.7).',
        predicted: Number(chladni(0.3, 0.7, 5, 2, true).toFixed(6)),
        expected: Number(chladni(0.3, 0.7, 2, 5, true).toFixed(6)),
        source: 'analytic: term1 and term2 swap under (m,n) -> (n,m); the sum is invariant',
    });

    // 5. Edge nodal line of (2,2): along x = 0 the mode is 2 cos(2 pi y), which
    //    is zero at y = 1/4. Verifies a nodal crossing away from the center.
    results.push({
        name: '(2,2) edge nodal crossing',
        description:
            'on the edge x = 0 the (2,2) symmetric mode reduces to 2 cos(2 pi y), which crosses zero at y = 1/4.',
        predicted: Number(chladni(0, 0.25, 2, 2, true).toFixed(6)),
        expected: 0,
        source: 'analytic: S(0, y) = 2 cos(2 pi y); zero at y = 1/4',
    });

    return results;
}
