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