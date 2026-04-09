// Morphologies of Stability — logic module
//
// Four canonical stabilizing patterns from dynamical systems theory:
//   1. Point attractor — relaxation toward a fixed point
//   2. Bistable switch — double-well potential with two stable states
//   3. Limit cycle — Hopf normal form producing stable oscillation
//   4. Consensus network — DeGroot-style opinion dynamics
//
// Each pattern demonstrates a distinct morphology of stability:
// what it means for a system to "hold form" differs fundamentally
// across these regimes.

import { SensitivityBar } from '@/components/SensitivityAnalysis';


// ── Types ──────────────────────────────────────────────────────

export type PatternType = 'point' | 'bistable' | 'limit' | 'consensus';

export type PresetKey =
    | 'point-relaxation'
    | 'bistable-wells'
    | 'hopf-oscillator'
    | 'collective-consensus'
    | 'near-bifurcation';

export interface Params {
    preset: PresetKey;
    pattern: PatternType;
    noise: number;
    simSpeed: number;
    // Point attractor
    pointK: number;
    pointTarget: number;
    // Bistable switch
    bistableStiffness: number;
    bistableDamping: number;
    bistableTilt: number;
    // Limit cycle
    limitMu: number;
    limitOmega: number;
    // Consensus network
    consensusCoupling: number;
    consensusStubbornness: number;
    consensusAnchor: number;
}

export interface PointState {
    x: number;
    target: number;
    history: number[];
}

export interface BistableState {
    x: number;
    v: number;
    history: number[];
}

export interface LimitCycleState {
    x: number;
    y: number;
    trail: { x: number; y: number }[];
}

export interface ConsensusState {
    opinions: number[];
    meanHistory: number[];
    spreadHistory: number[];
}

export interface SimulationState {
    point: PointState;
    bistable: BistableState;
    limit: LimitCycleState;
    consensus: ConsensusState;
}

export interface Metrics {
    pattern: PatternType;
    // Universal metrics
    lyapunovEstimate: number;
    stabilityIndex: number;
    currentEnergy: number;
    // Pattern-specific
    pointError: number;
    bistableBasin: 'left' | 'right' | 'ridge';
    bistablePotential: number;
    bistableBarrierHeight: number;
    limitRadius: number;
    limitTargetRadius: number;
    limitPhase: number;
    consensusMean: number;
    consensusSpread: number;
    consensusConvergenceRate: number;
    // Summary
    interpretation: string;
}

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    simState: SimulationState;
    label: string;
}

export type SweepableParam =
    | 'noise'
    | 'pointK'
    | 'bistableStiffness'
    | 'bistableDamping'
    | 'bistableTilt'
    | 'limitMu'
    | 'limitOmega'
    | 'consensusCoupling'
    | 'consensusStubbornness';

export interface SweepDatum {
    sweepValue: number;
    stabilityIndex: number;
    lyapunovEstimate: number;
    currentEnergy: number;
}


// ── Constants ──────────────────────────────────────────────────

export const ANIMATION_TOTAL_FRAMES = 70;
const HISTORY_MAX = 220;
const TRAIL_MAX = 260;
const N_AGENTS = 6;

export const PATTERN_META: Record<PatternType, {
    title: string;
    subtitle: string;
    equation: string;
    idea: string;
}> = {
    point: {
        title: 'Point attractor',
        subtitle: 'Relaxation toward a fixed point',
        equation: 'dx/dt = -k(x - x*) + ξ(t)',
        idea: 'The simplest stabilizer: deviations generate a restoring drift back toward a set point. Stability here means convergence to rest.',
    },
    bistable: {
        title: 'Bistable switch',
        subtitle: 'Two stable identities, one unstable ridge',
        equation: 'dx/dt = v,  dv/dt = -γv - dV/dx + ξ(t)',
        idea: 'A system can stabilize, yet harbor multiple possible stable forms. Small pushes are absorbed; large ones flip the basin. Identity is a choice between valleys.',
    },
    limit: {
        title: 'Limit cycle',
        subtitle: 'Stability as rhythm, not rest',
        equation: 'dz/dt = (μ - |z|²)z + iωz + ξ(t)',
        idea: 'Not all stability is stillness. Some systems stabilize into recurring motion — a rhythm that reforms after disturbance. The attractor is an orbit, not a point.',
    },
    consensus: {
        title: 'Consensus network',
        subtitle: 'Collective stabilization across many units',
        equation: 'dxᵢ/dt = c(x̄ - xᵢ) + s(a - xᵢ) + ξᵢ(t)',
        idea: 'Stability can be distributed: local differences get damped until a coordinated pattern emerges. The stable object is a collective configuration, not any single unit.',
    },
};


// ── Presets ──────────────────────────────────────────────────────

export const PRESET_DESCRIPTIONS: Record<PresetKey, {
    label: string;
    question: string;
    expectation: string;
}> = {
    'point-relaxation': {
        label: 'point relaxation',
        question: 'How does a point attractor absorb disturbance?',
        expectation: 'Strong restoring force pulls deviations back exponentially. Perturbations decay with time constant 1/k.',
    },
    'bistable-wells': {
        label: 'bistable wells',
        question: 'Can a system have two stable identities?',
        expectation: 'Balanced double-well potential. Small perturbations are absorbed; large ones can flip between basins.',
    },
    'hopf-oscillator': {
        label: 'Hopf oscillator',
        question: 'Is rhythm a form of stability?',
        expectation: 'Supercritical Hopf bifurcation produces a stable limit cycle. The orbit reforms after perturbation.',
    },
    'collective-consensus': {
        label: 'collective consensus',
        question: 'How do distributed units converge?',
        expectation: 'Moderate coupling drives opinions toward agreement. Spread decreases exponentially.',
    },
    'near-bifurcation': {
        label: 'near bifurcation',
        question: 'What happens at the edge of stability?',
        expectation: 'Limit cycle with μ near zero — on the boundary between point attractor and oscillation. Critical slowing down visible.',
    },
};

export const DEFAULT_PARAMS: Params = {
    preset: 'point-relaxation',
    pattern: 'point',
    noise: 0.06,
    simSpeed: 1,
    pointK: 1.2,
    pointTarget: 0,
    bistableStiffness: 1.3,
    bistableDamping: 1.05,
    bistableTilt: 0,
    limitMu: 1,
    limitOmega: 1.5,
    consensusCoupling: 1.1,
    consensusStubbornness: 0.35,
    consensusAnchor: 0,
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'point-relaxation':
            return {
                ...DEFAULT_PARAMS,
                preset: key,
                pattern: 'point',
                noise: 0.06,
                pointK: 1.2,
                pointTarget: 0,
            };
        case 'bistable-wells':
            return {
                ...DEFAULT_PARAMS,
                preset: key,
                pattern: 'bistable',
                noise: 0.08,
                bistableStiffness: 1.3,
                bistableDamping: 1.05,
                bistableTilt: 0,
            };
        case 'hopf-oscillator':
            return {
                ...DEFAULT_PARAMS,
                preset: key,
                pattern: 'limit',
                noise: 0.06,
                limitMu: 1,
                limitOmega: 1.5,
            };
        case 'collective-consensus':
            return {
                ...DEFAULT_PARAMS,
                preset: key,
                pattern: 'consensus',
                noise: 0.06,
                consensusCoupling: 1.1,
                consensusStubbornness: 0.35,
                consensusAnchor: 0,
            };
        case 'near-bifurcation':
            return {
                ...DEFAULT_PARAMS,
                preset: key,
                pattern: 'limit',
                noise: 0.04,
                limitMu: 0.05,
                limitOmega: 1.0,
            };
    }
}


// ── Helpers ────────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const rnd = (scale = 1) => (Math.random() * 2 - 1) * scale;

const mean = (arr: number[]) =>
    arr.reduce((s, v) => s + v, 0) / arr.length;

const stdDev = (arr: number[]) => {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
};

const pushHistory = (arr: number[], value: number) =>
    arr.length >= HISTORY_MAX ? [...arr.slice(1), value] : [...arr, value];

const pushTrail = (arr: { x: number; y: number }[], point: { x: number; y: number }) =>
    arr.length >= TRAIL_MAX ? [...arr.slice(1), point] : [...arr, point];


// ── Simulation ─────────────────────────────────────────────────

export function initialSimState(): SimulationState {
    const opinions = [0.95, -0.7, 0.6, -0.35, 0.12, -0.85];
    return {
        point: { x: 1.4, target: 0, history: [1.4] },
        bistable: { x: 1.25, v: 0, history: [1.25] },
        limit: { x: 0.2, y: 1.2, trail: [{ x: 0.2, y: 1.2 }] },
        consensus: {
            opinions,
            meanHistory: [mean(opinions)],
            spreadHistory: [stdDev(opinions)],
        },
    };
}

export function advanceSimulation(
    state: SimulationState,
    params: Params,
    dt: number,
): SimulationState {
    const noise = params.noise;
    const next = { ...state };

    // Point attractor: dx/dt = -k(x - x*) + noise
    {
        const s = state.point;
        const dx = -params.pointK * (s.x - params.pointTarget) + rnd(noise * 0.35);
        const x = clamp(s.x + dx * dt, -2.2, 2.2);
        next.point = { ...s, x, target: params.pointTarget, history: pushHistory(s.history, x) };
    }

    // Bistable switch: overdamped Langevin in double-well V(x) = a(x² - 1)² + tilt·x
    {
        const s = state.bistable;
        const dVdx = 4 * params.bistableStiffness * s.x * (s.x * s.x - 1) + params.bistableTilt;
        const v = clamp(
            s.v + (-params.bistableDamping * s.v - dVdx + rnd(noise * 0.5)) * dt,
            -5, 5,
        );
        const x = clamp(s.x + v * dt, -2.2, 2.2);
        next.bistable = { ...s, x, v, history: pushHistory(s.history, x) };
    }

    // Limit cycle: Hopf normal form
    // dx/dt = (μ - r²)x - ωy,  dy/dt = (μ - r²)y + ωx
    {
        const s = state.limit;
        const r2 = s.x * s.x + s.y * s.y;
        const dx = (params.limitMu - r2) * s.x - params.limitOmega * s.y + rnd(noise * 0.45);
        const dy = (params.limitMu - r2) * s.y + params.limitOmega * s.x + rnd(noise * 0.45);
        const x = clamp(s.x + dx * dt, -2.5, 2.5);
        const y = clamp(s.y + dy * dt, -2.5, 2.5);
        next.limit = { ...s, x, y, trail: pushTrail(s.trail, { x, y }) };
    }

    // Consensus: DeGroot-style opinion dynamics with anchor
    // dxᵢ/dt = c(x̄ - xᵢ) + s(anchor - xᵢ) + noise
    {
        const s = state.consensus;
        const m = mean(s.opinions);
        const opinions = s.opinions.map(oi =>
            clamp(
                oi + (params.consensusCoupling * (m - oi)
                    + params.consensusStubbornness * (params.consensusAnchor - oi)
                    + rnd(noise * 0.45)) * dt,
                -1.25, 1.25,
            ),
        );
        next.consensus = {
            ...s,
            opinions,
            meanHistory: pushHistory(s.meanHistory, mean(opinions)),
            spreadHistory: pushHistory(s.spreadHistory, stdDev(opinions)),
        };
    }

    return next;
}

export function perturbSimulation(state: SimulationState, pattern: PatternType): SimulationState {
    const next = { ...state };

    switch (pattern) {
        case 'point': {
            const x = clamp(state.point.x + rnd(0.75), -2, 2);
            next.point = { ...state.point, x, history: pushHistory(state.point.history, x) };
            break;
        }
        case 'bistable': {
            const x = clamp(state.bistable.x + rnd(0.45), -2, 2);
            const v = clamp(state.bistable.v + rnd(1.8), -4, 4);
            next.bistable = { ...state.bistable, x, v, history: pushHistory(state.bistable.history, x) };
            break;
        }
        case 'limit': {
            const x = clamp(state.limit.x + rnd(0.55), -2.2, 2.2);
            const y = clamp(state.limit.y + rnd(0.55), -2.2, 2.2);
            next.limit = { ...state.limit, x, y, trail: pushTrail(state.limit.trail, { x, y }) };
            break;
        }
        case 'consensus': {
            const opinions = state.consensus.opinions.map(v => clamp(v + rnd(0.45), -1.1, 1.1));
            next.consensus = {
                ...state.consensus,
                opinions,
                meanHistory: pushHistory(state.consensus.meanHistory, mean(opinions)),
                spreadHistory: pushHistory(state.consensus.spreadHistory, stdDev(opinions)),
            };
            break;
        }
    }

    return next;
}

export function randomizeSimulation(state: SimulationState, pattern: PatternType): SimulationState {
    const next = { ...state };

    switch (pattern) {
        case 'point': {
            const x = rnd(1.8);
            next.point = { ...state.point, x, history: [x] };
            break;
        }
        case 'bistable': {
            const x = rnd(1.8);
            next.bistable = { ...state.bistable, x, v: rnd(0.4), history: [x] };
            break;
        }
        case 'limit': {
            const x = rnd(1.2);
            const y = rnd(1.2);
            next.limit = { ...state.limit, x, y, trail: [{ x, y }] };
            break;
        }
        case 'consensus': {
            const opinions = Array.from({ length: N_AGENTS }, () => rnd(1));
            next.consensus = {
                ...state.consensus,
                opinions,
                meanHistory: [mean(opinions)],
                spreadHistory: [stdDev(opinions)],
            };
            break;
        }
    }

    return next;
}


// ── Metrics ────────────────────────────────────────────────────

function bistablePotential(x: number, stiffness: number, tilt: number): number {
    return stiffness * (x * x - 1) ** 2 + tilt * x;
}

function bistableBarrierHeight(stiffness: number, tilt: number): number {
    // Barrier height ≈ V(0) - min(V(-1), V(1)) for small tilt
    const vCenter = bistablePotential(0, stiffness, tilt);
    const vLeft = bistablePotential(-1, stiffness, tilt);
    const vRight = bistablePotential(1, stiffness, tilt);
    return Math.max(0, vCenter - Math.min(vLeft, vRight));
}

export function computeMetrics(params: Params, simState: SimulationState): Metrics {
    const pattern = params.pattern;

    let lyapunovEstimate = 0;
    let stabilityIndex = 0;
    let currentEnergy = 0;
    let pointError = 0;
    let bistableBasin: 'left' | 'right' | 'ridge' = 'left';
    let bistablePot = 0;
    let barrierH = 0;
    let limitRadius = 0;
    let limitTargetRadius = 0;
    let limitPhase = 0;
    let consensusMean = 0;
    let consensusSpread = 0;
    let consensusConvergenceRate = 0;
    let interpretation = '';

    switch (pattern) {
        case 'point': {
            const s = simState.point;
            pointError = Math.abs(s.x - params.pointTarget);
            currentEnergy = 0.5 * params.pointK * (s.x - params.pointTarget) ** 2;
            lyapunovEstimate = -params.pointK;
            stabilityIndex = params.pointK / (params.pointK + params.noise * 5);

            if (pointError < 0.05) {
                interpretation = 'The system has converged to the target. It is at rest within its basin.';
            } else if (pointError < 0.3) {
                interpretation = `Deviations of magnitude ${pointError.toFixed(2)} are being actively corrected by restoring force k = ${params.pointK.toFixed(1)}.`;
            } else {
                interpretation = `The system is significantly displaced (error = ${pointError.toFixed(2)}). Relaxation time ≈ ${(1 / params.pointK).toFixed(2)}s.`;
            }
            break;
        }
        case 'bistable': {
            const s = simState.bistable;
            bistablePot = bistablePotential(s.x, params.bistableStiffness, params.bistableTilt);
            barrierH = bistableBarrierHeight(params.bistableStiffness, params.bistableTilt);
            currentEnergy = bistablePot + 0.5 * s.v * s.v;

            if (Math.abs(s.x) < 0.3) {
                bistableBasin = 'ridge';
            } else {
                bistableBasin = s.x > 0 ? 'right' : 'left';
            }

            // Kramers escape rate approximation: rate ∝ exp(-2ΔV/σ²)
            const effectiveNoise = Math.max(params.noise, 0.001);
            const kramersExponent = 2 * barrierH / (effectiveNoise * effectiveNoise);
            lyapunovEstimate = -params.bistableDamping * 0.5;
            stabilityIndex = Math.min(1, 1 - Math.exp(-kramersExponent * 0.1));

            if (bistableBasin === 'ridge') {
                interpretation = `The system sits on the unstable ridge (x ≈ ${s.x.toFixed(2)}). Any perturbation will tip it into one of the two wells.`;
            } else {
                const tiltFavor = params.bistableTilt > 0.1 ? 'left' : params.bistableTilt < -0.1 ? 'right' : 'neither';
                interpretation = `Occupying the ${bistableBasin} well. Barrier height = ${barrierH.toFixed(2)}. ` +
                    `A perturbation of magnitude ≈ ${Math.sqrt(2 * barrierH).toFixed(2)} would be needed to flip basins.` +
                    (tiltFavor !== 'neither' ? ` Tilt favors the ${tiltFavor} well.` : '');
            }
            break;
        }
        case 'limit': {
            const s = simState.limit;
            limitRadius = Math.sqrt(s.x * s.x + s.y * s.y);
            limitTargetRadius = Math.sqrt(Math.max(params.limitMu, 0));
            limitPhase = Math.atan2(s.y, s.x);

            // Floquet exponent for limit cycle: -2μ for radial perturbations
            lyapunovEstimate = params.limitMu > 0 ? -2 * params.limitMu : params.limitMu;
            currentEnergy = 0.5 * (limitRadius - limitTargetRadius) ** 2;
            stabilityIndex = params.limitMu > 0
                ? params.limitMu / (params.limitMu + params.noise * 3)
                : 0;

            if (params.limitMu <= 0) {
                interpretation = `Below the Hopf bifurcation (μ = ${params.limitMu.toFixed(2)} ≤ 0). The origin is a stable spiral — no sustained oscillation.`;
            } else if (params.limitMu < 0.15) {
                interpretation = `Near the Hopf bifurcation (μ = ${params.limitMu.toFixed(2)}). The limit cycle exists but is fragile — critical slowing down makes recovery from perturbation slow.`;
            } else {
                interpretation = `Stable limit cycle with radius √μ = ${limitTargetRadius.toFixed(2)}. Current orbit radius = ${limitRadius.toFixed(2)}. Angular frequency ω = ${params.limitOmega.toFixed(1)}.`;
            }
            break;
        }
        case 'consensus': {
            const s = simState.consensus;
            consensusMean = mean(s.opinions);
            consensusSpread = stdDev(s.opinions);

            // Effective convergence rate: coupling + stubbornness
            consensusConvergenceRate = params.consensusCoupling * (1 - 1 / N_AGENTS) + params.consensusStubbornness;
            lyapunovEstimate = -consensusConvergenceRate;
            currentEnergy = consensusSpread;
            stabilityIndex = consensusConvergenceRate / (consensusConvergenceRate + params.noise * 3);

            if (consensusSpread < 0.05) {
                interpretation = `The network has converged (spread = ${consensusSpread.toFixed(3)}). All agents agree near ${consensusMean.toFixed(2)}.`;
            } else if (consensusSpread < 0.2) {
                interpretation = `Approaching consensus (spread = ${consensusSpread.toFixed(3)}). Mean opinion at ${consensusMean.toFixed(2)}. ` +
                    `Noise sustains residual disagreement.`;
            } else {
                interpretation = `Still divergent (spread = ${consensusSpread.toFixed(3)}). Coupling c = ${params.consensusCoupling.toFixed(1)} is competing with noise and initial conditions.`;
            }
            break;
        }
    }

    return {
        pattern,
        lyapunovEstimate,
        stabilityIndex,
        currentEnergy,
        pointError,
        bistableBasin,
        bistablePotential: bistablePot,
        bistableBarrierHeight: barrierH,
        limitRadius,
        limitTargetRadius,
        limitPhase,
        consensusMean,
        consensusSpread,
        consensusConvergenceRate,
        interpretation,
    };
}


// ── Narrative ──────────────────────────────────────────────────

export function computeNarrative(metrics: Metrics, params: Params): string {
    const parts: string[] = [];

    // Universal stability assessment
    if (metrics.stabilityIndex > 0.8) {
        parts.push('The system is strongly stable.');
    } else if (metrics.stabilityIndex > 0.5) {
        parts.push('The system is moderately stable.');
    } else if (metrics.stabilityIndex > 0.2) {
        parts.push('Stability is weak — the system is sensitive to perturbation.');
    } else {
        parts.push('The system is near the edge of instability.');
    }

    // Lyapunov assessment
    if (metrics.lyapunovEstimate < -1) {
        parts.push(`Perturbations decay rapidly (λ ≈ ${metrics.lyapunovEstimate.toFixed(2)}).`);
    } else if (metrics.lyapunovEstimate < -0.1) {
        parts.push(`Perturbations decay at a moderate rate (λ ≈ ${metrics.lyapunovEstimate.toFixed(2)}).`);
    } else if (metrics.lyapunovEstimate < 0) {
        parts.push(`Recovery is slow — the Lyapunov exponent (λ ≈ ${metrics.lyapunovEstimate.toFixed(2)}) is barely negative.`);
    }

    // Noise assessment
    if (params.noise > 0.3) {
        parts.push('High noise is testing the limits of the restoring mechanism.');
    } else if (params.noise > 0.15) {
        parts.push('Moderate noise creates visible fluctuations around the attractor.');
    }

    // Pattern-specific narrative
    parts.push(metrics.interpretation);

    return parts.join(' ');
}


// ── Sweep & Sensitivity ─────────────────────────────────────────

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'noise', label: 'noise', min: 0, max: 0.5 },
    { key: 'pointK', label: 'restoring force k', min: 0.2, max: 3 },
    { key: 'bistableStiffness', label: 'well depth a', min: 0.3, max: 2.6 },
    { key: 'bistableDamping', label: 'damping γ', min: 0.1, max: 2.5 },
    { key: 'bistableTilt', label: 'tilt', min: -1.4, max: 1.4 },
    { key: 'limitMu', label: 'growth μ', min: -0.8, max: 2 },
    { key: 'limitOmega', label: 'angular speed ω', min: 0.2, max: 3 },
    { key: 'consensusCoupling', label: 'coupling c', min: 0, max: 2.4 },
    { key: 'consensusStubbornness', label: 'stubbornness s', min: 0, max: 1.5 },
];

export function getRelevantParamSpecs(pattern: PatternType): typeof PARAM_SPECS {
    const always = PARAM_SPECS.filter(s => s.key === 'noise');
    switch (pattern) {
        case 'point':
            return [...always, ...PARAM_SPECS.filter(s => s.key === 'pointK')];
        case 'bistable':
            return [...always, ...PARAM_SPECS.filter(s =>
                s.key === 'bistableStiffness' || s.key === 'bistableDamping' || s.key === 'bistableTilt')];
        case 'limit':
            return [...always, ...PARAM_SPECS.filter(s =>
                s.key === 'limitMu' || s.key === 'limitOmega')];
        case 'consensus':
            return [...always, ...PARAM_SPECS.filter(s =>
                s.key === 'consensusCoupling' || s.key === 'consensusStubbornness')];
    }
}

function computeStabilityForSweep(params: Params): number {
    // Compute stability index analytically (no sim state needed)
    switch (params.pattern) {
        case 'point':
            return params.pointK / (params.pointK + params.noise * 5);
        case 'bistable': {
            const bh = bistableBarrierHeight(params.bistableStiffness, params.bistableTilt);
            const en = Math.max(params.noise, 0.001);
            return Math.min(1, 1 - Math.exp(-2 * bh / (en * en) * 0.1));
        }
        case 'limit':
            return params.limitMu > 0
                ? params.limitMu / (params.limitMu + params.noise * 3)
                : 0;
        case 'consensus': {
            const cr = params.consensusCoupling * (1 - 1 / N_AGENTS) + params.consensusStubbornness;
            return cr / (cr + params.noise * 3);
        }
    }
}

function computeLyapunovForSweep(params: Params): number {
    switch (params.pattern) {
        case 'point':
            return -params.pointK;
        case 'bistable':
            return -params.bistableDamping * 0.5;
        case 'limit':
            return params.limitMu > 0 ? -2 * params.limitMu : params.limitMu;
        case 'consensus':
            return -(params.consensusCoupling * (1 - 1 / N_AGENTS) + params.consensusStubbornness);
    }
}

function computeEnergyForSweep(params: Params): number {
    // Return characteristic energy scale
    switch (params.pattern) {
        case 'point':
            return 0.5 * params.pointK;
        case 'bistable':
            return bistableBarrierHeight(params.bistableStiffness, params.bistableTilt);
        case 'limit':
            return Math.max(params.limitMu, 0);
        case 'consensus':
            return 1 / (1 + params.consensusCoupling + params.consensusStubbornness);
    }
}

export function computeSweep(params: Params, sweepKey: SweepableParam): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey);
    if (!spec) return [];

    const data: SweepDatum[] = [];
    for (let i = 0; i <= 50; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / 50);
        const swept = { ...params, [sweepKey]: v };
        data.push({
            sweepValue: v,
            stabilityIndex: computeStabilityForSweep(swept),
            lyapunovEstimate: computeLyapunovForSweep(swept),
            currentEnergy: computeEnergyForSweep(swept),
        });
    }
    return data;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    const specs = getRelevantParamSpecs(params.pattern);
    return specs
        .map(spec => {
            const atMin = computeStabilityForSweep({ ...params, [spec.key]: spec.min });
            const atMax = computeStabilityForSweep({ ...params, [spec.key]: spec.max });
            return {
                label: spec.label,
                low: Math.min(atMin, atMax),
                high: Math.max(atMin, atMax),
            };
        })
        .sort((a, b) => (b.high - b.low) - (a.high - a.low));
}


// ── SVG Helpers ──────────────────────────────────────────────────

export function pathFromValues(
    values: number[],
    opts: { width: number; height: number; minY: number; maxY: number; padding?: number },
): string {
    if (!values.length) return '';
    const { width, height, minY, maxY, padding = 16 } = opts;
    const usableW = width - padding * 2;
    const usableH = height - padding * 2;
    return values
        .map((v, i) => {
            const x = padding + (i / Math.max(1, values.length - 1)) * usableW;
            const y = padding + (1 - (v - minY) / (maxY - minY || 1)) * usableH;
            return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
}

export function pathFromPoints(
    points: { x: number; y: number }[],
    width: number,
    height: number,
    domain = 2.25,
    padding = 16,
): string {
    if (!points.length) return '';
    const mapX = (x: number) => padding + ((x + domain) / (2 * domain)) * (width - padding * 2);
    const mapY = (y: number) => padding + (1 - (y + domain) / (2 * domain)) * (height - padding * 2);
    return points
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${mapX(p.x).toFixed(1)},${mapY(p.y).toFixed(1)}`)
        .join(' ');
}


// ── Animation ──────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
