import type { SensitivityBar } from '@/components/SensitivityAnalysis';

import { SCENARIOS, SCENARIO_KEYS, type ScenarioKey } from './scenarios';
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
    finalBelief: number;
    finalHarm: number;
    finalAttachment: number;
    finalFamily: number;
    finalTrust: number;
    cumulativeLoss: number;
}


export function computeSweep(p: Params, field: SweepableField): SweepDatum[] {
    const { min, max } = FIELD_RANGES[field];
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const v = min + ((max - min) * i) / 40;
        const m = scoreModel({ ...p, [field]: v });
        data.push({
            sweepValue: Number(v.toFixed(3)),
            finalBelief: Number((m.finalBelief * 100).toFixed(1)),
            finalHarm: Number((m.finalHarm * 100).toFixed(1)),
            finalAttachment: Number((m.finalAttachment * 100).toFixed(1)),
            finalFamily: Number((m.finalFamily * 100).toFixed(1)),
            finalTrust: Number((m.finalTrust * 100).toFixed(1)),
            cumulativeLoss: Number(m.cumulativeLoss.toFixed(2)),
        });
    }
    return data;
}


export function computeSensitivity(p: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = FIELD_KEYS.map((k) => {
        const { min, max } = FIELD_RANGES[k];
        const low = scoreModel({ ...p, [k]: min }).finalFamily * 100;
        const high = scoreModel({ ...p, [k]: max }).finalFamily * 100;
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
    if (value < 0.25) return `low ${label}`;
    if (value < 0.5) return `moderate ${label}`;
    if (value < 0.75) return `high ${label}`;
    return `severe ${label}`;
}


export function computeNarrative(p: Params, m: Metrics): string {
    const cse = currentCase(p);
    const reg = statusOf(m);
    const parts: string[] = [];

    parts.push(`reading ${cse.label} as ${reg.title}.`);
    parts.push(reg.description);

    const beliefHarmGap = m.finalBelief - m.finalHarm;
    if (beliefHarmGap > 0.2) {
        parts.push(`final belief (${m.finalBelief.toFixed(2)}) exceeds actual harm (${m.finalHarm.toFixed(2)}) by ${beliefHarmGap.toFixed(2)}: the institution is over-believing, the cultural-mismatch or poverty-bias signal is dominating.`);
    } else if (beliefHarmGap < -0.2) {
        parts.push(`final belief (${m.finalBelief.toFixed(2)}) sits below actual harm (${m.finalHarm.toFixed(2)}) by ${Math.abs(beliefHarmGap).toFixed(2)}: the cooperative surface is fooling the system.`);
    }

    if (m.removalCount > 0 && m.reunifyCount === 0) {
        parts.push(`${m.removalCount} removal step${m.removalCount === 1 ? '' : 's'} taken, no reunification: the path-dependence machine is running.`);
    } else if (m.removalCount > 0 && m.reunifyCount > 0) {
        parts.push(`${m.removalCount} removal, ${m.reunifyCount} reunification: the trajectory returned to home.`);
    } else if (m.removalCount === 0) {
        parts.push('no removal taken across the run.');
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
            ? `at the canonical ${FIELD_LABELS[dom]} setting for this scenario.`
            : `the ${FIELD_LABELS[dom]} dial is the most displaced from the canonical profile.`;
    const move = reg.scenario;
    const fieldNote = reg.aphorism;
    const compact = `final belief ${m.finalBelief.toFixed(2)}. ${band(m.finalHarm, 'harm')}. ${band(m.finalAttachment, 'attachment')}. ${band(m.finalFamily, 'family integrity')}.`;

    return { title, diagnosis, move, fieldNote, compact };
}


export interface ComparativeRow {
    key: ScenarioKey;
    label: string;
    finalBelief: number;
    finalHarm: number;
    finalFamily: number;
    cumulativeLoss: number;
    outcomeIndex: number;
    placement: string;
    expectedOutcomeIndex: number;
}


export function comparativeRanking(): ComparativeRow[] {
    const rows: ComparativeRow[] = SCENARIO_KEYS.map((k) => {
        const cse = SCENARIOS[k];
        const m = scoreModel({ ...cse.profile, case: k });
        return {
            key: k,
            label: cse.label,
            finalBelief: m.finalBelief,
            finalHarm: m.finalHarm,
            finalFamily: m.finalFamily,
            cumulativeLoss: m.cumulativeLoss,
            outcomeIndex: m.outcomeIndex,
            placement: m.placement,
            expectedOutcomeIndex: cse.expectedOutcomeIndex,
        };
    });
    rows.sort((a, b) => a.outcomeIndex - b.outcomeIndex);
    return rows;
}

export { REGIMES };
