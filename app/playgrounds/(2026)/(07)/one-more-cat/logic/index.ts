// The Cat Cascade Model.
//
// A monthly systems model of how a household moves from zero cats to one, a pair,
// an informal rescue, capacity overload, or a managed sanctuary. The decisive
// boundary is not a cat count but the care-load ratio rho = required care /
// effective capacity, combined with feedbacks (referrals, reproduction,
// attachment hysteresis) that keep the population from falling.
//
// This is a transparent hypothesis generator, not a fitted predictive model.
// Every coefficient is an explicit modeling choice; only a few rates are anchored
// to the literature (see assumptions.ts and calibration.ts).

export const MAX_CATS = 500;

// how the monthly flows are realized: smooth expected values, a single stochastic
// path, or a Monte-Carlo ensemble of stochastic paths.
export type SimMode = 'expected' | 'stochastic' | 'ensemble';

// ---------------------------------------------------------------------------
// parameters
// ---------------------------------------------------------------------------
export type ParamGroup =
    | 'Simulation'
    | 'Population flows'
    | 'Human decision system'
    | 'Care system'
    | 'Intervention lab';

export type ParamFormat = 'percent' | 'percentPoints' | 'score' | 'plain';

export interface Params {
    horizonMonths: number;
    initialCats: number;
    baseArrivalsPerYear: number;
    sterilizedShare: number;
    reproductionScale: number;
    kittenSurvival: number;
    rehomePerMonth: number;
    annualMortality: number;
    companionshipNeed: number;
    rescueIdentity: number;
    solicitationSensitivity: number;
    referralFeedback: number;
    attachment: number;
    costUnderestimation: number;
    overloadRecognition: number;
    baselineCapacity: number;
    spaceCapacity: number;
    organization: number;
    intakeDiscipline: number;
    economyOfScale: number;
    diseaseFeedback: number;
    externalSupport: number;
    interventionMonth: number;
    sterilizationBoost: number;
    rehomeBoost: number;
    capacityBoost: number;
    intakeBoost: number;
}

export type ParamKey = keyof Params;

export interface ParamMeta {
    key: ParamKey;
    label: string;
    group: ParamGroup;
    min: number;
    max: number;
    step: number;
    default: number;
    unit?: string;
    format?: ParamFormat;
    note: string;
}

export const PARAM_META: ParamMeta[] = [
    { key: 'horizonMonths', label: 'time horizon', group: 'Simulation', min: 24, max: 240, step: 12, default: 120, unit: 'months', note: 'Long horizons reveal slow feedback and delayed collapse.' },
    { key: 'initialCats', label: 'initial cats', group: 'Simulation', min: 0, max: 120, step: 1, default: 1, unit: 'cats', note: 'The starting state can already be a household, rescue, or sanctuary.' },

    { key: 'baseArrivalsPerYear', label: 'unsolicited opportunities', group: 'Population flows', min: 0, max: 24, step: 0.25, default: 0.8, unit: '/year', note: 'Strays, requests, or cats presented as urgent before referral amplification.' },
    { key: 'sterilizedShare', label: 'sterilized share', group: 'Population flows', min: 0, max: 1, step: 0.01, default: 0.9, format: 'percent', note: 'Reduces the fertile population. It does not remove cats already present.' },
    { key: 'reproductionScale', label: 'reproduction intensity', group: 'Population flows', min: 0, max: 1.5, step: 0.01, default: 0.35, format: 'score', note: 'Scales a literature anchor of 1.4 litters/year and median 3 kittens/litter (free-roaming cats).' },
    { key: 'kittenSurvival', label: 'kitten survival to entry', group: 'Population flows', min: 0.1, max: 0.95, step: 0.01, default: 0.45, format: 'percent', note: 'Share of births that survive and remain in the modeled household.' },
    { key: 'rehomePerMonth', label: 'rehoming throughput', group: 'Population flows', min: 0, max: 8, step: 0.05, default: 0.25, unit: 'cats/month', note: 'Raw placement capacity before attachment, network, and overload effects.' },
    { key: 'annualMortality', label: 'annual baseline exits', group: 'Population flows', min: 0.01, max: 0.2, step: 0.005, default: 0.04, format: 'percent', note: 'Baseline mortality and permanent exits. Welfare failure raises this rate.' },

    { key: 'companionshipNeed', label: 'utility / companionship need', group: 'Human decision system', min: 0, max: 1, step: 0.01, default: 0.45, format: 'score', note: 'Companionship and practical utility such as rodent control. Strongest at the first cat.' },
    { key: 'rescueIdentity', label: 'rescue identity', group: 'Human decision system', min: 0, max: 1, step: 0.01, default: 0.25, format: 'score', note: 'Moral reward and identity gained by accepting a cat in need.' },
    { key: 'solicitationSensitivity', label: 'sensitivity to cat solicitation', group: 'Human decision system', min: 0, max: 1, step: 0.01, default: 0.5, format: 'score', note: 'Response to purring, meowing, rubbing, approach, or visible vulnerability.' },
    { key: 'referralFeedback', label: 'social referral feedback', group: 'Human decision system', min: 0, max: 1, step: 0.01, default: 0.25, format: 'score', note: 'More current cats can make others more likely to send future cats your way.' },
    { key: 'attachment', label: 'attachment / surrender aversion', group: 'Human decision system', min: 0, max: 1, step: 0.01, default: 0.6, format: 'score', note: 'Makes relinquishing a known individual harder than refusing an unknown cat.' },
    { key: 'costUnderestimation', label: 'marginal-cost underestimation', group: 'Human decision system', min: 0, max: 1, step: 0.01, default: 0.25, format: 'score', note: 'The thought that one more bowl is cheap while monitoring and medical load are ignored.' },
    { key: 'overloadRecognition', label: 'recognition of overload', group: 'Human decision system', min: 0, max: 1, step: 0.01, default: 0.75, format: 'score', note: 'How strongly visible strain reduces new intake and motivates exits.' },

    { key: 'baselineCapacity', label: 'baseline care capacity', group: 'Care system', min: 1, max: 150, step: 1, default: 5, unit: 'cat-equivalents', note: 'Time, money, health, and labor available before organizational multipliers.' },
    { key: 'spaceCapacity', label: 'low-density space capacity', group: 'Care system', min: 1, max: 200, step: 1, default: 8, unit: 'cats', note: 'Number supportable before crowding sharply raises conflict and disease pressure.' },
    { key: 'organization', label: 'organizational maturity', group: 'Care system', min: 0, max: 1, step: 0.01, default: 0.2, format: 'score', note: 'Records, quarantine, routines, staffing, medical protocols, division of labor.' },
    { key: 'intakeDiscipline', label: 'intake discipline', group: 'Care system', min: 0, max: 1, step: 0.01, default: 0.7, format: 'score', note: 'How strongly intake closes before or during capacity strain.' },
    { key: 'economyOfScale', label: 'routine economies of scale', group: 'Care system', min: 0, max: 0.65, step: 0.01, default: 0.25, format: 'score', note: 'Bulk feeding and cleaning scale. Individual observation never disappears.' },
    { key: 'diseaseFeedback', label: 'density / disease feedback', group: 'Care system', min: 0, max: 1, step: 0.01, default: 0.45, format: 'score', note: 'Overcrowding and delayed detection create more work, reducing care quality.' },
    { key: 'externalSupport', label: 'external support network', group: 'Care system', min: 0, max: 1, step: 0.01, default: 0.1, format: 'score', note: 'Veterinary access, volunteers, donations, foster homes, transport, social services.' },

    { key: 'interventionMonth', label: 'intervention month', group: 'Intervention lab', min: 0, max: 180, step: 1, default: 0, unit: 'month', note: '0 means off. At this month, all non-zero intervention boosts begin.' },
    { key: 'sterilizationBoost', label: 'sterilization boost', group: 'Intervention lab', min: 0, max: 1, step: 0.01, default: 0, format: 'percentPoints', note: 'Adds to the sterilized share after the intervention month.' },
    { key: 'rehomeBoost', label: 'rehoming boost', group: 'Intervention lab', min: 0, max: 6, step: 0.05, default: 0, unit: 'cats/month', note: 'Additional placement throughput after intervention.' },
    { key: 'capacityBoost', label: 'capacity boost', group: 'Intervention lab', min: 0, max: 120, step: 1, default: 0, unit: 'cat-equivalents', note: 'Additional staff, funding, facilities, or foster capacity.' },
    { key: 'intakeBoost', label: 'intake-discipline boost', group: 'Intervention lab', min: 0, max: 1, step: 0.01, default: 0, format: 'percentPoints', note: 'Adds a stronger intake gate after the intervention month.' },
];

export const PARAM_GROUPS: ParamGroup[] = [
    'Simulation', 'Population flows', 'Human decision system', 'Care system', 'Intervention lab',
];

export const DEFAULT_PARAMS: Params = PARAM_META.reduce((acc, m) => {
    acc[m.key] = m.default;
    return acc;
}, {} as Params);

// parameters exposed to the threshold scanner and phase map (the continuous levers).
export const SWEEP_KEYS: ParamKey[] = [
    'sterilizedShare', 'rehomePerMonth', 'baseArrivalsPerYear', 'rescueIdentity', 'referralFeedback',
    'attachment', 'costUnderestimation', 'overloadRecognition', 'baselineCapacity', 'spaceCapacity',
    'organization', 'intakeDiscipline', 'diseaseFeedback', 'externalSupport',
];

// ---------------------------------------------------------------------------
// presets
// ---------------------------------------------------------------------------
export type PresetKey = 'rural' | 'pair' | 'litter' | 'rescuer' | 'overload' | 'sanctuary';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    rural: { label: 'rural mouser', question: 'One working cat with strong intake discipline. Does it stay a single cat?', expectation: 'A stable single-cat household: inflow stays below rehoming and exits.' },
    pair: { label: 'companion pair', question: 'Two sterilized companions. Is the pair the natural resting point?', expectation: 'A stable two-cat household with high attachment and near-zero reproduction.' },
    litter: { label: 'accidental litter', question: 'Low sterilization meets a fertile pair. What does a timed intervention buy?', expectation: 'A birth pulse, then a sterilization-and-rehoming intervention that bends the curve down.' },
    rescuer: { label: 'informal rescuer', question: 'A known rescuer with rising referrals. Does reputation feedback take over?', expectation: 'A drifting multi-cat network where intake discipline is the swing variable.' },
    overload: { label: 'overloaded accumulator', question: 'High intake, low recognition, high attachment. How fast does rho exceed 1?', expectation: 'A runaway accumulation crisis: births and referrals outpace saturated rehoming.' },
    sanctuary: { label: 'managed sanctuary', question: 'Eighty cats with real organization. Can a high count still be adequate care?', expectation: 'A managed sanctuary: high count, high organization, rho held below 1.' },
};

const PRESET_VALUES: Record<PresetKey, Partial<Params>> = {
    rural: {
        horizonMonths: 120, initialCats: 1, baseArrivalsPerYear: 0.4, sterilizedShare: 0.9,
        reproductionScale: 0.25, kittenSurvival: 0.4, rehomePerMonth: 0.08, annualMortality: 0.04,
        companionshipNeed: 0.76, rescueIdentity: 0.12, solicitationSensitivity: 0.42, referralFeedback: 0.08,
        attachment: 0.6, costUnderestimation: 0.15, overloadRecognition: 0.85,
        baselineCapacity: 4, spaceCapacity: 8, organization: 0.18, intakeDiscipline: 0.9,
        economyOfScale: 0.22, diseaseFeedback: 0.35, externalSupport: 0.1,
    },
    pair: {
        horizonMonths: 120, initialCats: 2, baseArrivalsPerYear: 0.3, sterilizedShare: 1,
        reproductionScale: 0.1, kittenSurvival: 0.4, rehomePerMonth: 0.04, annualMortality: 0.04,
        companionshipNeed: 0.78, rescueIdentity: 0.1, solicitationSensitivity: 0.62, referralFeedback: 0.05,
        attachment: 0.88, costUnderestimation: 0.15, overloadRecognition: 0.88,
        baselineCapacity: 5, spaceCapacity: 7, organization: 0.25, intakeDiscipline: 0.96,
        economyOfScale: 0.3, diseaseFeedback: 0.25, externalSupport: 0.18,
    },
    litter: {
        horizonMonths: 96, initialCats: 2, baseArrivalsPerYear: 0.45, sterilizedShare: 0.35,
        reproductionScale: 0.95, kittenSurvival: 0.65, rehomePerMonth: 0.35, annualMortality: 0.04,
        companionshipNeed: 0.55, rescueIdentity: 0.38, solicitationSensitivity: 0.62, referralFeedback: 0.18,
        attachment: 0.7, costUnderestimation: 0.38, overloadRecognition: 0.72,
        baselineCapacity: 6, spaceCapacity: 7, organization: 0.3, intakeDiscipline: 0.7,
        economyOfScale: 0.32, diseaseFeedback: 0.48, externalSupport: 0.22,
        interventionMonth: 18, sterilizationBoost: 0.6, rehomeBoost: 0.4, capacityBoost: 0, intakeBoost: 0.15,
    },
    rescuer: {
        horizonMonths: 144, initialCats: 4, baseArrivalsPerYear: 4.5, sterilizedShare: 0.78,
        reproductionScale: 0.55, kittenSurvival: 0.58, rehomePerMonth: 0.7, annualMortality: 0.05,
        companionshipNeed: 0.55, rescueIdentity: 0.88, solicitationSensitivity: 0.78, referralFeedback: 0.78,
        attachment: 0.78, costUnderestimation: 0.58, overloadRecognition: 0.58,
        baselineCapacity: 13, spaceCapacity: 15, organization: 0.45, intakeDiscipline: 0.42,
        economyOfScale: 0.4, diseaseFeedback: 0.62, externalSupport: 0.42,
    },
    overload: {
        horizonMonths: 120, initialCats: 12, baseArrivalsPerYear: 7, sterilizedShare: 0.58,
        reproductionScale: 1, kittenSurvival: 0.68, rehomePerMonth: 0.18, annualMortality: 0.05,
        companionshipNeed: 0.62, rescueIdentity: 0.92, solicitationSensitivity: 0.86, referralFeedback: 0.9,
        attachment: 0.96, costUnderestimation: 0.88, overloadRecognition: 0.24,
        baselineCapacity: 10, spaceCapacity: 12, organization: 0.16, intakeDiscipline: 0.14,
        economyOfScale: 0.34, diseaseFeedback: 0.86, externalSupport: 0.12,
    },
    sanctuary: {
        horizonMonths: 120, initialCats: 80, baseArrivalsPerYear: 18, sterilizedShare: 0.995,
        reproductionScale: 0.05, kittenSurvival: 0.45, rehomePerMonth: 2.5, annualMortality: 0.06,
        companionshipNeed: 0.28, rescueIdentity: 0.92, solicitationSensitivity: 0.5, referralFeedback: 0.9,
        attachment: 0.55, costUnderestimation: 0.08, overloadRecognition: 0.96,
        baselineCapacity: 105, spaceCapacity: 130, organization: 0.96, intakeDiscipline: 0.97,
        economyOfScale: 0.6, diseaseFeedback: 0.35, externalSupport: 0.92,
    },
};

export function presetParams(key: PresetKey): Params {
    return { ...DEFAULT_PARAMS, ...PRESET_VALUES[key] };
}

// ---------------------------------------------------------------------------
// numeric helpers
// ---------------------------------------------------------------------------
export function clamp(x: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, x));
}
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}
export function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
}

// combinatorial count of potential cat-cat relationships, n(n-1)/2.
export function potentialPairs(n: number): number {
    return (n * (n - 1)) / 2;
}

// the acceptance logistic in isolation (used by the decision panel and calibration).
export function acceptanceProbability(benefit: number, perceivedCost: number): number {
    return sigmoid((benefit - perceivedCost) * 2.7);
}

// deterministic PRNG so stochastic runs are reproducible from a seed.
export type Rng = () => number;
export function mulberry32(seed: number): Rng {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function normalRandom(rng: Rng): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function poisson(lambda: number, rng: Rng): number {
    if (lambda <= 0) return 0;
    if (lambda < 30) {
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
            k++;
            p *= rng();
        } while (p > L);
        return k - 1;
    }
    return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normalRandom(rng)));
}

function binomial(nRaw: number, pRaw: number, rng: Rng): number {
    const n = Math.max(0, Math.round(nRaw));
    const p = clamp(pRaw, 0, 1);
    if (n === 0 || p === 0) return 0;
    if (p === 1) return n;
    if (n < 80) {
        let x = 0;
        for (let i = 0; i < n; i++) if (rng() < p) x++;
        return x;
    }
    const mean = n * p;
    const sd = Math.sqrt(n * p * (1 - p));
    return clamp(Math.round(mean + sd * normalRandom(rng)), 0, n);
}

export function quantile(values: number[], q: number): number {
    if (!values.length) return NaN;
    const sorted = [...values].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}

// ---------------------------------------------------------------------------
// per-month effective parameters (intervention lab)
// ---------------------------------------------------------------------------
export interface DynamicParams {
    sterilizedShare: number;
    rehomePerMonth: number;
    baselineCapacity: number;
    intakeDiscipline: number;
    interventionActive: boolean;
}

export function paramsAtMonth(p: Params, month: number, disableIntervention = false): DynamicParams {
    const active = !disableIntervention && p.interventionMonth > 0 && month >= p.interventionMonth;
    return {
        sterilizedShare: clamp(p.sterilizedShare + (active ? p.sterilizationBoost : 0), 0, 1),
        rehomePerMonth: Math.max(0, p.rehomePerMonth + (active ? p.rehomeBoost : 0)),
        baselineCapacity: Math.max(0.5, p.baselineCapacity + (active ? p.capacityBoost : 0)),
        intakeDiscipline: clamp(p.intakeDiscipline + (active ? p.intakeBoost : 0), 0, 1),
        interventionActive: active,
    };
}

// ---------------------------------------------------------------------------
// care metrics: capacity, load, and the rho = load / capacity ratio
// ---------------------------------------------------------------------------
export interface CareMetrics {
    effectiveCapacity: number;
    effectiveSpace: number;
    monitoringCapacity: number;
    baseLoad: number;
    load: number;
    rho: number;
    welfare: number;
    strain: number;
    densityRatio: number;
    monitoringRatio: number;
    densityMultiplier: number;
    monitoringMultiplier: number;
    diseaseMultiplier: number;
    interventionActive: boolean;
    dyn: DynamicParams;
}

export function careMetrics(
    n: number,
    p: Params,
    month = 0,
    previousRho = 0,
    disableIntervention = false,
): CareMetrics {
    const dyn = paramsAtMonth(p, month, disableIntervention);
    const organization = p.organization;
    const support = p.externalSupport;
    const effectiveCapacity = dyn.baselineCapacity * (1 + 0.2 * organization + 0.15 * support);
    const effectiveSpace = p.spaceCapacity * (1 + 0.3 * organization + 0.15 * support);
    const economy = clamp(p.economyOfScale + 0.22 * organization, 0, 0.82);

    const routinizable = n * 0.62 * (1 - economy * (1 - Math.exp(-n / 8)));
    const individual = n * 0.38 * (1 - 0.18 * organization);
    const baseLoad = routinizable + individual;

    const densityRatio = n / Math.max(effectiveSpace, 0.5);
    const densityMultiplier = Math.min(12, 1 + 0.55 * p.diseaseFeedback * Math.pow(Math.max(0, densityRatio - 0.7), 1.55));

    const monitoringCapacity = effectiveCapacity * (0.85 + 0.75 * organization + 0.18 * support);
    const monitoringRatio = n / Math.max(monitoringCapacity, 0.5);
    const monitoringMultiplier = Math.min(10, 1 + 0.5 * (1 - 0.65 * organization) * Math.pow(Math.max(0, monitoringRatio - 1), 1.35));

    const diseaseMultiplier = Math.min(8, 1 + 0.45 * p.diseaseFeedback * Math.pow(Math.max(0, previousRho - 0.85), 1.55));
    const load = Math.min(1e6, baseLoad * densityMultiplier * monitoringMultiplier * diseaseMultiplier);
    const rho = Math.min(12, load / Math.max(effectiveCapacity, 0.5));

    const careAdequacy = 1 / (1 + Math.exp(4.0 * (rho - 1.4)));
    const spaceAdequacy = 1 / (1 + 0.65 * Math.pow(Math.max(0, densityRatio - 1), 1.45));
    const monitoringAdequacy = 1 / (1 + 0.85 * Math.pow(Math.max(0, monitoringRatio - 1), 1.35));
    const diseaseAdequacy = 1 / (1 + 0.6 * p.diseaseFeedback * Math.pow(Math.max(0, previousRho - 0.8), 1.35));
    const welfare = 100 * Math.pow(careAdequacy, 0.46) * Math.pow(spaceAdequacy, 0.2) * Math.pow(monitoringAdequacy, 0.2) * Math.pow(diseaseAdequacy, 0.14);

    const strain = 100 * clamp(
        0.52 * (1 - Math.exp(-0.72 * rho)) +
        0.18 * Math.max(0, n - effectiveCapacity) / Math.max(effectiveCapacity, 1) +
        0.2 * (1 - organization) * Math.max(0, rho - 1) +
        0.1 * p.attachment * Math.min(1, n / 30),
        0, 1,
    );

    return {
        effectiveCapacity, effectiveSpace, monitoringCapacity, baseLoad, load, rho, welfare, strain,
        densityRatio, monitoringRatio, densityMultiplier, monitoringMultiplier, diseaseMultiplier,
        interventionActive: dyn.interventionActive, dyn,
    };
}

// ---------------------------------------------------------------------------
// the one-more-cat decision
// ---------------------------------------------------------------------------
export interface DecisionMetrics extends CareMetrics {
    nextMetrics: CareMetrics;
    benefit: number;
    actualCost: number;
    perceivedCost: number;
    acceptProbability: number;
    deltaLoad: number;
    benefitComponents: Record<string, number>;
    costComponents: Record<string, number>;
}

export function decisionMetrics(
    n: number,
    p: Params,
    month = 0,
    previousRho = 0,
    disableIntervention = false,
): DecisionMetrics {
    const metrics = careMetrics(n, p, month, previousRho, disableIntervention);
    const nextMetrics = careMetrics(n + 1, p, month, metrics.rho, disableIntervention);
    const dyn = metrics.dyn;

    const firstUtility = p.companionshipNeed * (n < 0.5 ? 1.25 : n < 1.5 ? 0.48 : 0.12 * Math.exp(-(n - 1) / 4));
    const pairBonus = n >= 0.5 && n < 1.5 ? 0.42 * p.companionshipNeed : 0;
    const rescue = p.rescueIdentity * (0.55 + 0.22 * Math.log1p(n));
    const solicitation = p.solicitationSensitivity * (0.25 + 0.18 * Math.exp(-n / 10));
    const identity = p.rescueIdentity * p.referralFeedback * 0.12 * Math.log1p(n);
    const baseBenefit = 0.18;
    const benefit = baseBenefit + firstUtility + pairBonus + rescue + solicitation + identity;

    const deltaLoad = Math.max(0, nextMetrics.load - metrics.load);
    const marginalCare = (2.1 * deltaLoad) / Math.max(metrics.effectiveCapacity, 0.5);
    const startup = n < 0.5 ? 0.72 : 0;
    const secondCatDiscount = n >= 0.5 && n < 1.5 ? 0.25 : 0;
    const currentOverload = 0.75 * Math.max(0, metrics.rho - 0.75);
    const densityCost = 0.38 * Math.max(0, nextMetrics.densityRatio - 0.85);
    const baseCost = 0.35;
    const actualCost = Math.max(0.05, baseCost + marginalCare + startup + currentOverload + densityCost - secondCatDiscount);

    const habituation = n / (n + 4);
    const blindness = p.costUnderestimation * (0.25 + 0.75 * habituation);
    const recognizedOverload = dyn.intakeDiscipline * (0.2 + 1.4 * p.overloadRecognition) * Math.max(0, metrics.rho - 0.7);
    const occupancy = n / Math.max(metrics.effectiveCapacity, 0.5);
    const gateStart = 0.75 - 0.35 * dyn.intakeDiscipline;
    const intakeGuard = dyn.intakeDiscipline * (0.6 + 1.4 * p.organization) * 12 * Math.pow(Math.max(0, occupancy - gateStart), 1.2);
    const perceivedCost = Math.max(0.03, actualCost * (1 - 0.72 * blindness) + recognizedOverload + intakeGuard);
    const acceptProbability = acceptanceProbability(benefit, perceivedCost);

    return {
        ...metrics, nextMetrics, benefit, actualCost, perceivedCost, acceptProbability, deltaLoad,
        benefitComponents: {
            'baseline caregiving pull': baseBenefit,
            'utility / companionship': firstUtility,
            'second-cat bonus': pairBonus,
            'rescue identity': rescue,
            'cat solicitation': solicitation,
            'reputation identity': identity,
        },
        costComponents: {
            'baseline friction': baseCost,
            'marginal care load': marginalCare,
            'first-cat setup': startup,
            'existing overload': currentOverload,
            'density pressure': densityCost,
            'second-cat infrastructure discount': -secondCatDiscount,
            'recognized overload (perception)': recognizedOverload,
            'intake-capacity guard': intakeGuard,
            'cost hidden by habituation': -(actualCost - actualCost * (1 - 0.72 * blindness)),
        },
    };
}

function desiredCompanionCount(p: Params): number {
    if (p.companionshipNeed >= 0.72) return 2;
    if (p.companionshipNeed >= 0.18) return 1;
    return 0;
}

// ---------------------------------------------------------------------------
// expected monthly flows
// ---------------------------------------------------------------------------
export interface FlowResult {
    decision: DecisionMetrics;
    opportunityExpected: number;
    acceptedExpected: number;
    birthExpected: number;
    rehomeExpected: number;
    deathExpected: number;
    reputation: number;
    annualSurvivingKittensPerFertileFemale: number;
    fertileFemales: number;
    attachmentPass: number;
    networkFactor: number;
}

export function expectedFlows(
    n: number,
    p: Params,
    month: number,
    previousRho: number,
    disableIntervention = false,
): FlowResult {
    const decision = decisionMetrics(n, p, month, previousRho, disableIntervention);
    const dyn = decision.dyn;

    const reputation = 1 + p.referralFeedback * p.rescueIdentity * 2.0 * (0.25 * Math.log1p(n) + 0.015 * n);
    const opportunityExpected = (p.baseArrivalsPerYear / 12) * reputation;
    const acceptedExpected = opportunityExpected * decision.acceptProbability;

    // literature anchor: 1.4 litters/year and median 3 kittens/litter (Nutter et al., 2004).
    const annualSurvivingKittensPerFertileFemale = 1.4 * 3.0 * p.kittenSurvival * p.reproductionScale;
    const fertileFemales = n * 0.5 * (1 - dyn.sterilizedShare);
    const birthExpected = (fertileFemales * annualSurvivingKittensPerFertileFemale) / 12 * (0.72 + 0.28 * decision.welfare / 100);

    const desired = desiredCompanionCount(p);
    const excess = Math.max(0, n - desired);
    const attachmentPass = 0.12 + 0.88 * (1 - p.attachment);
    const crisisMotivation = 1 + 1.6 * p.overloadRecognition * Math.max(0, decision.rho - 0.9);
    const chaosPenalty = 1 / (1 + 0.8 * p.diseaseFeedback * Math.pow(Math.max(0, decision.rho - 1.2), 1.3));
    const networkFactor = 0.55 + 0.75 * p.organization + 0.45 * p.externalSupport + 0.35 * p.rescueIdentity;
    const rehomeExpected = Math.min(excess, dyn.rehomePerMonth * attachmentPass * crisisMotivation * chaosPenalty * networkFactor);

    const excessRisk = 1 + 2.5 * Math.pow(Math.max(0, (70 - decision.welfare) / 70), 1.6);
    const deathExpected = Math.min(n * 0.25, n * (p.annualMortality / 12) * excessRisk);

    return {
        decision, opportunityExpected, acceptedExpected, birthExpected, rehomeExpected, deathExpected,
        reputation, annualSurvivingKittensPerFertileFemale, fertileFemales, attachmentPass, networkFactor,
    };
}

// ---------------------------------------------------------------------------
// simulation
// ---------------------------------------------------------------------------
export interface Row {
    month: number;
    n: number;
    capacity: number;
    load: number;
    rho: number;
    welfare: number;
    strain: number;
    pAccept: number;
    opportunities: number;
    arrivals: number;
    births: number;
    rehomes: number;
    deaths: number;
    interventionActive: boolean;
    reputation: number;
}

export interface Regime {
    key: string;
    label: string;
    tone: 'good' | 'warn' | 'danger' | 'accent';
    note: string;
}

export interface ThresholdEvent {
    month: number;
    title: string;
    note: string;
    severity: 'normal' | 'warn' | 'danger';
    order: number;
}

export interface SimResult {
    rows: Row[];
    final: Row;
    peakN: number;
    peakRho: number;
    minWelfare: number;
    maxStrain: number;
    firstOverload: number | null;
    firstSevere: number | null;
    regime: Regime;
    events: ThresholdEvent[];
    disableIntervention: boolean;
}

export function classifyRegime(n: number, rho: number, welfare: number, p: Params): Regime {
    if (n < 0.5) return { key: 'none', label: 'no-cat state', tone: 'accent', note: 'No cat currently retained.' };
    if (n < 1.5 && rho < 1) return { key: 'single', label: 'single-cat household', tone: 'good', note: 'Individual care remains legible.' };
    if (n < 2.5 && rho < 1) return { key: 'pair', label: 'two-cat household', tone: 'good', note: 'The second-cat threshold has been crossed without overload.' };
    if (rho < 1 && n < 7) return { key: 'multi', label: 'stable multi-cat household', tone: 'good', note: 'Several cats, but required care stays below capacity.' };
    if (rho < 1 && n >= 20 && p.organization >= 0.62) return { key: 'sanctuary', label: 'managed sanctuary', tone: 'accent', note: 'High count supported by institutional organization and reserve capacity.' };
    if (rho < 1 && n >= 7) return { key: 'rescue', label: 'stable rescue network', tone: 'accent', note: 'The household has become a population-management system.' };
    if (rho >= 1.55 || welfare < 40) return { key: 'crisis', label: 'accumulation crisis', tone: 'danger', note: 'Care requirements materially exceed effective capacity.' };
    return { key: 'overload', label: 'capacity overload', tone: 'warn', note: 'The system has crossed rho = 1 and has little or no reserve.' };
}

function detectEvents(rows: Row[], p: Params): ThresholdEvent[] {
    const events: ThresholdEvent[] = [];
    let order = 0;
    const addFirst = (
        predicate: (r: Row) => boolean,
        title: string,
        note: string,
        severity: ThresholdEvent['severity'] = 'normal',
    ) => {
        const r = rows.find(predicate);
        if (r) events.push({ month: r.month, title, note, severity, order: order++ });
    };
    addFirst((r) => r.n >= 1, 'first cat retained', 'The fixed commitment threshold has been crossed.');
    addFirst((r) => r.n >= 2, 'second cat retained', 'Existing routines make the next cat feel cheaper than the first.');
    addFirst((r) => r.n >= 5, 'multi-cat identity threshold', 'Care begins to operate as a small population rather than isolated pets.');
    addFirst((r) => r.n >= 20, 'informal institution threshold', 'Individualized monitoring and placement now require deliberate systems.', 'warn');
    addFirst((r) => r.rho >= 1, 'capacity crossed', 'Required care load has exceeded effective capacity, rho >= 1.', 'warn');
    addFirst((r) => r.welfare < 70, 'welfare warning', 'The synthetic welfare index has fallen below 70.', 'warn');
    addFirst((r) => r.n >= 50, 'large-population threshold', 'The household now resembles a small shelter in scale.', 'warn');
    addFirst((r) => r.welfare < 40, 'severe welfare risk', 'The synthetic welfare index has fallen below 40.', 'danger');
    addFirst((r) => r.n >= 100, '100-cat threshold', 'A high-count household requires institutional staffing, records, medicine, and intake control.', 'danger');
    addFirst((r) => r.n >= 120, '120-cat threshold', 'The scenario has reached the extreme population named in the original question.', 'danger');
    if (p.interventionMonth > 0 && rows.some((r) => r.month === p.interventionMonth && r.interventionActive)) {
        events.push({ month: p.interventionMonth, title: 'intervention begins', note: 'The configured sterilization, rehoming, capacity, and intake changes start.', severity: 'normal', order: order++ });
    }
    events.sort((a, b) => a.month - b.month || a.order - b.order);
    return events;
}

function summarizeSimulation(rows: Row[], p: Params, disableIntervention: boolean): SimResult {
    const final = rows[rows.length - 1];
    const peakN = Math.max(...rows.map((r) => r.n));
    const peakRho = Math.max(...rows.map((r) => r.rho));
    const minWelfare = Math.min(...rows.map((r) => r.welfare));
    const maxStrain = Math.max(...rows.map((r) => r.strain));
    const firstOverloadRow = rows.find((r) => r.rho >= 1);
    const firstSevereRow = rows.find((r) => r.welfare < 40);
    return {
        rows, final, peakN, peakRho, minWelfare, maxStrain,
        firstOverload: firstOverloadRow ? firstOverloadRow.month : null,
        firstSevere: firstSevereRow ? firstSevereRow.month : null,
        regime: classifyRegime(final.n, final.rho, final.welfare, p),
        events: detectEvents(rows, p),
        disableIntervention,
    };
}

export function simulate(p: Params, seed = 42, stochastic = false, disableIntervention = false): SimResult {
    const rng = mulberry32(seed);
    const horizon = Math.round(p.horizonMonths);
    const rows: Row[] = [];
    let n = clamp(p.initialCats, 0, MAX_CATS);
    let previousRho = 0;

    for (let month = 0; month <= horizon; month++) {
        const flow = expectedFlows(n, p, month, previousRho, disableIntervention);
        const d = flow.decision;
        const row: Row = {
            month, n, capacity: d.effectiveCapacity, load: d.load, rho: d.rho, welfare: d.welfare, strain: d.strain,
            pAccept: d.acceptProbability, opportunities: 0, arrivals: 0, births: 0, rehomes: 0, deaths: 0,
            interventionActive: d.interventionActive, reputation: flow.reputation,
        };
        rows.push(row);
        if (month === horizon) break;

        let opportunities: number;
        let arrivals: number;
        let births: number;
        let rehomes: number;
        let deaths: number;
        if (stochastic) {
            opportunities = poisson(flow.opportunityExpected, rng);
            arrivals = binomial(opportunities, d.acceptProbability, rng);
            births = poisson(flow.birthExpected, rng);
            rehomes = Math.min(Math.floor(n + arrivals + births), poisson(flow.rehomeExpected, rng));
            deaths = Math.min(Math.floor(n + arrivals + births - rehomes), poisson(flow.deathExpected, rng));
        } else {
            opportunities = flow.opportunityExpected;
            arrivals = flow.acceptedExpected;
            births = flow.birthExpected;
            rehomes = flow.rehomeExpected;
            deaths = flow.deathExpected;
        }

        row.opportunities = opportunities;
        row.arrivals = arrivals;
        row.births = births;
        row.rehomes = rehomes;
        row.deaths = deaths;

        n = clamp(n + arrivals + births - rehomes - deaths, 0, MAX_CATS);
        previousRho = d.rho;
    }
    return summarizeSimulation(rows, p, disableIntervention);
}

// ---------------------------------------------------------------------------
// Monte Carlo ensemble
// ---------------------------------------------------------------------------
export interface EnsembleRow {
    month: number;
    n10: number;
    n50: number;
    n90: number;
    capacity50: number;
    rho50: number;
    welfare10: number;
    welfare50: number;
    welfare90: number;
    strain50: number;
}

export interface EnsembleResult {
    rows: EnsembleRow[];
    runs: number;
    final10: number;
    final50: number;
    final90: number;
    overloadProb: number;
    reach120Prob: number;
    severeProb: number;
    medianFirstOverload: number | null;
    medianRegime: Regime;
}

export function simulateEnsemble(p: Params, runs = 200, seed = 42): EnsembleResult {
    const sims: SimResult[] = [];
    for (let i = 0; i < runs; i++) sims.push(simulate(p, seed + i * 7919, true, false));
    const horizon = Math.round(p.horizonMonths);
    const rows: EnsembleRow[] = [];
    for (let month = 0; month <= horizon; month++) {
        const monthRows = sims.map((s) => s.rows[month]);
        rows.push({
            month,
            n10: quantile(monthRows.map((r) => r.n), 0.1),
            n50: quantile(monthRows.map((r) => r.n), 0.5),
            n90: quantile(monthRows.map((r) => r.n), 0.9),
            capacity50: quantile(monthRows.map((r) => r.capacity), 0.5),
            rho50: quantile(monthRows.map((r) => r.rho), 0.5),
            welfare10: quantile(monthRows.map((r) => r.welfare), 0.1),
            welfare50: quantile(monthRows.map((r) => r.welfare), 0.5),
            welfare90: quantile(monthRows.map((r) => r.welfare), 0.9),
            strain50: quantile(monthRows.map((r) => r.strain), 0.5),
        });
    }
    const finals = sims.map((s) => s.final.n);
    const overloadMonths = sims.filter((s) => s.firstOverload !== null).map((s) => s.firstOverload as number);
    const last = rows[horizon];
    return {
        rows, runs,
        final10: quantile(finals, 0.1), final50: quantile(finals, 0.5), final90: quantile(finals, 0.9),
        overloadProb: sims.filter((s) => s.firstOverload !== null).length / runs,
        reach120Prob: sims.filter((s) => s.peakN >= 120).length / runs,
        severeProb: sims.filter((s) => s.minWelfare < 40).length / runs,
        medianFirstOverload: overloadMonths.length ? quantile(overloadMonths, 0.5) : null,
        medianRegime: classifyRegime(last.n50, last.rho50, last.welfare50, p),
    };
}

// ---------------------------------------------------------------------------
// threshold scanner (1-D sweep + cliff detection)
// ---------------------------------------------------------------------------
export interface SweepPoint {
    value: number;
    finalCats: number;
    peakRho: number;
    minWelfare: number;
    firstOverload: number | null;
}

export interface SweepCrossing {
    label: string;
    value: number;
    finalCats: number;
    peakRho: number;
}

export interface SweepResult {
    key: ParamKey;
    min: number;
    max: number;
    points: SweepPoint[];
    cliffIndex: number;
    cliffValue: number;
    crossings: SweepCrossing[];
}

const SWEEP_THRESHOLDS: { label: string; test: (p: SweepPoint) => boolean }[] = [
    { label: 'final population reaches 2', test: (p) => p.finalCats >= 2 },
    { label: 'final population reaches 5', test: (p) => p.finalCats >= 5 },
    { label: 'peak load reaches rho = 1', test: (p) => p.peakRho >= 1 },
    { label: 'final population reaches 20', test: (p) => p.finalCats >= 20 },
    { label: 'minimum welfare falls below 40', test: (p) => p.minWelfare < 40 },
    { label: 'final population reaches 120', test: (p) => p.finalCats >= 120 },
];

export function computeSweep(state: Params, key: ParamKey, steps = 61): SweepResult {
    const meta = PARAM_META.find((m) => m.key === key) as ParamMeta;
    const points: SweepPoint[] = [];
    for (let i = 0; i < steps; i++) {
        const v = lerp(meta.min, meta.max, i / (steps - 1));
        const sim = simulate({ ...state, [key]: v }, 1, false, false);
        points.push({ value: v, finalCats: sim.final.n, peakRho: sim.peakRho, minWelfare: sim.minWelfare, firstOverload: sim.firstOverload });
    }
    let maxSlope = -Infinity;
    let cliffIndex = 0;
    const maxCats = Math.max(1, ...points.map((p) => p.finalCats));
    const maxRho = Math.max(1, ...points.map((p) => p.peakRho));
    for (let i = 1; i < points.length - 1; i++) {
        const dc = Math.abs(points[i + 1].finalCats - points[i - 1].finalCats) / maxCats;
        const dr = Math.abs(points[i + 1].peakRho - points[i - 1].peakRho) / maxRho;
        const slope = dc + dr;
        if (slope > maxSlope) {
            maxSlope = slope;
            cliffIndex = i;
        }
    }
    const crossings: SweepCrossing[] = [];
    for (const t of SWEEP_THRESHOLDS) {
        const idx = points.findIndex(t.test);
        if (idx >= 0) crossings.push({ label: t.label, value: points[idx].value, finalCats: points[idx].finalCats, peakRho: points[idx].peakRho });
    }
    return { key, min: meta.min, max: meta.max, points, cliffIndex, cliffValue: points[cliffIndex].value, crossings };
}

// ---------------------------------------------------------------------------
// two-parameter phase map
// ---------------------------------------------------------------------------
export interface PhaseCell {
    i: number;
    j: number;
    xv: number;
    yv: number;
    finalCats: number;
    peakRho: number;
    minWelfare: number;
    regimeKey: string;
}

export interface PhaseResult {
    xKey: ParamKey;
    yKey: ParamKey;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    nx: number;
    ny: number;
    cells: PhaseCell[];
    overloadedShare: number;
    reach120Share: number;
    stableHighShare: number;
}

export function computePhase(state: Params, xKey: ParamKey, yKey: ParamKey, nx = 26, ny = 20): PhaseResult {
    const xMeta = PARAM_META.find((m) => m.key === xKey) as ParamMeta;
    const yMeta = PARAM_META.find((m) => m.key === yKey) as ParamMeta;
    const cells: PhaseCell[] = [];
    for (let j = 0; j < ny; j++) {
        const yv = lerp(yMeta.min, yMeta.max, j / (ny - 1));
        for (let i = 0; i < nx; i++) {
            const xv = lerp(xMeta.min, xMeta.max, i / (nx - 1));
            const sim = simulate({ ...state, [xKey]: xv, [yKey]: yv }, 1, false, false);
            cells.push({ i, j, xv, yv, finalCats: sim.final.n, peakRho: sim.peakRho, minWelfare: sim.minWelfare, regimeKey: sim.regime.key });
        }
    }
    const total = cells.length;
    return {
        xKey, yKey, xMin: xMeta.min, xMax: xMeta.max, yMin: yMeta.min, yMax: yMeta.max, nx, ny, cells,
        overloadedShare: cells.filter((c) => c.peakRho >= 1).length / total,
        reach120Share: cells.filter((c) => c.finalCats >= 120).length / total,
        stableHighShare: cells.filter((c) => c.finalCats >= 20 && c.peakRho < 1).length / total,
    };
}

// ---------------------------------------------------------------------------
// snapshot comparison
// ---------------------------------------------------------------------------
export interface Snapshot {
    label: string;
    finalCats: number;
    peakRho: number;
    minWelfare: number;
    firstOverload: number | null;
    regimeLabel: string;
    series: { month: number; n: number }[];
}

export function makeSnapshot(sim: SimResult, label: string): Snapshot {
    return {
        label,
        finalCats: sim.final.n,
        peakRho: sim.peakRho,
        minWelfare: sim.minWelfare,
        firstOverload: sim.firstOverload,
        regimeLabel: sim.regime.label,
        series: sim.rows.map((r) => ({ month: r.month, n: r.n })),
    };
}

// ---------------------------------------------------------------------------
// sensitivity (tornado): sweep each lever min->max, record final population
// ---------------------------------------------------------------------------
export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

export function computeSensitivity(state: Params): { bars: SensitivityBar[]; baseline: number } {
    const baseline = simulate(state, 1, false, false).final.n;
    const bars: SensitivityBar[] = SWEEP_KEYS.map((key) => {
        const meta = PARAM_META.find((m) => m.key === key) as ParamMeta;
        const atMin = simulate({ ...state, [key]: meta.min }, 1, false, false).final.n;
        const atMax = simulate({ ...state, [key]: meta.max }, 1, false, false).final.n;
        return { label: meta.label, low: Math.min(atMin, atMax), high: Math.max(atMin, atMax) };
    });
    bars.sort((a, b) => (b.high - b.low) - (a.high - a.low));
    return { bars, baseline };
}

// ---------------------------------------------------------------------------
// plain-language narrative of the current trajectory
// ---------------------------------------------------------------------------
export function computeNarrative(sim: SimResult, params: Params, noIntervention?: SimResult | null): string {
    const parts: string[] = [];
    const final = sim.final;
    const start = Math.round(params.initialCats);
    const end = Math.round(final.n);
    const article = /^[aeiou]/i.test(sim.regime.label) ? 'an' : 'a';

    parts.push(`Starting from ${start} cat${start === 1 ? '' : 's'}, this household settles into ${article} ${sim.regime.label} at about ${end} cat${end === 1 ? '' : 's'}.`);

    if (sim.firstOverload !== null) {
        parts.push(`Required care crosses effective capacity (rho = 1) at ${monthLabel(sim.firstOverload)}, and load peaks near ${sim.peakRho.toFixed(1)}x capacity.`);
    } else {
        parts.push(`Care stays within capacity throughout: load peaks at ${sim.peakRho.toFixed(2)}x, never crossing 1.`);
    }

    // dominant driver of any growth above the starting count
    if (end > start + 1) {
        const drivers: { label: string; weight: number }[] = [
            { label: 'social referral feedback (a rising reputation as someone who takes cats in)', weight: params.referralFeedback * params.rescueIdentity },
            { label: 'reproduction inside the household (too few cats sterilized)', weight: (1 - params.sterilizedShare) * params.reproductionScale },
            { label: 'sensitivity to cat solicitation at the door', weight: params.solicitationSensitivity * params.baseArrivalsPerYear / 8 },
            { label: 'weak intake discipline against a high opportunity rate', weight: (1 - params.intakeDiscipline) * params.baseArrivalsPerYear / 8 },
        ];
        drivers.sort((a, b) => b.weight - a.weight);
        parts.push(`The main engine of accumulation here is ${drivers[0].label}.`);
    } else if (end <= start) {
        parts.push('Intake and exits roughly balance, so the population does not run away.');
    }

    if (final.welfare < 40) {
        parts.push(`Synthetic welfare falls to ${Math.round(sim.minWelfare)} at its worst, the range the model reserves for a genuine crisis.`);
    } else if (final.welfare < 70) {
        parts.push(`Welfare dips to ${Math.round(sim.minWelfare)}, a strained but not collapsed household.`);
    }

    if (params.interventionMonth > 0 && noIntervention) {
        const diff = Math.round(noIntervention.final.n - final.n);
        if (diff > 1) {
            parts.push(`The intervention at ${monthLabel(params.interventionMonth)} holds the final count roughly ${diff} cat${diff === 1 ? '' : 's'} below the no-intervention counterfactual.`);
        } else if (diff < -1) {
            parts.push(`Oddly, the configured intervention leaves the final count higher than doing nothing; check its timing and mix.`);
        } else {
            parts.push('The configured intervention barely moves the final count from the no-intervention path.');
        }
    }

    return parts.join(' ');
}

// ---------------------------------------------------------------------------
// display formatting
// ---------------------------------------------------------------------------
export function formatParamValue(key: ParamKey, value: number): string {
    const meta = PARAM_META.find((m) => m.key === key);
    if (!meta) return String(value);
    if (key === 'interventionMonth' && value === 0) return 'off';
    if (meta.format === 'percent') return `${Math.round(value * 100)}%`;
    if (meta.format === 'percentPoints') return `+${Math.round(value * 100)} pp`;
    if (meta.format === 'score') return value.toFixed(2);
    if (meta.unit === 'cats' || meta.unit === 'months' || meta.unit === 'month' || meta.unit === 'cat-equivalents') {
        return `${Math.round(value)} ${meta.unit}`;
    }
    if (meta.unit === '/year') return `${value.toFixed(2)}/yr`;
    if (meta.unit === 'cats/month') return `${value.toFixed(2)}/mo`;
    return value.toFixed(2);
}

export function monthLabel(m: number | null): string {
    if (m === null || m === undefined || !Number.isFinite(m)) return 'never';
    if (m === 0) return 'start';
    const y = Math.floor(m / 12);
    const mo = m % 12;
    return y > 0 ? `${y}y ${mo}m` : `${mo}m`;
}
