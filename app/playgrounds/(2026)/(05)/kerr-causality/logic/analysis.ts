import type { SensitivityBar } from '@/components/SensitivityAnalysis';

import { CASES, CASE_KEYS, type CaseKey } from './cases';
import {
    FIELD_KEYS,
    FIELD_LABELS,
    FIELD_RANGES,
    REGIMES,
    currentCase,
    dominantField,
    scoreModel,
    statusOf,
    type FieldKey,
    type Metrics,
    type Params,
} from './model';


export type SweepableField = FieldKey;

export interface SweepDatum {
    sweepValue: number;
    rMinus: number;
    rPlus: number;
    rMin: number;
    rMax: number;
    allowedSpan: number;
    crossings: number;
}

export function computeSweep(p: Params, field: SweepableField): SweepDatum[] {
    const { min, max } = FIELD_RANGES[field];
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const v = min + ((max - min) * i) / 40;
        const m = scoreModel({ ...p, [field]: v });
        data.push({
            sweepValue: Number(v.toFixed(3)),
            rMinus: Number(m.rMinus.toFixed(3)),
            rPlus: Number(m.rPlus.toFixed(3)),
            rMin: Number.isFinite(m.rMin) ? Number(m.rMin.toFixed(3)) : 0,
            rMax: Number.isFinite(m.rMax) ? Number(m.rMax.toFixed(3)) : 0,
            allowedSpan: Number(m.allowedSpan.toFixed(3)),
            crossings: m.crossings,
        });
    }
    return data;
}

export function computeSensitivity(p: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = FIELD_KEYS.map((k) => {
        const { min, max } = FIELD_RANGES[k];
        const low = scoreModel({ ...p, [k]: min }).allowedSpan;
        const high = scoreModel({ ...p, [k]: max }).allowedSpan;
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
    if (value < 0.5) return `near-zero ${label}`;
    if (value < 1.5) return `narrow ${label}`;
    if (value < 3) return `moderate ${label}`;
    return `wide ${label}`;
}

export function computeNarrative(p: Params, m: Metrics): string {
    const cse = currentCase(p);
    const reg = statusOf(m);
    const parts: string[] = [];

    parts.push(`reading the ${cse.label} scenario as ${reg.title}.`);
    parts.push(reg.description);

    if (m.crossings === 2) {
        parts.push('the radial corridor straddles both horizons, so the photon traverses every causal sector reachable from this side of the diagram.');
    } else if (m.crossings === 1) {
        parts.push('the corridor crosses one horizon. the photon either falls inward without returning, or threads only the outer sector.');
    } else if (m.regimeIndex === 0) {
        parts.push('no upper turning point: the photon escapes the scan window. R(r) stays non-negative out to the boundary.');
    } else {
        parts.push('both turning points sit in the same causal sector. the photon is bound there.');
    }

    if (Math.abs(p.E) < 1e-6) {
        parts.push('E = 0 puts the photon on the borderline allowed by the ergoregion. local energy is positive, but conserved energy at infinity vanishes.');
    } else if (p.E < 0) {
        parts.push('E < 0 is forbidden outside the ergoregion. this orbit is only possible because the time-translation killing vector becomes spacelike there.');
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
    const cse = currentCase(p);
    const reg = statusOf(m);
    const dom = dominantField(p);

    const title = `${cse.label}, ${reg.title}`;
    const diagnosis =
        Math.abs(p[dom] - cse.profile[dom]) < 1e-4
            ? `at the canonical ${FIELD_LABELS[dom]} for this scenario.`
            : `the ${FIELD_LABELS[dom]} dial is the most displaced from the canonical profile.`;
    const move = reg.scenario;
    const fieldNote = reg.aphorism;
    const compact = `${band(m.allowedSpan, 'corridor')} (${m.allowedSpan.toFixed(2)}). ${m.crossings} horizon crossing${m.crossings === 1 ? '' : 's'}. r in [${Number.isFinite(m.rMin) ? m.rMin.toFixed(2) : 'n/a'}, ${Number.isFinite(m.rMax) ? m.rMax.toFixed(2) : 'n/a'}].`;

    return { title, diagnosis, move, fieldNote, compact };
}

export interface ComparativeRow {
    key: CaseKey;
    label: string;
    allowedSpan: number;
    rMin: number;
    rMax: number;
    crossings: number;
    regimeIndex: number;
    expectedAllowedSpan: number;
}

export function comparativeRanking(): ComparativeRow[] {
    const rows: ComparativeRow[] = CASE_KEYS.map((k) => {
        const cse = CASES[k];
        const m = scoreModel({
            M: 1,
            ...cse.profile,
            case: k,
        });
        return {
            key: k,
            label: cse.label,
            allowedSpan: m.allowedSpan,
            rMin: m.rMin,
            rMax: m.rMax,
            crossings: m.crossings,
            regimeIndex: m.regimeIndex,
            expectedAllowedSpan: cse.expectedAllowedSpan,
        };
    });
    rows.sort((a, b) => b.allowedSpan - a.allowedSpan);
    return rows;
}

export { REGIMES };
