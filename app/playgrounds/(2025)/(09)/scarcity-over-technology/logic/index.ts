// The scarcity-versus-technology model. Technology T produces capacity that grows
// as a power law, eroded by friction f and corruption h; with N users the
// material scarcity (the dual multiplier on the binding constraint) is N over the
// per-capita allocation, and welfare is a log-utility sum. An optional attention
// ceiling A caps the usable capacity, so some scarcities cannot be engineered
// away. These are pure functions; the Viewer renders the same equations.

export const C0 = 100; // baseline capacity coefficient

export interface ModelResult {
    scarcity: number;
    welfare: number;
    allocation: number;
    activeConstraint: 'material' | 'attention';
}

// produced capacity: (1 - friction) * C0 * T^k
export function calculateCapacity(T: number, k: number, f: number): number {
    if (T <= 0) return 0;
    return (1 - f) * C0 * Math.pow(T, k);
}

export function calculateModel(
    T: number, N: number, k: number, f: number, h: number, A: number, attentionEnabled: boolean,
): ModelResult {
    if (N === 0) {
        return { scarcity: 0, welfare: 0, allocation: Infinity, activeConstraint: 'material' };
    }
    const available = calculateCapacity(T, k, f) * (1 - h);

    let binding = available;
    let activeConstraint: 'material' | 'attention' = 'material';
    if (attentionEnabled && A < available) {
        binding = A;
        activeConstraint = 'attention';
    }
    if (binding <= 0) {
        return { scarcity: Infinity, welfare: -Infinity, allocation: 0, activeConstraint };
    }

    const scarcity = N / binding;        // the binding dual multiplier (lambda)
    const allocation = binding / N;      // per-capita share
    const welfare = N * Math.log(allocation);
    return { scarcity, welfare, allocation, activeConstraint };
}
