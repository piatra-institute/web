// ── Coordination Under Complementarity ───────────────────────────
// Multilevel coordination failure simulator. Housing (and other
// complementarity-heavy systems) must function at the metro/
// regional level, but incentives, vetoes, and feedback sit at
// smaller scales. This produces undersupply, misallocation,
// queues, price spikes, or informality depending on which loops
// break. Inspired by sheaf theory (gluing local sections),
// Michael Levin (hierarchy and morphogenetic recruitment), and
// control theory (signal, controller, plant, output).
// ─────────────────────────────────────────────────────────────────

import type { SensitivityBar } from '@/components/SensitivityAnalysis';

// ── Types ────────────────────────────────────────────────────────

export const SCALE_LABELS = [
    'Cell', 'Tissue', 'Organ', 'Parcel', 'Neighborhood', 'Municipality', 'Metro',
] as const;

export const SCALE_NOTES: Record<string, string> = {
    Cell: 'Micro agents or parcels sensing local pressure.',
    Tissue: 'Clusters coordinating shared local structure.',
    Organ: 'Functional meso-unit with a clear task.',
    Parcel: 'Site-level development decision.',
    Neighborhood: 'Local compatibility and social veto layer.',
    Municipality: 'Permitting, fiscal incentives, infrastructure sequencing.',
    Metro: 'System-level housing, mobility, and productivity function.',
};

export interface Params {
    preset: PresetKey;
    demandShock: number;
    complementarity: number;
    signalFidelity: number;
    repairCapacity: number;
    localVeto: number;
    incumbentCapture: number;
    financeMisalignment: number;
    infrastructureSync: number;
    regionalSteering: number;
    gluingStrength: number;
    horizon: number;
}

export interface NodeState {
    label: string;
    index: number;
    desired: number;
    actual: number;
    support: number;
    perceivedSignal: number;
    vetoLoad: number;
    glueError: number;
    slack: number;
}

export type SystemRegime = 'Adaptive' | 'Rigid lock-in' | 'Chaotic drift' | 'Collapse';

export interface HarmObstruction {
    agency: number;       // loss of choice / access
    material: number;     // price spikes / affordability
    stability: number;    // tail risk / bubble fragility
    mobility: number;     // lock-in / inability to relocate
}

export interface StepState {
    t: number;
    nodes: NodeState[];
    coherence: number;
    far: number;
    misallocation: number;
    pricePressure: number;
    queuePressure: number;
    globalGoal: number;
    absorption: number;
    cohomologyDefect: number;
    regime: SystemRegime;
    basinStability: number;
    harm: HarmObstruction;
    effectiveSignalFidelity: number;
}

export type PresetKey = 'healthy-morphogenesis' | 'nimby-lock-in' | 'china-overhang' | 'informal-explosion';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'healthy-morphogenesis': {
        label: 'Healthy morphogenesis',
        question: 'What does coordinated multiscale adaptation look like?',
        expectation: 'High signal fidelity, strong gluing, and regional steering keep coherence high and misallocation low.',
    },
    'nimby-lock-in': {
        label: 'NIMBY lock-in',
        question: 'What breaks when local vetoes and incumbent capture dominate?',
        expectation: 'Neighborhood and municipality scales block adaptation; coherence drops, price pressure rises, FAR collapses.',
    },
    'china-overhang': {
        label: 'China-style overhang',
        question: 'What happens when finance misalignment drives building in the wrong places?',
        expectation: 'Low veto but high finance misalignment produces overbuilding in some scales, vacancy in others.',
    },
    'informal-explosion': {
        label: 'Informal urban explosion',
        question: 'What happens with massive demand, weak infrastructure, and poor signal fidelity?',
        expectation: 'The system cannot absorb demand formally; cohomology defect is very high, adaptation rate is very low.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'nimby-lock-in':
            return {
                preset: key, demandShock: 0.7, complementarity: 0.76,
                signalFidelity: 0.66, repairCapacity: 0.35, localVeto: 0.86,
                incumbentCapture: 0.88, financeMisalignment: 0.32,
                infrastructureSync: 0.41, regionalSteering: 0.2, gluingStrength: 0.44,
                horizon: 48,
            };
        case 'china-overhang':
            return {
                preset: key, demandShock: 0.44, complementarity: 0.62,
                signalFidelity: 0.58, repairCapacity: 0.41, localVeto: 0.18,
                incumbentCapture: 0.31, financeMisalignment: 0.89,
                infrastructureSync: 0.43, regionalSteering: 0.72, gluingStrength: 0.49,
                horizon: 48,
            };
        case 'informal-explosion':
            return {
                preset: key, demandShock: 0.91, complementarity: 0.84,
                signalFidelity: 0.37, repairCapacity: 0.24, localVeto: 0.39,
                incumbentCapture: 0.46, financeMisalignment: 0.61,
                infrastructureSync: 0.16, regionalSteering: 0.19, gluingStrength: 0.28,
                horizon: 48,
            };
        default: // healthy-morphogenesis
            return {
                preset: key, demandShock: 0.55, complementarity: 0.6,
                signalFidelity: 0.85, repairCapacity: 0.82, localVeto: 0.18,
                incumbentCapture: 0.22, financeMisalignment: 0.18,
                infrastructureSync: 0.82, regionalSteering: 0.78, gluingStrength: 0.84,
                horizon: 48,
            };
    }
}

export const DEFAULT_PARAMS: Params = presetParams('healthy-morphogenesis');


// ── Utility ──────────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 1): number {
    return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, alpha: number): number {
    return a + (b - a) * alpha;
}

function average(values: number[]): number {
    return values.reduce((s, v) => s + v, 0) / Math.max(values.length, 1);
}


// ── Simulation ───────────────────────────────────────────────────

export function simulate(params: Params): StepState[] {
    const n = SCALE_LABELS.length;
    const states: StepState[] = [];

    let desired = SCALE_LABELS.map((_, i) => 0.32 + i * 0.025);
    let actual = SCALE_LABELS.map((_, i) => 0.28 + i * 0.015);
    let trace = SCALE_LABELS.map(() => 0.2);
    // Hysteresis: accumulated misallocation degrades signal fidelity over time
    let signalDegradation = 0;

    for (let t = 0; t < params.horizon; t++) {
        const phase = t / Math.max(params.horizon - 1, 1);
        const cyclicalDemand = 0.18 * Math.sin(phase * Math.PI * 2.4);
        const baseGoal = clamp(0.35 + params.demandShock * 0.52 + cyclicalDemand);
        // Effective signal fidelity degrades with accumulated misallocation (hysteresis)
        const effectiveSignalFidelity = clamp(params.signalFidelity - signalDegradation * 0.3);

        const nextDesired = [...desired];
        const nextActual = [...actual];
        const perceivedSignals: number[] = [];
        const supports: number[] = [];
        const vetoLoads: number[] = [];
        const glueErrors: number[] = [];
        const slacks: number[] = [];

        for (let i = 0; i < n; i++) {
            const lower = i > 0 ? actual[i - 1] : actual[i];
            const upper = i < n - 1 ? actual[i + 1] : actual[i];
            const neighborhoodMean = (lower + actual[i] + upper) / 3;

            const localNoise = (1 - effectiveSignalFidelity) * (0.12 * Math.sin((t + 1) * (i + 1) * 0.57));
            const perceivedSignal = clamp(baseGoal + trace[i] * 0.3 + localNoise);
            perceivedSignals.push(perceivedSignal);

            const localScaleBias = i <= 2 ? 0.08 : i >= 5 ? 0.12 : 0.0;
            const downwardGoal = i > 0 ? desired[i - 1] : baseGoal;
            const upwardGoal = i < n - 1 ? desired[i + 1] : baseGoal;
            const glueTarget = (downwardGoal + upwardGoal + perceivedSignal) / 3;
            nextDesired[i] = clamp(
                lerp(desired[i], glueTarget + localScaleBias * (params.regionalSteering - params.financeMisalignment), 0.28 + params.gluingStrength * 0.22),
            );

            const support = params.complementarity * Math.min(lower, upper) + (1 - params.complementarity) * neighborhoodMean;
            supports.push(clamp(support));

            const localismWeight = i >= 3 && i <= 5 ? 1 : 0.45;
            const vetoLoad = clamp(localismWeight * (params.localVeto * 0.58 + params.incumbentCapture * 0.42) - params.regionalSteering * 0.24);
            vetoLoads.push(vetoLoad);

            const infraBoost = params.infrastructureSync * (i >= 3 ? 0.18 : 0.11);
            const repairBoost = params.repairCapacity * (i <= 2 ? 0.26 : 0.19);
            const financePenalty = params.financeMisalignment * (i >= 5 ? 0.28 : 0.11);
            const glueError = Math.abs(nextDesired[i] - perceivedSignal) * (1 - params.gluingStrength * 0.55);
            glueErrors.push(glueError);

            const adaptation = clamp(
                0.08 + repairBoost + infraBoost + params.signalFidelity * 0.14
                - vetoLoad * 0.24 - financePenalty
                - params.complementarity * Math.max(0, nextDesired[i] - support) * 0.15,
                0.02, 0.88,
            );

            const boundedTarget = Math.min(nextDesired[i], clamp(support + 0.24 + params.infrastructureSync * 0.12));
            const upwardMove = Math.max(0, boundedTarget - actual[i]);
            const downwardMove = Math.max(0, actual[i] - boundedTarget);

            // Levin-style morphogenetic pull
            const morphogeneticPull = params.repairCapacity * params.gluingStrength * ((baseGoal + upwardGoal) / 2 - actual[i]) * 0.22;

            nextActual[i] = clamp(actual[i] + upwardMove * adaptation - downwardMove * 0.2 + morphogeneticPull);
            trace[i] = clamp(trace[i] * 0.72 + Math.max(0, nextDesired[i] - nextActual[i]) * 0.65);
            slacks.push(clamp(nextDesired[i] - nextActual[i]));
        }

        desired = nextDesired;
        actual = nextActual;

        const coherenceRaw = 1 - average(actual.map((v, i) => {
            const prev = i > 0 ? actual[i - 1] : v;
            const next = i < n - 1 ? actual[i + 1] : v;
            return (Math.abs(v - prev) + Math.abs(v - next)) / 2;
        }));
        const coherence = clamp(coherenceRaw - average(glueErrors) * 0.35);
        const absorption = average(actual) / Math.max(baseGoal, 0.001);
        const far = clamp(
            absorption * 0.45 + coherence * 0.3 + params.infrastructureSync * 0.18 + params.regionalSteering * 0.12 - params.financeMisalignment * 0.12,
            0, 1.3,
        );
        const misallocation = clamp(
            average(actual.map((v, i) => Math.abs(v - desired[i]))) * 0.92 + params.financeMisalignment * 0.24 + average(vetoLoads) * 0.1,
        );
        const queuePressure = clamp(baseGoal * 0.6 + average(slacks) * 0.45 + params.localVeto * 0.18 - params.repairCapacity * 0.12);
        const pricePressure = clamp(baseGoal * 0.42 + average(slacks) * 0.36 + params.incumbentCapture * 0.12 + (1 - params.infrastructureSync) * 0.12);

        const nodes = SCALE_LABELS.map((label, index) => ({
            label,
            index,
            desired: desired[index],
            actual: actual[index],
            support: supports[index],
            perceivedSignal: perceivedSignals[index],
            vetoLoad: vetoLoads[index],
            glueError: glueErrors[index],
            slack: slacks[index],
        }));

        const cohomologyDefect = clamp(average(glueErrors) * 1.6 + Math.max(0, average(slacks) - coherence * 0.28));

        // Regime classification (inspired by ontogenic engine)
        let regime: SystemRegime = 'Adaptive';
        if (coherence > 0.55 && far > 0.5) {
            regime = 'Adaptive';
        } else if (coherence > 0.4 && far < 0.35 && average(vetoLoads) > 0.4) {
            regime = 'Rigid lock-in';
        } else if (coherence < 0.35 && misallocation > 0.5) {
            regime = 'Chaotic drift';
        } else if (far < 0.25 && cohomologyDefect > 0.55) {
            regime = 'Collapse';
        } else if (far < 0.4) {
            regime = coherence > 0.4 ? 'Rigid lock-in' : 'Chaotic drift';
        }

        // Basin stability: how much shock the current regime can absorb
        // Narrow basins (high veto + high capture + low repair) are fragile
        const basinWidth = clamp(
            params.repairCapacity * 0.35 + params.gluingStrength * 0.25 + params.infrastructureSync * 0.2
            - params.localVeto * 0.15 - params.incumbentCapture * 0.15 - params.financeMisalignment * 0.1,
        );
        const basinStability = clamp(basinWidth * coherence + (1 - cohomologyDefect) * 0.3);

        // Harm obstruction: what breaks when scales fail to glue
        const harm: HarmObstruction = {
            agency: clamp(average(slacks) * 0.6 + params.localVeto * 0.25 + (1 - coherence) * 0.15),
            material: clamp(pricePressure * 0.55 + params.incumbentCapture * 0.2 + misallocation * 0.25),
            stability: clamp(params.financeMisalignment * 0.4 + cohomologyDefect * 0.35 + (1 - basinStability) * 0.25),
            mobility: clamp(queuePressure * 0.35 + (1 - params.infrastructureSync) * 0.3 + average(vetoLoads) * 0.2 + (1 - params.regionalSteering) * 0.15),
        };

        // Hysteresis: accumulated misallocation corrupts future signal fidelity
        signalDegradation = clamp(signalDegradation * 0.92 + misallocation * 0.08);

        states.push({
            t,
            nodes,
            coherence,
            far,
            misallocation,
            pricePressure,
            queuePressure,
            globalGoal: baseGoal,
            absorption: clamp(absorption, 0, 1.5),
            cohomologyDefect,
            regime,
            basinStability,
            harm,
            effectiveSignalFidelity,
        });
    }
    return states;
}


// ── Param specs ──────────────────────────────────────────────────

export type SweepableParam = keyof Omit<Params, 'preset' | 'horizon'>;

export const PARAM_SPECS: { key: SweepableParam; label: string; hint: string }[] = [
    { key: 'demandShock', label: 'demand shock', hint: 'Pressure from migration, productivity, or household formation.' },
    { key: 'complementarity', label: 'complementarity', hint: 'How strongly each layer depends on adjacent layers being ready.' },
    { key: 'signalFidelity', label: 'signal fidelity', hint: 'How accurately local units perceive system-level need.' },
    { key: 'repairCapacity', label: 'repair capacity', hint: 'Ability to recruit lower levels toward higher-scale targets.' },
    { key: 'localVeto', label: 'local veto', hint: 'Permits, appeals, neighborhood resistance.' },
    { key: 'incumbentCapture', label: 'incumbent capture', hint: 'How much existing owners bias toward scarcity preservation.' },
    { key: 'financeMisalignment', label: 'finance misalignment', hint: 'Capital steers building toward balance-sheet logic.' },
    { key: 'infrastructureSync', label: 'infrastructure sync', hint: 'Utilities, transport, and shared capacity expansion.' },
    { key: 'regionalSteering', label: 'regional steering', hint: 'Metro-scale function overruling local anti-coordination.' },
    { key: 'gluingStrength', label: 'gluing strength', hint: 'How well local sections compose into a global section.' },
];


// ── Sensitivity ──────────────────────────────────────────────────

export function computeSensitivity(params: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = [];
    for (const spec of PARAM_SPECS) {
        const lowSteps = simulate({ ...params, [spec.key]: 0 });
        const highSteps = simulate({ ...params, [spec.key]: 1 });
        const lowFar = average(lowSteps.map(s => s.far));
        const highFar = average(highSteps.map(s => s.far));
        bars.push({ label: spec.label, low: lowFar * 100, high: highFar * 100 });
    }
    bars.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
    return bars;
}


// ── Narrative ────────────────────────────────────────────────────

export function computeNarrative(step: StepState, params: Params): string {
    const parts: string[] = [];

    parts.push(`System regime: ${step.regime}.`);

    if (step.regime === 'Adaptive') {
        parts.push('Scales are mostly aligned; demand is being absorbed into coordinated capacity.');
    } else if (step.regime === 'Rigid lock-in') {
        parts.push('The system appears stable but is locked \u2014 vetoes and incumbent capture prevent adaptation despite demand pressure.');
    } else if (step.regime === 'Chaotic drift') {
        parts.push('Scales are acting on contradictory signals; the system oscillates without settling into coordinated behavior.');
    } else {
        parts.push('The system has collapsed into a failure regime: gluing has broken down across most scales.');
    }

    if (step.basinStability < 0.3) {
        parts.push(`Basin stability is dangerously low (${(step.basinStability * 100).toFixed(0)}%) \u2014 a small demand shock could trigger a regime transition.`);
    }

    if (step.effectiveSignalFidelity < params.signalFidelity - 0.05) {
        parts.push(`Hysteresis: accumulated misallocation has degraded signal fidelity from ${(params.signalFidelity * 100).toFixed(0)}% to ${(step.effectiveSignalFidelity * 100).toFixed(0)}%.`);
    }

    // Harm narration
    const maxHarm = Math.max(step.harm.agency, step.harm.material, step.harm.stability, step.harm.mobility);
    if (maxHarm > 0.5) {
        const dominant = step.harm.agency === maxHarm ? 'agency (loss of choice/access)'
            : step.harm.material === maxHarm ? 'material security (price spikes)'
            : step.harm.stability === maxHarm ? 'systemic stability (bubble/tail risk)'
            : 'mobility (lock-in/inability to relocate)';
        parts.push(`The primary harm obstruction is ${dominant}.`);
    }

    if (step.cohomologyDefect > 0.5) {
        parts.push('High cohomology defect: local sections are not gluing into a coherent global section.');
    }

    return parts.join(' ');
}


// ── Easing ───────────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const ANIMATION_TOTAL_FRAMES = 70;
