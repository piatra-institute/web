import type { SensitivityBar } from '@/components/SensitivityAnalysis';

import { OBJECTS, OBJECT_KEYS, type ObjectKey } from './objects';
import {
    FIELD_KEYS,
    FIELD_LABELS,
    type FieldKey,
    type Metrics,
    type Params,
    computeField,
    dominantField,
    focalState,
    scoreModel,
    statusOf,
    weakestBrake,
} from './model';
import { LADDER } from './ladder';


export type SweepableField = FieldKey;

export interface SweepDatum {
    sweepValue: number;
    salience: number;
    overSalience: number;
    meaning: number;
    concentration: number;
    attentionShare: number;
    stability: number;
}

export function computeSweep(p: Params, field: SweepableField): SweepDatum[] {
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const v = (i / 40) * 100;
        const m = scoreModel({ ...p, [field]: v });
        data.push({
            sweepValue: Math.round(v),
            salience: m.salience,
            overSalience: m.overSalience,
            meaning: m.meaning,
            concentration: m.concentration,
            attentionShare: m.attentionShare,
            stability: m.stability,
        });
    }
    return data;
}

export function computeSensitivity(p: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = FIELD_KEYS.map((k) => {
        const low = scoreModel({ ...p, [k]: 0 }).salience;
        const high = scoreModel({ ...p, [k]: 100 }).salience;
        return {
            label: FIELD_LABELS[k],
            low: Math.min(low, high),
            high: Math.max(low, high),
        };
    });
    bars.sort((a, b) => b.high - b.low - (a.high - a.low));
    return bars;
}

function band(value: number, label: string): string {
    if (value < 30) return `low ${label}`;
    if (value < 55) return `moderate ${label}`;
    if (value < 78) return `high ${label}`;
    return `extreme ${label}`;
}

export function computeNarrative(p: Params, m: Metrics): string {
    const obj = OBJECTS[p.object];
    const focal = focalState(p);
    const status = statusOf(focal);
    const parts: string[] = [];

    parts.push(`reading the ${obj.label} as a ${status.title} object.`);
    parts.push(status.description);

    if (focal.climb >= 7) {
        parts.push('the object has reached the over-salience rung: it is now a world-filter, not an item in the world.');
    } else if (focal.climb >= 5) {
        parts.push(`it has climbed to the ${LADDER[focal.climb].title} rung of the ladder.`);
    } else {
        parts.push(`it sits low on the ladder, at the ${LADDER[focal.climb].title} rung.`);
    }

    if (m.concentration > 70) {
        parts.push('attention is winner-takes-most: one object is swallowing the field.');
    } else if (m.concentration < 35) {
        parts.push('attention is still spread across several objects.');
    }

    if (focal.uncertainty > 65 && m.overSalience > 55) {
        parts.push('the uncertainty term is doing the damage: ambiguity, not reward, is keeping the loop alive.');
    }

    if (m.meaning < 35 && m.salience > 60) {
        parts.push('salience far exceeds meaning: this is wanting without liking, the incentive-capture signature.');
    }

    return parts.join(' ');
}

export interface Reading {
    title: string;
    diagnosis: string;
    move: string;
    fieldNote: string;
    compact: string;
}

export function generateReading(p: Params, m: Metrics): Reading {
    const obj = OBJECTS[p.object];
    const status = statusOf(focalState(p));
    const dom = dominantField(p);
    const weak = weakestBrake(p);

    const title = `${obj.label}, ${status.title}`;
    const diagnosis = `the ${FIELD_LABELS[dom]} accelerant is doing most of the lifting; the ${FIELD_LABELS[weak]} brake is the slack the field is not using.`;
    const move = status.intervention;
    const fieldNote = status.aphorism;
    const compact = `salience ${m.salience}. ${band(m.salience, 'salience')}. ${band(m.overSalience, 'over-salience')}. ${band(m.meaning, 'meaning')}.`;

    return { title, diagnosis, move, fieldNote, compact };
}

export interface ComparativeRow {
    key: ObjectKey;
    label: string;
    salience: number;
    overSalience: number;
    attention: number;
    climb: number;
    statusIndex: number;
}

export function comparativeRanking(p: Params): ComparativeRow[] {
    const field = computeField(p);
    const rows: ComparativeRow[] = field.map((s) => ({
        key: s.key,
        label: OBJECTS[s.key].label,
        salience: s.salience,
        overSalience: s.overSalience,
        attention: Math.round(s.attention * 100),
        climb: s.climb,
        statusIndex: statusOf(s).index,
    }));
    rows.sort((a, b) => b.salience - a.salience);
    return rows;
}
