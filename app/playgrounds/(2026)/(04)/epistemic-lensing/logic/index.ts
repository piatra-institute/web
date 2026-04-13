// Epistemic Lensing — computation engine
// Based on: PAPER.md Section 5 (Toy Model)

// --- Types ---

export type PresetKey = 'pure-attenuation' | 'selection-warping' | 'amplification' | 'recursion';

export interface Params {
    // Channel parameters
    attenuation: number;       // 0-100: signal strength (0 = full attenuation, 100 = full signal)
    omissionRate: number;      // 0-100: probability of dropping a signal
    warpingBias: number;       // -100 to 100: directional bias injection
    amplificationGain: number; // 0-100: gain on extreme signals
    recursionStrength: number; // 0-100: autoregressive feedback from prior channel output
    channelNoise: number;      // 0-100: additive channel noise

    // Agent parameters
    priorStrength: number;     // 0-100: weight of existing belief vs new evidence
    trustInChannel: number;    // 0-100: how much the agent trusts the channel
    motivatedReasoning: number;// 0-100: downweight evidence inconsistent with current belief

    preset: PresetKey;
}

export const DEFAULT_PARAMS: Params = {
    attenuation: 70,
    omissionRate: 10,
    warpingBias: 0,
    amplificationGain: 0,
    recursionStrength: 0,
    channelNoise: 15,
    priorStrength: 30,
    trustInChannel: 70,
    motivatedReasoning: 0,
    preset: 'pure-attenuation',
};

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'pure-attenuation': {
        label: 'pure attenuation',
        question: 'What happens when the channel simply weakens the signal?',
        expectation: 'The agent becomes uncertain but not systematically wrong. Correction is effective.',
    },
    'selection-warping': {
        label: 'selection + warping',
        question: 'What happens when the channel omits evidence and injects bias?',
        expectation: 'The agent is confidently wrong. Correction leaves a residue.',
    },
    'amplification': {
        label: 'amplification',
        question: 'What happens when the channel overweights extreme signals?',
        expectation: 'The agent overreacts to outliers and oscillates more than the benchmark.',
    },
    'recursion': {
        label: 'recursion',
        question: 'What happens when the channel feeds back on itself?',
        expectation: 'The agent lags the world state and fails to fully correct. Hysteresis is high.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'pure-attenuation':
            return {
                attenuation: 30, omissionRate: 0, warpingBias: 0,
                amplificationGain: 0, recursionStrength: 0, channelNoise: 15,
                priorStrength: 30, trustInChannel: 70, motivatedReasoning: 0,
                preset: key,
            };
        case 'selection-warping':
            return {
                attenuation: 70, omissionRate: 50, warpingBias: 40,
                amplificationGain: 0, recursionStrength: 0, channelNoise: 15,
                priorStrength: 30, trustInChannel: 70, motivatedReasoning: 0,
                preset: key,
            };
        case 'amplification':
            return {
                attenuation: 70, omissionRate: 0, warpingBias: 0,
                amplificationGain: 80, recursionStrength: 0, channelNoise: 15,
                priorStrength: 30, trustInChannel: 70, motivatedReasoning: 0,
                preset: key,
            };
        case 'recursion':
            return {
                attenuation: 70, omissionRate: 0, warpingBias: 0,
                amplificationGain: 0, recursionStrength: 70, channelNoise: 15,
                priorStrength: 30, trustInChannel: 70, motivatedReasoning: 0,
                preset: key,
            };
    }
}

// --- Simulation ---

const T = 200;           // timesteps
const CORRECT_AT = 150;  // correction injection time
const SIGMA_W = 0.08;    // world volatility
const SIGMA_X = 0.12;    // observation noise

export interface TimeStep {
    t: number;
    world: number;
    benchmark: number;
    mediated: number;
    channelOutput: number;
    isCorrected: boolean;
}

// Deterministic seeded random for reproducibility
function seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
        return (s >>> 0) / 0xFFFFFFFF;
    };
}

function gaussianFromUniform(rand: () => number): number {
    const u1 = rand();
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
}

export function runSimulation(params: Params): TimeStep[] {
    const rand = seededRandom(42);
    const gauss = () => gaussianFromUniform(rand);

    const alpha = params.attenuation / 100;
    const pOmit = params.omissionRate / 100;
    const beta = params.warpingBias / 100;
    const gAmp = 1 + 3 * (params.amplificationGain / 100); // gain 1-4x
    const ampThreshold = 0.3; // amplify signals above this magnitude
    const gamma = params.recursionStrength / 100;
    const sigmaNu = params.channelNoise / 100 * 0.2;

    const pi = params.priorStrength / 100;
    const trust = params.trustInChannel / 100;
    const rho = params.motivatedReasoning / 100;

    const steps: TimeStep[] = [];
    let W = 0;       // world state
    let muBench = 0; // benchmark posterior mean
    let muMed = 0;   // mediated posterior mean
    let prevM = 0;   // previous channel output

    for (let t = 0; t < T; t++) {
        // World evolution
        W += SIGMA_W * gauss();

        // Evidence stream
        const X = W + SIGMA_X * gauss();

        // Benchmark update (ideal Bayesian with observation noise)
        const kBench = 1 - pi * 0.5; // benchmark uses moderate prior
        muBench = muBench + kBench * (X - muBench) * 0.3;

        // Channel transformation
        let M = X;

        // Attenuation
        M = alpha * M + (1 - alpha) * 0; // blend toward zero (attenuate)

        // Selection (omission)
        const omitted = rand() < pOmit;
        if (omitted) {
            M = prevM; // repeat previous signal when omitted
        }

        // Warping (bias injection)
        M = M + beta * 0.5;

        // Amplification (gain on extreme signals)
        if (Math.abs(X) > ampThreshold) {
            M = M * gAmp;
        }

        // Recursion (autoregressive feedback)
        M = (1 - gamma) * M + gamma * prevM;

        // Channel noise
        M += sigmaNu * gauss();

        // Correction: at t=CORRECT_AT, inject the true world state
        const isCorrected = t === CORRECT_AT;
        if (isCorrected) {
            M = W; // direct observation of truth
        }

        // Agent update (quasi-Bayesian)
        const evidence = M;
        const surprise = evidence - muMed;
        const consistencyWeight = rho > 0
            ? Math.exp(-rho * surprise * surprise * 4)
            : 1;
        const learningRate = trust * (1 - pi) * consistencyWeight * 0.3;
        muMed = muMed + learningRate * surprise;

        prevM = M;

        steps.push({
            t,
            world: W,
            benchmark: muBench,
            mediated: muMed,
            channelOutput: M,
            isCorrected,
        });
    }

    return steps;
}

// --- Metrics ---

export interface Metrics {
    informationLoss: number;
    posteriorDivergence: number;
    inferentialCurvature: number;
    hysteresis: number;
    calibrationError: number;
    regime: string;
}

export function computeMetrics(params: Params): Metrics {
    const steps = runSimulation(params);

    // Information loss: ratio of channel output variance to evidence variance
    const worldVar = variance(steps.map(s => s.world));
    const channelVar = variance(steps.map(s => s.channelOutput));
    const informationLoss = worldVar > 0 ? Math.max(0, 1 - channelVar / (worldVar + 0.01)) : 0;

    // Posterior divergence: mean absolute difference between mediated and benchmark
    const preCorrectionSteps = steps.filter(s => s.t < CORRECT_AT);
    const posteriorDivergence = mean(preCorrectionSteps.map(s => Math.abs(s.mediated - s.benchmark)));

    // Inferential curvature: compare update magnitudes
    const benchUpdates: number[] = [];
    const medUpdates: number[] = [];
    for (let i = 1; i < preCorrectionSteps.length; i++) {
        benchUpdates.push(Math.abs(preCorrectionSteps[i].benchmark - preCorrectionSteps[i - 1].benchmark));
        medUpdates.push(Math.abs(preCorrectionSteps[i].mediated - preCorrectionSteps[i - 1].mediated));
    }
    const meanBenchUpdate = mean(benchUpdates);
    const meanMedUpdate = mean(medUpdates);
    const inferentialCurvature = meanBenchUpdate > 0
        ? (meanMedUpdate - meanBenchUpdate) / meanBenchUpdate
        : 0;

    // Hysteresis: residual divergence after correction
    const postCorrectionSteps = steps.filter(s => s.t >= CORRECT_AT + 10);
    const hysteresis = postCorrectionSteps.length > 0
        ? mean(postCorrectionSteps.map(s => Math.abs(s.mediated - s.benchmark)))
        : 0;

    // Calibration error: mean squared error of mediated posterior vs world
    const calibrationError = mean(preCorrectionSteps.map(s => (s.mediated - s.world) ** 2));

    // Regime classification
    let regime: string;
    if (posteriorDivergence < 0.03 && hysteresis < 0.02) {
        regime = 'high-fidelity channel';
    } else if (informationLoss > 0.5 && posteriorDivergence < 0.08) {
        regime = 'attenuated but correctable';
    } else if (posteriorDivergence > 0.08 && hysteresis > 0.05) {
        regime = 'distorted with residue';
    } else if (inferentialCurvature > 0.3) {
        regime = 'magnification regime';
    } else if (inferentialCurvature < -0.3) {
        regime = 'occlusion regime';
    } else if (hysteresis > 0.08) {
        regime = 'locked-in distortion';
    } else {
        regime = 'moderate distortion';
    }

    return { informationLoss, posteriorDivergence, inferentialCurvature, hysteresis, calibrationError, regime };
}

// --- Sweep ---

export type SweepableParam = keyof Omit<Params, 'preset'>;

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'attenuation', label: 'attenuation', min: 0, max: 100 },
    { key: 'omissionRate', label: 'omission rate', min: 0, max: 100 },
    { key: 'warpingBias', label: 'warping bias', min: -100, max: 100 },
    { key: 'amplificationGain', label: 'amplification', min: 0, max: 100 },
    { key: 'recursionStrength', label: 'recursion', min: 0, max: 100 },
    { key: 'channelNoise', label: 'channel noise', min: 0, max: 100 },
    { key: 'priorStrength', label: 'prior strength', min: 0, max: 100 },
    { key: 'trustInChannel', label: 'trust in channel', min: 0, max: 100 },
    { key: 'motivatedReasoning', label: 'motivated reasoning', min: 0, max: 100 },
];

export interface SweepDatum {
    sweepValue: number;
    posteriorDivergence: number;
    hysteresis: number;
    informationLoss: number;
}

export function computeSweep(params: Params, sweepKey: SweepableParam = 'attenuation'): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey)!;
    const data: SweepDatum[] = [];
    const steps = 31;

    for (let i = 0; i < steps; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / (steps - 1));
        const m = computeMetrics({ ...params, [sweepKey]: v });
        data.push({
            sweepValue: v,
            posteriorDivergence: m.posteriorDivergence,
            hysteresis: m.hysteresis,
            informationLoss: m.informationLoss,
        });
    }

    return data;
}

// --- Sensitivity ---

import { SensitivityBar } from '@/components/SensitivityAnalysis';

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map(spec => {
        const atMin = computeMetrics({ ...params, [spec.key]: spec.min }).posteriorDivergence;
        const atMax = computeMetrics({ ...params, [spec.key]: spec.max }).posteriorDivergence;
        return {
            label: spec.label,
            low: Math.min(atMin, atMax),
            high: Math.max(atMin, atMax),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}

// --- Narrative ---

export function computeNarrative(metrics: Metrics, params: Params): string {
    const baselineMetrics = computeMetrics({
        ...DEFAULT_PARAMS,
        attenuation: 100, omissionRate: 0, warpingBias: 0,
        amplificationGain: 0, recursionStrength: 0, channelNoise: 0,
    });
    const baseDiv = baselineMetrics.posteriorDivergence;
    const ratio = baseDiv > 0.001 ? metrics.posteriorDivergence / baseDiv : 0;

    if (metrics.posteriorDivergence < 0.02) {
        return `High-fidelity channel. The agent tracks the benchmark closely. Correction would have negligible effect.`;
    }

    const parts: string[] = [];

    if (metrics.informationLoss > 0.4) {
        parts.push(`The channel destroys ${(metrics.informationLoss * 100).toFixed(0)}% of world-relevant information.`);
    }

    if (metrics.posteriorDivergence > 0.05) {
        parts.push(`The mediated posterior diverges ${ratio.toFixed(1)}x from baseline.`);
    }

    if (metrics.inferentialCurvature > 0.2) {
        parts.push(`The agent overreacts to evidence (magnification).`);
    } else if (metrics.inferentialCurvature < -0.2) {
        parts.push(`The agent underreacts to evidence (occlusion).`);
    }

    if (metrics.hysteresis > 0.05) {
        parts.push(`After correction, ${(metrics.hysteresis * 100 / Math.max(metrics.posteriorDivergence, 0.01) * 100).toFixed(0)}% of distortion persists as epistemic residue.`);
    } else {
        parts.push(`Correction is effective: the agent snaps back to the benchmark.`);
    }

    if (params.motivatedReasoning > 40) {
        parts.push(`Motivated reasoning further dampens corrective evidence.`);
    }

    return parts.join(' ');
}

// --- Snapshot ---

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    trajectory: TimeStep[];
    label: string;
}

// --- Animation ---

export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const ANIMATION_TOTAL_FRAMES = 70;

// --- Utilities ---

function mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function variance(arr: number[]): number {
    if (arr.length === 0) return 0;
    const m = mean(arr);
    return mean(arr.map(x => (x - m) ** 2));
}
