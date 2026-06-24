import type { SensitivityBar } from '@/components/SensitivityAnalysis';

import { SCENARIOS, SCENARIO_KEYS, type ScenarioKey } from './scenarios';
import {
    FIELD_KEYS,
    FIELD_LABELS,
    FIELD_RANGES,
    bandLabel,
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
    finalViewers: number;
    peakViewers: number;
    troughViewers: number;
    dwellShare: number;
    coreShare: number;
    logRange: number;
}

export function computeSweep(p: Params, field: SweepableField): SweepDatum[] {
    const { min, max } = FIELD_RANGES[field];
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const v = min + ((max - min) * i) / 40;
        const m = scoreModel({ ...p, [field]: v });
        data.push({
            sweepValue: Number(v.toFixed(2)),
            finalViewers: m.finalViewers,
            peakViewers: m.peakViewers,
            troughViewers: m.troughViewers,
            dwellShare: Number((m.dwellShare * 100).toFixed(1)),
            coreShare: Number((m.coreShare * 100).toFixed(1)),
            logRange: Number(m.logRange.toFixed(3)),
        });
    }
    return data;
}

export function computeSensitivity(p: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = FIELD_KEYS.map((k) => {
        const { min, max } = FIELD_RANGES[k];
        const low = scoreModel({ ...p, [k]: min }).finalViewers;
        const high = scoreModel({ ...p, [k]: max }).finalViewers;
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
    if (value < 0.2) return `weak ${label}`;
    if (value < 0.4) return `moderate ${label}`;
    if (value < 0.6) return `clear ${label}`;
    return `strong ${label}`;
}

export function computeNarrative(p: Params, m: Metrics): string {
    const cse = currentCase(p);
    const reg = statusOf(m);
    const parts: string[] = [];

    parts.push(`reading the ${cse.label} scenario as ${reg.title}.`);
    parts.push(reg.description);

    if (m.regimeIndex === 2) {
        parts.push(
            `${(m.dwellShare * 100).toFixed(0)} percent of the run sits in the ${bandLabel(m.dominantMidpoint)} band (around ${Math.round(m.dominantMidpoint)} viewers). that is the candidate attractor.`,
        );
    } else if (m.regimeIndex === 3) {
        parts.push(
            `the trajectory ends near ${Math.round(m.finalViewers)} viewers, well clear of the inherited floor of ${Math.round(p.initialFloor)}. shocks moved the system between basins.`,
        );
    } else if (m.regimeIndex === 0) {
        parts.push(
            `final audience ${Math.round(m.finalViewers)} sits below the inherited floor of ${Math.round(p.initialFloor)}. the basin did not hold.`,
        );
    } else {
        parts.push(
            `dominant dwell share is only ${(m.dwellShare * 100).toFixed(0)} percent. structural pull is being drowned by noise or by competing pressures.`,
        );
    }

    if (m.coreShare > 0.7) {
        parts.push('core audience dominates the final mix, so any future drop hits casuals first.');
    } else if (m.coreShare < 0.3) {
        parts.push('the audience is mostly casuals at the end; the floor is thin under any new shock.');
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
    const compact = `final ${Math.round(m.finalViewers)} (${bandLabel(m.finalViewers)}). dwell ${(m.dwellShare * 100).toFixed(0)} pct. ${band(m.dwellShare, 'concentration')}.`;

    return { title, diagnosis, move, fieldNote, compact };
}

export interface ComparativeRow {
    key: ScenarioKey;
    label: string;
    finalViewers: number;
    peakViewers: number;
    dwellShare: number;
    regimeIndex: number;
    expectedFinal: number;
    expectedDwellShare: number;
}

export function comparativeRanking(): ComparativeRow[] {
    const rows: ComparativeRow[] = SCENARIO_KEYS.map((k) => {
        const cse = SCENARIOS[k];
        const m = scoreModel({ ...cse.profile, case: k });
        return {
            key: k,
            label: cse.label,
            finalViewers: m.finalViewers,
            peakViewers: m.peakViewers,
            dwellShare: m.dwellShare,
            regimeIndex: m.regimeIndex,
            expectedFinal: cse.expectedFinal,
            expectedDwellShare: cse.expectedDwellShare,
        };
    });
    rows.sort((a, b) => b.finalViewers - a.finalViewers);
    return rows;
}
