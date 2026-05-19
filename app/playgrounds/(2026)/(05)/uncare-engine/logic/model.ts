import type { CaseKey } from './cases';
import { CASES } from './cases';
import { getStageByScore } from './stages';


export const AXIS_KEYS = [
    'load',
    'shame',
    'exit',
    'tribe',
    'inflation',
    'isolation',
] as const;

export type AxisKey = typeof AXIS_KEYS[number];

export const AXIS_LABELS: Record<AxisKey, string> = {
    load: 'moral load',
    shame: 'public shame',
    exit: 'available exit',
    tribe: 'tribal reward for defiance',
    inflation: 'moral inflation',
    isolation: 'isolation from private correction',
};

export const AXIS_HINTS: Record<AxisKey, string> = {
    load: 'how much of ordinary life feels morally implicated in the person\'s frame.',
    shame: 'how much correction feels staged as humiliation rather than private repair.',
    exit: 'how easy it is to act better without total self-destruction. higher means safer exits available.',
    tribe: 'how much the surrounding group rewards cruelty, defiance, and refusal as loyalty.',
    inflation: 'how much language uses maximum-charge moral terms for ordinary mistakes.',
    isolation: 'how rare low-stakes private correction is. higher means correction only ever happens in public.',
};

export type AxisValues = Record<AxisKey, number>;

export const SWEEPABLE_AXES = AXIS_KEYS;
export type SweepableAxis = AxisKey;

export type PresetKey = 'calm' | 'exhausted' | 'captured' | 'abyss';

export const PRESET_KEYS: PresetKey[] = ['calm', 'exhausted', 'captured', 'abyss'];

export interface PresetDescription {
    label: string;
    question: string;
    expectation: string;
    profile: AxisValues;
}

export const PRESET_DESCRIPTIONS: Record<PresetKey, PresetDescription> = {
    calm: {
        label: 'calm',
        question: 'what does proportional, bounded care look like as a parameter set?',
        expectation: 'low madness, high escape velocity, high care capacity. stage 0 ordinary.',
        profile: {
            load: 25,
            shame: 20,
            exit: 75,
            tribe: 15,
            inflation: 15,
            isolation: 20,
        },
    },
    exhausted: {
        label: 'exhausted',
        question: 'the person has not flipped yet. they are tired and shrinking the moral object.',
        expectation: 'middling madness, weakening care. somewhere in stage 1 or 2.',
        profile: {
            load: 70,
            shame: 45,
            exit: 50,
            tribe: 25,
            inflation: 55,
            isolation: 60,
        },
    },
    captured: {
        label: 'captured',
        question: 'a tribe pays for defiance and the exits look sealed.',
        expectation: 'high madness and inversion pressure. stage 3 or 4.',
        profile: {
            load: 65,
            shame: 70,
            exit: 30,
            tribe: 80,
            inflation: 65,
            isolation: 55,
        },
    },
    abyss: {
        label: 'abyss',
        question: 'what does the late-stage uncare configuration look like, all dials pushed?',
        expectation: 'near-maximum madness. monstrosity potential high. stage 5.',
        profile: {
            load: 85,
            shame: 85,
            exit: 15,
            tribe: 90,
            inflation: 85,
            isolation: 80,
        },
    },
};

export interface Params extends AxisValues {
    case: CaseKey;
    preset: PresetKey;
}

export const DEFAULT_PARAMS: Params = {
    ...PRESET_DESCRIPTIONS.exhausted.profile,
    case: 'veganism',
    preset: 'exhausted',
};

export interface Metrics {
    madness: number;
    escapeVelocity: number;
    inversionPressure: number;
    monstrosityPotential: number;
    careCapacity: number;
    backlashRisk: number;
    stageIndex: number;
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(100, Math.round(x)));
}

export function scoreModel(p: AxisValues): Metrics {
    const exitInv = 100 - p.exit;
    const madness = clamp01(
        p.load * 0.22 +
        p.shame * 0.18 +
        exitInv * 0.20 +
        p.tribe * 0.16 +
        p.inflation * 0.14 +
        p.isolation * 0.10,
    );

    const escapeVelocity = clamp01(
        p.exit * 0.48 +
        (100 - p.tribe) * 0.24 +
        (100 - p.isolation) * 0.18 +
        (100 - p.inflation) * 0.10,
    );

    const inversionPressure = clamp01(
        p.shame * 0.28 +
        p.tribe * 0.28 +
        p.inflation * 0.22 +
        p.isolation * 0.12 +
        exitInv * 0.10,
    );

    const monstrosityPotential = clamp01(
        madness * 0.45 +
        inversionPressure * 0.30 +
        p.tribe * 0.15 +
        p.isolation * 0.10,
    );

    const careCapacity = clamp01(
        100 - madness * 0.85 +
        (p.exit - 50) * 0.20,
    );

    const backlashRisk = clamp01(
        p.load * 0.28 +
        p.shame * 0.30 +
        p.inflation * 0.22 +
        exitInv * 0.20,
    );

    const stage = getStageByScore(madness);

    return {
        madness,
        escapeVelocity,
        inversionPressure,
        monstrosityPotential,
        careCapacity,
        backlashRisk,
        stageIndex: stage.index,
    };
}

export function presetParams(current: Params, key: PresetKey): Params {
    const profile = PRESET_DESCRIPTIONS[key].profile;
    return {
        ...current,
        ...profile,
        preset: key,
    };
}

export function applyCanonical(current: Params, caseKey: CaseKey): Params {
    const canonical = CASES[caseKey].canonical;
    return {
        ...current,
        ...canonical,
        case: caseKey,
    };
}

export function extractAxes(p: AxisValues): AxisValues {
    return AXIS_KEYS.reduce((acc, k) => {
        acc[k] = p[k];
        return acc;
    }, {} as AxisValues);
}

export function pressureComponent(p: AxisValues): number {
    return clamp01(p.load * 0.45 + p.shame * 0.30 + p.inflation * 0.25);
}

export function captureComponent(p: AxisValues): number {
    return clamp01(p.tribe * 0.40 + (100 - p.exit) * 0.35 + p.isolation * 0.25);
}

export function dominantAxis(p: AxisValues): AxisKey {
    const entries = AXIS_KEYS.map((k) => {
        const v = k === 'exit' ? 100 - p[k] : p[k];
        return [k, v] as const;
    });
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}

export function weakestAxis(p: AxisValues): AxisKey {
    const entries = AXIS_KEYS.map((k) => {
        const v = k === 'exit' ? 100 - p[k] : p[k];
        return [k, v] as const;
    });
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0][0];
}
