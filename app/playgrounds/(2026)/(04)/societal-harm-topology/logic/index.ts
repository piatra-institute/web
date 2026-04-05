/**
 * Societal Harm Topology — Core Logic
 *
 * Mathematical framework for quantifying distributed societal harm
 * from concentrated private power, following:
 *
 *   dynamic SCMs + multilayer networks + capability harm vectors
 *   + Shapley attribution + sheaf/cosheaf local-to-global consistency
 *   + ordered algebra for noncommensurable harms
 *
 * The core object is a *counterfactual harm vector*, not a scalar.
 * A scalar index is derived last, after vector aggregation,
 * repair adjustment, temporal weighting, and obstruction correction.
 */


// ─── Harm Dimensions ────────────────────────────────────────────────
// 8-dimensional harm state vector following the capability approach

export interface HarmDimension {
    key: string;
    label: string;
    symbol: string;
    description: string;
    futureSensitive: boolean; // gets extra futureWeight multiplier
}

export const DIMENSIONS: HarmDimension[] = [
    { key: 'life', label: 'Life-years', symbol: 'L', description: 'excess mortality, reduced life expectancy', futureSensitive: false },
    { key: 'health', label: 'Health', symbol: 'Q', description: 'disease burden, mental health, disability-adjusted life', futureSensitive: false },
    { key: 'material', label: 'Material', symbol: 'M', description: 'extraction, deprivation, involuntary wealth transfers', futureSensitive: false },
    { key: 'agency', label: 'Agency', symbol: 'A', description: 'freedom of action, autonomy, meaningful choice', futureSensitive: false },
    { key: 'political', label: 'Political voice', symbol: 'P', description: 'institutional influence, democratic participation', futureSensitive: true },
    { key: 'ecological', label: 'Ecological', symbol: 'E', description: 'environmental damage, biodiversity, pollution exposure', futureSensitive: true },
    { key: 'epistemic', label: 'Epistemic', symbol: 'I', description: 'information quality, manipulation, belief distortion', futureSensitive: false },
    { key: 'tail', label: 'Tail risk', symbol: 'T', description: 'catastrophic, systemic, or irreversible risk imposed on society', futureSensitive: true },
];

export type DimensionKey = 'life' | 'health' | 'material' | 'agency' | 'political' | 'ecological' | 'epistemic' | 'tail';

export type HarmVector = Record<DimensionKey, number>;


// ─── Sectors (Local Contexts) ───────────────────────────────────────
// The "cover" of overlapping social domains

export interface Sector {
    id: string;
    name: string;
    population: number;   // % of population affected (0–100)
    centrality: number;   // network centrality of actor in this sector (0–100)
    leverage: number;     // institutional leverage / control (0–100)
    benefit: number;      // claimed local benefit (0–100)
    uncertainty: number;  // epistemic uncertainty of harm estimate (0–100)
    gluing: number;       // compatibility with neighboring sectors (0–100)
    harms: HarmVector;    // raw harm intensities per dimension (0–100)
}


// ─── Parameters ─────────────────────────────────────────────────────

export interface Params {
    preset: PresetKey;
    actorPower: number;       // 0–100: concentration of power
    discount: number;         // 0.5–1.0: temporal discount factor β
    futureWeight: number;     // 0.5–2.0: weight on intergenerational harms
    repairCapacity: number;   // 0–100: societal counter-power / regulation
    moralWeights: HarmVector; // per-dimension ethical weights (0.2–2.0)
    sectors: Sector[];
    selectedSector: string;
}


// ─── Presets ────────────────────────────────────────────────────────

export type PresetKey = 'baseline' | 'platform-monopoly' | 'extractive-finance' | 'fossil-incumbent';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'baseline': {
        label: 'baseline',
        question: 'What does moderate, balanced concentration of power look like?',
        expectation: 'Harm distributed across sectors with no single dominant dimension. Sheaf consistency is relatively high — the local stories roughly cohere.',
    },
    'platform-monopoly': {
        label: 'platform monopoly',
        question: 'What happens when epistemic and political control concentrate in a platform actor?',
        expectation: 'Epistemic harm dominates. Political voice is suppressed. Low sheaf consistency — the media narrative diverges sharply from labor and ecological realities.',
    },
    'extractive-finance': {
        label: 'extractive finance',
        question: 'What does financialized extraction across labor and housing look like?',
        expectation: 'Material and agency harms dominate. Housing and labor sectors carry the heaviest burden. High tail risk from systemic fragility.',
    },
    'fossil-incumbent': {
        label: 'fossil incumbent',
        question: 'What is the harm profile of a major fossil-fuel actor with political capture?',
        expectation: 'Ecological and health harms dominate. Tail risk is extreme. Political capture enables persistent damage despite known consequences.',
    },
};

const DEFAULT_MORAL_WEIGHTS: HarmVector = {
    life: 1.60,
    health: 1.25,
    material: 1.00,
    agency: 1.10,
    political: 1.15,
    ecological: 1.20,
    epistemic: 0.90,
    tail: 1.45,
};

const DEFAULT_SECTORS: Sector[] = [
    {
        id: 'labor', name: 'Labor markets',
        population: 70, centrality: 68, leverage: 72, benefit: 18, uncertainty: 24, gluing: 78,
        harms: { life: 18, health: 44, material: 82, agency: 58, political: 35, ecological: 18, epistemic: 12, tail: 28 },
    },
    {
        id: 'housing', name: 'Housing markets',
        population: 66, centrality: 74, leverage: 71, benefit: 12, uncertainty: 20, gluing: 76,
        harms: { life: 22, health: 36, material: 76, agency: 61, political: 22, ecological: 24, epistemic: 10, tail: 30 },
    },
    {
        id: 'politics', name: 'Political system',
        population: 88, centrality: 83, leverage: 86, benefit: 10, uncertainty: 29, gluing: 68,
        harms: { life: 10, health: 15, material: 39, agency: 82, political: 94, ecological: 16, epistemic: 41, tail: 64 },
    },
    {
        id: 'media', name: 'Media / platforms',
        population: 91, centrality: 86, leverage: 67, benefit: 24, uncertainty: 34, gluing: 58,
        harms: { life: 6, health: 12, material: 24, agency: 56, political: 50, ecological: 8, epistemic: 96, tail: 42 },
    },
    {
        id: 'environment', name: 'Environment',
        population: 95, centrality: 79, leverage: 74, benefit: 8, uncertainty: 38, gluing: 72,
        harms: { life: 52, health: 76, material: 26, agency: 20, political: 12, ecological: 100, epistemic: 6, tail: 82 },
    },
    {
        id: 'supply', name: 'Supply chains',
        population: 74, centrality: 81, leverage: 78, benefit: 16, uncertainty: 31, gluing: 63,
        harms: { life: 26, health: 43, material: 58, agency: 47, political: 17, ecological: 34, epistemic: 8, tail: 46 },
    },
];

export const DEFAULT_PARAMS: Params = {
    preset: 'baseline',
    actorPower: 72,
    discount: 0.92,
    futureWeight: 1.15,
    repairCapacity: 22,
    moralWeights: { ...DEFAULT_MORAL_WEIGHTS },
    sectors: DEFAULT_SECTORS.map(s => ({ ...s, harms: { ...s.harms } })),
    selectedSector: 'labor',
};

export function presetParams(key: PresetKey): Params {
    const base = {
        ...DEFAULT_PARAMS,
        preset: key,
        moralWeights: { ...DEFAULT_MORAL_WEIGHTS },
        sectors: DEFAULT_SECTORS.map(s => ({ ...s, harms: { ...s.harms } })),
    };

    switch (key) {
        case 'baseline':
            return base;

        case 'platform-monopoly':
            return {
                ...base,
                actorPower: 88,
                repairCapacity: 14,
                sectors: base.sectors.map(s => {
                    if (s.id === 'media') return { ...s, centrality: 95, leverage: 91, harms: { ...s.harms, epistemic: 98, political: 72, agency: 74 } };
                    if (s.id === 'politics') return { ...s, harms: { ...s.harms, epistemic: 68, political: 88 } };
                    return s;
                }),
            };

        case 'extractive-finance':
            return {
                ...base,
                actorPower: 82,
                repairCapacity: 16,
                futureWeight: 1.30,
                sectors: base.sectors.map(s => {
                    if (s.id === 'labor') return { ...s, leverage: 88, harms: { ...s.harms, material: 92, agency: 74, tail: 48 } };
                    if (s.id === 'housing') return { ...s, leverage: 86, harms: { ...s.harms, material: 90, agency: 72, tail: 52 } };
                    if (s.id === 'supply') return { ...s, harms: { ...s.harms, material: 76, agency: 62 } };
                    return s;
                }),
            };

        case 'fossil-incumbent':
            return {
                ...base,
                actorPower: 78,
                repairCapacity: 12,
                futureWeight: 1.50,
                sectors: base.sectors.map(s => {
                    if (s.id === 'environment') return { ...s, centrality: 92, leverage: 88, harms: { ...s.harms, ecological: 100, health: 88, tail: 94, life: 62 } };
                    if (s.id === 'politics') return { ...s, harms: { ...s.harms, political: 92, ecological: 42, epistemic: 56 } };
                    if (s.id === 'supply') return { ...s, harms: { ...s.harms, ecological: 64, health: 58, tail: 62 } };
                    return s;
                }),
            };
    }
}


// ─── Metrics ────────────────────────────────────────────────────────

export interface LocalMetrics {
    id: string;
    name: string;
    exposure: number;
    dimensionScores: HarmVector;
    gross: number;
    benefitOffset: number;
    net: number;
}

export interface Metrics {
    local: LocalMetrics[];
    globalVector: HarmVector;
    grossTotal: number;
    netTotal: number;
    repair: number;
    fragility: number;
    sheafConsistency: number;
    obstruction: number;
    scalarIndex: number;
    dominantSector: { name: string; net: number };
    dominantDimension: { label: string; value: number };
}

/**
 * Cosine similarity between two harm vectors.
 * Used to measure structural coherence between sector profiles.
 */
function cosineSimilarity(a: HarmVector, b: HarmVector): number {
    const keys = DIMENSIONS.map(d => d.key as DimensionKey);
    let dot = 0, na = 0, nb = 0;
    for (const k of keys) {
        dot += a[k] * b[k];
        na += a[k] * a[k];
        nb += b[k] * b[k];
    }
    if (na === 0 || nb === 0) return 0;
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * L2 norm of a harm vector (harm magnitude).
 */
function vectorNorm(v: HarmVector): number {
    let sum = 0;
    for (const d of DIMENSIONS) {
        const val = v[d.key as DimensionKey];
        sum += val * val;
    }
    return Math.sqrt(sum);
}

/**
 * Core computation: from parameters to all derived metrics.
 *
 * The pipeline:
 *   1. For each sector, compute local harm vector scaled by exposure, weights, power
 *   2. Aggregate to global harm vector
 *   3. Compute gross/net harm with benefit offsets and repair
 *   4. Compute sheaf consistency via pairwise cosine similarity
 *   5. Compute fragility from tail, ecological, and governance mass
 *   6. Derive scalar index last
 */
export function computeMetrics(params: Params): Metrics {
    const { sectors, moralWeights, actorPower, futureWeight, repairCapacity, discount } = params;

    // 1. Local harm computation
    const local: LocalMetrics[] = sectors.map(sector => {
        // Exposure: how much of society this actor can reach through this sector
        const exposure = (sector.population / 100) * (sector.centrality / 100) * (sector.leverage / 100);

        // Uncertainty attenuates harm estimate (we are less sure of the damage)
        const uncertaintyPenalty = 1 - sector.uncertainty / 250;

        // Gluing compatibility affects how strongly local harm propagates globally
        const gluingFactor = 0.6 + sector.gluing / 250;

        // Actor power scales all harms
        const powerFactor = 0.55 + actorPower / 100;

        const dimensionScores = {} as HarmVector;
        for (const d of DIMENSIONS) {
            const k = d.key as DimensionKey;
            const base = sector.harms[k] * moralWeights[k];
            let scaled = base * exposure * uncertaintyPenalty * gluingFactor * powerFactor;
            // Future-sensitive dimensions get extra weight
            if (d.futureSensitive) scaled *= futureWeight;
            dimensionScores[k] = scaled;
        }

        const gross = Object.values(dimensionScores).reduce((a, b) => a + b, 0);
        const benefitOffset = gross * (sector.benefit / 100) * 0.45;
        const net = Math.max(0, gross - benefitOffset);

        return {
            id: sector.id,
            name: sector.name,
            exposure,
            dimensionScores,
            gross,
            benefitOffset,
            net,
        };
    });

    // 2. Global harm vector (sum of local vectors)
    const globalVector = {} as HarmVector;
    for (const d of DIMENSIONS) {
        const k = d.key as DimensionKey;
        globalVector[k] = local.reduce((sum, s) => sum + s.dimensionScores[k], 0);
    }

    // 3. Gross and net totals
    const grossTotal = local.reduce((sum, s) => sum + s.gross, 0);
    const netTotalRaw = local.reduce((sum, s) => sum + s.net, 0);
    const repair = netTotalRaw * (repairCapacity / 100) * 0.55;
    const netTotal = Math.max(0, netTotalRaw - repair);

    // 4. Sheaf consistency: pairwise cosine similarity of sector harm profiles
    let pairCount = 0;
    let similaritySum = 0;
    for (let i = 0; i < local.length; i++) {
        for (let j = i + 1; j < local.length; j++) {
            pairCount++;
            similaritySum += cosineSimilarity(local[i].dimensionScores, local[j].dimensionScores);
        }
    }
    const structuralCoherence = pairCount ? (similaritySum / pairCount + 1) / 2 : 1;
    const declaredGluing = local.reduce((sum, s) => {
        const sector = sectors.find(sec => sec.id === s.id);
        return sum + (sector?.gluing ?? 0);
    }, 0) / (sectors.length * 100);
    const sheafConsistency = 100 * (0.55 * structuralCoherence + 0.45 * declaredGluing);
    const obstruction = 100 - sheafConsistency;

    // 5. Fragility: weighted combination of tail risk, ecological, governance vulnerability
    const tailMass = globalVector.tail;
    const ecologicalMass = globalVector.ecological;
    const governanceMass = globalVector.political + globalVector.agency + globalVector.epistemic;
    const fragility =
        0.40 * tailMass +
        0.25 * ecologicalMass +
        0.20 * governanceMass +
        0.15 * (netTotal / Math.max(1, sectors.length));

    // 6. Scalar index: derived last, after all vector analysis
    const scalarIndex = netTotal * (discount * 0.5 + futureWeight * 0.3 + (1 + obstruction / 100) * 0.2);

    // Dominants
    const dominantSector = [...local].sort((a, b) => b.net - a.net)[0];
    const dimValues = DIMENSIONS.map(d => ({
        label: d.label,
        value: globalVector[d.key as DimensionKey],
    }));
    const dominantDimension = [...dimValues].sort((a, b) => b.value - a.value)[0];

    return {
        local,
        globalVector,
        grossTotal,
        netTotal,
        repair,
        fragility,
        sheafConsistency,
        obstruction,
        scalarIndex,
        dominantSector: { name: dominantSector.name, net: dominantSector.net },
        dominantDimension,
    };
}


// ─── Sheaf Consistency Matrix ───────────────────────────────────────

export interface SheafCell {
    sectorId: string;
    sectorName: string;
    dimensionKey: DimensionKey;
    dimensionLabel: string;
    value: number;         // sector's share of global dimension mass (0–100)
    rawScore: number;      // absolute local score
}

export function computeSheafMatrix(metrics: Metrics): SheafCell[] {
    const cells: SheafCell[] = [];
    for (const sector of metrics.local) {
        for (const d of DIMENSIONS) {
            const k = d.key as DimensionKey;
            const globalVal = metrics.globalVector[k];
            const share = globalVal > 0
                ? Math.min(100, (sector.dimensionScores[k] / globalVal) * 100)
                : 0;
            cells.push({
                sectorId: sector.id,
                sectorName: sector.name,
                dimensionKey: k,
                dimensionLabel: d.label,
                value: share,
                rawScore: sector.dimensionScores[k],
            });
        }
    }
    return cells;
}


// ─── Pairwise Sector Coherence ──────────────────────────────────────

export interface SectorPair {
    sectorA: string;
    sectorB: string;
    similarity: number;   // cosine similarity [-1, 1]
    compatible: boolean;  // similarity > 0.7
}

export function computeSectorPairs(metrics: Metrics): SectorPair[] {
    const pairs: SectorPair[] = [];
    for (let i = 0; i < metrics.local.length; i++) {
        for (let j = i + 1; j < metrics.local.length; j++) {
            const sim = cosineSimilarity(
                metrics.local[i].dimensionScores,
                metrics.local[j].dimensionScores,
            );
            pairs.push({
                sectorA: metrics.local[i].name,
                sectorB: metrics.local[j].name,
                similarity: sim,
                compatible: sim > 0.7,
            });
        }
    }
    return pairs.sort((a, b) => a.similarity - b.similarity);
}


// ─── Narrative ──────────────────────────────────────────────────────

export function computeNarrative(metrics: Metrics, params: Params): string {
    const { dominantSector, dominantDimension, obstruction, fragility, netTotal, grossTotal } = metrics;
    const parts: string[] = [];

    // Overall intensity
    const intensity = netTotal / Math.max(1, params.sectors.length);
    if (intensity < 40) {
        parts.push('Harm levels are moderate across the system.');
    } else if (intensity < 80) {
        parts.push('Significant harm accumulates across sectors.');
    } else {
        parts.push('The system shows severe, concentrated harm.');
    }

    // Dominant sector
    parts.push(`The heaviest burden falls on ${dominantSector.name.toLowerCase()} (net ${dominantSector.net.toFixed(0)}).`);

    // Dominant dimension
    parts.push(`${dominantDimension.label} is the most concentrated harm type (${dominantDimension.value.toFixed(0)}).`);

    // Sheaf obstruction
    if (obstruction > 35) {
        parts.push(`Local narratives are significantly incoherent (obstruction ${obstruction.toFixed(0)}%) — accountability structures are fragmented.`);
    } else if (obstruction > 20) {
        parts.push(`Moderate obstruction (${obstruction.toFixed(0)}%) — some local stories resist global narration.`);
    } else {
        parts.push(`Local sectors are relatively coherent (obstruction ${obstruction.toFixed(0)}%).`);
    }

    // Benefit ratio
    const benefitRatio = grossTotal > 0 ? (grossTotal - netTotal) / grossTotal : 0;
    if (benefitRatio > 0.3) {
        parts.push(`Claimed benefits offset ${(benefitRatio * 100).toFixed(0)}% of gross harm — but this does not erase the underlying vector geometry.`);
    }

    // Fragility warning
    if (fragility > 200) {
        parts.push('Warning: systemic fragility is critically high — tail risk and ecological damage are accumulating beyond repair capacity.');
    } else if (fragility > 120) {
        parts.push('Fragility is elevated. Tail risk and ecological exposure exceed comfortable margins.');
    }

    return parts.join(' ');
}


// ─── Sensitivity Analysis ───────────────────────────────────────────

export type SweepableParam = 'actorPower' | 'discount' | 'futureWeight' | 'repairCapacity';

export const PARAM_SPECS: { key: SweepableParam; label: string; min: number; max: number }[] = [
    { key: 'actorPower', label: 'actor power', min: 0, max: 100 },
    { key: 'discount', label: 'discount β', min: 0.5, max: 1.0 },
    { key: 'futureWeight', label: 'future weight', min: 0.5, max: 2.0 },
    { key: 'repairCapacity', label: 'repair capacity', min: 0, max: 100 },
];

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

/**
 * Compute sensitivity: sweep each parameter min→max,
 * hold others constant, measure scalarIndex range.
 */
export function computeSensitivity(params: Params): SensitivityBar[] {
    return PARAM_SPECS.map(spec => {
        const lowMetrics = computeMetrics({ ...params, [spec.key]: spec.min });
        const highMetrics = computeMetrics({ ...params, [spec.key]: spec.max });
        return {
            label: spec.label,
            low: lowMetrics.scalarIndex,
            high: highMetrics.scalarIndex,
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}


// ─── Sweep ──────────────────────────────────────────────────────────

export interface SweepDatum {
    sweepValue: number;
    scalarIndex: number;
    netTotal: number;
    fragility: number;
    obstruction: number;
}

export function computeSweep(params: Params, sweepKey: SweepableParam): SweepDatum[] {
    const spec = PARAM_SPECS.find(s => s.key === sweepKey)!;
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 50; i++) {
        const v = spec.min + (spec.max - spec.min) * (i / 50);
        const m = computeMetrics({ ...params, [sweepKey]: v });
        data.push({
            sweepValue: Number(v.toFixed(4)),
            scalarIndex: m.scalarIndex,
            netTotal: m.netTotal,
            fragility: m.fragility,
            obstruction: m.obstruction,
        });
    }
    return data;
}


// ─── Snapshot ───────────────────────────────────────────────────────

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    label: string;
}


// ─── Animation ──────────────────────────────────────────────────────

export const ANIMATION_TOTAL_FRAMES = 70;

export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Interpolate between two harm vectors at time t ∈ [0,1].
 * Used for animating transitions when parameters change.
 */
export function interpolateHarmVector(a: HarmVector, b: HarmVector, t: number): HarmVector {
    const result = {} as HarmVector;
    for (const d of DIMENSIONS) {
        const k = d.key as DimensionKey;
        result[k] = a[k] + (b[k] - a[k]) * t;
    }
    return result;
}

/**
 * Global vector magnitude for display (L1 norm normalized).
 */
export function vectorMagnitude(v: HarmVector): number {
    return Object.values(v).reduce((a, b) => a + b, 0);
}

/**
 * Gini coefficient of the harm vector — measures how concentrated
 * harm is across dimensions (0 = perfectly spread, 1 = all in one).
 */
export function vectorGini(v: HarmVector): number {
    const values = Object.values(v).sort((a, b) => a - b);
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    if (mean === 0) return 0;
    let sumDiffs = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            sumDiffs += Math.abs(values[i] - values[j]);
        }
    }
    return sumDiffs / (2 * n * n * mean);
}
