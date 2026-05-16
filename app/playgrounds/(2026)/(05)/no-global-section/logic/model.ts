import { CASES, type CaseKey } from './cases';
import type { LensKey } from './lenses';


export interface AxisValues {
    locality: number;
    abstraction: number;
    desire: number;
    institution: number;
    trauma: number;
    knowledge: number;
}

export type AxisKey = keyof AxisValues;

export const AXIS_KEYS: AxisKey[] = [
    'locality',
    'abstraction',
    'desire',
    'institution',
    'trauma',
    'knowledge',
];

export const AXIS_LABELS: Record<AxisKey, string> = {
    locality: 'locality',
    abstraction: 'abstraction',
    desire: 'desire',
    institution: 'institution',
    trauma: 'trauma',
    knowledge: 'knowledge',
};

export const AXIS_HINTS: Record<AxisKey, string> = {
    locality: 'how strongly the situation is anchored to a particular place, body, or bond',
    abstraction: 'how much the situation reaches toward a universal frame, ideal, or system',
    desire: 'how much unsatisfied wanting drives the action',
    institution: 'how much shared order, law, or convention holds the situation together',
    trauma: 'how much the situation carries unresolved wound, grief, or violence',
    knowledge: 'how much articulated understanding the situation contains or demands',
};

export type PresetKey = 'tragic' | 'technocratic' | 'mythic' | 'modernist';

export interface Params extends AxisValues {
    case: CaseKey;
    lens: LensKey;
    preset: PresetKey;
}

export interface Metrics {
    obstruction: number;
    glue: number;
    mythicCharge: number;
    modernity: number;
    germPersistence: number;
    monodromyTwist: number;
    localGlobalTension: number;
}

export const DEFAULT_PARAMS: Params = {
    case: 'odysseus',
    lens: 'sheaf',
    preset: 'tragic',
    locality: 87,
    abstraction: 82,
    desire: 73,
    institution: 61,
    trauma: 78,
    knowledge: 69,
};

function clamp01(x: number): number {
    return Math.max(0, Math.min(100, Math.round(x)));
}

export function scoreModel(p: AxisValues): Metrics {
    const t_LG = Math.abs(p.locality - p.abstraction);
    const containment = p.institution * 0.42 + p.knowledge * 0.21;
    const pressure =
        p.desire * 0.23 +
        p.trauma * 0.31 +
        t_LG * 0.27 +
        p.abstraction * 0.14;
    const obstruction = clamp01(pressure - containment * 0.36 + 18);
    const glue = clamp01(100 - obstruction + p.institution * 0.12 + p.knowledge * 0.08);
    const mythicCharge = clamp01((p.desire + p.trauma + p.locality) / 3);
    const modernity = clamp01((p.abstraction + p.institution + p.knowledge) / 3);
    const germPersistence = clamp01(
        p.locality * 0.55 + p.trauma * 0.2 + p.desire * 0.1 + (100 - p.abstraction) * 0.2,
    );
    const monodromyTwist = clamp01(p.trauma * 0.4 + t_LG * 0.3 + p.desire * 0.2);
    return {
        obstruction,
        glue,
        mythicCharge,
        modernity,
        germPersistence,
        monodromyTwist,
        localGlobalTension: clamp01(t_LG),
    };
}

export const PRESET_DESCRIPTIONS: Record<
    PresetKey,
    { label: string; question: string; expectation: string }
> = {
    tragic: {
        label: 'tragic humanity',
        question: 'What does the obstruction look like when local meaning, abstraction, and trauma are all loud at once?',
        expectation: 'High obstruction. The local sections are dense but incompatible. The story is what cannot be glued.',
    },
    technocratic: {
        label: 'technocratic universalism',
        question: 'Can a strong institution and strong knowledge produce a clean global section without locality or desire?',
        expectation: 'Apparently low obstruction, but at the cost of germ persistence. The world coheres because the local has been thinned.',
    },
    mythic: {
        label: 'mythic topology',
        question: 'What happens when locality, desire, and trauma dominate, with institution almost absent?',
        expectation: 'High mythic charge, high obstruction, low gluing capacity. Meaning is local and unsharable.',
    },
    modernist: {
        label: 'modernist over-possibility',
        question: 'How does the system behave when knowledge and abstraction are high but locality is moderate?',
        expectation: 'Moderate obstruction with a derived flavor: many possible sections, none binding.',
    },
};

export function presetAxes(key: PresetKey): AxisValues {
    switch (key) {
        case 'tragic':
            return { locality: 87, abstraction: 82, desire: 73, institution: 61, trauma: 78, knowledge: 69 };
        case 'technocratic':
            return { locality: 31, abstraction: 91, desire: 36, institution: 88, trauma: 42, knowledge: 84 };
        case 'mythic':
            return { locality: 72, abstraction: 63, desire: 86, institution: 28, trauma: 67, knowledge: 51 };
        case 'modernist':
            return { locality: 49, abstraction: 76, desire: 64, institution: 70, trauma: 56, knowledge: 88 };
    }
}

export function presetParams(p: Params, key: PresetKey): Params {
    return { ...p, ...presetAxes(key), preset: key };
}

export function caseAxes(caseKey: CaseKey): AxisValues {
    return { ...CASES[caseKey].canonical };
}

export function applyCanonical(p: Params, caseKey: CaseKey): Params {
    return { ...p, ...caseAxes(caseKey), case: caseKey };
}

export function dominantAxis(p: AxisValues): { key: AxisKey; value: number } {
    let best: AxisKey = 'locality';
    let bestVal = p.locality;
    for (const k of AXIS_KEYS) {
        if (p[k] > bestVal) {
            best = k;
            bestVal = p[k];
        }
    }
    return { key: best, value: bestVal };
}

export function weakestAxis(p: AxisValues): { key: AxisKey; value: number } {
    let worst: AxisKey = 'locality';
    let worstVal = p.locality;
    for (const k of AXIS_KEYS) {
        if (p[k] < worstVal) {
            worst = k;
            worstVal = p[k];
        }
    }
    return { key: worst, value: worstVal };
}
