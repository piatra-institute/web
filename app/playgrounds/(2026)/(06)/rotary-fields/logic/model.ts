import { clamp } from '@/lib/playgroundMath';

import { SCENARIOS, type PresetKey } from './scenarios';


export interface SimulationParams {
    seqLen: number;
    pairs: number;
    base: number;
    tokenI: number;
    tokenJ: number;
    contentSim: number;
    phaseSlope: number;
    noise: number;
    gridScale: number;
    seed: number;
}

export interface Params extends SimulationParams {
    preset: PresetKey;
}


export const FIELD_KEYS = [
    'seqLen',
    'pairs',
    'base',
    'contentSim',
    'phaseSlope',
    'noise',
    'gridScale',
] as const;

export type FieldKey = typeof FIELD_KEYS[number];


export const FIELD_LABELS: Record<FieldKey, string> = {
    seqLen: 'sequence length',
    pairs: 'embedding pairs',
    base: 'RoPE base',
    contentSim: 'content similarity',
    phaseSlope: 'phase slope',
    noise: 'noise',
    gridScale: 'grid scale',
};


export const FIELD_HINTS: Record<FieldKey, string> = {
    seqLen: 'number of token positions in the sequence. attention is computed across all pairs.',
    pairs: 'how many 2D pairs make up the embedding. each pair gets its own RoPE frequency.',
    base: 'the base in the RoPE frequency formula. larger base means slower high-dim rotations and longer effective context.',
    contentSim: 'raw query-key similarity before rotation. higher means content alone already wants tokens to attend to each other.',
    phaseSlope: 'how many degrees the spike phase advances across one traversal of a place field. 360 reproduces O\'Keefe and Recce 1993.',
    noise: 'jitter on spike phase and on observation. higher values blur the phase code.',
    gridScale: 'spatial scale of the grid-interference pattern. larger values produce finer grids.',
};


export const FIELD_RANGES: Record<FieldKey, { min: number; max: number; step: number }> = {
    seqLen: { min: 4, max: 40, step: 1 },
    pairs: { min: 1, max: 12, step: 1 },
    base: { min: 100, max: 50000, step: 100 },
    contentSim: { min: -1, max: 1, step: 0.01 },
    phaseSlope: { min: 0, max: 720, step: 5 },
    noise: { min: 0, max: 0.4, step: 0.01 },
    gridScale: { min: 4, max: 20, step: 0.5 },
};


export const FIELD_GROUPS: { title: string; keys: FieldKey[] }[] = [
    { title: 'RoPE geometry', keys: ['seqLen', 'pairs', 'base'] },
    { title: 'content', keys: ['contentSim'] },
    { title: 'neural phase', keys: ['phaseSlope', 'noise', 'gridScale'] },
];


export const DEFAULT_PARAMS: Params = {
    ...SCENARIOS.llama.profile,
    preset: 'llama',
};


export function applyPreset(current: Params, key: PresetKey): Params {
    return {
        ...current,
        ...SCENARIOS[key].profile,
        preset: key,
    };
}


export function clampTokenIndices(p: Params): Params {
    const max = p.seqLen - 1;
    return {
        ...p,
        tokenI: clamp(p.tokenI, 0, max),
        tokenJ: clamp(p.tokenJ, 0, max),
    };
}
