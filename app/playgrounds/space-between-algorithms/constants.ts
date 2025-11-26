export interface SimulationParams {
    intraEntropy: number;
    empowerment: number;
    policyVolume: number;
    causalEmergence: number;
    descriptiveRegularity: number;
}

export type PresetId = 'sorting' | 'fixedNN' | 'learningNN' | 'cell' | 'human' | 'custom';

export interface Preset {
    id: PresetId;
    name: string;
    description: string;
    params: SimulationParams;
}

export const PRESETS: Preset[] = [
    {
        id: 'sorting',
        name: 'Sorting algorithm',
        description: 'Almost no intra- or inter-algorithm freedom: rigid, deterministic behavior on a tiny policy manifold.',
        params: {
            intraEntropy: 0.02,
            empowerment: 0.10,
            policyVolume: 0.02,
            causalEmergence: 0.05,
            descriptiveRegularity: 0.9,
        },
    },
    {
        id: 'fixedNN',
        name: 'Fixed neural net',
        description: 'More complex mapping, but weights are frozen: richer internal structure, limited ability to move in policy space.',
        params: {
            intraEntropy: 0.15,
            empowerment: 0.25,
            policyVolume: 0.10,
            causalEmergence: 0.15,
            descriptiveRegularity: 0.9,
        },
    },
    {
        id: 'learningNN',
        name: 'Learning neural net',
        description: 'Significant intra-algorithm branching and a large, learnable policy manifold. Still strongly constrained by architecture.',
        params: {
            intraEntropy: 0.45,
            empowerment: 0.55,
            policyVolume: 0.55,
            causalEmergence: 0.35,
            descriptiveRegularity: 0.8,
        },
    },
    {
        id: 'cell',
        name: 'Cell / tissue',
        description: 'Many local rules and flexible trajectories in morphospace; large goal slack with strong constraints from physics and evolution.',
        params: {
            intraEntropy: 0.50,
            empowerment: 0.60,
            policyVolume: 0.70,
            causalEmergence: 0.65,
            descriptiveRegularity: 0.7,
        },
    },
    {
        id: 'human',
        name: 'Human-level agent',
        description: 'Large repertoire of algorithms, meta-level reprogramming, rich macro-scale causal emergence.',
        params: {
            intraEntropy: 0.70,
            empowerment: 0.80,
            policyVolume: 0.85,
            causalEmergence: 0.90,
            descriptiveRegularity: 0.75,
        },
    },
    {
        id: 'custom',
        name: 'Custom',
        description: 'Tune the parameters directly to explore hypothetical systems and exotic corners of algorithm space.',
        params: {
            intraEntropy: 0.40,
            empowerment: 0.40,
            policyVolume: 0.40,
            causalEmergence: 0.40,
            descriptiveRegularity: 0.60,
        },
    },
];

export function computeFreedomScore(params: SimulationParams): number {
    const {
        intraEntropy,
        empowerment,
        policyVolume,
        causalEmergence,
        descriptiveRegularity,
    } = params;

    const score =
        0.25 * intraEntropy +
        0.25 * empowerment +
        0.2 * policyVolume +
        0.2 * causalEmergence +
        0.1 * descriptiveRegularity;

    return Math.round(score * 100);
}
