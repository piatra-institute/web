import { clamp, clamp01 } from '@/lib/playgroundMath';


/**
 * Political autoimmunity / rights-dependence voting misalignment.
 *
 * The model is taken faithfully from the ideation's formal section. For a
 * group g, a coalition c, and a policy domain j the per-domain adverse risk is
 *
 *     R = exposure · dependence · hostility · implementation · magnitude
 *
 * foreseeable risk multiplies in awareness, priority risk multiplies in
 * salience, and the net autoimmunity subtracts a protective benefit and a
 * tolerance, weighted by the interest model:
 *
 *     priorityRisk = R · awareness · salience
 *     benefit      = protection · implementation · magnitude
 *     net          = voteShare · Σ_j W(kind_j) · max(0, priorityRisk_j − benefit_j − τ)
 *
 * All inputs are synthetic, illustrative values, not empirical estimates. The
 * point of the instrument is that the ranking of cases changes with the
 * definition of interest; it is a hypothesis-generating sandbox, never a
 * verdict about any real voter.
 */


export type DomainKind = 'rights' | 'security' | 'material' | 'expressive' | 'institutional';

export const KIND_LABEL: Record<DomainKind, string> = {
    rights: 'civil rights',
    security: 'security / immigration',
    material: 'material',
    expressive: 'expressive / protest',
    institutional: 'institutional',
};

export const KIND_ORDER: DomainKind[] = ['rights', 'security', 'material', 'expressive', 'institutional'];


export interface Domain {
    id: string;
    label: string;
    kind: DomainKind;
}

export interface Cell {
    domainId: string;
    exposure: number;
    dependence: number;
    hostility: number;
    protection: number;
    implementation: number;
    magnitude: number;
    salience: number;
    awareness: number;
}

export interface Scenario {
    id: string;
    group: string;
    coalition: string;
    label: string;
    note: string;
    voteShare: number;
    domains: Domain[];
    cells: Cell[];
    /** illustrative post-vote disillusionment proxy, prior support minus later approval. */
    priorSupport: number;
    laterApproval: number;
}


/**
 * The three illustrative cases from the ideation's synthetic worked example
 * (its section P1). Group labels are real because the rights-dependence content
 * is the subject matter; the coalition is left as a generic object coded hostile
 * on these domains rather than a named person. Every number is synthetic.
 */
export const SCENARIOS: Record<string, Scenario> = {
    lgbtq: {
        id: 'lgbtq',
        group: 'LGBTQ voters',
        coalition: 'restrictionist coalition',
        label: 'LGBTQ',
        note: 'A small rights-dependent subgroup supporting a coalition coded hostile on federal civil-rights protections. High per-supporter exposure, small vote share.',
        voteShare: 0.12,
        priorSupport: 0.86,
        laterApproval: 0.7,
        domains: [
            { id: 'lgbtq-civil-rights', label: 'Federal civil-rights protection', kind: 'rights' },
            { id: 'lgbtq-trans-health', label: 'Gender-identity health and documents', kind: 'rights' },
            { id: 'lgbtq-enforcement', label: 'Hate-crime and discrimination enforcement', kind: 'rights' },
        ],
        cells: [
            { domainId: 'lgbtq-civil-rights', exposure: 0.70, dependence: 0.90, hostility: 0.90, protection: 0, implementation: 0.90, magnitude: 0.90, salience: 0.75, awareness: 0.90 },
            { domainId: 'lgbtq-trans-health', exposure: 0.30, dependence: 0.95, hostility: 0.95, protection: 0, implementation: 0.90, magnitude: 0.85, salience: 0.65, awareness: 0.90 },
            { domainId: 'lgbtq-enforcement', exposure: 0.65, dependence: 0.80, hostility: 0.70, protection: 0, implementation: 0.60, magnitude: 0.70, salience: 0.60, awareness: 0.80 },
        ],
    },
    muslim: {
        id: 'muslim',
        group: 'Muslim voters',
        coalition: 'restrictionist coalition',
        label: 'Muslim',
        note: 'Defection or protest after foreign-policy dissatisfaction toward a coalition coded hostile on entry and religious-bias enforcement. The protest interest model reframes the Gaza domain.',
        voteShare: 0.21,
        priorSupport: 0.21,
        laterApproval: 0.16,
        domains: [
            { id: 'muslim-entry', label: 'Entry vetting and travel restriction', kind: 'security' },
            { id: 'muslim-gaza', label: 'Foreign-policy protest (Gaza)', kind: 'expressive' },
            { id: 'muslim-bias', label: 'Religious-bias enforcement', kind: 'rights' },
        ],
        cells: [
            { domainId: 'muslim-entry', exposure: 0.60, dependence: 0.80, hostility: 0.80, protection: 0, implementation: 0.80, magnitude: 0.80, salience: 0.85, awareness: 0.90 },
            { domainId: 'muslim-gaza', exposure: 0.50, dependence: 0.70, hostility: 0.50, protection: 0, implementation: 0.70, magnitude: 0.70, salience: 0.95, awareness: 0.95 },
            { domainId: 'muslim-bias', exposure: 0.60, dependence: 0.80, hostility: 0.70, protection: 0, implementation: 0.65, magnitude: 0.65, salience: 0.70, awareness: 0.80 },
        ],
    },
    latino: {
        id: 'latino',
        group: 'Latino voters',
        coalition: 'restrictionist coalition',
        label: 'Latino',
        note: 'A heterogeneous, large bloc. Lower per-supporter synthetic risk than the other cases, but the large vote share lifts the population-weighted score. The material domain carries weight only under the material interest model.',
        voteShare: 0.48,
        priorSupport: 0.48,
        laterApproval: 0.33,
        domains: [
            { id: 'latino-immig', label: 'Immigration enforcement spillover', kind: 'security' },
            { id: 'latino-economy', label: 'Material economy', kind: 'material' },
            { id: 'latino-civil-rights', label: 'Civil-rights enforcement', kind: 'rights' },
        ],
        cells: [
            { domainId: 'latino-immig', exposure: 0.55, dependence: 0.75, hostility: 0.85, protection: 0, implementation: 0.90, magnitude: 0.80, salience: 0.65, awareness: 0.85 },
            { domainId: 'latino-economy', exposure: 0.45, dependence: 0.55, hostility: 0.30, protection: 0.15, implementation: 0.70, magnitude: 0.50, salience: 0.80, awareness: 0.75 },
            { domainId: 'latino-civil-rights', exposure: 0.50, dependence: 0.65, hostility: 0.60, protection: 0, implementation: 0.70, magnitude: 0.65, salience: 0.55, awareness: 0.70 },
        ],
    },
};

export const SCENARIO_KEYS = Object.keys(SCENARIOS);

/** domain id -> kind, across all scenarios. */
export const DOMAIN_KIND: Record<string, DomainKind> = (() => {
    const out: Record<string, DomainKind> = {};
    for (const key of SCENARIO_KEYS) {
        for (const d of SCENARIOS[key].domains) out[d.id] = d.kind;
    }
    return out;
})();

export const DOMAIN_LABEL: Record<string, string> = (() => {
    const out: Record<string, string> = {};
    for (const key of SCENARIO_KEYS) {
        for (const d of SCENARIOS[key].domains) out[d.id] = d.label;
    }
    return out;
})();


export type InterestModelKey = 'rights' | 'material' | 'balanced' | 'expressive' | 'protest' | 'institutional';

export interface InterestModel {
    key: InterestModelKey;
    label: string;
    blurb: string;
    weights: Record<DomainKind, number>;
}

/**
 * Each interest model is a weight profile over domain kinds. Switching the
 * model reweights the domains, which is what reorders the cases. This is the
 * ideation's competing-interest-functions idea made concrete.
 */
export const INTEREST_MODELS: Record<InterestModelKey, InterestModel> = {
    rights: {
        key: 'rights',
        label: 'rights-dependence',
        blurb: 'Interest is civil rights, due process, anti-discrimination law, bodily autonomy, equal access. The cleanest academic construct.',
        weights: { rights: 1.0, security: 0.7, material: 0.2, expressive: 0.1, institutional: 0.5 },
    },
    material: {
        key: 'material',
        label: 'material welfare',
        blurb: 'Interest is income, taxes, benefits, healthcare, inflation. Economic domains dominate; rights count for little.',
        weights: { rights: 0.2, security: 0.4, material: 1.0, expressive: 0.1, institutional: 0.2 },
    },
    balanced: {
        key: 'balanced',
        label: 'balanced',
        blurb: 'Every domain kind weighted equally. A neutral starting point with no thesis about which interest matters.',
        weights: { rights: 0.5, security: 0.5, material: 0.5, expressive: 0.5, institutional: 0.5 },
    },
    expressive: {
        key: 'expressive',
        label: 'expressive / status',
        blurb: 'Interest is symbolic belonging, identity, status. Expressive utility is treated as real utility, so apparent self-harm shrinks.',
        weights: { rights: 0.2, security: 0.2, material: 0.3, expressive: 1.0, institutional: 0.2 },
    },
    protest: {
        key: 'protest',
        label: 'punitive protest',
        blurb: 'Interest is punishing a party for betrayal. The protest domain is reweighted as intended action, not adverse exposure.',
        weights: { rights: 0.3, security: 0.3, material: 0.3, expressive: 0.9, institutional: 0.4 },
    },
    institutional: {
        key: 'institutional',
        label: 'long-run institutional',
        blurb: 'Interest is democratic norms, courts, civil service, pluralism. Institutional and rights domains carry the weight.',
        weights: { rights: 0.6, security: 0.5, material: 0.3, expressive: 0.2, institutional: 1.0 },
    },
};

export const INTEREST_MODEL_KEYS = Object.keys(INTEREST_MODELS) as InterestModelKey[];


export interface Params {
    focusScenario: string;
    interestModel: InterestModelKey;
    /** scales every implementation probability, 0..150 (percent). */
    implementationClimate: number;
    /** scales every awareness term, 0..100. */
    awarenessWeight: number;
    /** scales every salience term, 0..100. */
    salienceEmphasis: number;
    /** net tolerance τ, 0..30 (percent). */
    tolerance: number;
    /** net (tradeoff-adjusted, interest-weighted) vs gross (raw priority risk). */
    net: boolean;
    /** multiply per-supporter risk by group vote share. */
    populationWeighted: boolean;
    showUncertainty: boolean;
}

export const DEFAULT_PARAMS: Params = {
    focusScenario: 'lgbtq',
    interestModel: 'rights',
    implementationClimate: 100,
    awarenessWeight: 100,
    salienceEmphasis: 100,
    tolerance: 2,
    net: true,
    populationWeighted: true,
    showUncertainty: true,
};


interface Mods {
    climate: number;
    aware: number;
    sal: number;
}

type VarKey = keyof Pick<Cell, 'exposure' | 'dependence' | 'hostility' | 'magnitude' | 'implementation' | 'salience' | 'awareness' | 'protection'>;

interface EvalOpts {
    net: boolean;
    populationWeighted: boolean;
    voteShare: number;
    mods: Mods;
    tol: number;
    weights: Record<DomainKind, number>;
    scale?: Partial<Record<VarKey, number>>;
}


function modsFromParams(params: Params): Mods {
    return {
        climate: params.implementationClimate / 100,
        aware: params.awarenessWeight / 100,
        sal: params.salienceEmphasis / 100,
    };
}


export function cellPriorityRisk(c: Cell, mods: Mods, scale?: Partial<Record<VarKey, number>>): number {
    const s = scale ?? {};
    const exposure = clamp01(c.exposure * (s.exposure ?? 1));
    const dependence = clamp01(c.dependence * (s.dependence ?? 1));
    const hostility = clamp01(c.hostility * (s.hostility ?? 1));
    const magnitude = clamp01(c.magnitude * (s.magnitude ?? 1));
    const P = clamp01(c.implementation * (s.implementation ?? 1) * mods.climate);
    const dr = exposure * dependence * hostility * P * magnitude;
    return dr * clamp01(c.awareness * (s.awareness ?? 1) * mods.aware) * clamp01(c.salience * (s.salience ?? 1) * mods.sal);
}

export function cellBenefit(c: Cell, mods: Mods, scale?: Partial<Record<VarKey, number>>): number {
    const s = scale ?? {};
    const P = clamp01(c.implementation * (s.implementation ?? 1) * mods.climate);
    const magnitude = clamp01(c.magnitude * (s.magnitude ?? 1));
    return clamp01(c.protection * (s.protection ?? 1)) * P * magnitude;
}


function evalCells(cells: Cell[], opts: EvalOpts): number {
    let total = 0;
    for (const c of cells) {
        const pr = cellPriorityRisk(c, opts.mods, opts.scale);
        if (opts.net) {
            const ben = cellBenefit(c, opts.mods, opts.scale);
            const w = opts.weights[DOMAIN_KIND[c.domainId]] ?? 1;
            total += w * Math.max(0, pr - ben - opts.tol);
        } else {
            total += pr;
        }
    }
    return opts.populationWeighted ? total * opts.voteShare : total;
}


function optsFromParams(scenario: Scenario, params: Params, overrides?: Partial<EvalOpts>): EvalOpts {
    return {
        net: params.net,
        populationWeighted: params.populationWeighted,
        voteShare: scenario.voteShare,
        mods: modsFromParams(params),
        tol: params.tolerance / 100,
        weights: INTEREST_MODELS[params.interestModel].weights,
        ...overrides,
    };
}


/** Σ priorityRisk over a scenario's cells, with no interest weights, no benefit, no vote share. Matches the ideation's worked example. */
export function grossPriorityRisk(scenario: Scenario): number {
    return evalCells(scenario.cells, {
        net: false,
        populationWeighted: false,
        voteShare: scenario.voteShare,
        mods: { climate: 1, aware: 1, sal: 1 },
        tol: 0,
        weights: INTEREST_MODELS.balanced.weights,
    });
}

export function populationWeightedGross(scenario: Scenario): number {
    return grossPriorityRisk(scenario) * scenario.voteShare;
}


// ----- deterministic Monte Carlo (seeded, reproducible) -----

function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function hashSeed(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }
    return h >>> 0;
}

function randNormal(rng: () => number): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Marsaglia-Tsang gamma sampler. */
function gammaSample(rng: () => number, k: number): number {
    if (k < 1) {
        return gammaSample(rng, k + 1) * Math.pow(rng() || 1e-9, 1 / k);
    }
    const d = k - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    for (let i = 0; i < 64; i++) {
        const x = randNormal(rng);
        const v0 = 1 + c * x;
        if (v0 <= 0) continue;
        const v = v0 * v0 * v0;
        const u = rng();
        if (u < 1 - 0.0331 * x * x * x * x) return d * v;
        if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
    return d;
}

function betaSample(rng: () => number, a: number, b: number): number {
    const x = gammaSample(rng, a);
    const y = gammaSample(rng, b);
    const s = x + y;
    return s > 0 ? x / s : 0;
}

const KAPPA = 60;
const MC_SAMPLES = 240;

function perturb(rng: () => number, mean: number, kappa: number): number {
    const m = clamp(mean, 0.001, 0.999);
    const a = Math.max(0.5, m * kappa);
    const b = Math.max(0.5, (1 - m) * kappa);
    return clamp01(betaSample(rng, a, b));
}


export interface Interval {
    low: number;
    high: number;
}

function monteCarlo(scenario: Scenario, params: Params): Interval {
    const rng = mulberry32(hashSeed(scenario.id) ^ 0x9e3779b9);
    const opts = optsFromParams(scenario, params);
    const out: number[] = [];
    for (let s = 0; s < MC_SAMPLES; s++) {
        const cells = scenario.cells.map((c) => ({
            domainId: c.domainId,
            exposure: perturb(rng, c.exposure, KAPPA),
            dependence: perturb(rng, c.dependence, KAPPA),
            hostility: perturb(rng, c.hostility, KAPPA),
            protection: perturb(rng, c.protection, KAPPA),
            implementation: perturb(rng, c.implementation, KAPPA),
            magnitude: perturb(rng, c.magnitude, KAPPA),
            salience: perturb(rng, c.salience, KAPPA),
            awareness: perturb(rng, c.awareness, KAPPA),
        }));
        out.push(evalCells(cells, opts));
    }
    out.sort((a, b) => a - b);
    const q = (p: number) => out[Math.min(out.length - 1, Math.max(0, Math.floor(p * out.length)))];
    return { low: q(0.05), high: q(0.95) };
}


export interface DomainContribution {
    domainId: string;
    label: string;
    kind: DomainKind;
    priorityRisk: number;
    benefit: number;
    netContribution: number;
}

export interface ScenarioMetric {
    id: string;
    label: string;
    group: string;
    /** the value currently shown (gross or net, per-supporter or population-weighted). */
    display: number;
    grossPerSupporter: number;
    netPerSupporter: number;
    populationWeighted: number;
    interval: Interval;
    dominantDomain: DomainContribution | null;
    contributions: DomainContribution[];
    regret: number;
    rank: number;
}


export function scenarioContributions(scenario: Scenario, params: Params): DomainContribution[] {
    const mods = modsFromParams(params);
    const tol = params.tolerance / 100;
    const weights = INTEREST_MODELS[params.interestModel].weights;
    return scenario.cells.map((c) => {
        const pr = cellPriorityRisk(c, mods);
        const ben = cellBenefit(c, mods);
        const kind = DOMAIN_KIND[c.domainId];
        const net = (weights[kind] ?? 1) * Math.max(0, pr - ben - tol);
        return {
            domainId: c.domainId,
            label: DOMAIN_LABEL[c.domainId] ?? c.domainId,
            kind,
            priorityRisk: pr,
            benefit: ben,
            netContribution: net,
        };
    });
}


export function computeScenarioMetric(scenario: Scenario, params: Params): ScenarioMetric {
    const gross = evalCells(scenario.cells, optsFromParams(scenario, params, { net: false, populationWeighted: false }));
    const netPer = evalCells(scenario.cells, optsFromParams(scenario, params, { net: true, populationWeighted: false }));
    const popWeighted = evalCells(scenario.cells, optsFromParams(scenario, params, { net: params.net, populationWeighted: true }));
    const display = evalCells(scenario.cells, optsFromParams(scenario, params));
    const contributions = scenarioContributions(scenario, params);
    const dominantDomain = contributions.reduce<DomainContribution | null>((best, d) => {
        const metric = params.net ? d.netContribution : d.priorityRisk;
        const bestMetric = best ? (params.net ? best.netContribution : best.priorityRisk) : -1;
        return metric > bestMetric ? d : best;
    }, null);
    return {
        id: scenario.id,
        label: scenario.label,
        group: scenario.group,
        display,
        grossPerSupporter: gross,
        netPerSupporter: netPer,
        populationWeighted: popWeighted,
        interval: params.showUncertainty ? monteCarlo(scenario, params) : { low: display, high: display },
        dominantDomain,
        contributions,
        regret: scenario.priorSupport - scenario.laterApproval,
        rank: 0,
    };
}


export function computeAllMetrics(params: Params): ScenarioMetric[] {
    const metrics = SCENARIO_KEYS.map((k) => computeScenarioMetric(SCENARIOS[k], params));
    const ordered = [...metrics].sort((a, b) => b.display - a.display);
    ordered.forEach((m, i) => (m.rank = i + 1));
    return metrics.map((m) => ({ ...m, rank: ordered.find((o) => o.id === m.id)?.rank ?? 0 }));
}


// ----- cross-interest-model ranking matrix -----

export interface ModelRankRow {
    key: InterestModelKey;
    label: string;
    scores: Record<string, number>;
    topScenario: string;
}

export function computeModelMatrix(params: Params): ModelRankRow[] {
    return INTEREST_MODEL_KEYS.map((key) => {
        const scores: Record<string, number> = {};
        let top = SCENARIO_KEYS[0];
        let topVal = -Infinity;
        for (const sk of SCENARIO_KEYS) {
            const scenario = SCENARIOS[sk];
            const v = evalCells(scenario.cells, optsFromParams(scenario, { ...params, interestModel: key }, { net: true, populationWeighted: true }));
            scores[sk] = v;
            if (v > topVal) {
                topVal = v;
                top = sk;
            }
        }
        return { key, label: INTEREST_MODELS[key].label, scores, topScenario: SCENARIOS[top].label };
    });
}


// ----- tornado sensitivity for the focus scenario (net, per-supporter) -----

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export function computeSensitivity(scenario: Scenario, params: Params): { bars: SensitivityBar[]; baseline: number } {
    const base = optsFromParams(scenario, params, { net: true, populationWeighted: false });
    const baseline = evalCells(scenario.cells, base);

    const evalWith = (o: Partial<EvalOpts>) => evalCells(scenario.cells, { ...base, ...o });
    const withMods = (m: Partial<Mods>) => evalWith({ mods: { ...base.mods, ...m } });
    const withScale = (s: Partial<Record<VarKey, number>>) => evalWith({ scale: s });

    const raw: SensitivityBar[] = [
        { label: 'implementation', low: withMods({ climate: 0.5 }), high: withMods({ climate: 1.5 }) },
        { label: 'awareness', low: withMods({ aware: 0 }), high: withMods({ aware: 1 }) },
        { label: 'salience', low: withMods({ sal: 0 }), high: withMods({ sal: 1 }) },
        { label: 'tolerance τ', low: evalWith({ tol: 0.3 }), high: evalWith({ tol: 0 }) },
        { label: 'hostility', low: withScale({ hostility: 0.5 }), high: withScale({ hostility: 1 }) },
        { label: 'exposure', low: withScale({ exposure: 0.5 }), high: withScale({ exposure: 1 }) },
        { label: 'dependence', low: withScale({ dependence: 0.5 }), high: withScale({ dependence: 1 }) },
        { label: 'magnitude', low: withScale({ magnitude: 0.5 }), high: withScale({ magnitude: 1 }) },
    ];
    const bars = raw
        .map((b) => ({ label: b.label, low: Math.min(b.low, b.high), high: Math.max(b.low, b.high) }))
        .sort((a, b) => (b.high - b.low) - (a.high - a.low));
    return { bars, baseline };
}


// ----- one-lever sweep across all scenarios (net, population-weighted) -----

export type SweepLever = 'tolerance' | 'implementationClimate' | 'awarenessWeight' | 'salienceEmphasis';

export const SWEEP_LEVERS: { key: SweepLever; label: string; min: number; max: number }[] = [
    { key: 'tolerance', label: 'tolerance τ', min: 0, max: 30 },
    { key: 'implementationClimate', label: 'implementation climate', min: 0, max: 150 },
    { key: 'awarenessWeight', label: 'awareness weight', min: 0, max: 100 },
    { key: 'salienceEmphasis', label: 'salience emphasis', min: 0, max: 100 },
];

export interface SweepDatum {
    value: number;
    [scenarioId: string]: number;
}

export function computeSweep(params: Params, lever: SweepLever): SweepDatum[] {
    const spec = SWEEP_LEVERS.find((l) => l.key === lever)!;
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const value = spec.min + ((spec.max - spec.min) * i) / 40;
        const p: Params = { ...params, [lever]: value, net: true, populationWeighted: true };
        const row: SweepDatum = { value: Number(value.toFixed(1)) };
        for (const sk of SCENARIO_KEYS) {
            const scenario = SCENARIOS[sk];
            row[sk] = Number(evalCells(scenario.cells, optsFromParams(scenario, p)).toFixed(4));
        }
        data.push(row);
    }
    return data;
}


export function computeNarrative(metrics: ScenarioMetric[], params: Params): string {
    const focus = metrics.find((m) => m.id === params.focusScenario);
    if (!focus) return '';
    const model = INTEREST_MODELS[params.interestModel];
    const mode = params.net ? 'net (tradeoff-adjusted)' : 'gross (raw priority risk)';
    const weighting = params.populationWeighted ? 'population-weighted by vote share' : 'per supporter';

    const top = [...metrics].sort((a, b) => b.display - a.display)[0];
    const parts: string[] = [];
    parts.push(
        `Under the ${model.label} interest model, ${focus.group} rank #${focus.rank} of ${metrics.length} on the ${mode} misalignment score, ${weighting}.`,
    );
    if (focus.dominantDomain) {
        parts.push(`The largest single contribution is "${focus.dominantDomain.label}" (${KIND_LABEL[focus.dominantDomain.kind]}).`);
    }
    if (top.id !== focus.id) {
        parts.push(`${top.group} currently carry the highest score; switch the interest model and the ranking reorders.`);
    } else {
        parts.push(`This case currently carries the highest score, but that is an artifact of the chosen interest weights, not a verdict.`);
    }
    if (focus.regret > 0.1) {
        parts.push(`Illustrative disillusionment proxy: support fell ${Math.round(focus.regret * 100)} points after implementation.`);
    }
    return parts.join(' ');
}


export interface Snapshot {
    label: string;
    interestModel: string;
    display: number;
    netPerSupporter: number;
    rank: number;
}
