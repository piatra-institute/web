export interface SimulationParams {
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
