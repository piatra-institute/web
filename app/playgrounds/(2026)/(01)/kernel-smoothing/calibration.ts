import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    gaussianKernel,
    gaussianDensity,
    epanechnikovKernel,
    nadarayaWatson,
} from './logic';


/**
 * Calibration against exact, closed-form properties of kernels and the
 * Nadaraya-Watson estimator. Every `predicted` value is computed from the
 * playground's own logic functions; nothing is hardcoded. Each `expected`
 * value is the analytic target these functions must reproduce.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Standard-normal density peak: K(0) = 1 / sqrt(2 pi) = 0.398942...
    results.push({
        name: 'gaussian density peak K(0)',
        description:
            'the unit-bandwidth Gaussian probability kernel evaluated at u = 0 must equal 1 / sqrt(2 pi).',
        predicted: Number(gaussianDensity(0).toFixed(4)),
        expected: Number((1 / Math.sqrt(2 * Math.PI)).toFixed(4)),
        source: 'standard normal density; Silverman 1986, Density Estimation',
    });

    // 2. Density normalization: a fine Riemann sum of the Gaussian density over
    //    a wide window must integrate to 1 (a kernel is a probability density).
    {
        const lo = -8;
        const hi = 8;
        const n = 16000;
        const dx = (hi - lo) / n;
        let area = 0;
        for (let i = 0; i < n; i++) {
            const u = lo + (i + 0.5) * dx;
            area += gaussianDensity(u) * dx;
        }
        results.push({
            name: 'gaussian density integrates to 1',
            description:
                'numerically integrating the Gaussian kernel over the real line returns total mass 1 (normalization).',
            predicted: Number(area.toFixed(4)),
            expected: 1,
            source: 'kernel normalization condition; integral of any kernel K equals 1',
        });
    }

    // 3. Epanechnikov normalization: integral of 0.75(1 - u^2) on [-1, 1] = 1.
    {
        const lo = -1;
        const hi = 1;
        const n = 20000;
        const dx = (hi - lo) / n;
        let area = 0;
        for (let i = 0; i < n; i++) {
            const u = lo + (i + 0.5) * dx;
            area += epanechnikovKernel(u) * dx;
        }
        results.push({
            name: 'epanechnikov integrates to 1',
            description:
                'the Epanechnikov kernel 0.75(1 - u^2) on its compact support [-1, 1] integrates to total mass 1.',
            predicted: Number(area.toFixed(4)),
            expected: 1,
            source: 'Epanechnikov 1969; optimal compact-support kernel',
        });
    }

    // 4. Kernel symmetry: K(-u) = K(u). Measured as the largest absolute
    //    asymmetry over a sweep; the target is 0.
    {
        let maxAsym = 0;
        for (let i = 0; i <= 40; i++) {
            const u = -2 + (i * 4) / 40;
            const g = Math.abs(gaussianKernel(u, 0, 1) - gaussianKernel(-u, 0, 1));
            const e = Math.abs(epanechnikovKernel(u) - epanechnikovKernel(-u));
            maxAsym = Math.max(maxAsym, g, e);
        }
        results.push({
            name: 'kernel symmetry K(-u) = K(u)',
            description:
                'Gaussian and Epanechnikov kernels are even functions; the maximum asymmetry across a sweep is 0.',
            predicted: Number(maxAsym.toFixed(4)),
            expected: 0,
            source: 'kernel symmetry axiom; Wand and Jones 1995',
        });
    }

    // 5. Nadaraya-Watson reproduces a constant: smoothing a flat signal returns
    //    that constant exactly, regardless of bandwidth (weights sum to 1).
    {
        const xs = [-2, -1, 0, 1, 2, 3];
        const c = 1.7;
        const ys = xs.map(() => c);
        const yHat = nadarayaWatson(0.4, xs, ys, 0.6);
        results.push({
            name: 'constant signal is reproduced',
            description:
                'Nadaraya-Watson regression of a constant target y = 1.7 returns 1.7 at any query, since normalized weights sum to 1.',
            predicted: Number(yHat.toFixed(4)),
            expected: Number(c.toFixed(4)),
            source: 'Nadaraya 1964; Watson 1964 (locally weighted average property)',
        });
    }

    return results;
}
