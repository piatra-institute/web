export type PresetKey = 'diffusion-dominated' | 'resonance-assisted' | 'noise-flooded';

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
    preset: 'diffusion-dominated',
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'diffusion-dominated':
            return {
                diffusion3D: 70, sliding1D: 50, resonanceMatch: 10,
                activation: 10, coupling: 10, ionicNoise: 30, preset: key,
            };
        case 'resonance-assisted':
            return {
                diffusion3D: 55, sliding1D: 40, resonanceMatch: 80,
                activation: 75, coupling: 70, ionicNoise: 25, preset: key,
            };
        case 'noise-flooded':
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

export function computeMetrics(params: Params): Metrics {
    const d3 = params.diffusion3D / 100;
    const d1 = params.sliding1D / 100;
    const r = params.resonanceMatch / 100;
    const a = params.activation / 100;
    const g = params.coupling / 100;
    const n = params.ionicNoise / 100;

    const resonanceGain = r * a * g * (1 - 0.55 * n);
    const baselineMobility = 0.55 * d3 + 0.45 * d1;
    const targetBias = Math.max(0, 0.15 + 0.95 * resonanceGain);
    const compressibility = Math.max(0.08, 0.82 - 0.45 * (r * g) + 0.22 * d1);
    const searchTime = Math.max(0.12, 1.25 - 0.55 * baselineMobility - 0.5 * targetBias + 0.18 * n);

    const interpretation =
        resonanceGain > 0.42
            ? 'Resonance-assisted recruitment is strong enough to visibly reduce search time in the toy model.'
            : resonanceGain > 0.2
                ? 'Resonance contributes, but diffusion and sliding still dominate most of the search.'
                : 'The system behaves mostly like conventional diffusion/sliding with weak long-range recruitment.';

    return { resonanceGain, baselineMobility, targetBias, compressibility, searchTime, interpretation };
}


const N_SITES = 80;
const TARGET_SITE = 60;
const PROTEIN_START = 20;

export interface SiteDatum {
    site: number;
    withResonance: number;
    withoutResonance: number;
    isTarget: boolean;
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

    return raw.map((r, i) => ({
        site: i,
        withResonance: r.w / sumWith,
        withoutResonance: r.wo / sumWithout,
        isTarget: i === TARGET_SITE,
    }));
}


export interface SweepDatum {
    coupling: number;
    searchTime: number;
    compressibility: number;
    targetBias: number;
}

export function computeSweep(params: Params): SweepDatum[] {
    const data: SweepDatum[] = [];

    for (let g = 0; g <= 100; g += 2) {
        const m = computeMetrics({ ...params, coupling: g });
        data.push({
            coupling: g,
            searchTime: m.searchTime,
            compressibility: m.compressibility,
            targetBias: m.targetBias,
        });
    }

    return data;
}
