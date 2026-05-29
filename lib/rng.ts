/**
 * Deterministic seeded RNG and Gaussian sampler for playgrounds.
 *
 * Lifted verbatim from `audience-attractor`. Determinism is the contract: for
 * any two callers that pass the same seed sequence, the outputs must be
 * bit-identical. Do not refactor the bodies.
 */


/**
 * Pseudo-random number in [0, 1) given a numeric seed.
 *
 * Uses the standard `sin` trick: deterministic, cheap, good enough for the
 * visual / simulation purposes here.
 */
export function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

/**
 * Standard-normal sample given a numeric seed.
 *
 * Box-Muller transform over two `seededRandom` draws (offset by 991 to
 * decorrelate u and v).
 */
export function gaussian(seed: number): number {
    const u = Math.max(0.000001, seededRandom(seed));
    const v = Math.max(0.000001, seededRandom(seed + 991));
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
