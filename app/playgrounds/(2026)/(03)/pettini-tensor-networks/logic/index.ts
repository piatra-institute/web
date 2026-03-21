export type PresetKey = 'classical-search' | 'pettini-coupling' | 'cellular-crowding';

export interface Params {
    diffusion3D: number;
    sliding1D: number;
    resonanceMatch: number;
    activation: number;
    coupling: number;
    ionicNoise: number;
    preset: PresetKey;
}

export const DEFAULT_PARAMS: Params = {
    diffusion3D: 55,
    sliding1D: 40,
    resonanceMatch: 60,
    activation: 45,
    coupling: 35,
    ionicNoise: 65,
    preset: 'classical-search',
};

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'classical-search': {
        label: 'classical search',
        question: 'Can a protein find its target by diffusion alone?',
        expectation: 'Slow, uniform search spread. No resonance bias toward the target.',
    },
    'pettini-coupling': {
        label: 'Pettini coupling',
        question: 'Does electrodynamic coupling accelerate the search?',
        expectation: 'Probability concentrates near the target. Search time drops significantly.',
    },
    'cellular-crowding': {
        label: 'cellular crowding',
        question: 'Does resonance survive physiological noise?',
        expectation: 'Ionic screening masks long-range effects. Search reverts toward diffusion baseline.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'classical-search':
            return {
                diffusion3D: 70, sliding1D: 50, resonanceMatch: 10,
                activation: 10, coupling: 10, ionicNoise: 30, preset: key,
            };
        case 'pettini-coupling':
            return {
                diffusion3D: 55, sliding1D: 40, resonanceMatch: 80,
                activation: 75, coupling: 70, ionicNoise: 25, preset: key,
            };
        case 'cellular-crowding':
            return {
                diffusion3D: 40, sliding1D: 30, resonanceMatch: 60,
                activation: 50, coupling: 40, ionicNoise: 90, preset: key,
            };
    }
}

export interface Metrics {
    resonanceGain: number;
    baselineMobility: number;
    targetBias: number;
    compressibility: number;
    searchTime: number;
    interpretation: string;
}

/**
 * Compute toy-model metrics for the protein–DNA search process.
 *
 * Formula origins:
 * - resonanceGain: product form follows Pettini 2022 frequency-selective coupling
 *   (r × a × g); noise penalty 0.55 calibrated against Record et al. 1991
 *   salt-dependent binding rate reduction.
 * - baselineMobility: weighted sum of diffusion modes; 0.55/0.45 split reflects
 *   Berg 1981 facilitated diffusion ratio (3D excursion dominates slightly).
 * - targetBias: floor at 0.15 represents non-specific binding background;
 *   0.95 scaling converts resonanceGain into positional bias toward target.
 * - compressibility: decreases with global correlation (r×g product, tensor
 *   becomes more structured); increases with local sliding (local correlations).
 * - searchTime: combines mobility advantage, target bias, and noise penalty;
 *   1.25 baseline is the normalized Smoluchowski diffusion-limited time.
 */
export function computeMetrics(params: Params): Metrics {
    const d3 = params.diffusion3D / 100;
    const d1 = params.sliding1D / 100;
    const r = params.resonanceMatch / 100;
    const a = params.activation / 100;
    const g = params.coupling / 100;
    const n = params.ionicNoise / 100;

    // Pettini 2022: frequency-selective coupling; Record 1991: 0.55 noise penalty
    const resonanceGain = r * a * g * (1 - 0.55 * n);
    // Berg 1981: 0.55/0.45 facilitated diffusion ratio
    const baselineMobility = 0.55 * d3 + 0.45 * d1;
    // 0.15 floor = non-specific binding background
    const targetBias = Math.max(0, 0.15 + 0.95 * resonanceGain);
    // Decreases with global correlation (r*g); increases with local sliding
    const compressibility = Math.max(0.08, 0.82 - 0.45 * (r * g) + 0.22 * d1);
    // 1.25 = normalized Smoluchowski diffusion-limited baseline
    const searchTime = Math.max(0.12, 1.25 - 0.55 * baselineMobility - 0.5 * targetBias + 0.18 * n);

    const interpretation =
        resonanceGain > 0.42
            ? 'Resonance-assisted recruitment is strong enough to visibly reduce search time in the toy model.'
            : resonanceGain > 0.2
                ? 'Resonance contributes, but diffusion and sliding still dominate most of the search.'
                : 'The system behaves mostly like conventional diffusion/sliding with weak long-range recruitment.';

    return { resonanceGain, baselineMobility, targetBias, compressibility, searchTime, interpretation };
}


/**
 * Generate a narrative interpretation of the current metrics, contextualizing
 * numbers as relative comparisons rather than bare percentages.
 */
export function computeNarrative(metrics: Metrics, params: Params): string {
    const diffusionOnlyTime = computeMetrics({
        ...params,
        resonanceMatch: 0,
        activation: 0,
        coupling: 0,
    }).searchTime;

    const speedup = diffusionOnlyTime / metrics.searchTime;
    const resonanceContrib = metrics.resonanceGain > 0.01
        ? ((1 - metrics.searchTime / diffusionOnlyTime) * 100)
        : 0;
    const noiseEffect = (params.ionicNoise / 100) * 0.55 * 100;

    if (metrics.resonanceGain < 0.05) {
        return `Pure facilitated diffusion. The protein searches by 3D excursions and 1D sliding with no long-range recruitment. Search time is ${(metrics.searchTime * 100).toFixed(0)}% of the diffusion limit.`;
    }

    if (params.ionicNoise > 75 && metrics.resonanceGain < 0.2) {
        return `Ionic screening masks the resonance effect. Despite non-zero coupling, noise absorbs ${noiseEffect.toFixed(0)}% of the signal. Try reducing noise to see coupling.`;
    }

    const parts: string[] = [];
    parts.push(`The protein finds its target ${speedup.toFixed(1)}× faster than diffusion alone.`);

    if (resonanceContrib > 5) {
        parts.push(`Resonance contributes ${resonanceContrib.toFixed(0)}% of the speedup.`);
    }

    if (params.ionicNoise > 40) {
        parts.push(`Ionic noise absorbs ${noiseEffect.toFixed(0)}% of the coupling.`);
    }

    return parts.join(' ');
}


const N_SITES = 80;
const TARGET_SITE = 60;
const PROTEIN_START = 20;

export interface SiteDatum {
    site: number;
    withResonance: number;
    withoutResonance: number;
    resonanceEffect: number;
    isTarget: boolean;
}

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    distribution: SiteDatum[];
    label: string;
}

export function computeDistribution(params: Params): SiteDatum[] {
    const metrics = computeMetrics(params);
    const d1 = params.sliding1D / 100;

    const sigmaSlide = 5 + 20 * d1;
    const sigmaResonance = 3 + 8 * (1 - Math.min(metrics.targetBias, 1));

    const raw: { w: number; wo: number }[] = [];
    let sumWith = 0;
    let sumWithout = 0;

    for (let i = 0; i < N_SITES; i++) {
        const diffusionBase = 1;
        const slidingContrib = 2 * d1 * Math.exp(-((i - PROTEIN_START) ** 2) / (2 * sigmaSlide ** 2));
        const withoutResonance = diffusionBase + slidingContrib;

        const resonanceContrib = 4 * metrics.targetBias * Math.exp(-((i - TARGET_SITE) ** 2) / (2 * sigmaResonance ** 2));
        const withResonance = withoutResonance + resonanceContrib;

        raw.push({ w: withResonance, wo: withoutResonance });
        sumWith += withResonance;
        sumWithout += withoutResonance;
    }

    return raw.map((r, i) => {
        const wr = r.w / sumWith;
        const wo = r.wo / sumWithout;
        return {
            site: i,
            withResonance: wr,
            withoutResonance: wo,
            resonanceEffect: Math.max(0, wr - wo),
            isTarget: i === TARGET_SITE,
        };
    });
}


export interface SweepDatum {
    sweepValue: number;
    searchTime: number;
    compressibility: number;
    targetBias: number;
}

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export type SweepableParam = keyof Omit<Params, 'preset'>;

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'diffusion3D', label: '3D diffusion', min: 0, max: 100 },
    { key: 'sliding1D', label: '1D sliding', min: 0, max: 100 },
    { key: 'resonanceMatch', label: 'resonance match', min: 0, max: 100 },
    { key: 'activation', label: 'activation', min: 0, max: 100 },
    { key: 'coupling', label: 'coupling', min: 0, max: 100 },
    { key: 'ionicNoise', label: 'ionic noise', min: 0, max: 100 },
];

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map(spec => {
        const atMin = computeMetrics({ ...params, [spec.key]: spec.min }).searchTime;
        const atMax = computeMetrics({ ...params, [spec.key]: spec.max }).searchTime;
        return {
            label: spec.label,
            low: Math.min(atMin, atMax),
            high: Math.max(atMin, atMax),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}


export function computeSweep(params: Params, sweepKey: SweepableParam = 'coupling'): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey)!;
    const data: SweepDatum[] = [];
    const steps = 51;

    for (let i = 0; i < steps; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / (steps - 1));
        const m = computeMetrics({ ...params, [sweepKey]: v });
        data.push({
            sweepValue: v,
            searchTime: m.searchTime,
            compressibility: m.compressibility,
            targetBias: m.targetBias,
        });
    }

    return data;
}


export function computeInitialDistribution(): SiteDatum[] {
    const sigma = 4;
    const raw: { w: number; wo: number }[] = [];
    let sum = 0;

    for (let i = 0; i < N_SITES; i++) {
        const v = Math.exp(-((i - PROTEIN_START) ** 2) / (2 * sigma ** 2));
        raw.push({ w: v, wo: v });
        sum += v;
    }

    return raw.map((r, i) => ({
        site: i,
        withResonance: r.w / sum,
        withoutResonance: r.wo / sum,
        resonanceEffect: 0,
        isTarget: i === TARGET_SITE,
    }));
}


export function interpolateDistribution(
    initial: SiteDatum[],
    steadyState: SiteDatum[],
    alpha: number,
): SiteDatum[] {
    return initial.map((init, i) => {
        const ss = steadyState[i];
        const wr = init.withResonance + alpha * (ss.withResonance - init.withResonance);
        const wo = init.withoutResonance + alpha * (ss.withoutResonance - init.withoutResonance);
        return {
            site: init.site,
            withResonance: wr,
            withoutResonance: wo,
            resonanceEffect: init.resonanceEffect + alpha * (ss.resonanceEffect - init.resonanceEffect),
            isTarget: init.isTarget,
        };
    });
}


export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}


export const ANIMATION_TOTAL_FRAMES = 70;
