// The state-space model treats consciousness as a trajectory through the activity
// of coupled excitatory and inhibitory neural populations, driven by synaptic
// conductances and thalamic input. The full simulation is stochastic, but it is
// built on exact, deterministic primitives: a sigmoid firing-rate response, and a
// Pearson correlation used to measure synchrony between populations. These pure
// functions are what the calibration checks; the Viewer uses the same ones.

// firing-rate response: a logistic of activity with gain a and threshold theta
export function sigmoid(x: number, a = 3.2, theta = 0.35): number {
    return 1.0 / (1.0 + Math.exp(-a * (x - theta)));
}

export function clamp01(x: number): number {
    return x < 0 ? 0 : x > 1 ? 1 : x;
}

export function mean(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
}

// Pearson correlation coefficient between two equal-length signals, used as the
// synchrony measure between excitatory and inhibitory activity
export function pearson(a: number[], b: number[]): number {
    const ma = mean(a);
    const mb = mean(b);
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < a.length; i++) {
        const xa = a[i] - ma;
        const xb = b[i] - mb;
        num += xa * xb;
        da += xa * xa;
        db += xb * xb;
    }
    const den = Math.sqrt(da * db) + 1e-12;
    return den > 0 ? num / den : 0;
}
