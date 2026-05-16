import { CASES } from './cases';
import { LENSES } from './lenses';
import {
    AXIS_KEYS,
    AXIS_LABELS,
    AXIS_HINTS,
    dominantAxis,
    weakestAxis,
    scoreModel,
    type AxisKey,
    type AxisValues,
    type Metrics,
    type Params,
} from './model';


export type SweepableAxis = AxisKey;

export const AXIS_SPECS: { key: SweepableAxis; label: string; hint: string }[] = AXIS_KEYS.map((k) => ({
    key: k,
    label: AXIS_LABELS[k],
    hint: AXIS_HINTS[k],
}));

export interface SweepDatum {
    sweepValue: number;
    obstruction: number;
    glue: number;
    mythicCharge: number;
    modernity: number;
    germPersistence: number;
    monodromyTwist: number;
}

export function computeSweep(p: Params, axis: SweepableAxis): SweepDatum[] {
    const out: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const v = i * 2.5;
        const m = scoreModel({ ...p, [axis]: v });
        out.push({
            sweepValue: Math.round(v),
            obstruction: m.obstruction,
            glue: m.glue,
            mythicCharge: m.mythicCharge,
            modernity: m.modernity,
            germPersistence: m.germPersistence,
            monodromyTwist: m.monodromyTwist,
        });
    }
    return out;
}

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export function computeSensitivity(p: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = AXIS_KEYS.map((k) => {
        const lo = scoreModel({ ...p, [k]: 0 }).obstruction;
        const hi = scoreModel({ ...p, [k]: 100 }).obstruction;
        return { label: AXIS_LABELS[k], low: Math.min(lo, hi), high: Math.max(lo, hi) };
    });
    return bars.sort((a, b) => b.high - b.low - (a.high - a.low));
}

export function computeNarrative(p: Params, m: Metrics): string {
    const c = CASES[p.case];
    const lens = LENSES[p.lens];
    const dom = dominantAxis(p);
    const weak = weakestAxis(p);
    const parts: string[] = [];
    parts.push(
        `Reading ${c.label} through the ${lens.label} lens at obstruction ${m.obstruction} and gluing ${m.glue}.`,
    );
    if (m.obstruction >= 75) {
        parts.push('The local sections cannot be reconciled. The story is structurally an obstruction.');
    } else if (m.obstruction >= 55) {
        parts.push('Gluing succeeds only with visible scars. The overlaps remain marked.');
    } else if (m.obstruction <= 35) {
        parts.push('The local sections are unusually compatible. The risk is flattening, not fragmentation.');
    } else {
        parts.push('The system glues partially. Some overlaps cohere, others remain open.');
    }
    if (m.germPersistence >= 70) {
        parts.push(`The local germ (${AXIS_LABELS[dom.key]} at ${dom.value}) holds against extension.`);
    } else if (m.germPersistence <= 35) {
        parts.push('The local germ is being dissolved by abstraction. Return becomes harder than departure.');
    }
    if (m.monodromyTwist >= 70) {
        parts.push('Any loop through this situation returns the subject changed. Repetition is not identity here.');
    }
    if (weak.value <= 25) {
        parts.push(`${AXIS_LABELS[weak.key]} is nearly absent (${weak.value}); the configuration is one-sided.`);
    }
    return parts.join(' ');
}

export interface Reading {
    title: string;
    theorem: string;
    aphorism: string;
    fieldNote: string;
    compact: string;
}

export function generateReading(p: Params, m: Metrics): Reading {
    const c = CASES[p.case];
    const lens = LENSES[p.lens];
    const dom = dominantAxis(p);
    const sec = (() => {
        let key: AxisKey = 'locality';
        let val = -1;
        for (const k of AXIS_KEYS) {
            if (k === dom.key) continue;
            if (p[k] > val) {
                key = k;
                val = p[k];
            }
        }
        return key;
    })();

    const risk =
        m.obstruction > 74
            ? 'The gluing obstruction dominates: the work becomes a map of incompatibility rather than reconciliation.'
            : m.obstruction > 48
                ? 'The system glues locally, but only by preserving visible scars at the overlaps.'
                : 'The local sections are unusually compatible: the danger is not fragmentation, but flattening.';

    return {
        title: `${c.label} through ${lens.label}`,
        theorem: `In this configuration, ${c.label} reads as ${lens.formula}. ${risk}`,
        aphorism:
            m.glue > m.obstruction
                ? 'The art is not unity. The art is controlled compatibility.'
                : 'The wound is not outside the structure. The wound is the transition function.',
        fieldNote: `dominant: ${AXIS_LABELS[dom.key]} | secondary: ${AXIS_LABELS[sec]} | local-global tension: ${m.localGlobalTension}/100 | obstruction: ${m.obstruction}/100`,
        compact: `Let X be the narrative base space and F the sheaf of commitments. The selected work exhibits local sections s_i that ${m.obstruction > 60 ? 'fail' : 'partially succeed'} to glue over overlaps. The remaining object is not a universal subject, but a residue: a transported, wounded, locally answerable germ.`,
    };
}

export function comparativeRanking(_p: AxisValues): { caseKey: keyof typeof CASES; label: string; obstruction: number }[] {
    return (Object.keys(CASES) as (keyof typeof CASES)[])
        .map((k) => {
            const m = scoreModel(CASES[k].canonical);
            return { caseKey: k, label: CASES[k].label, obstruction: m.obstruction };
        })
        .sort((a, b) => b.obstruction - a.obstruction);
}
