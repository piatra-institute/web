export type PresetKey =
    | 'museum-masterpiece'
    | 'ai-image-feed'
    | 'war-archive'
    | 'meme-relic'
    | 'luxury-object';

export interface Params {
    objectSingularity: number;
    formalDensity: number;
    embodiedTrace: number;
    reproductionSaturation: number;
    ritualDistance: number;
    institutionalAuthority: number;
    scarcity: number;
    marketPressure: number;
    observerTraining: number;
    observerDesire: number;
    observerAlienation: number;
    historicalDepth: number;
    traumaIndex: number;
    preset: PresetKey;
}

export const PRESET_DESCRIPTIONS: Record<
    PresetKey,
    { label: string; question: string; expectation: string }
> = {
    'museum-masterpiece': {
        label: 'museum masterpiece',
        question: 'What does aura look like when institution, scarcity, and history align?',
        expectation: 'Strong sacred and prestige fibers, high curvature, low sheaf tension.',
    },
    'ai-image-feed': {
        label: 'AI image in feed',
        question: 'What remains of aura under pure mechanical reproduction?',
        expectation: 'Flat field. Meme and uncanny dimensions dominate; sacred and embodied collapse.',
    },
    'war-archive': {
        label: 'wartime archive object',
        question: 'How does trauma and damaged provenance accumulate aura?',
        expectation: 'High historical depth and embodied trace. Holonomy is large from the survival path.',
    },
    'meme-relic': {
        label: 'meme relic',
        question: 'Can mass repetition produce its own aura attractor?',
        expectation: 'Meme basin dominates. Sheaf tension is high — communities disagree about its meaning.',
    },
    'luxury-object': {
        label: 'luxury commodity',
        question: 'Is luxury aura just sacred aura plus a price tag?',
        expectation: 'Market and prestige fibers spike; embodied and historical lag behind.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'museum-masterpiece':
            return {
                objectSingularity: 0.88,
                formalDensity: 0.78,
                embodiedTrace: 0.72,
                reproductionSaturation: 0.34,
                ritualDistance: 0.82,
                institutionalAuthority: 0.93,
                scarcity: 0.89,
                marketPressure: 0.74,
                observerTraining: 0.71,
                observerDesire: 0.63,
                observerAlienation: 0.34,
                historicalDepth: 0.86,
                traumaIndex: 0.29,
                preset: key,
            };
        case 'ai-image-feed':
            return {
                objectSingularity: 0.24,
                formalDensity: 0.61,
                embodiedTrace: 0.12,
                reproductionSaturation: 0.91,
                ritualDistance: 0.16,
                institutionalAuthority: 0.22,
                scarcity: 0.09,
                marketPressure: 0.21,
                observerTraining: 0.46,
                observerDesire: 0.52,
                observerAlienation: 0.66,
                historicalDepth: 0.07,
                traumaIndex: 0.08,
                preset: key,
            };
        case 'war-archive':
            return {
                objectSingularity: 0.81,
                formalDensity: 0.54,
                embodiedTrace: 0.95,
                reproductionSaturation: 0.21,
                ritualDistance: 0.71,
                institutionalAuthority: 0.68,
                scarcity: 0.91,
                marketPressure: 0.29,
                observerTraining: 0.55,
                observerDesire: 0.49,
                observerAlienation: 0.22,
                historicalDepth: 0.96,
                traumaIndex: 0.88,
                preset: key,
            };
        case 'meme-relic':
            return {
                objectSingularity: 0.42,
                formalDensity: 0.36,
                embodiedTrace: 0.28,
                reproductionSaturation: 0.96,
                ritualDistance: 0.39,
                institutionalAuthority: 0.18,
                scarcity: 0.26,
                marketPressure: 0.33,
                observerTraining: 0.37,
                observerDesire: 0.81,
                observerAlienation: 0.73,
                historicalDepth: 0.43,
                traumaIndex: 0.18,
                preset: key,
            };
        case 'luxury-object':
            return {
                objectSingularity: 0.61,
                formalDensity: 0.68,
                embodiedTrace: 0.44,
                reproductionSaturation: 0.37,
                ritualDistance: 0.76,
                institutionalAuthority: 0.57,
                scarcity: 0.72,
                marketPressure: 0.94,
                observerTraining: 0.48,
                observerDesire: 0.91,
                observerAlienation: 0.53,
                historicalDepth: 0.35,
                traumaIndex: 0.05,
                preset: key,
            };
    }
}

export const DIMENSIONS: { key: keyof AuraVector; label: string }[] = [
    { key: 'sacred', label: 'sacred' },
    { key: 'prestige', label: 'prestige' },
    { key: 'distance', label: 'distance' },
    { key: 'historical', label: 'history' },
    { key: 'embodied', label: 'trace' },
    { key: 'meme', label: 'meme' },
    { key: 'market', label: 'market' },
    { key: 'uncanny', label: 'uncanny' },
];

export interface AuraVector {
    sacred: number;
    prestige: number;
    distance: number;
    historical: number;
    embodied: number;
    meme: number;
    market: number;
    uncanny: number;
}

export interface Basin {
    name: string;
    value: number;
}

export interface TransportCost {
    key: 'relic' | 'luxury' | 'meme';
    label: string;
    cost: number;
}

export interface Metrics {
    novelty: number;
    authenticity: number;
    benjaminDistance: number;
    socialGravity: number;
    auraIntensity: number;
    auraVector: AuraVector;
    curvature: number;
    sheafTension: number;
    holonomy: number;
    energy: number;
    basins: Basin[];
    transportCosts: TransportCost[];
    interpretation: string;
}

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

const TRANSPORT_TARGETS: Record<TransportCost['key'], AuraVector> = {
    relic: {
        sacred: 0.9, prestige: 0.55, distance: 0.86, historical: 0.92,
        embodied: 0.82, meme: 0.18, market: 0.3, uncanny: 0.22,
    },
    luxury: {
        sacred: 0.25, prestige: 0.78, distance: 0.72, historical: 0.32,
        embodied: 0.42, meme: 0.24, market: 0.94, uncanny: 0.2,
    },
    meme: {
        sacred: 0.18, prestige: 0.24, distance: 0.36, historical: 0.44,
        embodied: 0.25, meme: 0.94, market: 0.38, uncanny: 0.62,
    },
};

/**
 * Compute the relational aura model.
 *
 * Model origins:
 * - auraVector entries combine context, observer, and history factors with
 *   weights chosen so each fiber peaks under a recognizable cultural condition.
 * - benjaminDistance is the additive "distance" component of Benjamin's aura,
 *   weighted toward ritual and history with reproduction as a subtractive term.
 * - curvature is the sigmoid of an interaction polynomial — pure-additive
 *   weighted sums miss the way scarcity × authority bends perception.
 * - sheafTension measures community disagreement as L1 distance between
 *   attribute pairs that index different interpretive regimes.
 * - holonomy tracks aura accumulated by path: history × authority × scarcity
 *   minus reproduction. Models how relics gain charge by surviving.
 */
export function computeMetrics(s: Params): Metrics {
    const novelty = clamp(0.55 * s.formalDensity + 0.45 * (1 - s.reproductionSaturation));
    const authenticity = clamp(
        0.42 * s.objectSingularity +
        0.31 * s.embodiedTrace +
        0.27 * s.historicalDepth -
        0.35 * s.reproductionSaturation,
    );
    const socialGravity = clamp(
        0.45 * s.institutionalAuthority +
        0.30 * s.marketPressure +
        0.25 * s.observerDesire,
    );
    const benjaminDistance = clamp(
        0.38 * s.ritualDistance +
        0.26 * s.historicalDepth +
        0.20 * s.scarcity +
        0.16 * s.institutionalAuthority -
        0.32 * s.reproductionSaturation,
    );
    const auraIntensity = clamp(
        sigmoid(
            2.7 * authenticity +
            2.1 * benjaminDistance +
            1.2 * novelty +
            1.5 * socialGravity +
            1.1 * s.traumaIndex -
            3.05,
        ),
    );

    const sacred = clamp(
        0.42 * s.ritualDistance +
        0.28 * s.historicalDepth +
        0.18 * s.embodiedTrace +
        0.12 * s.traumaIndex -
        0.18 * s.marketPressure,
    );
    const prestige = clamp(
        0.47 * s.institutionalAuthority +
        0.27 * s.marketPressure +
        0.16 * s.scarcity +
        0.10 * s.formalDensity,
    );
    const distance = benjaminDistance;
    const historical = clamp(
        0.61 * s.historicalDepth + 0.22 * s.traumaIndex + 0.17 * s.embodiedTrace,
    );
    const embodied = clamp(
        0.72 * s.embodiedTrace +
        0.18 * s.objectSingularity +
        0.10 * s.traumaIndex -
        0.16 * s.reproductionSaturation,
    );
    const meme = clamp(
        0.56 * s.reproductionSaturation +
        0.22 * s.observerDesire +
        0.22 * s.observerAlienation -
        0.24 * s.ritualDistance,
    );
    const market = clamp(
        0.63 * s.marketPressure +
        0.22 * s.scarcity +
        0.15 * s.institutionalAuthority,
    );
    const uncanny = clamp(
        0.36 * s.formalDensity +
        0.28 * s.observerAlienation +
        0.20 * (1 - s.embodiedTrace) +
        0.16 * s.reproductionSaturation,
    );

    const auraVector: AuraVector = {
        sacred, prestige, distance, historical, embodied, meme, market, uncanny,
    };

    const interaction =
        1.25 * s.scarcity * s.institutionalAuthority +
        1.15 * s.historicalDepth * s.embodiedTrace +
        1.00 * s.ritualDistance * s.observerTraining +
        0.90 * s.traumaIndex * s.historicalDepth +
        0.65 * s.marketPressure * s.observerDesire -
        1.10 * s.reproductionSaturation * s.objectSingularity;

    const curvature = clamp(sigmoid(2.4 * interaction - 0.55));
    const sheafTension = clamp(
        Math.abs(s.marketPressure - s.traumaIndex) * 0.31 +
        Math.abs(s.institutionalAuthority - s.observerAlienation) * 0.24 +
        Math.abs(s.ritualDistance - s.reproductionSaturation) * 0.25 +
        Math.abs(s.scarcity - s.observerDesire) * 0.20,
    );
    const holonomy = clamp(
        0.22 +
        0.24 * s.historicalDepth +
        0.20 * s.traumaIndex +
        0.19 * s.institutionalAuthority +
        0.15 * s.scarcity -
        0.16 * s.reproductionSaturation,
    );

    const energy = clamp(1 - auraIntensity + 0.32 * sheafTension - 0.22 * curvature);

    const basins: Basin[] = [
        {
            name: 'sacred relic',
            value: clamp(0.45 * sacred + 0.25 * historical + 0.20 * distance + 0.10 * embodied),
        },
        {
            name: 'institutional masterpiece',
            value: clamp(0.44 * prestige + 0.28 * historical + 0.18 * distance + 0.10 * s.formalDensity),
        },
        {
            name: 'luxury aura',
            value: clamp(0.56 * market + 0.22 * distance + 0.22 * prestige),
        },
        {
            name: 'ruin aura',
            value: clamp(0.45 * historical + 0.32 * embodied + 0.23 * s.traumaIndex),
        },
        { name: 'meme aura', value: meme },
        {
            name: 'synthetic novelty',
            value: clamp(0.38 * uncanny + 0.34 * novelty + 0.28 * s.reproductionSaturation),
        },
    ].sort((a, b) => b.value - a.value);

    const transportCosts: TransportCost[] = (
        Object.entries(TRANSPORT_TARGETS) as [TransportCost['key'], AuraVector][]
    ).map(([key, target]) => {
        const sumSq = DIMENSIONS.reduce((acc, d) => {
            const diff = auraVector[d.key] - target[d.key];
            return acc + diff * diff;
        }, 0);
        const cost = Math.sqrt(sumSq / DIMENSIONS.length);
        return {
            key,
            label: key === 'relic' ? 'to relic' : key === 'luxury' ? 'to luxury' : 'to meme relic',
            cost: clamp(cost),
        };
    });

    const interpretation =
        auraIntensity > 0.62
            ? 'High aura: distance, history, scarcity, and authority cohere. The object behaves as a charged relation.'
            : auraIntensity > 0.34
                ? 'Mixed aura: some fibers carry charge, others have collapsed under reproduction or detachment.'
                : 'Low aura: the field is flat. Reproduction or absence of ritual distance dominates.';

    return {
        novelty,
        authenticity,
        benjaminDistance,
        socialGravity,
        auraIntensity,
        auraVector,
        curvature,
        sheafTension,
        holonomy,
        energy,
        basins,
        transportCosts,
        interpretation,
    };
}

/**
 * Plain-language interpretation of the current aura state. Compares the
 * dominant attractor basin and notes friction (sheaf tension) or path
 * accumulation (holonomy) when those exceed the typical regime.
 */
export function computeNarrative(metrics: Metrics, params: Params): string {
    const dominantBasin = metrics.basins[0];
    const secondBasin = metrics.basins[1];
    const parts: string[] = [];

    parts.push(
        `Aura intensity ${(metrics.auraIntensity * 100).toFixed(0)}%, dominated by the ${dominantBasin.name} basin (${(dominantBasin.value * 100).toFixed(0)}%).`,
    );

    if (dominantBasin.value - secondBasin.value < 0.08) {
        parts.push(
            `It is competing closely with the ${secondBasin.name} basin — the object is on a regime boundary.`,
        );
    }

    if (metrics.sheafTension > 0.45) {
        parts.push(
            `Sheaf tension is high (${(metrics.sheafTension * 100).toFixed(0)}%): different communities assign incompatible aura.`,
        );
    }

    if (metrics.holonomy > 0.6) {
        parts.push(
            `Holonomy is large (${(metrics.holonomy * 100).toFixed(0)}%) — much of the aura is path-dependent, accrued through history, crisis, or ritual.`,
        );
    }

    if (metrics.curvature > 0.65) {
        parts.push(
            `Curvature is high — institution, scarcity, and history bend perception strongly around this object.`,
        );
    }

    if (params.reproductionSaturation > 0.8 && metrics.auraIntensity < 0.4) {
        parts.push(
            `Reproduction saturation has flattened the aura field; mechanical reproducibility dissolves the unique presence.`,
        );
    }

    return parts.join(' ');
}

export type SweepableParam = keyof Omit<Params, 'preset'>;

export const PARAM_SPECS: { key: SweepableParam; label: string; group: 'object' | 'context' | 'observer' | 'history' }[] = [
    { key: 'objectSingularity', label: 'singularity', group: 'object' },
    { key: 'formalDensity', label: 'formal density', group: 'object' },
    { key: 'embodiedTrace', label: 'embodied trace', group: 'object' },
    { key: 'reproductionSaturation', label: 'reproduction', group: 'object' },
    { key: 'ritualDistance', label: 'ritual distance', group: 'context' },
    { key: 'institutionalAuthority', label: 'institution', group: 'context' },
    { key: 'scarcity', label: 'scarcity', group: 'context' },
    { key: 'marketPressure', label: 'market', group: 'context' },
    { key: 'observerTraining', label: 'training', group: 'observer' },
    { key: 'observerDesire', label: 'desire', group: 'observer' },
    { key: 'observerAlienation', label: 'alienation', group: 'observer' },
    { key: 'historicalDepth', label: 'historical depth', group: 'history' },
    { key: 'traumaIndex', label: 'trauma', group: 'history' },
];

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map((spec) => {
        const atLow = computeMetrics({ ...params, [spec.key]: 0 }).auraIntensity;
        const atHigh = computeMetrics({ ...params, [spec.key]: 1 }).auraIntensity;
        return {
            label: spec.label,
            low: Math.min(atLow, atHigh),
            high: Math.max(atLow, atHigh),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}

export interface SweepDatum {
    sweepValue: number;
    auraIntensity: number;
    curvature: number;
    sheafTension: number;
    holonomy: number;
}

export function computeSweep(params: Params, sweepKey: SweepableParam): SweepDatum[] {
    const data: SweepDatum[] = [];
    const steps = 41;
    for (let i = 0; i < steps; i++) {
        const v = i / (steps - 1);
        const m = computeMetrics({ ...params, [sweepKey]: v });
        data.push({
            sweepValue: v,
            auraIntensity: m.auraIntensity,
            curvature: m.curvature,
            sheafTension: m.sheafTension,
            holonomy: m.holonomy,
        });
    }
    return data;
}

export interface PathStage {
    stage: string;
    aura: number;
}

/**
 * Holonomy path: the same object moving through five contexts and returning.
 * Aura at each stage is a stage-specific reweighting of the params, then
 * post-multiplied by accumulated holonomy at the return.
 */
export function computeHolonomyPath(params: Params, metrics: Metrics): PathStage[] {
    return [
        {
            stage: 'studio',
            aura: clamp(0.20 + 0.25 * params.embodiedTrace + 0.18 * params.formalDensity),
        },
        {
            stage: 'market',
            aura: clamp(0.18 + 0.32 * params.marketPressure + 0.18 * params.scarcity),
        },
        {
            stage: 'archive',
            aura: clamp(
                0.22 + 0.35 * params.historicalDepth + 0.22 * params.institutionalAuthority,
            ),
        },
        {
            stage: 'crisis',
            aura: clamp(0.16 + 0.48 * params.traumaIndex + 0.20 * params.historicalDepth),
        },
        {
            stage: 'return',
            aura: clamp(
                metrics.auraIntensity +
                0.12 * metrics.holonomy -
                0.06 * params.reproductionSaturation,
            ),
        },
    ];
}

export interface EnergyPoint {
    x: number;
    y: number;
    z: number;
    size: number;
}

/**
 * Energy field over (historicalDepth, ritualDistance) at the current params.
 * Three Gaussian wells anchor the relic, meme, and luxury attractors. The
 * current point also pulls a local well so the user can see their position.
 */
export function computeEnergyField(params: Params, metrics: Metrics): EnergyPoint[] {
    const out: EnergyPoint[] = [];
    const N = 18;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            const x = i / (N - 1);
            const y = j / (N - 1);
            const relicWell = Math.exp(
                -22 * (Math.pow(x - 0.82, 2) + Math.pow(y - 0.78, 2)),
            );
            const memeWell = Math.exp(
                -20 * (Math.pow(x - 0.25, 2) + Math.pow(y - 0.23, 2)),
            );
            const luxuryWell = Math.exp(
                -18 * (Math.pow(x - 0.71, 2) + Math.pow(y - 0.31, 2)),
            );
            const pointPull = Math.exp(
                -28 *
                (Math.pow(x - params.historicalDepth, 2) +
                    Math.pow(y - params.ritualDistance, 2)),
            );
            const z = clamp(
                0.95 -
                0.38 * relicWell -
                0.28 * memeWell -
                0.31 * luxuryWell -
                0.40 * pointPull +
                0.18 * metrics.sheafTension,
            );
            out.push({ x, y, z, size: 16 + 90 * (1 - z) });
        }
    }
    return out;
}
