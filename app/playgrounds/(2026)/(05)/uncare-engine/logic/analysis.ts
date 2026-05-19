import type { SensitivityBar } from '@/components/SensitivityAnalysis';

import { CASES, CASE_KEYS } from './cases';
import type { CaseKey } from './cases';
import {
    AXIS_KEYS,
    AXIS_LABELS,
    Metrics,
    Params,
    SweepableAxis,
    dominantAxis,
    scoreModel,
    weakestAxis,
} from './model';
import { STAGES, STAGE_BY_KEY, getStageByScore } from './stages';


export interface SweepDatum {
    sweepValue: number;
    madness: number;
    escapeVelocity: number;
    inversionPressure: number;
    monstrosityPotential: number;
    careCapacity: number;
    backlashRisk: number;
}

export function computeSweep(p: Params, axis: SweepableAxis): SweepDatum[] {
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const v = (i / 40) * 100;
        const swept: Params = { ...p, [axis]: v };
        const m = scoreModel(swept);
        data.push({
            sweepValue: Math.round(v),
            madness: m.madness,
            escapeVelocity: m.escapeVelocity,
            inversionPressure: m.inversionPressure,
            monstrosityPotential: m.monstrosityPotential,
            careCapacity: m.careCapacity,
            backlashRisk: m.backlashRisk,
        });
    }
    return data;
}

export function computeSensitivity(p: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = AXIS_KEYS.map((k) => {
        const low = scoreModel({ ...p, [k]: 0 }).madness;
        const high = scoreModel({ ...p, [k]: 100 }).madness;
        return {
            label: AXIS_LABELS[k],
            low: Math.min(low, high),
            high: Math.max(low, high),
        };
    });
    bars.sort((a, b) => (b.high - b.low) - (a.high - a.low));
    return bars;
}

function band(value: number, label: string): string {
    if (value < 30) return `low ${label}`;
    if (value < 55) return `moderate ${label}`;
    if (value < 75) return `high ${label}`;
    return `severe ${label}`;
}

export function computeNarrative(p: Params, m: Metrics): string {
    const stage = getStageByScore(m.madness);
    const c = CASES[p.case];
    const parts: string[] = [];
    parts.push(`reading ${c.label} through the ${stage.title} band.`);
    parts.push(stage.description);

    if (m.escapeVelocity < 25) {
        parts.push('exits are nearly sealed; the person cannot see a path back without losing face.');
    } else if (m.escapeVelocity > 60) {
        parts.push('exits are still open; a small concession could move the person back a stage.');
    }

    if (m.inversionPressure > 70 && m.madness > 60) {
        parts.push('inversion pressure is high enough that further accusation will probably make the indefensible look more attractive, not less.');
    }

    if (m.monstrosityPotential > 70) {
        parts.push('monstrosity potential is the dominant signal: the person may begin to enjoy harming what others protect.');
    }

    if (m.backlashRisk > 75) {
        parts.push('a backlash event is imminent; expect a public refusal performance.');
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
    const stage = getStageByScore(m.madness);
    const c = CASES[p.case];
    const dom = dominantAxis(p);
    const weak = weakestAxis(p);
    const domLabel = AXIS_LABELS[dom];
    const weakLabel = AXIS_LABELS[weak];

    const title = `${c.label} at the ${stage.title}`;
    const diagnosis = `the ${domLabel} dial is doing most of the work; the ${weakLabel} dial is the slack the person is not yet using.`;
    const move = stage.intervention;
    const fieldNote = stage.aphorism;
    const compact = `madness ${m.madness}. ${band(m.madness, 'madness')}. ${band(m.inversionPressure, 'inversion')}. ${band(m.escapeVelocity, 'exit')}.`;

    return { title, diagnosis, move, fieldNote, compact };
}

export interface ComparativeRow {
    key: CaseKey;
    label: string;
    predictedMadness: number;
    predictedStage: number;
    expectedMadness: number;
    expectedStage: number;
    delta: number;
}

export function comparativeRanking(): ComparativeRow[] {
    const rows: ComparativeRow[] = CASE_KEYS.map((k) => {
        const c = CASES[k];
        const m = scoreModel({ ...c.canonical });
        return {
            key: k,
            label: c.label,
            predictedMadness: m.madness,
            predictedStage: m.stageIndex,
            expectedMadness: c.expectedMadness,
            expectedStage: c.expectedStage,
            delta: m.madness - c.expectedMadness,
        };
    });
    rows.sort((a, b) => b.predictedMadness - a.predictedMadness);
    return rows;
}

export function stageDistribution(): Array<{ stage: string; count: number }> {
    const counts = STAGES.map((s) => ({ stage: s.title, count: 0 }));
    for (const k of CASE_KEYS) {
        const m = scoreModel(CASES[k].canonical);
        counts[m.stageIndex].count += 1;
    }
    return counts;
}

export { STAGE_BY_KEY };
