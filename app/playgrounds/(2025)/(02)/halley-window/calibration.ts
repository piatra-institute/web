import type { CalibrationResult } from '@/components/CalibrationPanel';

import { cabs, halleyRoot } from './logic';


/**
 * Each case runs the actual iteration on p(z) = z^n - 1 from a starting point
 * and checks where it lands (the predicted value is computed here by halleyRoot,
 * not stored). Every root of z^n - 1 is an n-th root of unity, so it sits exactly
 * on the unit circle; a correct iteration converges to one of them. The c = 0
 * case confirms the same code reduces to Newton's method and still finds a root.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'Halley, z^3-1, start 1.3',
            description: 'modulus of the converged root; every root of z^3-1 lies on the unit circle.',
            predicted: Number(cabs(halleyRoot({ re: 1.3, im: 0 }, 3, 1).root).toFixed(4)),
            expected: 1,
            source: 'roots of z^n-1 are the n-th roots of unity, |root| = 1',
        },
        {
            name: 'Halley, z^3-1, start -0.6+0.8i',
            description: 'real part of the converged root; the nearby root is the primitive cube root -1/2 + (sqrt3/2)i.',
            predicted: Number(halleyRoot({ re: -0.6, im: 0.8 }, 3, 1).root.re.toFixed(4)),
            expected: -0.5,
            source: 'cube roots of unity: 1 and -1/2 +/- (sqrt3/2)i',
        },
        {
            name: 'Halley, z^2-1, start 0.7',
            description: 'converged root of z^2-1 from a positive real start.',
            predicted: Number(halleyRoot({ re: 0.7, im: 0 }, 2, 1).root.re.toFixed(4)),
            expected: 1,
            source: 'roots of z^2-1 are +/-1',
        },
        {
            name: 'Halley, z^5-1, start 0.3+1.1i',
            description: 'modulus of the converged root for a degree-5 board.',
            predicted: Number(cabs(halleyRoot({ re: 0.3, im: 1.1 }, 5, 1).root).toFixed(4)),
            expected: 1,
            source: 'roots of z^5-1 are the fifth roots of unity, |root| = 1',
        },
        {
            name: 'Newton (c=0), z^2-1, start 0.7',
            description: 'with the second-derivative weight off the iteration is Newton; it still finds the root.',
            predicted: Number(halleyRoot({ re: 0.7, im: 0 }, 2, 0).root.re.toFixed(4)),
            expected: 1,
            source: 'c=0 reduces generalized Halley to Newton, z - f/f\'',
        },
    ];
}
