// Concentration metrics for the fitness landscape. The Gini coefficient and the
// top-share measure how unequally fitness is spread across strategies; as
// competition sharpens (high convexity, collapsed niches) both rise toward the
// monodominant limit. These are general pure functions over a list of values,
// used by the calibration; constants.ts applies the same measures to the 2D
// landscape grid.

// Gini coefficient of a list of non-negative values: 0 = perfect equality,
// approaching (n-1)/n as all mass concentrates on a single value.
export function gini(values: number[]): number {
    const n = values.length;
    if (n === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    if (mean === 0) return 0;
    let sumDiff = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) sumDiff += Math.abs(values[i] - values[j]);
    }
    return sumDiff / (2 * n * n * mean);
}

// fraction of the total captured by the largest `frac` of values
export function topShare(values: number[], frac: number): number {
    const sorted = [...values].sort((a, b) => b - a);
    const k = Math.max(1, Math.floor(sorted.length * frac));
    const top = sorted.slice(0, k).reduce((a, b) => a + b, 0);
    const total = sorted.reduce((a, b) => a + b, 0);
    return total > 0 ? top / total : 0;
}

// a one-hot distribution: a single winner takes everything, the rest get nothing
export function oneHot(n: number): number[] {
    return Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0));
}
