import type { SensitivityBar } from '@/components/SensitivityAnalysis';

import {
    FIELD_KEYS,
    FIELD_LABELS,
    FIELD_RANGES,
    type FieldKey,
    type Params,
} from './model';
import { scoreModel, type Metrics } from './simulation';
import { SCENARIOS, type ScenarioCase } from './scenarios';


export type SweepableField = FieldKey;


export interface SweepDatum {
    sweepValue: number;
    concentration: number;
    contextWidth: number;
    nearbyMass: number;
    distantMass: number;
    translationDrift: number;
}


export function computeSweep(p: Params, field: SweepableField): SweepDatum[] {
    const { min, max, step } = FIELD_RANGES[field];
    const samples = Math.min(41, Math.max(11, Math.round((max - min) / step) + 1));
    const data: SweepDatum[] = [];
    for (let i = 0; i < samples; i++) {
        const t = samples === 1 ? 0 : i / (samples - 1);
        let v = min + (max - min) * t;
        if (field === 'seqLen' || field === 'pairs') v = Math.round(v);
        const m = scoreModel({ ...p, [field]: v });
        data.push({
            sweepValue: Number(v.toFixed(3)),
            concentration: Number((m.concentration * 100).toFixed(1)),
            contextWidth: Number(m.contextWidth.toFixed(2)),
            nearbyMass: Number((m.nearbyMass * 100).toFixed(1)),
            distantMass: Number((m.distantMass * 100).toFixed(1)),
            translationDrift: Number((m.translationDrift * 100).toFixed(2)),
        });
    }
    return data;
}


export function computeSensitivity(p: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = FIELD_KEYS.map((k) => {
        const { min, max } = FIELD_RANGES[k];
        const lowParams = { ...p, [k]: k === 'seqLen' || k === 'pairs' ? Math.round(min) : min };
        const highParams = { ...p, [k]: k === 'seqLen' || k === 'pairs' ? Math.round(max) : max };
        const low = scoreModel(lowParams).concentration * 100;
        const high = scoreModel(highParams).concentration * 100;
        return {
            label: FIELD_LABELS[k],
            low: Math.min(low, high),
            high: Math.max(low, high),
        };
    });
    bars.sort((a, b) => (b.high - b.low) - (a.high - a.low));
    return bars;
}


function band(value: number, label: string): string {
    if (value < 0.25) return `low ${label}`;
    if (value < 0.5) return `moderate ${label}`;
    if (value < 0.75) return `high ${label}`;
    return `extreme ${label}`;
}


export function currentScenario(p: Params): ScenarioCase {
    return SCENARIOS[p.preset];
}


export function dominantField(p: Params): FieldKey {
    const canon = SCENARIOS[p.preset].profile;
    const score = (k: FieldKey) => {
        const r = FIELD_RANGES[k];
        const span = r.max - r.min;
        return span === 0 ? 0 : Math.abs(p[k] - canon[k]) / span;
    };
    const sorted = FIELD_KEYS.map((k) => [k, score(k)] as const).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
}


export function computeNarrative(p: Params, m: Metrics): string {
    const cse = currentScenario(p);
    const parts: string[] = [];

    parts.push(`reading the ${cse.label} configuration.`);
    parts.push(`peak attention ${m.peakScore.toFixed(2)}, mean ${m.meanScore.toFixed(2)}, concentration ${(m.concentration * 100).toFixed(0)}%.`);

    if (m.nearbyMass > m.distantMass + 0.05) {
        parts.push('the head is locality-biased: nearby tokens attend more than far ones.');
    } else if (m.distantMass > m.nearbyMass + 0.05) {
        parts.push('the head is long-range: distant tokens attend more than nearby ones, an unusual regime usually only seen with specific content patterns.');
    } else {
        parts.push('attention is roughly position-flat: content similarity is doing most of the work.');
    }

    if (m.translationDrift > 0.05) {
        parts.push(`translation drift ${m.translationDrift.toFixed(2)}: the head is not exactly translation-invariant because content vectors are tied to absolute positions.`);
    } else {
        parts.push(`translation drift ${m.translationDrift.toFixed(2)}: close to RoPE's theoretical relative-only behaviour.`);
    }

    parts.push(`phase advance at token i: ${m.phaseAdvance.toFixed(0)}°.`);

    return parts.join(' ');
}


export interface Reading {
    title: string;
    diagnosis: string;
    bridgeNote: string;
    aphorism: string;
    compact: string;
}


export function generateReading(p: Params, m: Metrics): Reading {
    const cse = currentScenario(p);
    const dom = dominantField(p);
    const distance = Math.abs(p[dom] - cse.profile[dom]);
    const span = FIELD_RANGES[dom].max - FIELD_RANGES[dom].min;

    const title = `${cse.label}`;
    const diagnosis =
        span > 0 && distance / span < 0.01
            ? `at the canonical ${FIELD_LABELS[dom]} setting for this preset.`
            : `the ${FIELD_LABELS[dom]} dial is the most displaced from the canonical profile.`;

    const phaseDeg = m.phaseAdvance.toFixed(0);
    const angleDeg = m.relativeAngle.toFixed(0);
    const bridgeNote = `RoPE relative angle in the first plane: ${angleDeg}°. neural phase advance at the same position: ${phaseDeg}°. both encode position as an angle even though the substrates have nothing in common.`;

    const aphorism =
        m.concentration > 0.7
            ? 'a sharp attention is a head that has chosen to localise.'
            : m.distantMass > m.nearbyMass
                ? 'a long-range head trades sharpness for reach.'
                : 'attention is the geometry the head has decided is worth paying for.';

    const compact = `${band(m.concentration, 'concentration')}. ${band(m.nearbyMass + 0.5, 'nearby mass')}. drift ${(m.translationDrift * 100).toFixed(1)}%.`;

    return { title, diagnosis, bridgeNote, aphorism, compact };
}


export interface ComparativeRow {
    key: ScenarioCase['key'];
    label: string;
    concentration: number;
    contextWidth: number;
    nearbyMass: number;
    distantMass: number;
    drift: number;
    expectedConcentration: number;
}


export function comparativeRanking(): ComparativeRow[] {
    const rows: ComparativeRow[] = Object.values(SCENARIOS).map((cse) => {
        const m = scoreModel({ ...cse.profile, preset: cse.key });
        return {
            key: cse.key,
            label: cse.label,
            concentration: m.concentration * 100,
            contextWidth: m.contextWidth,
            nearbyMass: m.nearbyMass,
            distantMass: m.distantMass,
            drift: m.translationDrift,
            expectedConcentration: cse.expectedConcentration,
        };
    });
    rows.sort((a, b) => b.concentration - a.concentration);
    return rows;
}
