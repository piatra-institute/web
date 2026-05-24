// pure physics primitives for the kerr null geodesic playground.
// units throughout: M = 1.

export interface KerrParams {
    M: number;
    a: number;
    E: number;
    L: number;
    Q: number;
}

export interface Horizons {
    rPlus: number;
    rMinus: number;
}

export function horizons(M: number, a: number): Horizons {
    const disc = Math.max(0, M * M - a * a);
    const s = Math.sqrt(disc);
    return { rPlus: M + s, rMinus: M - s };
}

export function delta(r: number, M: number, a: number): number {
    return r * r - 2 * M * r + a * a;
}

// kerr null radial potential:
// R(r) = [(r^2 + a^2) E - a L]^2 - delta(r) * [Q + (L - a E)^2]
export function radialPotential(r: number, p: KerrParams): number {
    const { M, a, E, L, Q } = p;
    const A = (r * r + a * a) * E - a * L;
    const B = Q + (L - a * E) ** 2;
    return A * A - delta(r, M, a) * B;
}

// closed form turning points when E = 0:
// r_{min,max} = M -/+ sqrt(M^2 - a^2 Q / (Q + L^2))
export function analyticZeroEnergyTurnings(
    M: number,
    a: number,
    L: number,
    Q: number,
): { rMin: number; rMax: number } | null {
    const denom = Q + L * L;
    if (denom <= 0) return null;
    const inside = M * M - (a * a * Q) / denom;
    if (inside < 0) return null;
    const s = Math.sqrt(inside);
    return { rMin: M - s, rMax: M + s };
}

function bisectRoot(
    fn: (r: number) => number,
    lo: number,
    hi: number,
    iters = 60,
): number | null {
    let fa = fn(lo);
    let fb = fn(hi);
    if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null;
    if (Math.abs(fa) < 1e-12) return lo;
    if (Math.abs(fb) < 1e-12) return hi;
    if (fa * fb > 0) return null;
    let a = lo;
    let b = hi;
    for (let i = 0; i < iters; i++) {
        const mid = 0.5 * (a + b);
        const fm = fn(mid);
        if (!Number.isFinite(fm)) return null;
        if (Math.abs(fm) < 1e-13) return mid;
        if (fa * fm <= 0) {
            b = mid;
            fb = fm;
        } else {
            a = mid;
            fa = fm;
        }
    }
    return 0.5 * (a + b);
}

function uniqueSorted(values: number[], eps = 1e-4): number[] {
    const sorted = values.filter(Number.isFinite).sort((x, y) => x - y);
    const out: number[] = [];
    for (const v of sorted) {
        if (!out.length || Math.abs(v - out[out.length - 1]) > eps) out.push(v);
    }
    return out;
}

// 1200-sample bracketed root finder over [minR, maxR].
export function getRoots(
    fn: (r: number) => number,
    minR: number,
    maxR: number,
    samples = 1200,
): number[] {
    const roots: number[] = [];
    let x0 = minR;
    let y0 = fn(x0);
    for (let i = 1; i <= samples; i++) {
        const x1 = minR + ((maxR - minR) * i) / samples;
        const y1 = fn(x1);
        if (Number.isFinite(y0) && Number.isFinite(y1)) {
            if (Math.abs(y1) < 1e-5) roots.push(x1);
            const s0 = Math.sign(y0);
            const s1 = Math.sign(y1);
            if (s0 !== 0 && s1 !== 0 && s0 !== s1) {
                const r = bisectRoot(fn, x0, x1);
                if (r !== null) roots.push(r);
            }
        }
        x0 = x1;
        y0 = y1;
    }
    return uniqueSorted(roots);
}

// the radial range we scan for roots. -1.6 includes the inner sheet edge for moderate a;
// 3.8 is a few schwarzschild radii of outer headroom.
export const SCAN_MIN_R = -1.6;
export const SCAN_MAX_R = 3.8;

export interface AllowedInterval {
    lo: number;
    hi: number;
    span: number;
}

// returns the connected intervals where R(r) >= 0 across [SCAN_MIN_R, SCAN_MAX_R].
export function allowedIntervals(p: KerrParams, roots: number[]): AllowedInterval[] {
    const boundaries = [SCAN_MIN_R, ...roots.filter((r) => r > SCAN_MIN_R && r < SCAN_MAX_R), SCAN_MAX_R];
    const intervals: AllowedInterval[] = [];
    for (let i = 0; i < boundaries.length - 1; i++) {
        const lo = boundaries[i];
        const hi = boundaries[i + 1];
        if (hi - lo < 1e-6) continue;
        const mid = 0.5 * (lo + hi);
        if (radialPotential(mid, p) >= 0) {
            intervals.push({ lo, hi, span: hi - lo });
        }
    }
    return intervals;
}

// the photon lives in one allowed interval. take the widest as the main corridor.
export function mainAllowedInterval(intervals: AllowedInterval[]): AllowedInterval | null {
    if (intervals.length === 0) return null;
    let best = intervals[0];
    for (const v of intervals) if (v.span > best.span) best = v;
    return best;
}

export function isBoundaryUnbounded(interval: AllowedInterval): boolean {
    return interval.hi >= SCAN_MAX_R - 1e-3;
}
