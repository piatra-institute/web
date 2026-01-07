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
    weights: number[];
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

export interface PairOverlapDiagnostic {
    intervals: [number, number];
    overlap: [number, number];
    maxAbs: number;
    meanAbs: number;
    sampleCount: number;
    ok: boolean;
}

export interface TripleCocycleDiagnostic {
    intervals: [number, number, number];
    intersection: [number, number];
    maxViolation: number;
    sampleCount: number;
    ok: boolean;
}

export interface CommuteDiagnostic {
    source: number;
    target: number;
    meanDiff: number;
    maxDiff: number;
    sampleCount: number;
}

export interface OverlapStats {
    maxAbs: number;
    meanAbs: number;
    count: number;
    pairwise: PairOverlapDiagnostic[];
    triple: TripleCocycleDiagnostic[];
}

export interface MutualInformationDiagnostic {
    intervals: [number, number];
    bits: number;
    sampleCount: number;
}

export interface MacroStats {
    mean: number;
    variance: number;
    skewness: number;
    kurtosis: number;
    autocorrelation: { lag: number; value: number }[];
    momentMatrix: number[][];
}

export interface MemoryKernelEstimate {
    lags: number[];
    weights: number[];
    halfLife: number;
}

export interface MarkovTestResult {
    statistic: number;
    df: number;
    pValue: number;
    passed: boolean;
}

export interface ReducedModel {
    a: number;
    b: number;
    c: number;
    pred: number[];
    rmse: number;
    residuals: number[];
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
    kernelLength: number;
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
    kernelLength: 32,
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

function weightedMean(values: number[], weights: number[]): number {
    let num = 0;
    let den = 0;
    for (let i = 0; i < values.length; i++) {
        const w = weights[i] ?? 0;
        if (!Number.isFinite(values[i]) || !Number.isFinite(w) || w <= 0) continue;
        num += values[i] * w;
        den += w;
    }
    return den > 0 ? num / den : 0;
}

function centralMoments(series: number[]): {
    mean: number;
    variance: number;
    skewness: number;
    kurtosis: number;
} {
    const values = series.filter(Number.isFinite);
    if (values.length === 0) {
        return { mean: 0, variance: 0, skewness: 0, kurtosis: 0 };
    }
    const m = mean(values);
    let m2 = 0;
    let m3 = 0;
    let m4 = 0;
    for (const v of values) {
        const d = v - m;
        const d2 = d * d;
        m2 += d2;
        m3 += d2 * d;
        m4 += d2 * d2;
    }
    const n = values.length;
    const variance = n > 0 ? m2 / n : 0;
    const skewness = variance > 1e-12 ? (m3 / n) / Math.pow(variance, 1.5) : 0;
    const kurtosis = variance > 1e-12 ? (m4 / n) / (variance * variance) : 0;
    return { mean: m, variance, skewness, kurtosis };
}

function autocorrelation(series: number[], maxLag: number): { lag: number; value: number }[] {
    const values = series.filter(Number.isFinite);
    if (values.length === 0) return [];
    const m = mean(values);
    const denom = values.reduce((acc, v) => acc + (v - m) * (v - m), 0);
    if (denom === 0) {
        return Array.from({ length: maxLag }, (_, i) => ({ lag: i + 1, value: 0 }));
    }
    const ac: { lag: number; value: number }[] = [];
    for (let lag = 1; lag <= maxLag; lag++) {
        let num = 0;
        for (let i = 0; i < values.length - lag; i++) {
            num += (values[i] - m) * (values[i + lag] - m);
        }
        ac.push({ lag, value: num / denom });
    }
    return ac;
}

function quantize(series: number[], bins: number): { values: number[]; min: number; max: number } {
    const filtered = series.filter(Number.isFinite);
    if (filtered.length === 0) {
        return { values: [], min: 0, max: 0 };
    }
    const lo = Math.min(...filtered);
    const hi = Math.max(...filtered);
    const span = hi - lo + 1e-9;
    const quantized = series.map((v) => {
        if (!Number.isFinite(v)) return -1;
        const n = Math.floor(((v - lo) / span) * bins);
        return Math.max(0, Math.min(bins - 1, n));
    });
    return { values: quantized, min: lo, max: hi };
}

function mutualInformation(a: number[], b: number[], bins = 12): number {
    if (a.length !== b.length || a.length === 0) return 0;
    const qa = quantize(a, bins);
    const qb = quantize(b, bins);
    const valuesA = qa.values;
    const valuesB = qb.values;
    const joint = Array.from({ length: bins }, () => Array(bins).fill(0));
    const marginalA = Array(bins).fill(0);
    const marginalB = Array(bins).fill(0);
    let n = 0;
    for (let i = 0; i < valuesA.length; i++) {
        const ia = valuesA[i];
        const ib = valuesB[i];
        if (ia < 0 || ib < 0) continue;
        joint[ia][ib] += 1;
        marginalA[ia] += 1;
        marginalB[ib] += 1;
        n++;
    }
    if (n === 0) return 0;

    let mi = 0;
    for (let i = 0; i < bins; i++) {
        for (let j = 0; j < bins; j++) {
            const pij = joint[i][j] / n;
            if (pij <= 0) continue;
            const pi = marginalA[i] / n;
            const pj = marginalB[j] / n;
            if (pi <= 0 || pj <= 0) continue;
            mi += pij * Math.log2(pij / (pi * pj));
        }
    }
    return mi;
}

// Regularized upper incomplete gamma (Γ(a, x) / Γ(a)) using series/continued fraction
function logGamma(z: number): number {
    const g = 7;
    const p = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7,
    ];
    if (z < 0.5) {
        return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
    }
    z -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) {
        x += p[i] / (z + i);
    }
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function gammaSeries(a: number, x: number): { value: number; lnGammaA: number } {
    const lnGammaA = logGamma(a);
    if (x === 0) {
        return { value: 0, lnGammaA };
    }
    let sum = 1 / a;
    let term = sum;
    for (let n = 1; n < 1000; n++) {
        term *= x / (a + n);
        sum += term;
        if (Math.abs(term) < Math.abs(sum) * 1e-12) break;
    }
    return { value: sum * Math.exp(-x + a * Math.log(x) - lnGammaA), lnGammaA };
}

function gammaContinuedFraction(a: number, x: number): { value: number; lnGammaA: number } {
    const lnGammaA = logGamma(a);
    let b = x + 1 - a;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i < 1000; i++) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        c = b + an / c;
        if (Math.abs(c) < 1e-30) c = 1e-30;
        d = 1 / d;
        const delta = d * c;
        h *= delta;
        if (Math.abs(delta - 1) < 1e-12) break;
    }
    return { value: h * Math.exp(-x + a * Math.log(x) - lnGammaA), lnGammaA };
}

function regularizedGammaQ(a: number, x: number): number {
    if (x < 0 || a <= 0) return NaN;
    if (x === 0) return 1;
    if (x < a + 1) {
        const { value } = gammaSeries(a, x);
        return 1 - value;
    }
    const { value } = gammaContinuedFraction(a, x);
    return value;
}

function chiSquareSurvival(x: number, df: number): number {
    if (df <= 0) return 1;
    return regularizedGammaQ(df / 2, x / 2);
}

function ljungBox(residuals: number[], maxLag: number): MarkovTestResult {
    const series = residuals.filter(Number.isFinite);
    const n = series.length;
    if (n === 0) {
        return { statistic: 0, df: maxLag, pValue: 1, passed: true };
    }
    const ac = autocorrelation(series, maxLag);
    const Q =
        n * (n + 2) *
        ac.reduce((acc, { lag, value }) => {
            return acc + (value * value) / (n - lag);
        }, 0);
    const pValue = chiSquareSurvival(Q, maxLag);
    return {
        statistic: Q,
        df: maxLag,
        pValue,
        passed: pValue > 0.05,
    };
}

function approxHalfLife(weights: number[], dt: number): number {
    if (weights.length === 0) return 0;
    const positive = weights.map(Math.abs);
    const max = Math.max(...positive);
    if (max === 0) return 0;
    for (let i = 0; i < positive.length; i++) {
        if (positive[i] <= max / 2) {
            return i * dt;
        }
    }
    return positive.length * dt;
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
    const measurementVar = Math.max(1e-4, measurementNoise * measurementNoise);
    const baseWeight = measurementVar > 0 ? 1 / measurementVar : 1e6;

    for (const interval of cover) {
        const indices = restrictSeries(micro.t, interval);
        const values: number[] = [];
        const weights: number[] = [];

        if (indices.length === 0) {
            sections.push({ intervalId: interval.id, indices, values, weights });
            continue;
        }

        if (consistent) {
            // Restriction of global section + measurement noise
            for (const gi of indices) {
                const noisy = micro.x[gi] + measurementNoise * randn(rng);
                values.push(noisy);
                weights.push(baseWeight);
            }
        } else {
            // Independent local micro-history
            let x0 = micro.x[indices[0]] + measurementNoise * randn(rng);
            values.push(x0);
            weights.push(baseWeight);
            for (let j = 1; j < indices.length; j++) {
                const event = rng() < lambda * dt;
                const jump = event ? stepSigma * randn(rng) : 0;
                x0 = x0 + drift * dt + jump;
                values.push(x0);
                weights.push(baseWeight);
            }
        }

        sections.push({ intervalId: interval.id, indices, values, weights });
    }

    return sections;
}

/**
 * Compute overlap inconsistency between local sections
 */
export function computeOverlapStats(
    t: number[],
    cover: Interval[],
    sections: LocalSection[],
    tolerance: number
): OverlapStats {
    let maxAbs = 0;
    let sumAbs = 0;
    let count = 0;
    const pairwise: PairOverlapDiagnostic[] = [];
    const tripleDiagnostics: TripleCocycleDiagnostic[] = [];

    const sectionMap = new Map<number, LocalSection>();
    const sectionValueMaps = new Map<number, Map<number, number>>();
    for (const s of sections) {
        sectionMap.set(s.intervalId, s);
        const valueMap = new Map<number, number>();
        for (let j = 0; j < s.indices.length; j++) {
            valueMap.set(s.indices[j], s.values[j]);
        }
        sectionValueMaps.set(s.intervalId, valueMap);
    }

    for (let a = 0; a < cover.length; a++) {
        for (let b = a + 1; b < cover.length; b++) {
            const Ia = cover[a];
            const Ib = cover[b];
            const lo = Math.max(Ia.a, Ib.a);
            const hi = Math.min(Ia.b, Ib.b);
            if (hi <= lo) continue;

            const mapA = sectionValueMaps.get(Ia.id);
            const mapB = sectionValueMaps.get(Ib.id);
            if (!mapA || !mapB) continue;

            let localMax = 0;
            let localSum = 0;
            let localCount = 0;

            for (const [gi, valA] of mapA.entries()) {
                const tt = t[gi];
                if (tt < lo - 1e-12 || tt > hi + 1e-12) continue;
                if (!mapB.has(gi)) continue;
                const diff = Math.abs(valA - mapB.get(gi)!);
                localMax = Math.max(localMax, diff);
                localSum += diff;
                localCount++;
            }

            if (localCount > 0) {
                maxAbs = Math.max(maxAbs, localMax);
                sumAbs += localSum;
                count += localCount;
                pairwise.push({
                    intervals: [Ia.id, Ib.id],
                    overlap: [lo, hi],
                    maxAbs: localMax,
                    meanAbs: localSum / localCount,
                    sampleCount: localCount,
                    ok: localMax <= tolerance,
                });
            }
        }
    }

    // Triple overlaps for Čech cocycle diagnostics
    for (let a = 0; a < cover.length; a++) {
        for (let b = a + 1; b < cover.length; b++) {
            for (let c = b + 1; c < cover.length; c++) {
                const Ia = cover[a];
                const Ib = cover[b];
                const Ic = cover[c];
                const lo = Math.max(Ia.a, Ib.a, Ic.a);
                const hi = Math.min(Ia.b, Ib.b, Ic.b);
                if (hi <= lo) continue;

                const mapA = sectionValueMaps.get(Ia.id);
                const mapB = sectionValueMaps.get(Ib.id);
                const mapC = sectionValueMaps.get(Ic.id);
                if (!mapA || !mapB || !mapC) continue;

                let localMax = 0;
                let localCount = 0;

                for (const [gi, valA] of mapA.entries()) {
                    const tt = t[gi];
                    if (tt < lo - 1e-12 || tt > hi + 1e-12) continue;
                    if (!mapB.has(gi) || !mapC.has(gi)) continue;
                    const valB = mapB.get(gi)!;
                    const valC = mapC.get(gi)!;
                    const hiLocal = Math.max(valA, valB, valC);
                    const loLocal = Math.min(valA, valB, valC);
                    const spread = hiLocal - loLocal;
                    localMax = Math.max(localMax, spread);
                    localCount++;
                }

                if (localCount > 0) {
                    tripleDiagnostics.push({
                        intervals: [Ia.id, Ib.id, Ic.id],
                        intersection: [lo, hi],
                        maxViolation: localMax,
                        sampleCount: localCount,
                        ok: localMax <= tolerance,
                    });
                }
            }
        }
    }

    return {
        maxAbs,
        meanAbs: count ? sumAbs / count : 0,
        count,
        pairwise,
        triple: tripleDiagnostics,
    };
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
    const buckets: Map<number, { value: number; weight: number }[]> = new Map();
    for (let i = 0; i < t.length; i++) buckets.set(i, []);

    for (const section of sections) {
        for (let j = 0; j < section.indices.length; j++) {
            buckets.get(section.indices[j])!.push({
                value: section.values[j],
                weight: section.weights[j] ?? 1,
            });
        }
    }

    // Check strict gluing condition
    let ok = true;
    let maxPointSpread = 0;

    for (let i = 0; i < t.length; i++) {
        const vals = buckets.get(i)!;
        if (vals.length <= 1) continue;
        const numbers = vals.map((v) => v.value);
        const lo = Math.min(...numbers);
        const hi = Math.max(...numbers);
        maxPointSpread = Math.max(maxPointSpread, hi - lo);
        if (strict && hi - lo > tolerance) ok = false;
    }

    const glued: number[] = Array(t.length).fill(NaN);

    if (strict && !ok) {
        return { ok: false, glued, maxPointSpread };
    }

    // Sheafification: average where multiple locals exist
    for (let i = 0; i < t.length; i++) {
        const samples = buckets.get(i)!;
        if (samples.length === 0) continue;
        const values = samples.map((s) => s.value);
        const weights = samples.map((s) => (s.weight > 0 ? s.weight : 1));
        glued[i] = weightedMean(values, weights);
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

function movingAverageMap(section: LocalSection, window: number): Map<number, number> {
    const smoothed = movingAverage(section.values, window);
    const map = new Map<number, number>();
    for (let i = 0; i < section.indices.length; i++) {
        if (!Number.isFinite(smoothed[i])) continue;
        map.set(section.indices[i], smoothed[i]);
    }
    return map;
}

function computeCommuteDiagnostics(params: {
    cover: Interval[];
    sections: LocalSection[];
    macroWindow: number;
}): CommuteDiagnostic[] {
    const { cover, sections, macroWindow } = params;
    const macroMap = new Map<number, Map<number, number>>();
    const sectionMap = new Map<number, LocalSection>();
    for (const section of sections) {
        macroMap.set(section.intervalId, movingAverageMap(section, macroWindow));
        sectionMap.set(section.intervalId, section);
    }

    const diagnostics: CommuteDiagnostic[] = [];

    for (let i = 0; i < cover.length; i++) {
        for (let j = 0; j < cover.length; j++) {
            if (i === j) continue;
            const source = cover[i];
            const target = cover[j];
            if (source.a - 1e-9 > target.a || source.b + 1e-9 < target.b) {
                continue; // target not contained in source
            }
            const sourceMacro = macroMap.get(source.id);
            const targetMacro = macroMap.get(target.id);
            const targetSection = sectionMap.get(target.id);
            if (!sourceMacro || !targetMacro || !targetSection) continue;

            let sum = 0;
            let max = 0;
            let samples = 0;

            for (const gi of targetSection.indices) {
                if (!sourceMacro.has(gi) || !targetMacro.has(gi)) continue;
                const diff = Math.abs(sourceMacro.get(gi)! - targetMacro.get(gi)!);
                sum += diff;
                max = Math.max(max, diff);
                samples++;
            }

            if (samples > 0) {
                diagnostics.push({
                    source: source.id,
                    target: target.id,
                    meanDiff: sum / samples,
                    maxDiff: max,
                    sampleCount: samples,
                });
            }
        }
    }

    return diagnostics;
}

function computeMutualInformationDiagnostics(params: {
    t: number[];
    cover: Interval[];
    sections: LocalSection[];
}): MutualInformationDiagnostic[] {
    const { t, cover, sections } = params;
    const diag: MutualInformationDiagnostic[] = [];
    const sectionValueMaps = new Map<number, Map<number, number>>();
    for (const section of sections) {
        const map = new Map<number, number>();
        for (let i = 0; i < section.indices.length; i++) {
            map.set(section.indices[i], section.values[i]);
        }
        sectionValueMaps.set(section.intervalId, map);
    }

    for (let a = 0; a < cover.length; a++) {
        for (let b = a + 1; b < cover.length; b++) {
            const Ia = cover[a];
            const Ib = cover[b];
            const lo = Math.max(Ia.a, Ib.a);
            const hi = Math.min(Ia.b, Ib.b);
            if (hi <= lo) continue;

            const mapA = sectionValueMaps.get(Ia.id);
            const mapB = sectionValueMaps.get(Ib.id);
            if (!mapA || !mapB) continue;

            const seriesA: number[] = [];
            const seriesB: number[] = [];

            for (const [gi, valA] of mapA.entries()) {
                const tt = t[gi];
                if (tt < lo - 1e-12 || tt > hi + 1e-12) continue;
                if (!mapB.has(gi)) continue;
                seriesA.push(valA);
                seriesB.push(mapB.get(gi)!);
            }

            if (seriesA.length > 5) {
                diag.push({
                    intervals: [Ia.id, Ib.id],
                    bits: mutualInformation(seriesA, seriesB),
                    sampleCount: seriesA.length,
                });
            }
        }
    }

    return diag;
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
        return { a: 0, b: 0, c: 0, pred: macro.slice(), rmse: 0, residuals: [] };
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

    const beta = feats.length > 0 ? solveLeastSquares(feats, dm) : [];

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

    const residuals: number[] = [];

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

    for (let i = 0; i < dm.length; i++) {
        const phi = feats[i];
        let predicted = 0;
        for (let j = 0; j < phi.length; j++) {
            predicted += (beta[j] ?? 0) * phi[j];
        }
        residuals.push(dm[i] - predicted);
    }

    const validMacro = macro.filter(Number.isFinite);
    const validPred = pred.filter(Number.isFinite);
    const rm = rmse(validMacro, validPred);

    return { a, b, c, pred, rmse: rm, residuals };
}

export function estimateMemoryKernel(params: {
    macro: number[];
    dt: number;
    length: number;
}): { estimate: MemoryKernelEstimate; residuals: number[] } {
    const { macro, dt, length } = params;
    const L = Math.max(1, Math.min(length, 128));
    if (macro.length <= L + 2) {
        return { estimate: { lags: [], weights: [], halfLife: 0 }, residuals: [] };
    }

    const feats: number[][] = [];
    const targets: number[] = [];

    for (let i = L; i < macro.length - 1; i++) {
        const current = macro[i];
        const next = macro[i + 1];
        if (!Number.isFinite(current) || !Number.isFinite(next)) continue;
        const row: number[] = [current];
        let valid = true;
        for (let k = 1; k <= L; k++) {
            const past = macro[i - k];
            if (!Number.isFinite(past)) {
                valid = false;
                break;
            }
            row.push(past);
        }
        if (!valid) continue;
        feats.push(row);
        targets.push((next - current) / dt);
    }

    if (targets.length === 0) {
        return { estimate: { lags: [], weights: [], halfLife: 0 }, residuals: [] };
    }

    const beta = solveLeastSquares(feats, targets);
    const kernelWeights = beta.slice(1).map((w) => w);
    const lags = Array.from({ length: kernelWeights.length }, (_, i) => (i + 1) * dt);

    const residuals: number[] = [];
    for (let i = 0; i < targets.length; i++) {
        const phi = feats[i];
        let predicted = 0;
        for (let j = 0; j < phi.length; j++) {
            predicted += (beta[j] ?? 0) * phi[j];
        }
        residuals.push(targets[i] - predicted);
    }

    return {
        estimate: {
            lags,
            weights: kernelWeights,
            halfLife: approxHalfLife(kernelWeights, dt),
        },
        residuals,
    };
}

function computeMacroStatistics(series: number[], dt: number): MacroStats {
    const { mean: m, variance, skewness, kurtosis } = centralMoments(series);
    const autocorr = autocorrelation(series, 10);
    const powered = series.filter(Number.isFinite);
    const momentMatrix: number[][] = [
        [m, powered.length ? mean(powered.map((v) => v * v)) : 0],
        [powered.length ? mean(powered.map((v) => v * v * v)) : 0, powered.length ? mean(powered.map((v) => v ** 4)) : 0],
    ];
    return {
        mean: m,
        variance,
        skewness,
        kurtosis,
        autocorrelation: autocorr,
        momentMatrix,
    };
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

    const overlapStats = computeOverlapStats(micro.t, cover, sections, params.tolerance);
    const mutualInfo = computeMutualInformationDiagnostics({ t: micro.t, cover, sections });

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
    const macroStats = computeMacroStatistics(macro, params.dt);

    const reduced = fitReducedModel({
        dt: params.dt,
        macro,
        tau: Math.max(1e-6, params.tau),
        useMemory: params.useMemory,
    });

    const kernelResult = estimateMemoryKernel({
        macro,
        dt: params.dt,
        length: params.kernelLength,
    });

    const commuteDiagnostics = computeCommuteDiagnostics({
        cover,
        sections,
        macroWindow: w,
    });

    const residualsForTest = kernelResult.residuals.length ? kernelResult.residuals : reduced.residuals;
    const maxLag = Math.max(1, Math.min(12, Math.floor(residualsForTest.length / 5)));
    const markovTest = ljungBox(residualsForTest, maxLag);

    return {
        cover,
        micro,
        sections,
        overlapStats,
        mutualInfo,
        commuteDiagnostics,
        glueResult,
        macro,
        macroStats,
        reduced,
        memoryKernel: kernelResult.estimate,
        markovTest,
    };
}
