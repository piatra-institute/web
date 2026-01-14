export type KernelType = 'gaussian' | 'softmaxDot';

export interface DataPoint {
    id: string;
    x: number;
    y: number;
}

export interface DerivedPoint extends DataPoint {
    K: number;
    alpha: number;
    contrib: number;
}

export interface KernelGridPoint {
    x: number;
    K: number;
}

export interface SimulationParams {
    kernelType: KernelType;
    xq: number;
    h: number;
    tau: number;
    xMin: number;
    xMax: number;
}

export const DEFAULT_PARAMS: SimulationParams = {
    kernelType: 'gaussian',
    xq: 0.5,
    h: 1.0,
    tau: 1.0,
    xMin: -4,
    xMax: 4,
};

export const DEFAULT_POINTS: DataPoint[] = [
    { id: 'a', x: -2, y: -1.0 },
    { id: 'b', x: -1, y: 0.4 },
    { id: 'c', x: 0, y: 1.2 },
    { id: 'd', x: 1, y: 0.3 },
    { id: 'e', x: 2, y: -0.8 },
];

/**
 * Gaussian kernel: K(xq, xi) = exp(-(xq - xi)^2 / (2h^2))
 */
export function gaussianKernel(xq: number, xi: number, h: number): number {
    const denom = 2 * h * h;
    const z = (xq - xi) ** 2;
    return Math.exp(-z / denom);
}

/**
 * Softmax-dot kernel (1D stand-in): K(xq, xi) = exp((xq * xi) / tau)
 * In Transformers, tau ~ sqrt(d_k).
 */
export function softmaxDotKernel(xq: number, xi: number, tau: number): number {
    return Math.exp((xq * xi) / tau);
}

export function computeKernel(
    xq: number,
    xi: number,
    params: SimulationParams
): number {
    if (params.kernelType === 'gaussian') {
        return gaussianKernel(xq, xi, Math.max(1e-6, params.h));
    }
    return softmaxDotKernel(xq, xi, Math.max(1e-6, params.tau));
}

export function clamp(n: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, n));
}

export function fmt(x: number, d: number = 6): string {
    if (!Number.isFinite(x)) return '—';
    const s = x.toFixed(d);
    return s.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

export function safeNumber(value: string | number, fallback: number = 0): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

export interface DerivedData {
    pts: DerivedPoint[];
    Z: number;
    yHat: number;
    grid: KernelGridPoint[];
    lo: number;
    hi: number;
}

export function computeDerivedData(
    points: DataPoint[],
    params: SimulationParams
): DerivedData {
    const pts = points
        .map((p) => ({
            ...p,
            x: safeNumber(p.x),
            y: safeNumber(p.y),
        }))
        .sort((a, b) => a.x - b.x);

    const raw = pts.map((p) => {
        const K = computeKernel(params.xq, p.x, params);
        return { ...p, K, alpha: 0, contrib: 0 };
    });

    const Z = raw.reduce((acc, r) => acc + r.K, 0);
    const withAlpha = raw.map((r) => ({
        ...r,
        alpha: Z > 0 ? r.K / Z : 0,
        contrib: Z > 0 ? (r.K / Z) * r.y : 0,
    }));

    const yHat = withAlpha.reduce((acc, r) => acc + r.contrib, 0);

    // Kernel shape grid
    const [lo, hi] = params.xMin < params.xMax
        ? [params.xMin, params.xMax]
        : [params.xMax, params.xMin];
    const n = 200;
    const grid: KernelGridPoint[] = Array.from({ length: n }, (_, i) => {
        const x = lo + (i * (hi - lo)) / (n - 1);
        const K = computeKernel(params.xq, x, params);
        return { x, K };
    });

    return { pts: withAlpha, Z, yHat, grid, lo, hi };
}

export function generateId(): string {
    return Math.random().toString(36).slice(2, 8);
}
