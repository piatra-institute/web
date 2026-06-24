/**
 * Hsp90 canalization model core.
 *
 * A phenotype is a point in a three-dimensional trait space. Its displacement
 * from the canalized optimum (the origin) has two sources:
 *
 *   - latent genetic variation, with per-axis amplitude scaled by sigma_G.
 *     The axes are anisotropic (full, 0.4x, 0.2x) so that genetic variation is
 *     concentrated on the first trait axis, as cryptic variation tends to be.
 *   - environmental / developmental noise, with isotropic amplitude sigma_E.
 *
 * The latent displacement on each axis is the genetic term plus the
 * environmental term. The total latent vector is (x, y, z) with radius
 * r = sqrt(x^2 + y^2 + z^2).
 *
 * Hsp90 acts as a buffer. Each phenotype is pulled back toward the optimum by a
 * factor f(r) in [0, 1]:
 *
 *     f(r) = 1 / (1 + exp(-k * (r - (1 - C))))
 *
 * where C is the chaperone capacity and k the buffering sharpness. The buffered
 * phenotype is the latent vector scaled by f. Counter-intuitively f grows with
 * r: small deviations near the optimum are left alone (f near 0, strong pull to
 * center is not needed because they are already close), while large deviations
 * past the threshold radius (1 - C) escape buffering (f near 1, displacement
 * passes through). Raising capacity C lowers the threshold so more of trait
 * space is left expressed; lowering C (Hsp90 inhibition or stress) raises the
 * threshold so more variation is masked near the center.
 *
 * The canalization readout is the variance ratio
 *
 *     ratio = E[ r_buffered^2 ] / E[ r_latent^2 ]
 *
 * over the latent distribution. ratio near 0 means strong canalization (most
 * variance is hidden); ratio near 1 means the buffer is depleted and latent
 * variation is fully expressed. "hidden variance" is (1 - ratio).
 *
 * The interactive Viewer estimates this ratio by Monte Carlo sampling. For
 * reproducible calibration the same physics is integrated deterministically
 * here over a fixed quadrature grid, so `predicted` values never depend on a
 * random seed.
 */

export interface ModelParams {
    /** chaperone capacity C in [0, 1]; higher = buffer is "spent" sooner */
    capacity: number;
    /** genetic standard-deviation scale sigma_G */
    gSD: number;
    /** environmental standard-deviation scale sigma_E */
    eSD: number;
    /** buffering sharpness k */
    k: number;
}

/** per-axis anisotropy of genetic variation (first axis carries most). */
export const GENETIC_AXIS_SCALE: readonly [number, number, number] = [1, 0.4, 0.2];

/**
 * Logistic buffering factor f(r) in [0, 1]. The displacement of a phenotype at
 * latent radius r is scaled by this factor after Hsp90 acts.
 */
export function bufferingFactor(r: number, capacity: number, k: number): number {
    return 1 / (1 + Math.exp(-k * (r - (1 - capacity))));
}

/**
 * One latent draw mapped through the buffer.
 * Returns the latent and buffered squared radii for a uniform draw vector
 * `u` whose six entries are independent uniforms on [-1, 1]
 * (three genetic, three environmental).
 */
export function evaluateDraw(
    u: readonly [number, number, number, number, number, number],
    params: ModelParams,
): { latentSq: number; bufferedSq: number } {
    const { capacity, gSD, eSD, k } = params;
    const [ug0, ug1, ug2, ue0, ue1, ue2] = u;

    const x = gSD * GENETIC_AXIS_SCALE[0] * ug0 + eSD * ue0;
    const y = gSD * GENETIC_AXIS_SCALE[1] * ug1 + eSD * ue1;
    const z = gSD * GENETIC_AXIS_SCALE[2] * ug2 + eSD * ue2;

    const latentSq = x * x + y * y + z * z;
    const r = Math.sqrt(latentSq);
    const f = bufferingFactor(r, capacity, k);
    const bufferedSq = latentSq * f * f;

    return { latentSq, bufferedSq };
}

export interface VarianceResult {
    /** mean squared latent radius E[r^2] */
    latentVariance: number;
    /** mean squared buffered radius E[r_buffered^2] */
    bufferedVariance: number;
    /** bufferedVariance / latentVariance in [0, 1]; 0 = full canalization */
    ratio: number;
    /** fraction of latent variance hidden by the buffer, 1 - ratio */
    hiddenFraction: number;
}

/**
 * Deterministic variance ratio by tensor-product midpoint quadrature over the
 * six uniform axes. `grid` is the number of points per axis (default 6 -> 6^6 =
 * 46656 evaluations). The result is reproducible and contains no randomness, so
 * it is safe to use as a calibration target.
 */
export function computeVarianceDeterministic(params: ModelParams, grid = 6): VarianceResult {
    // midpoints of `grid` equal sub-intervals of [-1, 1]
    const nodes: number[] = [];
    for (let i = 0; i < grid; i++) {
        nodes.push(-1 + (2 * (i + 0.5)) / grid);
    }

    let sumLat = 0;
    let sumBuf = 0;
    let count = 0;

    for (const a of nodes) {
        for (const b of nodes) {
            for (const c of nodes) {
                for (const d of nodes) {
                    for (const e of nodes) {
                        for (const g of nodes) {
                            const { latentSq, bufferedSq } = evaluateDraw(
                                [a, b, c, d, e, g],
                                params,
                            );
                            sumLat += latentSq;
                            sumBuf += bufferedSq;
                            count += 1;
                        }
                    }
                }
            }
        }
    }

    const latentVariance = sumLat / count;
    const bufferedVariance = sumBuf / count;
    const ratio = latentVariance > 0 ? bufferedVariance / latentVariance : 0;

    return {
        latentVariance,
        bufferedVariance,
        ratio,
        hiddenFraction: 1 - ratio,
    };
}

/** convenience: hidden-variance percentage for a parameter set. */
export function hiddenVariancePercent(params: ModelParams, grid = 6): number {
    return computeVarianceDeterministic(params, grid).hiddenFraction * 100;
}

/**
 * Qualitative regime of canalization from the hidden-variance fraction.
 * Thresholds follow the interpretation shown in the Settings panel.
 */
export type CanalizationRegime = 'strong' | 'partial' | 'depleted';

export function classifyRegime(hiddenFraction: number): CanalizationRegime {
    const hidden = hiddenFraction * 100;
    if (hidden > 70) return 'strong';
    if (hidden > 30) return 'partial';
    return 'depleted';
}

/** threshold radius at which buffering crosses f = 0.5. */
export function thresholdRadius(capacity: number): number {
    return 1 - capacity;
}
