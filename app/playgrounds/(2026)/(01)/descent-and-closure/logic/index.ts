/**
 * Descent & Closure - Mathematical Core
 *
 * Sheaf-theoretic framework for the "event → process" boundary:
 * - Site of time-intervals as a cover of [0, T]
 * - Presheaf of micro-trajectories (local sections)
 * - Sheaf gluing condition (strict vs sheafification)
 * - Coarse-graining natural transformation q: X → M
 * - Closure test: Markov vs memory-kernel (Mori–Zwanzig-style)
 */

// Types
export interface Interval {
    id: number;
    a: number;
    b: number;
}

export interface LocalSection {
    intervalId: number;
    indices: number[];
    values: number[];
}

export interface MicroTrajectory {
    t: number[];
    x: number[];
}

export interface GlueResult {
    ok: boolean;
    glued: number[];
    maxPointSpread: number;
}

export interface OverlapStats {
    maxAbs: number;
    meanAbs: number;
    count: number;
}

export interface ReducedModel {
    a: number;
    b: number;
    c: number;
    pred: number[];
    rmse: number;
}

export interface SimulationParams {
    // Time
    T: number;
    dt: number;
    seed: number;
    // Micro dynamics
    lambda: number;      // event rate
    stepSigma: number;   // jump magnitude
    drift: number;       // deterministic drift
    // Cover
    intervalCount: number;
    overlapFrac: number;
    // Local sections
    consistent: boolean;
    measurementNoise: number;
    // Gluing
    tolerance: number;
    strictSheaf: boolean;
    // Macro
    macroWindow: number;
    // Closure
    useMemory: boolean;
    tau: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
    T: 10,
    dt: 0.02,
    seed: 1337,
    lambda: 3.0,
    stepSigma: 0.55,
    drift: 0.05,
    intervalCount: 6,
    overlapFrac: 0.35,
    consistent: true,
    measurementNoise: 0.0,
    tolerance: 0.15,
    strictSheaf: true,
    macroWindow: 21,
    useMemory: true,
    tau: 0.25,
};

// Deterministic PRNG (LCG)
export function mulberry32(seed: number) {
    let s = seed >>> 0;
    return () => {
        s = (1664525 * s + 1013904223) >>> 0;
        return s / 2 ** 32;
    };
}

function randn(rng: () => number): number {
    const u1 = Math.max(1e-12, rng());
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function mean(xs: number[]): number {
    if (xs.length === 0) return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function rmse(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length);
    if (n === 0) return 0;
    let s = 0;
    for (let i = 0; i < n; i++) {
        const d = a[i] - b[i];
        s += d * d;
    }
    return Math.sqrt(s / n);
}

// Least squares solver for small systems
function solveLeastSquares(X: number[][], y: number[]): number[] {
    const n = X.length;
    const p = X[0]?.length ?? 0;
    const XtX = Array.from({ length: p }, () => Array(p).fill(0));
    const Xty = Array(p).fill(0);

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < p; j++) {
            Xty[j] += X[i][j] * y[i];
            for (let k = 0; k < p; k++) {
                XtX[j][k] += X[i][j] * X[i][k];
            }
        }
    }

    // Gaussian elimination
    const A = XtX.map((row, i) => row.concat([Xty[i]]));
    for (let col = 0; col < p; col++) {
        let pivot = col;
        for (let r = col + 1; r < p; r++) {
            if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
        }
        if (Math.abs(A[pivot][col]) < 1e-12) continue;
        if (pivot !== col) {
            const tmp = A[pivot];
            A[pivot] = A[col];
            A[col] = tmp;
        }
        const div = A[col][col];
        for (let c = col; c < p + 1; c++) A[col][c] /= div;
        for (let r = 0; r < p; r++) {
            if (r === col) continue;
            const factor = A[r][col];
            for (let c = col; c < p + 1; c++) A[r][c] -= factor * A[col][c];
        }
    }

    const beta = Array(p).fill(0);
    for (let i = 0; i < p; i++) beta[i] = A[i][p] ?? 0;
    return beta;
}

/**
 * Build a cover of [0, T] with k overlapping intervals
 */
export function buildCover(T: number, k: number, overlapFrac: number): Interval[] {
    const w = T / k;
    const o = overlapFrac * w;
    const intervals: Interval[] = [];
    for (let i = 0; i < k; i++) {
        const a = Math.max(0, i * w - (i === 0 ? 0 : o));
        const b = Math.min(T, (i + 1) * w + (i === k - 1 ? 0 : o));
        intervals.push({ id: i, a, b });
    }
    return intervals;
}

/**
 * Simulate micro-trajectory (event-driven random walk with drift)
 */
export function simulateMicro(params: {
    T: number;
    dt: number;
    lambda: number;
    stepSigma: number;
    drift: number;
    seed: number;
}): MicroTrajectory {
    const { T, dt, lambda, stepSigma, drift, seed } = params;
    const rng = mulberry32(seed);
    const n = Math.floor(T / dt) + 1;
    const t: number[] = Array.from({ length: n }, (_, i) => i * dt);
    const x: number[] = Array(n).fill(0);

    for (let i = 1; i < n; i++) {
        const event = rng() < lambda * dt;
        const jump = event ? stepSigma * randn(rng) : 0;
        x[i] = x[i - 1] + drift * dt + jump;
    }

    return { t, x };
}

/**
 * Restrict a series to an interval
 */
function restrictSeries(t: number[], interval: Interval): number[] {
    const idx: number[] = [];
    for (let i = 0; i < t.length; i++) {
        if (t[i] >= interval.a - 1e-12 && t[i] <= interval.b + 1e-12) {
            idx.push(i);
        }
    }
    return idx;
}

/**
 * Create local sections from the cover
 */
export function makeLocalSections(params: {
    micro: MicroTrajectory;
    cover: Interval[];
    consistent: boolean;
    measurementNoise: number;
    lambda: number;
    stepSigma: number;
    drift: number;
    dt: number;
    seed: number;
}): LocalSection[] {
    const { micro, cover, consistent, measurementNoise, lambda, stepSigma, drift, dt, seed } = params;
    const rng = mulberry32(seed ^ 0x9e3779b9);
    const sections: LocalSection[] = [];

    for (const interval of cover) {
        const indices = restrictSeries(micro.t, interval);
        const values: number[] = [];

        if (indices.length === 0) {
            sections.push({ intervalId: interval.id, indices, values });
            continue;
        }

        if (consistent) {
            // Restriction of global section + measurement noise
            for (const gi of indices) {
                const noisy = micro.x[gi] + measurementNoise * randn(rng);
                values.push(noisy);
            }
        } else {
            // Independent local micro-history
            let x0 = micro.x[indices[0]] + measurementNoise * randn(rng);
            values.push(x0);
            for (let j = 1; j < indices.length; j++) {
                const event = rng() < lambda * dt;
                const jump = event ? stepSigma * randn(rng) : 0;
                x0 = x0 + drift * dt + jump;
                values.push(x0);
            }
        }

        sections.push({ intervalId: interval.id, indices, values });
    }

    return sections;
}

/**
 * Compute overlap inconsistency between local sections
 */
export function computeOverlapStats(
    t: number[],
    cover: Interval[],
    sections: LocalSection[]
): OverlapStats {
    let maxAbs = 0;
    let sumAbs = 0;
    let count = 0;

    const sectionMap = new Map<number, LocalSection>();
    for (const s of sections) sectionMap.set(s.intervalId, s);

    for (let a = 0; a < cover.length; a++) {
        for (let b = a + 1; b < cover.length; b++) {
            const Ia = cover[a];
            const Ib = cover[b];
            const lo = Math.max(Ia.a, Ib.a);
            const hi = Math.min(Ia.b, Ib.b);
            if (hi <= lo) continue;

            const A = sectionMap.get(Ia.id);
            const B = sectionMap.get(Ib.id);
            if (!A || !B) continue;

            const mapA = new Map<number, number>();
            for (let j = 0; j < A.indices.length; j++) {
                mapA.set(A.indices[j], A.values[j]);
            }

            for (let j = 0; j < B.indices.length; j++) {
                const gi = B.indices[j];
                const tt = t[gi];
                if (tt < lo - 1e-12 || tt > hi + 1e-12) continue;
                if (!mapA.has(gi)) continue;
                const d = Math.abs(mapA.get(gi)! - B.values[j]);
                maxAbs = Math.max(maxAbs, d);
                sumAbs += d;
                count++;
            }
        }
    }

    return { maxAbs, meanAbs: count ? sumAbs / count : 0, count };
}

/**
 * Glue local sections (strict sheaf condition or sheafification)
 */
export function glueSections(params: {
    t: number[];
    cover: Interval[];
    sections: LocalSection[];
    tolerance: number;
    strict: boolean;
}): GlueResult {
    const { t, cover, sections, tolerance, strict } = params;

    // Collect all values at each global index
    const buckets: Map<number, number[]> = new Map();
    for (let i = 0; i < t.length; i++) buckets.set(i, []);

    for (const section of sections) {
        for (let j = 0; j < section.indices.length; j++) {
            buckets.get(section.indices[j])!.push(section.values[j]);
        }
    }

    // Check strict gluing condition
    let ok = true;
    let maxPointSpread = 0;

    for (let i = 0; i < t.length; i++) {
        const vals = buckets.get(i)!;
        if (vals.length <= 1) continue;
        const lo = Math.min(...vals);
        const hi = Math.max(...vals);
        maxPointSpread = Math.max(maxPointSpread, hi - lo);
        if (strict && hi - lo > tolerance) ok = false;
    }

    const glued: number[] = Array(t.length).fill(NaN);

    if (strict && !ok) {
        return { ok: false, glued, maxPointSpread };
    }

    // Sheafification: average where multiple locals exist
    for (let i = 0; i < t.length; i++) {
        const vals = buckets.get(i)!;
        if (vals.length === 0) continue;
        glued[i] = mean(vals);
    }

    return { ok: true, glued, maxPointSpread };
}

/**
 * Moving average (coarse-graining q: X → M)
 */
export function movingAverage(x: number[], w: number): number[] {
    const n = x.length;
    const y = Array(n).fill(NaN);
    const half = Math.max(0, Math.floor(w / 2));

    for (let i = 0; i < n; i++) {
        const a = Math.max(0, i - half);
        const b = Math.min(n - 1, i + half);
        let s = 0;
        let c = 0;
        for (let j = a; j <= b; j++) {
            if (Number.isFinite(x[j])) {
                s += x[j];
                c++;
            }
        }
        y[i] = c ? s / c : NaN;
    }
    return y;
}

/**
 * Fit and predict reduced macro dynamics (Markov vs memory kernel)
 */
export function fitReducedModel(params: {
    dt: number;
    macro: number[];
    tau: number;
    useMemory: boolean;
}): ReducedModel {
    const { dt, macro, tau, useMemory } = params;
    const n = macro.length;

    if (n < 5) {
        return { a: 0, b: 0, c: 0, pred: macro.slice(), rmse: 0 };
    }

    const dm: number[] = [];
    const feats: number[][] = [];

    // Exponential kernel convolution
    const alpha = tau > 1e-6 ? Math.exp(-dt / tau) : 0;
    let conv = 0;

    for (let i = 0; i < n - 1; i++) {
        const m = macro[i];
        const mNext = macro[i + 1];
        if (!Number.isFinite(m) || !Number.isFinite(mNext)) continue;

        if (useMemory) {
            conv = alpha * conv + m * dt;
        }

        const d = (mNext - m) / dt;
        dm.push(d);
        if (useMemory) {
            feats.push([m, conv, 1]);
        } else {
            feats.push([m, 1]);
        }
    }

    const beta = solveLeastSquares(feats, dm);

    let a = 0, b = 0, c = 0;
    if (useMemory) {
        a = beta[0] ?? 0;
        c = beta[1] ?? 0;
        b = beta[2] ?? 0;
    } else {
        a = beta[0] ?? 0;
        b = beta[1] ?? 0;
    }

    // Predict forward
    const pred = Array(n).fill(NaN);
    pred[0] = macro[0];
    conv = 0;

    for (let i = 0; i < n - 1; i++) {
        const m = pred[i];
        if (!Number.isFinite(m)) {
            pred[i + 1] = NaN;
            continue;
        }
        if (useMemory) {
            conv = alpha * conv + m * dt;
            pred[i + 1] = m + dt * (a * m + c * conv + b);
        } else {
            pred[i + 1] = m + dt * (a * m + b);
        }
    }

    const validMacro = macro.filter(Number.isFinite);
    const validPred = pred.filter(Number.isFinite);
    const rm = rmse(validMacro, validPred);

    return { a, b, c, pred, rmse: rm };
}

/**
 * Run full simulation pipeline
 */
export function runSimulation(params: SimulationParams) {
    const cover = buildCover(params.T, params.intervalCount, params.overlapFrac);

    const micro = simulateMicro({
        T: params.T,
        dt: params.dt,
        lambda: params.lambda,
        stepSigma: params.stepSigma,
        drift: params.drift,
        seed: params.seed,
    });

    const sections = makeLocalSections({
        micro,
        cover,
        consistent: params.consistent,
        measurementNoise: params.measurementNoise,
        lambda: params.lambda,
        stepSigma: params.stepSigma,
        drift: params.drift,
        dt: params.dt,
        seed: params.seed,
    });

    const overlapStats = computeOverlapStats(micro.t, cover, sections);

    const glueResult = glueSections({
        t: micro.t,
        cover,
        sections,
        tolerance: params.tolerance,
        strict: params.strictSheaf,
    });

    // Compute macro from glued (or fallback to micro)
    const base = glueResult.ok ? glueResult.glued : micro.x;
    const w = Math.max(3, Math.floor(params.macroWindow) | 1);
    const macro = movingAverage(base, w);

    const reduced = fitReducedModel({
        dt: params.dt,
        macro,
        tau: Math.max(1e-6, params.tau),
        useMemory: params.useMemory,
    });

    return {
        cover,
        micro,
        sections,
        overlapStats,
        glueResult,
        macro,
        reduced,
    };
}
