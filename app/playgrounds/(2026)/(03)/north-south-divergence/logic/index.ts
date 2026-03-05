// ---------- Types ----------

export type RegionKey = 'north' | 'south';

export type Accelerant = {
    id: string;
    label: string;
    short: string;
    description: string;
    defaultWeight: number;
};

export type TimeBin = {
    id: string;
    label: string;
    yearStart: number; // negative = BCE
    yearEnd: number;
    notes?: string;
    values: Record<RegionKey, Record<string, number>>;
};

export type ModelKind = 'additive' | 'multiplicative' | 'ces';
export type GapMode = 'difference' | 'ratio';

export interface ModelConfig {
    kind: ModelKind;
    cesRho: number;
    gapMode: GapMode;
}

export interface Scenario {
    northLabel: string;
    southLabel: string;
    model: ModelConfig;
    weights: Record<string, number>;
    accelerants: Accelerant[];
    timeline: TimeBin[];
    lockWeightSum: boolean;
    shapleySamples: number;
    selectedBinId: string;
}

// ---------- Default accelerants ----------

export const DEFAULT_ACCELERANTS: Accelerant[] = [
    {
        id: 'energy',
        label: 'Energy throughput',
        short: 'Energy',
        description: 'Scalable energy: biomass, coal, oil/gas, electrification.',
        defaultWeight: 0.16,
    },
    {
        id: 'institutions',
        label: 'Institutions & property rights',
        short: 'Inst.',
        description: 'Rule of law, credible commitment, contract enforcement.',
        defaultWeight: 0.14,
    },
    {
        id: 'state',
        label: 'State capacity',
        short: 'State',
        description: 'Tax capacity, administration, infrastructure, public goods.',
        defaultWeight: 0.11,
    },
    {
        id: 'human',
        label: 'Human capital',
        short: 'Human',
        description: 'Education, literacy, health, skills, technology absorption.',
        defaultWeight: 0.12,
    },
    {
        id: 'knowledge',
        label: 'Knowledge & innovation',
        short: 'Innov.',
        description: 'Scientific ecosystems, diffusion channels, R&D.',
        defaultWeight: 0.12,
    },
    {
        id: 'finance',
        label: 'Finance & capital markets',
        short: 'Finance',
        description: 'Financial intermediation, risk-sharing, cost of capital.',
        defaultWeight: 0.09,
    },
    {
        id: 'trade',
        label: 'Trade & value-chain power',
        short: 'Trade',
        description: 'Terms-of-trade, bargaining power, value-added control.',
        defaultWeight: 0.08,
    },
    {
        id: 'extraction',
        label: 'Coercion, empire & extraction',
        short: 'Empire',
        description: 'Coerced labor, colonial extraction, unequal exchange.',
        defaultWeight: 0.10,
    },
    {
        id: 'geography',
        label: 'Geography & disease',
        short: 'Geo.',
        description: 'Endowments, waterways, disease burdens, transport costs.',
        defaultWeight: 0.08,
    },
];

// ---------- Default timeline ----------

export const DEFAULT_TIMELINE: TimeBin[] = [
    {
        id: 'ancient',
        label: 'Early agrarian states',
        yearStart: -10000,
        yearEnd: 1,
        notes: 'Highly uncertain. Broad hypotheses rather than precise data.',
        values: {
            north: { energy: 0.25, institutions: 0.25, state: 0.22, human: 0.18, knowledge: 0.18, finance: 0.12, trade: 0.16, extraction: 0.10, geography: 0.22 },
            south: { energy: 0.25, institutions: 0.25, state: 0.22, human: 0.18, knowledge: 0.18, finance: 0.12, trade: 0.16, extraction: 0.10, geography: 0.22 },
        },
    },
    {
        id: 'medieval',
        label: 'Post-classical',
        yearStart: 1,
        yearEnd: 1000,
        values: {
            north: { energy: 0.28, institutions: 0.27, state: 0.25, human: 0.20, knowledge: 0.20, finance: 0.14, trade: 0.18, extraction: 0.12, geography: 0.24 },
            south: { energy: 0.30, institutions: 0.28, state: 0.26, human: 0.20, knowledge: 0.21, finance: 0.14, trade: 0.20, extraction: 0.12, geography: 0.26 },
        },
    },
    {
        id: 'late_medieval',
        label: 'High/Late medieval',
        yearStart: 1000,
        yearEnd: 1500,
        values: {
            north: { energy: 0.30, institutions: 0.30, state: 0.28, human: 0.23, knowledge: 0.24, finance: 0.18, trade: 0.22, extraction: 0.14, geography: 0.26 },
            south: { energy: 0.33, institutions: 0.30, state: 0.30, human: 0.24, knowledge: 0.25, finance: 0.18, trade: 0.25, extraction: 0.15, geography: 0.28 },
        },
    },
    {
        id: 'early_modern',
        label: 'Early modern',
        yearStart: 1500,
        yearEnd: 1750,
        values: {
            north: { energy: 0.40, institutions: 0.40, state: 0.38, human: 0.30, knowledge: 0.32, finance: 0.30, trade: 0.40, extraction: 0.45, geography: 0.30 },
            south: { energy: 0.38, institutions: 0.30, state: 0.30, human: 0.26, knowledge: 0.28, finance: 0.22, trade: 0.28, extraction: 0.20, geography: 0.30 },
        },
    },
    {
        id: 'ir1',
        label: 'Industrial takeoff',
        yearStart: 1750,
        yearEnd: 1850,
        values: {
            north: { energy: 0.70, institutions: 0.55, state: 0.52, human: 0.42, knowledge: 0.50, finance: 0.45, trade: 0.55, extraction: 0.55, geography: 0.36 },
            south: { energy: 0.35, institutions: 0.25, state: 0.28, human: 0.28, knowledge: 0.25, finance: 0.20, trade: 0.22, extraction: 0.10, geography: 0.30 },
        },
    },
    {
        id: 'ir2',
        label: 'Second industrial rev.',
        yearStart: 1850,
        yearEnd: 1913,
        values: {
            north: { energy: 0.82, institutions: 0.62, state: 0.60, human: 0.55, knowledge: 0.62, finance: 0.60, trade: 0.62, extraction: 0.62, geography: 0.40 },
            south: { energy: 0.40, institutions: 0.22, state: 0.30, human: 0.30, knowledge: 0.24, finance: 0.22, trade: 0.25, extraction: 0.10, geography: 0.30 },
        },
    },
    {
        id: 'wars',
        label: 'World wars',
        yearStart: 1913,
        yearEnd: 1950,
        values: {
            north: { energy: 0.75, institutions: 0.55, state: 0.68, human: 0.58, knowledge: 0.62, finance: 0.52, trade: 0.45, extraction: 0.55, geography: 0.40 },
            south: { energy: 0.42, institutions: 0.25, state: 0.35, human: 0.32, knowledge: 0.28, finance: 0.22, trade: 0.28, extraction: 0.15, geography: 0.30 },
        },
    },
    {
        id: 'postwar',
        label: 'Postwar growth',
        yearStart: 1950,
        yearEnd: 1980,
        values: {
            north: { energy: 0.85, institutions: 0.65, state: 0.72, human: 0.70, knowledge: 0.72, finance: 0.68, trade: 0.62, extraction: 0.45, geography: 0.44 },
            south: { energy: 0.55, institutions: 0.35, state: 0.42, human: 0.45, knowledge: 0.38, finance: 0.30, trade: 0.40, extraction: 0.18, geography: 0.33 },
        },
    },
    {
        id: 'globalization',
        label: 'Hyper-globalization',
        yearStart: 1980,
        yearEnd: 2008,
        values: {
            north: { energy: 0.82, institutions: 0.70, state: 0.70, human: 0.78, knowledge: 0.80, finance: 0.82, trade: 0.75, extraction: 0.32, geography: 0.46 },
            south: { energy: 0.65, institutions: 0.45, state: 0.48, human: 0.55, knowledge: 0.50, finance: 0.42, trade: 0.55, extraction: 0.20, geography: 0.36 },
        },
    },
    {
        id: 'present',
        label: 'Post-2008 multipolar',
        yearStart: 2008,
        yearEnd: 2025,
        values: {
            north: { energy: 0.78, institutions: 0.72, state: 0.72, human: 0.82, knowledge: 0.86, finance: 0.80, trade: 0.72, extraction: 0.22, geography: 0.48 },
            south: { energy: 0.70, institutions: 0.50, state: 0.55, human: 0.62, knowledge: 0.60, finance: 0.52, trade: 0.62, extraction: 0.18, geography: 0.40 },
        },
    },
];

// ---------- Default scenario ----------

export const DEFAULT_SCENARIO: Scenario = {
    northLabel: 'Global North',
    southLabel: 'Global South',
    model: {
        kind: 'ces',
        cesRho: 0.25,
        gapMode: 'difference',
    },
    weights: Object.fromEntries(DEFAULT_ACCELERANTS.map((a) => [a.id, a.defaultWeight])),
    accelerants: DEFAULT_ACCELERANTS,
    timeline: DEFAULT_TIMELINE,
    lockWeightSum: true,
    shapleySamples: 200,
    selectedBinId: 'ir1',
};

// ---------- Utilities ----------

export function clamp01(x: number): number {
    if (Number.isNaN(x)) return 0;
    return Math.max(0, Math.min(1, x));
}

export function normalizeWeights(weights: Record<string, number>): Record<string, number> {
    const entries = Object.entries(weights);
    const sum = entries.reduce((acc, [, v]) => acc + (Number.isFinite(v) ? Math.max(0, v) : 0), 0);
    if (sum <= 0) {
        const n = entries.length || 1;
        return Object.fromEntries(entries.map(([k]) => [k, 1 / n]));
    }
    return Object.fromEntries(entries.map(([k, v]) => [k, Math.max(0, v) / sum]));
}

export function formatYear(y: number): string {
    if (y < 0) return `${Math.abs(y)} BCE`;
    return `${y} CE`;
}

// ---------- Aggregator ----------

export function scoreRegion(
    kind: ModelKind,
    values: Record<string, number>,
    weights: Record<string, number>,
    cesRho: number,
): number {
    const w = normalizeWeights(weights);
    const keys = Object.keys(w);
    const xs = keys.map((k) => clamp01(values[k] ?? 0));
    const ws = keys.map((k) => w[k]);

    if (kind === 'additive') {
        let s = 0;
        for (let i = 0; i < xs.length; i++) s += ws[i] * xs[i];
        return s;
    }

    if (kind === 'multiplicative') {
        let logSum = 0;
        for (let i = 0; i < xs.length; i++) {
            logSum += ws[i] * Math.log(Math.max(1e-6, xs[i]));
        }
        return Math.exp(logSum);
    }

    // CES
    const rho = cesRho;
    if (Math.abs(rho) < 1e-6) {
        let logSum = 0;
        for (let i = 0; i < xs.length; i++) {
            logSum += ws[i] * Math.log(Math.max(1e-6, xs[i]));
        }
        return Math.exp(logSum);
    }
    let inner = 0;
    for (let i = 0; i < xs.length; i++) {
        inner += ws[i] * Math.pow(Math.max(1e-6, xs[i]), rho);
    }
    return Math.pow(Math.max(1e-12, inner), 1 / rho);
}

export function gapScore(
    model: ModelConfig,
    bin: TimeBin,
    weights: Record<string, number>,
    overrides?: {
        valuesNorth?: Record<string, number>;
        valuesSouth?: Record<string, number>;
    },
): number {
    const northVals = overrides?.valuesNorth ?? bin.values.north;
    const southVals = overrides?.valuesSouth ?? bin.values.south;
    const sn = scoreRegion(model.kind, northVals, weights, model.cesRho);
    const ss = scoreRegion(model.kind, southVals, weights, model.cesRho);

    if (model.gapMode === 'ratio') {
        return sn / Math.max(1e-6, ss);
    }
    return sn - ss;
}

// ---------- Deterministic RNG ----------

function hashString(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed: number): () => number {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ---------- Shapley attribution ----------

export interface ShapleyResult {
    id: string;
    label: string;
    contribution: number;
}

export function shapleyAttribution(
    model: ModelConfig,
    accelerants: Accelerant[],
    bin: TimeBin,
    weights: Record<string, number>,
    samples: number,
): ShapleyResult[] {
    const ids = accelerants.map((a) => a.id);

    const baseN: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]));
    const baseS: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]));
    const contrib: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]));

    function valueWithSet(activeSet: Set<string>): number {
        const n: Record<string, number> = { ...baseN };
        const s: Record<string, number> = { ...baseS };
        for (const id of activeSet) {
            n[id] = bin.values.north[id] ?? 0;
            s[id] = bin.values.south[id] ?? 0;
        }
        return gapScore(model, bin, weights, { valuesNorth: n, valuesSouth: s });
    }

    const rng = mulberry32(hashString(`${bin.id}|${model.kind}|${model.cesRho}|${model.gapMode}`));

    for (let t = 0; t < samples; t++) {
        const perm = shuffle(ids, rng);
        const active = new Set<string>();
        let prev = valueWithSet(active);
        for (const id of perm) {
            active.add(id);
            const next = valueWithSet(active);
            contrib[id] += next - prev;
            prev = next;
        }
    }

    const out = accelerants.map((a) => ({
        id: a.id,
        label: a.short,
        contribution: (contrib[a.id] ?? 0) / Math.max(1, samples),
    }));

    out.sort((x, y) => Math.abs(y.contribution) - Math.abs(x.contribution));
    return out;
}

// ---------- Computed data for charts ----------

export interface GapDataPoint {
    id: string;
    label: string;
    period: string;
    gap: number;
    northScore: number;
    southScore: number;
}

export function computeGapTimeline(scenario: Scenario): GapDataPoint[] {
    return scenario.timeline.map((b) => {
        const gap = gapScore(scenario.model, b, scenario.weights);
        const northScore = scoreRegion(scenario.model.kind, b.values.north, scenario.weights, scenario.model.cesRho);
        const southScore = scoreRegion(scenario.model.kind, b.values.south, scenario.weights, scenario.model.cesRho);
        return {
            id: b.id,
            label: b.label,
            period: `${formatYear(b.yearStart)}\u2013${formatYear(b.yearEnd)}`,
            gap,
            northScore,
            southScore,
        };
    });
}

export interface RadarDataPoint {
    axis: string;
    north: number;
    south: number;
}

export function computeRadarData(accelerants: Accelerant[], bin: TimeBin): RadarDataPoint[] {
    return accelerants.map((a) => ({
        axis: a.short,
        north: clamp01(bin.values.north[a.id] ?? 0),
        south: clamp01(bin.values.south[a.id] ?? 0),
    }));
}
