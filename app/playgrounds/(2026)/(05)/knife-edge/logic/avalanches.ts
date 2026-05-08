import { ACTIVE_THRESHOLD, AVALANCHE_HISTORY } from './index';

export interface AvalancheBuffer {
    sizes: Uint16Array;
    head: number;
    filled: number;
}

export function makeAvalancheBuffer(): AvalancheBuffer {
    return { sizes: new Uint16Array(AVALANCHE_HISTORY), head: 0, filled: 0 };
}

export function pushAvalanche(buf: AvalancheBuffer, u: Float32Array): number {
    let count = 0;
    for (let i = 0; i < u.length; i++) {
        if (Math.abs(u[i]) > ACTIVE_THRESHOLD) count++;
    }
    if (count > 0) {
        buf.sizes[buf.head] = count;
        buf.head = (buf.head + 1) % AVALANCHE_HISTORY;
        if (buf.filled < AVALANCHE_HISTORY) buf.filled++;
    }
    return count;
}

export function clearAvalancheBuffer(buf: AvalancheBuffer): void {
    buf.head = 0;
    buf.filled = 0;
    buf.sizes.fill(0);
}

export interface AvalancheBin {
    size: number;
    count: number;
}

/**
 * Log-binned histogram of avalanche sizes. Bin centres are geometric.
 */
export function logBinAvalanches(buf: AvalancheBuffer, nBins = 14): AvalancheBin[] {
    if (buf.filled < 8) return [];
    const sizes: number[] = [];
    for (let i = 0; i < buf.filled; i++) {
        if (buf.sizes[i] > 0) sizes.push(buf.sizes[i]);
    }
    if (sizes.length === 0) return [];
    const maxSize = Math.max(...sizes);
    if (maxSize <= 1) return [];
    const logMax = Math.log(maxSize + 1);
    const bins: AvalancheBin[] = [];
    for (let b = 0; b < nBins; b++) {
        const lo = Math.exp((b / nBins) * logMax);
        const hi = Math.exp(((b + 1) / nBins) * logMax);
        const centre = Math.sqrt(lo * hi);
        let n = 0;
        for (const s of sizes) {
            if (s >= lo && s < hi) n++;
        }
        if (n > 0) bins.push({ size: centre, count: n });
    }
    return bins;
}

/**
 * Linear regression on log(P(s)) vs log(s), returns the slope as a
 * negative-tau estimate. Returns null when fewer than four bins survive.
 */
export function fitTauExponent(bins: AvalancheBin[]): number | null {
    if (bins.length < 4) return null;
    const xs = bins.map((b) => Math.log(b.size));
    const totalCount = bins.reduce((acc, b) => acc + b.count, 0);
    const ys = bins.map((b) => Math.log(b.count / totalCount));
    let xMean = 0, yMean = 0;
    for (let i = 0; i < xs.length; i++) {
        xMean += xs[i];
        yMean += ys[i];
    }
    xMean /= xs.length;
    yMean /= ys.length;
    let num = 0, den = 0;
    for (let i = 0; i < xs.length; i++) {
        num += (xs[i] - xMean) * (ys[i] - yMean);
        den += (xs[i] - xMean) * (xs[i] - xMean);
    }
    if (den < 1e-9) return null;
    return num / den;
}
