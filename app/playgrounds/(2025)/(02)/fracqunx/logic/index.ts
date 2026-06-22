// The fracqunx as probability. A bead crossing n rows of pegs makes n
// independent left-or-right choices, each going right with probability p, so the
// bin it lands in follows a Binomial(n, p) distribution. The de Moivre-Laplace
// theorem (a central limit theorem) makes that binomial approach a normal
// distribution as the number of rows grows. These are pure functions used by the
// calibration.

// Probabilities for landing in bin k = 0..n. Computed in log space for stability.
export function binomialPmf(n: number, p: number): number[] {
    const out: number[] = [];
    let logC = 0; // log C(n, 0) = 0
    for (let k = 0; k <= n; k++) {
        if (k > 0) logC += Math.log((n - k + 1) / k);
        out.push(Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p)));
    }
    return out;
}

export function distributionMean(pmf: number[]): number {
    return pmf.reduce((s, pk, k) => s + k * pk, 0);
}

export function distributionStd(pmf: number[]): number {
    const m = distributionMean(pmf);
    return Math.sqrt(pmf.reduce((s, pk, k) => s + pk * (k - m) ** 2, 0));
}

// Mass of the binomial sitting in the bins within one standard deviation of the
// mean. The central limit theorem predicts this approaches the normal value
// 0.6827 as the number of rows grows (with discreteness it sits a little above).
export function massWithinOneStd(n: number, p: number): number {
    const pmf = binomialPmf(n, p);
    const mu = n * p;
    const sd = Math.sqrt(n * p * (1 - p));
    let mass = 0;
    for (let k = 0; k <= n; k++) {
        if (k >= mu - sd && k <= mu + sd) mass += pmf[k];
    }
    return mass;
}
