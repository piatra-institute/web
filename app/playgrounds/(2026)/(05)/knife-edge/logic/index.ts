export * from './simulation';
export * from './avalanches';
export * from './sheaf';
export * from './phase';

export type PresetKey =
    | 'subcritical'
    | 'critical'
    | 'supercritical'
    | 'avalanche-edge'
    | 'over-synchronised';

export interface Params {
    gain: number;
    damping: number;
    localCoupling: number;
    distantCoupling: number;
    noise: number;
    pulseWidth: number;
    speed: number;
    preset: PresetKey;
}

export const LATTICE_SIZE = 96;
export const NUM_PATCHES = 16;
export const PATCH_WIDTH = LATTICE_SIZE / NUM_PATCHES; // 6
export const ACTIVE_THRESHOLD = 0.22;
export const AVALANCHE_HISTORY = 320;

export const PRESET_DESCRIPTIONS: Record<
    PresetKey,
    { label: string; question: string; expectation: string }
> = {
    'subcritical': {
        label: 'subcritical',
        question: 'What happens when damping wins?',
        expectation: 'Pulses decay locally. λ_max < 0. Avalanche distribution is exponential, not power-law.',
    },
    'critical': {
        label: 'critical',
        question: 'What does scale-invariance look like in real time?',
        expectation: 'Wave neither dies nor explodes. λ_max ≈ 0. τ approaches the -3/2 branching exponent.',
    },
    'supercritical': {
        label: 'supercritical',
        question: 'When does response become runaway?',
        expectation: 'Pulses recruit the medium. λ_max > 0. The lattice saturates against its cubic ceiling.',
    },
    'avalanche-edge': {
        label: 'avalanche edge',
        question: 'Mimicking Beggs & Plenz: σ ≈ 1, neuronal avalanches.',
        expectation: 'τ-fit close to -1.5 over multiple decades. Spectral gap small, kernel near degenerate.',
    },
    'over-synchronised': {
        label: 'over-synchronised',
        question: 'What does seizure-like over-integration look like?',
        expectation: 'High distant coupling fuses the lattice. Low differentiation. Spectral gap collapses.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'subcritical':
            return {
                gain: 0.62, damping: 0.035, localCoupling: 0.45, distantCoupling: 0.06,
                noise: 0.012, pulseWidth: 6, speed: 1, preset: key,
            };
        case 'critical':
            return {
                gain: 1.035, damping: 0.035, localCoupling: 0.45, distantCoupling: 0.08,
                noise: 0.014, pulseWidth: 6, speed: 1, preset: key,
            };
        case 'supercritical':
            return {
                gain: 1.24, damping: 0.035, localCoupling: 0.45, distantCoupling: 0.10,
                noise: 0.014, pulseWidth: 6, speed: 1, preset: key,
            };
        case 'avalanche-edge':
            return {
                gain: 1.04, damping: 0.04, localCoupling: 0.55, distantCoupling: 0.04,
                noise: 0.018, pulseWidth: 4, speed: 1, preset: key,
            };
        case 'over-synchronised':
            return {
                gain: 1.18, damping: 0.06, localCoupling: 0.7, distantCoupling: 0.28,
                noise: 0.01, pulseWidth: 12, speed: 1, preset: key,
            };
    }
}

export type Regime = 'subcritical' | 'critical' | 'supercritical';

export interface AnalyticalMetrics {
    lambdaMax: number;
    distance: number;
    correlationLengthEstimate: number;
    tauTheoretical: number;
    spectralGapEstimate: number;
    regime: Regime;
    regimeLabel: string;
}

export function analyticalMetrics(p: Params): AnalyticalMetrics {
    const lambdaMax = p.gain - 1 - p.damping + 0.4 * p.distantCoupling;
    const distance = Math.abs(lambdaMax);
    const correlationLengthEstimate = Math.min(LATTICE_SIZE / 2, 1 / (0.04 + distance));
    const tauTheoretical = -1.5 - 0.45 * Math.tanh(6 * lambdaMax);
    const spectralGapEstimate = 0.02 + 0.85 * distance;
    let regime: Regime;
    let regimeLabel: string;
    if (lambdaMax < -0.04) {
        regime = 'subcritical';
        regimeLabel = 'subcritical · pulses decay locally';
    } else if (lambdaMax > 0.04) {
        regime = 'supercritical';
        regimeLabel = 'supercritical · pulses amplify and saturate';
    } else {
        regime = 'critical';
        regimeLabel = 'critical · scale-free response, marginal stability';
    }
    return { lambdaMax, distance, correlationLengthEstimate, tauTheoretical, spectralGapEstimate, regime, regimeLabel };
}

export interface LiveMetrics {
    amplitude: number;
    energy: number;
    correlationLength: number;
    activeFraction: number;
    tauObserved: number | null;
    avalancheBins: { size: number; count: number }[];
    patches: number[];
    eigenvalues: number[];
    kernelDim: number;
    spectralGap: number;
}

export interface Snapshot {
    params: Params;
    analytical: AnalyticalMetrics;
    live: LiveMetrics;
    label: string;
}

export type SweepableParam = keyof Omit<Params, 'preset' | 'speed'>;

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number; step: number }[] = [
    { key: 'gain', label: 'gain', min: 0, max: 2, step: 0.005 },
    { key: 'damping', label: 'damping', min: 0.005, max: 0.4, step: 0.005 },
    { key: 'localCoupling', label: 'local coupling', min: 0.05, max: 0.95, step: 0.01 },
    { key: 'distantCoupling', label: 'distant coupling', min: 0, max: 0.4, step: 0.005 },
    { key: 'noise', label: 'noise', min: 0, max: 0.06, step: 0.001 },
    { key: 'pulseWidth', label: 'pulse width', min: 1, max: 18, step: 1 },
];

export interface SweepDatum {
    sweepValue: number;
    lambdaMax: number;
    correlationLength: number;
    tauTheoretical: number;
    spectralGap: number;
}

export function computeSweep(params: Params, key: SweepableParam): SweepDatum[] {
    const spec = PARAM_SPECS.find((s) => s.key === key);
    if (!spec) return [];
    const data: SweepDatum[] = [];
    const steps = 41;
    for (let i = 0; i < steps; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / (steps - 1));
        const m = analyticalMetrics({ ...params, [key]: v });
        data.push({
            sweepValue: v,
            lambdaMax: m.lambdaMax,
            correlationLength: m.correlationLengthEstimate / (LATTICE_SIZE / 2),
            tauTheoretical: -m.tauTheoretical / 3,
            spectralGap: m.spectralGapEstimate,
        });
    }
    return data;
}

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map((spec) => {
        const atLow = analyticalMetrics({ ...params, [spec.key]: spec.min }).lambdaMax;
        const atHigh = analyticalMetrics({ ...params, [spec.key]: spec.max }).lambdaMax;
        return {
            label: spec.label,
            low: Math.min(atLow, atHigh),
            high: Math.max(atLow, atHigh),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}

export function computeNarrative(analytical: AnalyticalMetrics, live: LiveMetrics): string {
    const parts: string[] = [];
    if (analytical.regime === 'critical') {
        parts.push(
            `Operating point near criticality (λ_max ≈ ${analytical.lambdaMax.toFixed(3)}). The lattice is marginally stable: pulses neither decay quickly nor explode.`,
        );
    } else if (analytical.regime === 'subcritical') {
        parts.push(
            `Subcritical regime (λ_max = ${analytical.lambdaMax.toFixed(3)}): the medium absorbs perturbation. Correlations decay exponentially with length ξ ≈ ${analytical.correlationLengthEstimate.toFixed(1)} sites.`,
        );
    } else {
        parts.push(
            `Supercritical regime (λ_max = ${analytical.lambdaMax.toFixed(3)}): the lattice amplifies any seed. Cubic saturation eventually pins amplitudes at the nonlinear ceiling.`,
        );
    }
    if (live.tauObserved !== null && Math.abs(live.tauObserved + 1.5) < 0.25) {
        parts.push(
            `The avalanche τ-fit (${live.tauObserved.toFixed(2)}) sits near the ‑3/2 branching exponent, the canonical fingerprint of critical cascade dynamics.`,
        );
    } else if (live.tauObserved !== null) {
        parts.push(
            `The empirical τ-fit (${live.tauObserved.toFixed(2)}) is off the critical ‑3/2 line; the avalanche size distribution carries a characteristic scale.`,
        );
    }
    if (live.spectralGap < 0.08 && live.spectralGap > 0) {
        parts.push(
            `Sheaf spectral gap is small (${live.spectralGap.toFixed(3)}): local patches struggle to glue into a global section, disagreement at patch boundaries is large.`,
        );
    }
    if (live.kernelDim > 1) {
        parts.push(
            `Effective kernel dimension is ${live.kernelDim}, the wave field is decomposing into multiple disconnected pieces under the current restriction maps.`,
        );
    }
    return parts.join(' ');
}
