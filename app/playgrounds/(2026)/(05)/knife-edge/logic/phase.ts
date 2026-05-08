import { Params, analyticalMetrics } from './index';

export interface PhasePoint {
    gain: number;
    damping: number;
    lambdaMax: number;
}

/**
 * Sample a coarse (gain, damping) phase grid for the diagram backdrop. Returns
 * lambdaMax at each grid point, consumers colour-code from this.
 */
export function phaseGrid(p: Params, gridSize = 24): PhasePoint[] {
    const out: PhasePoint[] = [];
    for (let gi = 0; gi <= gridSize; gi++) {
        for (let di = 0; di <= gridSize; di++) {
            const gain = (gi / gridSize) * 2;
            const damping = (di / gridSize) * 0.5;
            const m = analyticalMetrics({ ...p, gain, damping });
            out.push({ gain, damping, lambdaMax: m.lambdaMax });
        }
    }
    return out;
}

/**
 * Critical curve λ_max = 0 in the (gain, damping) plane, parameterised by gain.
 * Used to render the regime boundary in the phase diagram.
 */
export function criticalCurve(p: Params, samples = 80): { gain: number; damping: number }[] {
    const out: { gain: number; damping: number }[] = [];
    for (let i = 0; i <= samples; i++) {
        const gain = (i / samples) * 2;
        // λ_max = gain - 1 - damping + 0.4 distantCoupling
        const damping = gain - 1 + 0.4 * p.distantCoupling;
        if (damping >= 0 && damping <= 0.5) {
            out.push({ gain, damping });
        }
    }
    return out;
}
