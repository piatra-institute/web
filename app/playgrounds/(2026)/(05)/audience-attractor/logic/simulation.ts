// stochastic audience-attractor simulation.
// deterministic given fixed (params, scenario, seed): the rng is seeded.

import { clamp } from '@/lib/playgroundMath';
import { gaussian, seededRandom } from '@/lib/rng';

import type { ScenarioKey } from './scenarios';

export interface SimulationParams {
    initialFloor: number;
    capacity: number;
    habit: number;
    parasocial: number;
    discoverability: number;
    cumulativeAdvantage: number;
    saturation: number;
    identityLock: number;
    quality: number;
    noise: number;
    shockProbability: number;
    shockStrength: number;
}

export interface SimRow {
    t: number;
    viewers: number;
    core: number;
    casual: number;
    logViewers: number;
}

export interface SimEvent {
    t: number;
    label: string;
}

export interface SimResult {
    rows: SimRow[];
    events: SimEvent[];
}

// fixed sim horizon. exposing this as a param would couple the sweep grid to it.
export const HORIZON = 180;
const SEED = 73;

// scenario multipliers and timed events.
const SCENARIO_MULT: Record<ScenarioKey, number> = {
    baseline: 1,
    breakout: 1.28,
    pivot: 0.95,
    scandal: 0.72,
    collapse: 0.58,
    decay: 0.85,
};

export function simulate(params: SimulationParams, scenario: ScenarioKey): SimResult {
    let core = params.initialFloor * 0.68;
    let casual = params.initialFloor * 0.32;
    const rows: SimRow[] = [];
    const events: SimEvent[] = [];

    const scenarioMult = SCENARIO_MULT[scenario];

    for (let t = 0; t < HORIZON; t++) {
        const viewers = Math.max(1, core + casual);
        const logV = Math.log10(viewers + 1);

        // scenario-specific dynamics: pivot raises capacity mid-run; collapse breaks retention;
        // scandal injects negative shock; breakout opens a window of high discoverability.
        const capacity = scenario === 'pivot' && t > HORIZON * 0.35
            ? params.capacity * 1.65
            : params.capacity;
        const quality = scenario === 'pivot' && t > HORIZON * 0.35
            ? params.quality + 1.2
            : params.quality;
        const discoverability =
            scenario === 'breakout' && t > HORIZON * 0.2 && t < HORIZON * 0.45
                ? params.discoverability * 2.1
                : params.discoverability;
        const retentionShock = scenario === 'collapse' && t > HORIZON * 0.25 ? 0.52 : 1;
        const controversy =
            scenario === 'scandal' && t > HORIZON * 0.3 && t < HORIZON * 0.42 ? -0.22 : 0;
        const decayPressure = scenario === 'decay' ? 0.97 : 1;

        const habitRetention = clamp(0.72 + params.habit * 0.022, 0.65, 0.97) * retentionShock * decayPressure;
        const conversion = clamp(0.01 + params.parasocial * 0.004 + quality * 0.002, 0.01, 0.095);
        const socialProof = Math.pow(viewers + 1, 0.24 + params.cumulativeAdvantage * 0.03);
        const saturationTerm = clamp(1 - viewers / Math.max(1, capacity), -0.22, 1);
        const platform = discoverability * 8 * socialProof * saturationTerm * scenarioMult;
        const nicheDrag =
            Math.max(0, viewers - capacity * 0.72) *
            (params.saturation * 0.004 + params.identityLock * 0.002);

        const noiseTerm = gaussian(SEED + t * 17) * params.noise * Math.sqrt(viewers + 8);

        const shockRoll = seededRandom(SEED + t * 71);
        let shock = 0;
        if (shockRoll < params.shockProbability / 100) {
            shock = Math.abs(gaussian(SEED + t * 131)) * params.shockStrength * Math.sqrt(viewers + 100);
            events.push({ t, label: 'exposure shock' });
        }

        // scenario-tagged event markers
        if (scenario === 'breakout' && Math.abs(t - Math.round(HORIZON * 0.28)) < 1) {
            events.push({ t, label: 'collab window' });
        }
        if (scenario === 'pivot' && Math.abs(t - Math.round(HORIZON * 0.36)) < 1) {
            events.push({ t, label: 'format pivot' });
        }
        if (scenario === 'scandal' && Math.abs(t - Math.round(HORIZON * 0.31)) < 1) {
            events.push({ t, label: 'trust shock' });
        }
        if (scenario === 'collapse' && Math.abs(t - Math.round(HORIZON * 0.26)) < 1) {
            events.push({ t, label: 'schedule collapse' });
        }

        const newCasual = clamp(
            platform + noiseTerm + shock + controversy * viewers - nicheDrag,
            0,
            capacity * 2.5,
        );
        const converted = casual * conversion;
        core = clamp(core * habitRetention + converted, 1, capacity * 2.5);
        casual = clamp(newCasual, 0, capacity * 2.5);

        rows.push({
            t,
            viewers: Math.round(core + casual),
            core: Math.round(core),
            casual: Math.round(casual),
            logViewers: Number(logV.toFixed(3)),
        });
    }

    return { rows, events };
}

export interface DetectedBand {
    band: string;
    midpoint: number;
    count: number;
    share: number;
    logBand: number;
}

// histogram of log-viewers dwell time, bucketed to 0.25 log units (a ~1.78x range).
export function detectBands(rows: SimRow[]): DetectedBand[] {
    if (rows.length === 0) return [];
    const logs = rows.map((d) => Math.log10(d.viewers + 1));
    const buckets = new Map<number, number>();
    for (const v of logs) {
        const b = Math.round(v * 4) / 4;
        buckets.set(b, (buckets.get(b) || 0) + 1);
    }
    return Array.from(buckets.entries())
        .map(([logBand, count]) => ({
            band: `${Math.round(Math.pow(10, logBand - 0.125))}-${Math.round(Math.pow(10, logBand + 0.125))}`,
            midpoint: Math.pow(10, logBand),
            count,
            share: count / rows.length,
            logBand,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
}

export interface DriftPoint {
    viewers: number;
    logViewers: number;
    drift: number;
}

// analytic expected drift as a function of log-viewers, holding all other params fixed.
// crossings near zero are candidate stable attractors.
export function driftData(params: SimulationParams): DriftPoint[] {
    const rows: DriftPoint[] = [];
    const maxLog = Math.log10(params.capacity * 1.8 + 1);
    const kLog = Math.log10(params.capacity + 1);
    const floorLog = Math.log10(params.initialFloor + 1);
    for (let i = 0; i <= 120; i++) {
        const x = (i / 120) * maxLog;
        const viewers = Math.pow(10, x) - 1;
        const habitPull = params.habit * 0.018 * (floorLog - x);
        const cumulative = params.discoverability * 0.012 * Math.pow(Math.max(x, 0.01), params.cumulativeAdvantage);
        const sat = -params.saturation * 0.026 * Math.max(0, x - kLog * 0.72);
        const identityDrag = -params.identityLock * 0.009 * Math.max(0, x - floorLog - 0.35);
        const net = habitPull + cumulative + sat + identityDrag + (params.quality - 5) * 0.006;
        rows.push({ viewers, logViewers: x, drift: net });
    }
    return rows;
}

export interface PotentialPoint {
    viewers: number;
    logViewers: number;
    potential: number;
}

// audience potential landscape U(x) over log-viewers. wells at the inherited floor
// and at the niche capacity; an identity-lock-in barrier between them.
export function potentialData(params: SimulationParams): PotentialPoint[] {
    const rows: PotentialPoint[] = [];
    const maxLog = Math.log10(params.capacity * 1.6 + 1);
    const floorLog = Math.log10(params.initialFloor + 1);
    const ceilingLog = Math.log10(params.capacity + 1);
    for (let i = 0; i <= 140; i++) {
        const x = (i / 140) * maxLog;
        const well1 = Math.pow(x - floorLog, 2) * 0.7;
        const well2 = Math.pow(x - ceilingLog, 2) * 0.45;
        const barrier =
            Math.exp(-Math.pow((x - (floorLog + ceilingLog) / 2) * 1.8, 2)) *
            params.identityLock /
            20;
        const u = Math.min(well1, well2 + 0.8) + barrier;
        rows.push({ viewers: Math.pow(10, x) - 1, logViewers: x, potential: u });
    }
    return rows;
}

export function bandLabel(v: number): string {
    if (v < 50) return 'micro';
    if (v < 250) return 'small';
    if (v < 1000) return 'mid';
    if (v < 5000) return 'large';
    if (v < 20000) return 'elite';
    return 'mass';
}
