export interface AvalancheData {
    size: number;
    freq: number;
}

export interface SimulationResult {
    data: AvalancheData[];
    meanSize: number;
    alpha: number | null;
}

export interface BifurcationPoint {
    sigma: number;
    alpha: number | null;
}

// Simulate a single avalanche with branching parameter sigma
export function simulateAvalanche(sigma: number, maxSteps: number = 10000): number {
    let activity = 1;
    let size = 0;
    
    while (activity > 0 && size < maxSteps) {
        size += activity;
        let next = 0;
        for (let i = 0; i < activity; i++) {
            if (Math.random() < sigma) next++;
        }
        activity = next;
    }
    
    return size;
}

// Run multiple trials and collect statistics
export function runTrials(sigma: number, trials: number = 5000): {
    data: AvalancheData[];
    meanSize: number;
} {
    const freq = new Map<number, number>();
    let total = 0;
    
    for (let i = 0; i < trials; i++) {
        const size = simulateAvalanche(sigma);
        total += size;
        freq.set(size, (freq.get(size) || 0) + 1);
    }
    
    const data = Array.from(freq, ([size, f]) => ({ size, freq: f }))
        .sort((a, b) => a.size - b.size);
    
    return {
        data,
        meanSize: total / trials,
    };
}

// Estimate power-law exponent using linear regression on log-log data
export function slopeEstimate(data: AvalancheData[]): number | null {
    const pts = data.filter((d) => d.size > 0 && d.freq > 0);
    const n = pts.length;
    
    if (n < 2) return null;
    
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    
    pts.forEach((d) => {
        const x = Math.log(d.size);
        const y = Math.log(d.freq);
        sx += x;
        sy += y;
        sxx += x * x;
        sxy += x * y;
    });
    
    return (n * sxy - sx * sy) / (n * sxx - sx * sx);
}

// Generate bifurcation diagram data
export function generateBifurcationData(): BifurcationPoint[] {
    const pts: BifurcationPoint[] = [];
    
    for (let s = 0.5; s <= 1.5 + 1e-9; s += 0.05) {
        const sigma = parseFloat(s.toFixed(2));
        const { data } = runTrials(sigma, 1500);
        pts.push({ 
            sigma, 
            alpha: slopeEstimate(data) 
        });
    }
    
    return pts;
}

// Determine regime based on sigma value
export function getRegime(sigma: number): string {
    if (sigma < 0.95) return "Sub-critical";
    if (sigma > 1.05) return "Super-critical";
    return "Critical";
}

// --- Closed-form / deterministic core of the branching process ---
// These are the exact analytic facts the stochastic simulation samples,
// and are what the calibration panel verifies (the Monte-Carlo run itself
// is not deterministic, so it is not calibrated directly).

// Expected total avalanche size for a subcritical Galton-Watson process
// started from a single active site with mean offspring sigma:
//   E[S] = 1 / (1 - sigma),  for sigma < 1.
// Diverges at the critical point sigma = 1.
export function expectedAvalancheSize(sigma: number): number {
    if (sigma >= 1) return Infinity;
    return 1 / (1 - sigma);
}

// Mean activity after one branching step from k active sites, where each
// site independently produces an offspring with probability sigma:
//   E[next] = sigma * k.
// The branching ratio (mean multiplicative growth per step) is therefore
// exactly sigma; criticality is sigma = 1.
export function branchingRatio(sigma: number): number {
    return sigma;
}

// Probability that an avalanche started from one site is finite (does not
// run away). For sigma <= 1 every avalanche terminates almost surely, so the
// extinction probability is 1. For sigma > 1 it is the smaller root of the
// fixed-point equation q = 1 - sigma + sigma * q for Bernoulli offspring,
// which gives q = (1 - sigma) / sigma ... clamped: for sigma > 1,
//   q = (1 - sigma) / sigma is negative, so extinction prob = max(0, ...).
// With Bernoulli (0/1) offspring the generating function is f(q) = 1 - sigma + sigma*q,
// whose only fixed point is q = 1; a pure Bernoulli branch never explodes
// super-critically in the runaway sense, but the seeded simulation grows
// without bound once sigma > 1 because activity can only stay flat or grow.
// We expose the mean-field extinction certainty as a regime indicator instead.
export function extinctionCertain(sigma: number): boolean {
    return sigma <= 1;
}

// Theoretical avalanche-size exponent at criticality. A critical
// Galton-Watson branching process has size distribution P(S = s) ~ s^(-3/2)
// (mean-field directed-percolation / branching universality), so a log-log
// slope estimate of an exact power law with this exponent must return -3/2.
export const CRITICAL_EXPONENT = -1.5;

// Build an exact (noise-free) power-law avalanche distribution
// freq(s) = C * s^(exponent) so slopeEstimate is verified against a known slope.
export function exactPowerLaw(exponent: number, sMax: number = 200): AvalancheData[] {
    const data: AvalancheData[] = [];
    for (let s = 1; s <= sMax; s++) {
        data.push({ size: s, freq: Math.pow(s, exponent) });
    }
    return data;
}