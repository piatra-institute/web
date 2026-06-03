import { seededRandom } from '@/lib/rng';


/**
 * Neural-side computations: phase precession in a place field, spike scatter,
 * grid-like oscillatory interference, and a low-dim population trajectory.
 *
 * These do not claim to implement RoPE. They are the closest biological
 * analogues to position-as-rotation: spike timing as phase, relative phase as
 * relative position, multiple frequencies as multiple scales.
 */


export interface PlaceFieldPoint {
    /** position in the field, 0..1. */
    x: number;
    /** firing rate at this position, 0..1 gaussian envelope. */
    rate: number;
    /** spike phase at this position, 0..1 (wrapped). */
    phase: number;
}

export interface SpikePoint {
    /** position in field, 0..1. */
    x: number;
    /** phase at spike emission, 0..1 (wrapped). */
    phase: number;
    /** rate at this position. */
    rate: number;
}


/** sampled rate-by-phase curve across one traversal of a place field. */
export function placeFieldCurve(
    phaseSlopeDeg: number,
    samples: number = 161,
): PlaceFieldPoint[] {
    const out: PlaceFieldPoint[] = [];
    for (let s = 0; s < samples; s++) {
        const x = s / (samples - 1);
        const rate = Math.exp(-Math.pow((x - 0.5) / 0.22, 2));
        const raw = 1 - (phaseSlopeDeg / 720) * x;
        const phase = ((raw % 1) + 1) % 1;
        out.push({ x, rate, phase });
    }
    return out;
}


/** stochastic spike emission across the place field. seed makes it deterministic. */
export function placeFieldSpikes(
    phaseSlopeDeg: number,
    noise: number,
    seed: number,
    count: number = 110,
): SpikePoint[] {
    const out: SpikePoint[] = [];
    for (let n = 0; n < count; n++) {
        const x = seededRandom(seed + 41 * n);
        const rate = Math.exp(-Math.pow((x - 0.5) / 0.22, 2));
        const accept = seededRandom(seed + 41 * n + 7);
        if (accept < rate * 0.78) {
            const jitter = (seededRandom(seed + 41 * n + 13) - 0.5) * noise;
            const raw = 1 - (phaseSlopeDeg / 720) * x + jitter;
            const phase = ((raw % 1) + 1) % 1;
            out.push({ x, phase, rate });
        }
    }
    return out;
}


/**
 * 2D grid-like field built by summing three oscillations at 60° offsets.
 * size grid is N x N, scale controls how many spatial periods fit on screen,
 * phase shifts the whole pattern.
 */
export function gridInterference(
    N: number,
    scale: number,
    phase: number,
): number[][] {
    const dirs = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
    const field: number[][] = [];
    for (let y = 0; y < N; y++) {
        const row: number[] = [];
        for (let x = 0; x < N; x++) {
            const xx = (x - N / 2) / scale;
            const yy = (y - N / 2) / scale;
            let v = 0;
            for (const a of dirs) {
                v += Math.cos(xx * Math.cos(a) * 2.8 + yy * Math.sin(a) * 2.8 + phase);
            }
            row.push(v / 3);
        }
        field.push(row);
    }
    return field;
}


/**
 * coherence of the grid pattern: fraction of cells with |v| above 0.5. higher
 * means a more sharply defined hexagonal lattice; lower means the three
 * oscillations have washed each other out.
 */
export function gridCoherence(field: number[][]): number {
    let n = 0;
    let hot = 0;
    for (const row of field) {
        for (const v of row) {
            n++;
            if (Math.abs(v) > 0.5) hot++;
        }
    }
    return n === 0 ? 0 : hot / n;
}


/** angle (radians) of the spike phase at position `pos` on a place-field traversal. */
export function spikePhaseAt(phaseSlopeDeg: number, pos: number, baseDeg: number = 0): number {
    const totalDeg = baseDeg - phaseSlopeDeg * pos;
    return (totalDeg * Math.PI) / 180;
}


/**
 * low-dimensional neural population trajectory as a parametric spiral. used
 * only for the bridge view; not used in calibration metrics.
 */
export function populationTrajectory(
    radius: number,
    turns: number,
    points: number = 280,
): { x: number; y: number }[] {
    const out: { x: number; y: number }[] = [];
    for (let s = 0; s < points; s++) {
        const u = s / (points - 1);
        const a = u * Math.PI * 2 * turns;
        const r = radius * (0.25 + 0.72 * u);
        out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.72 });
    }
    return out;
}
