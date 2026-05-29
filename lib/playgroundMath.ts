/**
 * Shared scalar math helpers for playgrounds.
 *
 * These were duplicated across multiple playground logic files. Behaviour is
 * preserved byte-identically: every function body matches the private versions
 * it replaces.
 */


/** Clamp `v` to the inclusive range [`lo`, `hi`]. */
export function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

/** Clamp `x` to the inclusive range [0, 1]. */
export function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

/**
 * Round `x` and clamp the result to the integer range [0, 100]. Used by the
 * playgrounds that present metrics on a 0-100 scale.
 */
export function clamp100(x: number): number {
    return Math.max(0, Math.min(100, Math.round(x)));
}

/** Linear interpolation between `a` and `b` by `t`, no clamp. */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
