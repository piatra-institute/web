import { LATTICE_SIZE, Params } from './index';

export function makeLattice(): Float32Array {
    return new Float32Array(LATTICE_SIZE);
}

function gaussianRandom(): number {
    // Box-Muller, returns N(0, 1)
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * One simulation step on the periodic 1D lattice. Mutates u in place.
 *
 * Continuous-time form:
 *   du/dt = (gain - 1 - damping) u
 *         + localCoupling * (u_{i-1} - 2 u_i + u_{i+1})
 *         + distantCoupling * (mean(u) - u_i)
 *         - cubic * u^3
 *         + noise * dW
 *
 * Linearised growth at u = 0:
 *   λ_max = gain - 1 - damping + (small contribution from couplings via mean)
 *
 * Cubic saturation pins amplitudes once they cross unity.
 */
export function stepLattice(u: Float32Array, p: Params, dt = 0.18): void {
    const N = u.length;
    const linear = p.gain - 1 - p.damping;
    let mean = 0;
    for (let i = 0; i < N; i++) mean += u[i];
    mean /= N;

    const next = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        const left = u[(i - 1 + N) % N];
        const right = u[(i + 1) % N];
        const lap = left - 2 * u[i] + right;
        const longRange = mean - u[i];
        const cubic = u[i] * u[i] * u[i];
        const dudt =
            linear * u[i] +
            p.localCoupling * lap +
            p.distantCoupling * longRange -
            0.55 * cubic +
            p.noise * gaussianRandom();
        next[i] = u[i] + dt * dudt;
    }
    for (let i = 0; i < N; i++) u[i] = next[i];
}

/**
 * Inject a Gaussian pulse centred at index `centre` with width `width`.
 */
export function injectPulse(
    u: Float32Array,
    centre: number,
    width: number,
    amplitude = 1.2,
): void {
    const N = u.length;
    const sigma = Math.max(0.5, width);
    for (let i = 0; i < N; i++) {
        const dx = ((i - centre + N / 2) % N) - N / 2;
        u[i] += amplitude * Math.exp(-(dx * dx) / (2 * sigma * sigma));
    }
}

export function resetLattice(u: Float32Array): void {
    for (let i = 0; i < u.length; i++) {
        u[i] = 0.05 * (Math.random() - 0.5);
    }
}

/**
 * Estimate correlation length from autocorrelation of the lattice. Returns the
 * lag at which the autocorrelation falls below 1/e.
 */
export function correlationLength(u: Float32Array): number {
    const N = u.length;
    let mean = 0;
    for (let i = 0; i < N; i++) mean += u[i];
    mean /= N;
    let variance = 0;
    for (let i = 0; i < N; i++) {
        const d = u[i] - mean;
        variance += d * d;
    }
    variance /= N;
    if (variance < 1e-9) return 0;

    const maxLag = Math.floor(N / 2);
    for (let lag = 1; lag < maxLag; lag++) {
        let cov = 0;
        for (let i = 0; i < N; i++) {
            cov += (u[i] - mean) * (u[(i + lag) % N] - mean);
        }
        cov /= N;
        const acf = cov / variance;
        if (acf < 1 / Math.E) return lag;
    }
    return maxLag;
}

export function amplitude(u: Float32Array): number {
    let m = 0;
    for (let i = 0; i < u.length; i++) {
        const a = Math.abs(u[i]);
        if (a > m) m = a;
    }
    return m;
}

export function energy(u: Float32Array): number {
    let s = 0;
    for (let i = 0; i < u.length; i++) s += u[i] * u[i];
    return s / u.length;
}
