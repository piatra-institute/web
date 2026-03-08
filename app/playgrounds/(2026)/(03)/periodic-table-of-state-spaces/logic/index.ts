// ── Types ────────────────────────────────────────────────────────

export type Family = 'geometry' | 'dynamics' | 'control' | 'systems' | 'social' | 'epistemology';

export type ViewMode = 'table' | 'compare' | 'classify' | 'ladder';

export type DimensionKey = keyof DimensionScores;

export interface DimensionScores {
    dimensionality: number;
    stochasticity: number;
    nonlinearity: number;
    observability: number;
    controllability: number;
    openness: number;
    adaptation: number;
    endogeneity: number;
    reflexivity: number;
    predictability: number;
}

export interface StateSpace {
    id: string;
    name: string;
    family: Family;
    row: number;
    col: number;
    short: string;
    summary: string;
    examples: string[];
    tags: string[];
    scores: DimensionScores;
    keyQuestion: string;
    note: string;
    ancestors: string[];
}

export interface SampleCase {
    name: string;
    types: string[];
    description: string;
    profile: DimensionScores;
}

export interface Params {
    viewMode: ViewMode;
    search: string;
    familyFilter: Family | 'all';
    selectedId: string | null;
    compareIds: string[];
    classifyProfile: DimensionScores;
    classifyPreset: string | null;
    ladderHighlight: string | null;
}

// ── Constants ────────────────────────────────────────────────────

export const FAMILY_COLORS: Record<Family, string> = {
    geometry: '#3b82f6',
    dynamics: '#22c55e',
    control: '#a855f7',
    systems: '#f59e0b',
    social: '#ef4444',
    epistemology: '#06b6d4',
};

export const FAMILY_LABELS: Record<Family, string> = {
    geometry: 'Geometry',
    dynamics: 'Dynamics',
    control: 'Control',
    systems: 'Systems',
    social: 'Social',
    epistemology: 'Epistemology',
};

export const DIMENSION_LABELS: Record<DimensionKey, { label: string; low: string; high: string }> = {
    dimensionality: { label: 'dimensionality', low: 'finite', high: 'infinite' },
    stochasticity: { label: 'stochasticity', low: 'deterministic', high: 'stochastic' },
    nonlinearity: { label: 'nonlinearity', low: 'linear', high: 'nonlinear' },
    observability: { label: 'observability', low: 'hidden', high: 'observable' },
    controllability: { label: 'controllability', low: 'uncontrollable', high: 'controllable' },
    openness: { label: 'openness', low: 'closed', high: 'open' },
    adaptation: { label: 'adaptation', low: 'fixed', high: 'self-modifying' },
    endogeneity: { label: 'endogeneity', low: 'exogenous', high: 'endogenous' },
    reflexivity: { label: 'reflexivity', low: 'none', high: 'second-order' },
    predictability: { label: 'predictability', low: 'unpredictable', high: 'predictable' },
};

export const DIMENSION_KEYS: DimensionKey[] = [
    'dimensionality',
    'stochasticity',
    'nonlinearity',
    'observability',
    'controllability',
    'openness',
    'adaptation',
    'endogeneity',
    'reflexivity',
    'predictability',
];

export const VIEW_MODES: { key: ViewMode; label: string }[] = [
    { key: 'table', label: 'Table' },
    { key: 'compare', label: 'Compare' },
    { key: 'classify', label: 'Classify' },
    { key: 'ladder', label: 'Ladder' },
];

export const DEFAULT_PROFILE: DimensionScores = {
    dimensionality: 2,
    stochasticity: 2,
    nonlinearity: 2,
    observability: 2,
    controllability: 2,
    openness: 2,
    adaptation: 2,
    endogeneity: 2,
    reflexivity: 2,
    predictability: 2,
};

export const DEFAULT_PARAMS: Params = {
    viewMode: 'table',
    search: '',
    familyFilter: 'all',
    selectedId: null,
    compareIds: [],
    classifyProfile: DEFAULT_PROFILE,
    classifyPreset: null,
    ladderHighlight: null,
};

// Ladder levels
export const LADDER_LEVELS = [
    {
        key: 'fixed',
        label: 'Fixed',
        description: 'Laws are exogenous. The system does not modify its own rules. Parameters are set from outside.',
        ids: ['FD', 'CD', 'CF', 'IF', 'HM', 'LN', 'OB', 'CT', 'ER', 'MF', 'DS', 'GD'],
    },
    {
        key: 'adaptive',
        label: 'Adaptive',
        description: 'The system updates its behavior through experience, but the update rules themselves are fixed.',
        ids: ['NL', 'ST', 'CH', 'HY', 'FB', 'AD', 'SO', 'OC', 'NW'],
    },
    {
        key: 'endogenous',
        label: 'Endogenous',
        description: 'Rules are generated inside the system. The structure of the state space is itself a variable.',
        ids: ['OP', 'HR', 'DC', 'PO', 'EN', 'GT'],
    },
    {
        key: 'reflexive',
        label: 'Reflexive',
        description: 'The system\'s model of itself feeds back into its dynamics. Observation changes the observed.',
        ids: ['RF', 'S2', 'PF'],
    },
];

// ── Re-exports ───────────────────────────────────────────────────

export { STATE_SPACES } from './data';
export { SAMPLE_CASES } from './cases';
export { matchScore, rankSpaces } from './match';
