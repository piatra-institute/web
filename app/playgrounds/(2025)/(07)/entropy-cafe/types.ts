export type PresetKey =
    | 'fresh-pour'
    | 'gentle-settle'
    | 'vigorous-stir'
    | 'thick'
    | 'watery';

export interface SimulationParams {
    preset: PresetKey;
    isPaused: boolean;
    isStirring: boolean;
    stirStrength: number;
    pourRate: number;
    viscosity: number;
    diffusion: number;
    buoyancy: number;
    speed: number;
}

export interface SimulationMetrics {
    entropy: number;
    mixedness: number;
    complexity: number;
    kinetic: number;
}

// One time-sampled metrics point used by the history chart. `t` is a sample
// index (monotone), not seconds.
export interface MetricSample extends SimulationMetrics {
    t: number;
}

// A saved configuration the user can compare the live system against.
export interface Snapshot {
    params: SimulationParams;
    metrics: SimulationMetrics;
    peakComplexity: number;
    label: string;
}
