// Ontogenic Engine — logic module
//
// Models entityhood as an achievement of adaptive self-maintenance,
// drawing on Simondon's individuation, Maturana & Varela's autopoiesis,
// the enactivist tradition, and Friston's active inference.
//
// Six control parameters modulate five coupled dynamic variables
// that track how a system holds itself together while remaining
// open enough to transform. The key output is the "becoming index" —
// a composite measure of whether the system is genuinely individuating
// or merely persisting, rigidifying, drifting, or dissolving.

import { SensitivityBar } from '@/components/SensitivityAnalysis';


// ── Types ──────────────────────────────────────────────────────

export type PresetKey =
    | 'world-oriented-learner'
    | 'autopoietic-core'
    | 'rigid-organism'
    | 'chaotic-drift';

export type PhaseRegime =
    | 'World-Oriented Becoming'
    | 'Metastable Individuation'
    | 'Rigid Closure'
    | 'Chaotic Drift'
    | 'Dissolution';

export interface Params {
    preset: PresetKey;
    autonomy: number;       // 0-100: internal self-regulation and repair capacity
    boundary: number;       // 0-100: strength of self/world distinction
    plasticity: number;     // 0-100: capacity to reorganize under pressure
    coupling: number;       // 0-100: degree of openness to environmental flows
    memory: number;         // 0-100: retention of prior successful organization
    perturbation: number;   // 0-100: environmental stress and destabilizing input
    steps: number;          // simulation horizon
}

export interface TimeStep {
    t: number;
    viability: number;
    coherence: number;
    novelty: number;
    tension: number;
    boundaryFlux: number;
    becoming: number;
}

export interface PhasePoint {
    x: number;  // boundaryFlux
    y: number;  // tension
    z: number;  // becoming (for size)
}

export interface Scores {
    phase: PhaseRegime;
    becomingIndex: number;
    viability: number;
    coherence: number;
    novelty: number;
    tension: number;
    boundaryFlux: number;
    adaptiveRange: number;
    rigidity: number;
    exposureRisk: number;
    avgBecoming: number;
    avgViability: number;
}

export interface SimResult {
    series: TimeStep[];
    scores: Scores;
    radar: { metric: string; value: number }[];
    phaseSpace: PhasePoint[];
}

export interface Snapshot {
    params: Params;
    scores: Scores;
    label: string;
}

export type SweepableParam =
    | 'autonomy'
    | 'boundary'
    | 'plasticity'
    | 'coupling'
    | 'memory'
    | 'perturbation';

export interface SweepDatum {
    sweepValue: number;
    avgBecoming: number;
    finalBecoming: number;
    avgViability: number;
}


// ── Constants ──────────────────────────────────────────────────

export const ANIMATION_TOTAL_FRAMES = 70;

export const PARAM_META: Record<SweepableParam, { label: string; description: string }> = {
    autonomy: { label: 'autonomy', description: 'internal capacity for self-regulation and repair' },
    boundary: { label: 'boundary integrity', description: 'strength of self/world distinction' },
    plasticity: { label: 'plasticity', description: 'capacity to reorganize under pressure' },
    coupling: { label: 'world coupling', description: 'degree of openness to external flows' },
    memory: { label: 'memory', description: 'retention of prior successful organization' },
    perturbation: { label: 'perturbation', description: 'environmental stress and destabilizing input' },
};


// ── Presets ──────────────────────────────────────────────────────

export const PRESET_DESCRIPTIONS: Record<PresetKey, {
    label: string;
    question: string;
    expectation: string;
}> = {
    'world-oriented-learner': {
        label: 'world-oriented learner',
        question: 'What does genuine becoming look like?',
        expectation: 'Balanced autonomy and openness sustain a high becoming index. The system individuates by engaging the world without losing itself.',
    },
    'autopoietic-core': {
        label: 'autopoietic core',
        question: 'Can strong self-production sustain an entity with less plasticity?',
        expectation: 'High autonomy and boundary compensate for lower plasticity. The system persists through robust self-maintenance.',
    },
    'rigid-organism': {
        label: 'rigid organism',
        question: 'What happens when identity is preserved by over-constraining change?',
        expectation: 'Very high boundary and memory with low plasticity. Coherence stays high but novelty collapses. Risk of rigid closure.',
    },
    'chaotic-drift': {
        label: 'chaotic drift',
        question: 'Can a system change without individuating?',
        expectation: 'Low autonomy and boundary with high perturbation and coupling. The system changes constantly but cannot maintain itself as an entity.',
    },
};

export const DEFAULT_PARAMS: Params = {
    preset: 'world-oriented-learner',
    autonomy: 72,
    boundary: 68,
    plasticity: 66,
    coupling: 58,
    memory: 63,
    perturbation: 36,
    steps: 80,
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'world-oriented-learner':
            return {
                preset: key,
                autonomy: 72, boundary: 68, plasticity: 66,
                coupling: 58, memory: 63, perturbation: 36,
                steps: 80,
            };
        case 'autopoietic-core':
            return {
                preset: key,
                autonomy: 82, boundary: 86, plasticity: 48,
                coupling: 40, memory: 70, perturbation: 24,
                steps: 80,
            };
        case 'rigid-organism':
            return {
                preset: key,
                autonomy: 78, boundary: 88, plasticity: 22,
                coupling: 20, memory: 85, perturbation: 30,
                steps: 80,
            };
        case 'chaotic-drift':
            return {
                preset: key,
                autonomy: 28, boundary: 24, plasticity: 82,
                coupling: 76, memory: 18, perturbation: 84,
                steps: 80,
            };
    }
}


// ── Helpers ────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, v));
}


// ── Core Simulation ─────────────────────────────────────────────
//
// Five coupled state variables evolve under six control parameters.
//
// Interaction terms (biologically interpretable):
//   selfProduction = a·b + 0.6·m − 0.4·q   (autopoietic closure)
//   exploration    = p·c                     (adaptive openness)
//   repair         = a·b + 0.4·m             (self-maintenance)
//   blanketStress  = q + 0.6·c − 0.8·b      (Markov blanket perturbation)
//   rigidity       = (m + b − p) / 2         (over-constraint)
//   reorganization = 0.7·p + 0.4·c − 0.3·m  (structural transformation)
//
// State update equations couple these terms into the five dynamics.
// The "becoming index" is a weighted synthesis rewarding joint
// viability, coherence, novelty, moderate boundary flux, and low tension.

export function computeSimulation(params: Params): SimResult {
    const a = params.autonomy / 100;
    const b = params.boundary / 100;
    const p = params.plasticity / 100;
    const c = params.coupling / 100;
    const m = params.memory / 100;
    const q = params.perturbation / 100;
    const steps = params.steps;

    // Interaction terms
    const selfProduction = 8 * a * b + 6 * m - 4 * q;
    const exploration = 9 * p * c;
    const repair = 10 * a * b + 4 * m;
    const blanketStress = 10 * q + 6 * c - 8 * b;
    const overfitRigidity = Math.max(0, (m + b - p - 0.9)) * 18;
    const reorganization = 7 * p + 4 * c - 3 * m;
    const exposure = 12 * q * c;

    // Initialize state variables
    let viability = clamp(38 + 42 * a + 10 * b - 18 * q);
    let coherence = clamp(35 + 28 * b + 18 * m - 10 * q + 8 * a);
    let novelty = clamp(24 + 42 * p + 20 * c - 12 * m);
    let tension = clamp(20 + 48 * q + 12 * c - 20 * a - 14 * b);
    let boundaryFlux = clamp(30 + 30 * p + 20 * c - 26 * b);

    const series: TimeStep[] = [];

    for (let t = 0; t < steps; t++) {
        // Coupled state updates with mild oscillatory forcing (metabolic rhythm)
        tension = clamp(
            tension
            + 0.26 * exposure
            + 0.18 * boundaryFlux
            - 0.24 * repair
            - 0.08 * selfProduction
            + Math.sin(t / 7) * 1.2,
        );

        viability = clamp(
            viability
            + 0.22 * selfProduction
            - 0.18 * tension
            + 0.08 * exploration
            - 0.09 * overfitRigidity
            + Math.cos(t / 9) * 0.8,
        );

        coherence = clamp(
            coherence
            + 0.18 * repair
            + 0.08 * m * 10
            - 0.16 * boundaryFlux
            - 0.12 * tension
            + 0.04 * viability
            - 0.05 * exploration,
        );

        novelty = clamp(
            novelty
            + 0.22 * exploration
            + 0.06 * tension
            - 0.14 * repair
            - 0.1 * m * 10
            + Math.sin(t / 6) * 0.9,
        );

        boundaryFlux = clamp(
            boundaryFlux
            + 0.22 * reorganization
            + 0.12 * blanketStress
            - 0.16 * repair
            + 0.05 * novelty
            - 0.03 * coherence,
        );

        // Becoming index: rewards joint viability, coherence, novelty,
        // moderate boundary flux (peak at 50), and low tension
        const becoming = clamp(
            0.28 * viability
            + 0.22 * coherence
            + 0.18 * novelty
            + 0.16 * (100 - Math.abs(50 - boundaryFlux) * 2)
            + 0.16 * (100 - tension),
        );

        series.push({
            t,
            viability: Number(viability.toFixed(2)),
            coherence: Number(coherence.toFixed(2)),
            novelty: Number(novelty.toFixed(2)),
            tension: Number(tension.toFixed(2)),
            boundaryFlux: Number(boundaryFlux.toFixed(2)),
            becoming: Number(becoming.toFixed(2)),
        });
    }

    const last = series[series.length - 1] ?? {
        viability: 0, coherence: 0, novelty: 0,
        tension: 0, boundaryFlux: 0, becoming: 0,
    };

    const avg = (key: keyof TimeStep) =>
        series.reduce((acc, row) => acc + (row[key] as number), 0) / Math.max(1, series.length);

    const rigidity = clamp((params.memory + params.boundary - params.plasticity) / 2);
    const exposureRisk = clamp((params.perturbation + params.coupling - params.boundary) / 1.5);
    const adaptiveRange = clamp(
        100 - Math.abs(avg('boundaryFlux') - 50) * 1.8 - Math.abs(avg('tension') - 35) * 0.8,
    );

    // Phase regime classification
    let phase: PhaseRegime = 'Metastable Individuation';
    if (last.viability < 35 || last.coherence < 30) {
        phase = 'Dissolution';
    } else if (rigidity > 70 && last.novelty < 30) {
        phase = 'Rigid Closure';
    } else if (exposureRisk > 55 && last.tension > 60) {
        phase = 'Chaotic Drift';
    } else if (last.becoming > 72 && adaptiveRange > 55) {
        phase = 'World-Oriented Becoming';
    }

    const scores: Scores = {
        phase,
        becomingIndex: Math.round(last.becoming),
        viability: Math.round(last.viability),
        coherence: Math.round(last.coherence),
        novelty: Math.round(last.novelty),
        tension: Math.round(last.tension),
        boundaryFlux: Math.round(last.boundaryFlux),
        adaptiveRange: Math.round(adaptiveRange),
        rigidity: Math.round(rigidity),
        exposureRisk: Math.round(exposureRisk),
        avgBecoming: Math.round(avg('becoming')),
        avgViability: Math.round(avg('viability')),
    };

    const radar = [
        { metric: 'Autonomy', value: params.autonomy },
        { metric: 'Boundary', value: params.boundary },
        { metric: 'Plasticity', value: params.plasticity },
        { metric: 'Coupling', value: params.coupling },
        { metric: 'Memory', value: params.memory },
        { metric: 'Perturb.', value: params.perturbation },
    ];

    const phaseSpace: PhasePoint[] = series.map(row => ({
        x: row.boundaryFlux,
        y: row.tension,
        z: Math.max(8, row.becoming / 7),
    }));

    return { series, scores, radar, phaseSpace };
}


// ── Narrative ──────────────────────────────────────────────────

export function computeNarrative(scores: Scores, params: Params): string {
    const parts: string[] = [];

    switch (scores.phase) {
        case 'World-Oriented Becoming':
            parts.push('The system remains distinct from its environment while still open enough to reorganize itself.');
            parts.push('Viability, coherence, and novelty are jointly sustained: this is learning as individuation rather than mere task optimization.');
            break;
        case 'Rigid Closure':
            parts.push('The pattern holds itself together, but at the cost of low transformation capacity.');
            parts.push('Identity is preserved by over-constraining becoming. Plasticity or coupling increase could reopen the system.');
            break;
        case 'Chaotic Drift':
            parts.push('Environmental coupling and perturbation dominate repair.');
            parts.push('The system changes, but cannot retain a stable regime of self-maintenance. Increase autonomy or boundary to anchor it.');
            break;
        case 'Dissolution':
            parts.push('The boundary and repair loops fail to preserve a viable self.');
            parts.push('Becoming collapses into disintegration rather than individuation.');
            break;
        default:
            parts.push('The system occupies a metastable zone: not fixed, not dissolved.');
            parts.push('It preserves itself by continuously resolving tension through adaptive reorganization.');
    }

    // Diagnostic details
    if (scores.rigidity > 60) {
        parts.push(`Rigidity index is high (${scores.rigidity}): memory + boundary dominates plasticity.`);
    }
    if (scores.exposureRisk > 50) {
        parts.push(`Exposure risk is elevated (${scores.exposureRisk}): environmental input exceeds boundary capacity.`);
    }
    if (scores.adaptiveRange > 70) {
        parts.push(`Adaptive range is strong (${scores.adaptiveRange}): the system absorbs perturbation well.`);
    }

    return parts.join(' ');
}


// ── Sweep & Sensitivity ────────────────────────────────────────

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'autonomy', label: 'autonomy', min: 0, max: 100 },
    { key: 'boundary', label: 'boundary', min: 0, max: 100 },
    { key: 'plasticity', label: 'plasticity', min: 0, max: 100 },
    { key: 'coupling', label: 'coupling', min: 0, max: 100 },
    { key: 'memory', label: 'memory', min: 0, max: 100 },
    { key: 'perturbation', label: 'perturbation', min: 0, max: 100 },
];

export function computeSweep(params: Params, sweepKey: SweepableParam): SweepDatum[] {
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 50; i++) {
        const v = (i / 50) * 100;
        const swept = { ...params, [sweepKey]: v };
        const result = computeSimulation(swept);
        data.push({
            sweepValue: v,
            avgBecoming: result.scores.avgBecoming,
            finalBecoming: result.scores.becomingIndex,
            avgViability: result.scores.avgViability,
        });
    }
    return data;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS
        .map(spec => {
            const atMin = computeSimulation({ ...params, [spec.key]: spec.min }).scores.avgBecoming;
            const atMax = computeSimulation({ ...params, [spec.key]: spec.max }).scores.avgBecoming;
            return {
                label: spec.label,
                low: Math.min(atMin, atMax),
                high: Math.max(atMin, atMax),
            };
        })
        .sort((a, b) => (b.high - b.low) - (a.high - a.low));
}


// ── Animation ──────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
