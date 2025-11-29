export interface SimulationParams {
    convexity: number;
    separation: number;
    noiseFloor: number;
}

export type PresetId = 'pluralistic' | 'transitional' | 'monodominant' | 'nicheSurvival' | 'custom';

export interface Preset {
    id: PresetId;
    name: string;
    description: string;
    params: SimulationParams;
}

export const PRESETS: Preset[] = [
    {
        id: 'pluralistic',
        name: 'Pluralistic ecology',
        description: 'Low convexity, high separation, moderate slack. Many algorithmic strategies can coexist across distinct niches.',
        params: {
            convexity: 0.1,
            separation: 0.9,
            noiseFloor: 0.03,
        },
    },
    {
        id: 'transitional',
        name: 'Transitional regime',
        description: 'Moderate convexity begins concentrating fitness. Some strategies are pushed out, but multiple peaks remain viable.',
        params: {
            convexity: 0.4,
            separation: 0.6,
            noiseFloor: 0.02,
        },
    },
    {
        id: 'monodominant',
        name: 'Monodominant',
        description: 'High convexity, collapsed niches, low slack. A single algorithmic apex predator captures nearly all fitness.',
        params: {
            convexity: 0.9,
            separation: 0.2,
            noiseFloor: 0.005,
        },
    },
    {
        id: 'nicheSurvival',
        name: 'Niche survival',
        description: 'High convexity but strong separation. Multiple dominant peaks survive in their respective niches.',
        params: {
            convexity: 0.85,
            separation: 1.0,
            noiseFloor: 0.01,
        },
    },
    {
        id: 'custom',
        name: 'Custom',
        description: 'Tune parameters directly to explore the fitness landscape.',
        params: {
            convexity: 0.3,
            separation: 0.5,
            noiseFloor: 0.02,
        },
    },
];

export const GRID_SIZE = 50;

export interface LandscapePoint {
    x: number;
    y: number;
    fitness: number;
}

export function generateLandscape(params: SimulationParams): LandscapePoint[] {
    const { convexity, separation, noiseFloor } = params;
    const points: LandscapePoint[] = [];

    const peak1x = -0.4;
    const peak1y = -0.4;
    const peak2x = peak1x + 0.7 * separation;
    const peak2y = peak1y + 0.8 * separation;

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const x = (i / (GRID_SIZE - 1)) * 2 - 1;
            const y = (j / (GRID_SIZE - 1)) * 2 - 1;

            const peak1 = Math.exp(-(((x - peak1x) ** 2 + (y - peak1y) ** 2) * 4));
            const peak2 = Math.exp(-(((x - peak2x) ** 2 + (y - peak2y) ** 2) * 4));
            const base = peak1 + peak2;

            const amplified = Math.pow(base, 1 + convexity * 4) + noiseFloor;

            points.push({ x, y, fitness: amplified });
        }
    }
    return points;
}

export function computeConcentration(landscape: LandscapePoint[]): number {
    const values = landscape.map((p) => p.fitness).sort((a, b) => b - a);
    const k = Math.max(1, Math.floor(values.length * 0.05));
    const topSum = values.slice(0, k).reduce((acc, v) => acc + v, 0);
    const total = values.reduce((acc, v) => acc + v, 0);
    return total > 0 ? topSum / total : 0;
}

export function computeGiniCoefficient(landscape: LandscapePoint[]): number {
    const values = landscape.map((p) => p.fitness).sort((a, b) => a - b);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    if (mean === 0) return 0;

    let sumDiff = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            sumDiff += Math.abs(values[i] - values[j]);
        }
    }
    return sumDiff / (2 * n * n * mean);
}
