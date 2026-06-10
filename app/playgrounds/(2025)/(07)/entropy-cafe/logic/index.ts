import type { PresetKey, SimulationParams, SimulationMetrics } from '../types';

export type { PresetKey } from '../types';


export const PRESET_KEYS: PresetKey[] = [
    'fresh-pour',
    'gentle-settle',
    'vigorous-stir',
    'thick',
    'watery',
];


export const PRESET_DESCRIPTIONS: Record<
    PresetKey,
    { label: string; question: string; expectation: string }
> = {
    'fresh-pour': {
        label: 'fresh pour',
        question: 'What does an unstirred pour do on its own?',
        expectation:
            'Cream sinks and spreads slowly. Entropy creeps up; structure stays coarse until you stir.',
    },
    'gentle-settle': {
        label: 'gentle settle',
        question: 'How far does diffusion alone mix the cup?',
        expectation:
            'No stir, low diffusion. Mixing is slow and incomplete; complexity stays low and entropy plateaus early.',
    },
    'vigorous-stir': {
        label: 'vigorous stir',
        question: 'What happens when you stir hard and continuously?',
        expectation:
            'Filaments form fast, apparent complexity spikes, then collapses as the cup reaches a uniform high-entropy state.',
    },
    'thick': {
        label: 'thick (viscous)',
        question: 'How does a viscous fluid mix?',
        expectation:
            'Momentum damps quickly. Swirls are sluggish and long-lived; the complexity peak is broad and late.',
    },
    'watery': {
        label: 'watery (thin)',
        question: 'How does a thin fluid mix?',
        expectation:
            'Streaks travel far and break up fast. The complexity peak is sharp and early; entropy saturates quickly.',
    },
};


export const DEFAULT_PARAMS: SimulationParams = {
    preset: 'fresh-pour',
    isPaused: false,
    isStirring: false,
    stirStrength: 9.5,
    pourRate: 650,
    viscosity: 0.42,
    diffusion: 0.28,
    buoyancy: 0.7,
    speed: 1,
};


export function presetParams(key: PresetKey): SimulationParams {
    switch (key) {
        case 'fresh-pour':
            return { ...DEFAULT_PARAMS, preset: 'fresh-pour' };
        case 'gentle-settle':
            return {
                preset: 'gentle-settle',
                isPaused: false,
                isStirring: false,
                stirStrength: 4,
                pourRate: 450,
                viscosity: 0.6,
                diffusion: 0.12,
                buoyancy: 0.5,
                speed: 1,
            };
        case 'vigorous-stir':
            return {
                preset: 'vigorous-stir',
                isPaused: false,
                isStirring: true,
                stirStrength: 16,
                pourRate: 800,
                viscosity: 0.35,
                diffusion: 0.4,
                buoyancy: 0.7,
                speed: 1.2,
            };
        case 'thick':
            return {
                preset: 'thick',
                isPaused: false,
                isStirring: false,
                stirStrength: 8,
                pourRate: 500,
                viscosity: 1.0,
                diffusion: 0.15,
                buoyancy: 0.6,
                speed: 1,
            };
        case 'watery':
            return {
                preset: 'watery',
                isPaused: false,
                isStirring: false,
                stirStrength: 11,
                pourRate: 700,
                viscosity: 0.18,
                diffusion: 0.5,
                buoyancy: 0.9,
                speed: 1.1,
            };
    }
}


// The three canonical stages of cream-into-coffee mixing, after the photograph
// in Carroll's analogy and the coffee automaton of Aaronson, Carroll and
// Ouellette (2014). Entropy rises monotonically across them; apparent
// complexity rises and then falls.
export interface MixingStage {
    id: string;
    label: string;
    description: string;
    expectedEntropy: number; // coarse-grained binary entropy, bits in [0, 1]
    complexityShape: 'low' | 'peak' | 'collapsed';
}

export const MIXING_STAGES: MixingStage[] = [
    {
        id: 'layered',
        label: 'layered',
        description: 'cream resting on coffee, just poured',
        expectedEntropy: 0.08,
        complexityShape: 'low',
    },
    {
        id: 'swirling',
        label: 'swirling',
        description: 'filaments and tendrils at their most intricate',
        expectedEntropy: 0.55,
        complexityShape: 'peak',
    },
    {
        id: 'uniform',
        label: 'uniform',
        description: 'fully mixed, a flat milky brown',
        expectedEntropy: 0.9,
        complexityShape: 'collapsed',
    },
];


// A plain-language reading of the current live state. The absolute metric
// magnitudes are small (immiscible cream and coffee), so the reading keys off
// where the apparent complexity sits relative to its peak this run, which tracks
// the mixing phase robustly regardless of the absolute scale.
export function computeNarrative(metrics: SimulationMetrics, peakComplexity: number): string {
    const rel = peakComplexity > 1e-9 ? metrics.complexity / peakComplexity : 0;

    if (peakComplexity < 1e-9) {
        return 'The cup is still settling. Pour cream and stir to drive it toward equilibrium, and watch the structure rise and then fall as entropy climbs.';
    }
    if (rel > 0.55) {
        return 'Filaments and tendrils are at their most intricate: apparent complexity is near its peak this run while entropy keeps climbing toward equilibrium.';
    }
    if (rel < 0.25) {
        return 'The swirls are dissolving into a more uniform mixture. The apparent complexity has fallen back even as entropy stays near its ceiling: the high-entropy state looks visually simple.';
    }
    return 'The cup is mixing. Cream is dispersing into the coffee, building structure toward its complexity peak as entropy rises.';
}
