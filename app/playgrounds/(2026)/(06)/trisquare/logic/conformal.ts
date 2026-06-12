import { clamp } from '@/lib/playgroundMath';


export type ConformalPreset = 'flat' | 'bump' | 'well' | 'wave' | 'lumpy';

export const CONFORMAL_PRESETS: ConformalPreset[] = ['flat', 'bump', 'well', 'wave', 'lumpy'];


export interface ConformalControls {
    /** amplitude A of the conformal deformation. */
    amplitude: number;
    /** width sigma of the Gaussian features. */
    width: number;
    /** wave number k for the oscillating preset. */
    waveNumber: number;
}


/** half-extent of the sampled square, x and y range over [-DOMAIN, DOMAIN]. */
export const DOMAIN = 3;
/** grid resolution (odd, so the origin is a sample point). */
export const GRID_N = 41;

const MIN_OMEGA = 0.05;


/** the conformal factor Omega(x, y) for the selected preset. */
export function omegaAt(
    preset: ConformalPreset,
    controls: ConformalControls,
    x: number,
    y: number,
): number {
    const { amplitude: A, width: sigma, waveNumber: k } = controls;
    const s2 = Math.max(0.05, sigma * sigma);
    const r2 = x * x + y * y;

    switch (preset) {
        case 'flat':
            return 1;
        case 'bump':
            return 1 + A * Math.exp(-r2 / s2);
        case 'well':
            return Math.max(MIN_OMEGA, 1 - A * Math.exp(-r2 / s2));
        case 'wave':
            return Math.max(MIN_OMEGA, 1 + A * Math.sin(k * x));
        case 'lumpy': {
            const b1 = Math.exp(-(((x - 1.2) ** 2) + (y - 0.8) ** 2) / s2);
            const b2 = 0.8 * Math.exp(-(((x + 1.0) ** 2) + (y + 1.1) ** 2) / s2);
            const b3 = 0.6 * Math.exp(-(((x - 0.6) ** 2) + (y + 1.0) ** 2) / s2);
            return Math.max(MIN_OMEGA, 1 + A * (b1 + b2 - b3));
        }
        default:
            return 1;
    }
}


export interface ConformalField {
    omega: number[][];
    curvature: number[][];
    metrics: ConformalMetrics;
}

export interface ConformalMetrics {
    /** peak absolute Gaussian curvature over the interior. */
    maxAbsK: number;
    /** mean absolute Gaussian curvature over the interior. */
    meanAbsK: number;
    /** discrete integral of K over the patch (area-weighted). */
    integralK: number;
    /** largest value of the conformal factor. */
    peakOmega: number;
    /** smallest value of the conformal factor. */
    minOmega: number;
}


/**
 * Compute Omega and the 2D Gaussian curvature
 *   K = -Omega^{-2} * Laplacian(ln Omega)
 * on a regular grid using a five-point finite-difference Laplacian.
 */
export function computeField(preset: ConformalPreset, controls: ConformalControls): ConformalField {
    const n = GRID_N;
    const h = (2 * DOMAIN) / (n - 1);
    const omega: number[][] = [];
    const logOmega: number[][] = [];

    for (let j = 0; j < n; j++) {
        const orow: number[] = [];
        const lrow: number[] = [];
        const y = -DOMAIN + j * h;
        for (let i = 0; i < n; i++) {
            const x = -DOMAIN + i * h;
            const w = omegaAt(preset, controls, x, y);
            orow.push(w);
            lrow.push(Math.log(w));
        }
        omega.push(orow);
        logOmega.push(lrow);
    }

    const curvature: number[][] = [];
    for (let j = 0; j < n; j++) {
        curvature.push(new Array(n).fill(0));
    }

    let maxAbsK = 0;
    let sumAbsK = 0;
    let integralK = 0;
    let count = 0;
    let peakOmega = -Infinity;
    let minOmega = Infinity;

    for (let j = 1; j < n - 1; j++) {
        for (let i = 1; i < n - 1; i++) {
            const lap =
                (logOmega[j][i + 1] +
                    logOmega[j][i - 1] +
                    logOmega[j + 1][i] +
                    logOmega[j - 1][i] -
                    4 * logOmega[j][i]) /
                (h * h);
            const w = omega[j][i];
            const K = -lap / (w * w);
            curvature[j][i] = K;

            const absK = Math.abs(K);
            if (absK > maxAbsK) maxAbsK = absK;
            sumAbsK += absK;
            integralK += K * h * h;
            count++;
        }
    }

    for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
            const w = omega[j][i];
            if (w > peakOmega) peakOmega = w;
            if (w < minOmega) minOmega = w;
        }
    }

    return {
        omega,
        curvature,
        metrics: {
            maxAbsK,
            meanAbsK: count ? sumAbsK / count : 0,
            integralK,
            peakOmega,
            minOmega,
        },
    };
}


/**
 * Numeric Gaussian curvature at the origin for an arbitrary conformal factor,
 * used to validate the finite-difference method against analytic test metrics.
 */
export function numericKAtOrigin(omega: (x: number, y: number) => number, h = 0.04): number {
    const c = Math.log(omega(0, 0));
    const lap =
        (Math.log(omega(h, 0)) +
            Math.log(omega(-h, 0)) +
            Math.log(omega(0, h)) +
            Math.log(omega(0, -h)) -
            4 * c) /
        (h * h);
    const w0 = omega(0, 0);
    return -lap / (w0 * w0);
}


export function clampControls(c: ConformalControls): ConformalControls {
    return {
        amplitude: clamp(c.amplitude, 0, 0.95),
        width: clamp(c.width, 0.3, 2.5),
        waveNumber: clamp(c.waveNumber, 0.5, 5),
    };
}
