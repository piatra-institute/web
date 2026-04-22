// ── Counterfactual Growth Engine ─────────────────────────────────
// Explore how countries might have evolved under another country's
// economic path. Not a literal causal estimate — a framework for
// counterfactual exploration. The target country keeps its own
// starting conditions and population; we transfer part of the
// model country's growth trajectory or policy basket.
//
// Beyond the original ideation:
//  * 13 countries (not 6)
//  * Synthetic control — blend multiple model countries
//  * Confidence bands (transfer uncertainty)
//  * Event markers on timeline
//  * Gap decomposition by policy dimension
//  * Reverse-mode framework symmetry
// ─────────────────────────────────────────────────────────────────

import type { SensitivityBar } from '@/components/SensitivityAnalysis';

// ── Years ────────────────────────────────────────────────────────

export const YEAR_START = 1990;
export const YEAR_END = 2024;
export const YEARS = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_START + i);


// ── Country presets ──────────────────────────────────────────────

export interface CountryPreset {
    code: CountryCode;
    name: string;
    color: string;
    population1990: number;  // millions
    population2024: number;
    gdpPc1990: number;       // USD (constant 2010)
    policy: {
        institutions: number;
        investment: number;
        education: number;
        exportComplexity: number;
        macroStability: number;
        stateCapacity: number;
        euAbsorption: number;
    };
    growthAnchors: {
        earlyTransitionDrag: number;
        convergenceBoost: number;
        crisisPenalty: number;
        recovery: number;
        recent: number;
    };
}

export type CountryCode =
    | 'ROU' | 'POL' | 'CZE' | 'EST' | 'HUN' | 'BGR'
    | 'DEU' | 'ESP' | 'SVK' | 'SVN' | 'PRT' | 'IRL' | 'KOR' | 'UKR';

export const COUNTRIES: Record<CountryCode, CountryPreset> = {
    ROU: {
        code: 'ROU', name: 'Romania', color: '#a3e635',
        population1990: 23.2, population2024: 19.0, gdpPc1990: 5000,
        policy: { institutions: 48, investment: 52, education: 58, exportComplexity: 46, macroStability: 51, stateCapacity: 47, euAbsorption: 58 },
        growthAnchors: { earlyTransitionDrag: -0.035, convergenceBoost: 0.029, crisisPenalty: -0.055, recovery: 0.028, recent: 0.022 },
    },
    POL: {
        code: 'POL', name: 'Poland', color: '#22d3ee',
        population1990: 38.2, population2024: 36.6, gdpPc1990: 5100,
        policy: { institutions: 70, investment: 67, education: 68, exportComplexity: 69, macroStability: 73, stateCapacity: 67, euAbsorption: 76 },
        growthAnchors: { earlyTransitionDrag: -0.008, convergenceBoost: 0.039, crisisPenalty: -0.012, recovery: 0.032, recent: 0.026 },
    },
    CZE: {
        code: 'CZE', name: 'Czechia', color: '#c084fc',
        population1990: 10.4, population2024: 10.9, gdpPc1990: 8200,
        policy: { institutions: 78, investment: 66, education: 72, exportComplexity: 79, macroStability: 74, stateCapacity: 72, euAbsorption: 70 },
        growthAnchors: { earlyTransitionDrag: -0.015, convergenceBoost: 0.031, crisisPenalty: -0.03, recovery: 0.026, recent: 0.019 },
    },
    EST: {
        code: 'EST', name: 'Estonia', color: '#10b981',
        population1990: 1.57, population2024: 1.37, gdpPc1990: 6200,
        policy: { institutions: 83, investment: 63, education: 73, exportComplexity: 64, macroStability: 79, stateCapacity: 77, euAbsorption: 71 },
        growthAnchors: { earlyTransitionDrag: -0.03, convergenceBoost: 0.045, crisisPenalty: -0.07, recovery: 0.035, recent: 0.024 },
    },
    HUN: {
        code: 'HUN', name: 'Hungary', color: '#f59e0b',
        population1990: 10.37, population2024: 9.6, gdpPc1990: 7600,
        policy: { institutions: 61, investment: 59, education: 64, exportComplexity: 66, macroStability: 57, stateCapacity: 60, euAbsorption: 65 },
        growthAnchors: { earlyTransitionDrag: -0.02, convergenceBoost: 0.028, crisisPenalty: -0.045, recovery: 0.02, recent: 0.014 },
    },
    BGR: {
        code: 'BGR', name: 'Bulgaria', color: '#84cc16',
        population1990: 8.7, population2024: 6.45, gdpPc1990: 4200,
        policy: { institutions: 50, investment: 49, education: 57, exportComplexity: 48, macroStability: 53, stateCapacity: 46, euAbsorption: 55 },
        growthAnchors: { earlyTransitionDrag: -0.04, convergenceBoost: 0.031, crisisPenalty: -0.05, recovery: 0.025, recent: 0.021 },
    },
    DEU: {
        code: 'DEU', name: 'Germany', color: '#eab308',
        population1990: 79.4, population2024: 84.5, gdpPc1990: 29600,
        policy: { institutions: 88, investment: 72, education: 82, exportComplexity: 94, macroStability: 86, stateCapacity: 85, euAbsorption: 68 },
        growthAnchors: { earlyTransitionDrag: 0.021, convergenceBoost: 0.017, crisisPenalty: -0.055, recovery: 0.019, recent: 0.008 },
    },
    ESP: {
        code: 'ESP', name: 'Spain', color: '#f43f5e',
        population1990: 38.9, population2024: 48.4, gdpPc1990: 22100,
        policy: { institutions: 72, investment: 63, education: 69, exportComplexity: 74, macroStability: 68, stateCapacity: 70, euAbsorption: 82 },
        growthAnchors: { earlyTransitionDrag: 0.028, convergenceBoost: 0.025, crisisPenalty: -0.065, recovery: 0.017, recent: 0.014 },
    },
    SVK: {
        code: 'SVK', name: 'Slovakia', color: '#a78bfa',
        population1990: 5.28, population2024: 5.42, gdpPc1990: 6400,
        policy: { institutions: 64, investment: 68, education: 66, exportComplexity: 75, macroStability: 69, stateCapacity: 64, euAbsorption: 69 },
        growthAnchors: { earlyTransitionDrag: -0.02, convergenceBoost: 0.041, crisisPenalty: -0.048, recovery: 0.028, recent: 0.018 },
    },
    SVN: {
        code: 'SVN', name: 'Slovenia', color: '#06b6d4',
        population1990: 2.0, population2024: 2.12, gdpPc1990: 11300,
        policy: { institutions: 74, investment: 61, education: 75, exportComplexity: 78, macroStability: 70, stateCapacity: 71, euAbsorption: 67 },
        growthAnchors: { earlyTransitionDrag: -0.018, convergenceBoost: 0.028, crisisPenalty: -0.075, recovery: 0.021, recent: 0.016 },
    },
    PRT: {
        code: 'PRT', name: 'Portugal', color: '#ec4899',
        population1990: 9.96, population2024: 10.3, gdpPc1990: 15800,
        policy: { institutions: 70, investment: 57, education: 62, exportComplexity: 65, macroStability: 62, stateCapacity: 67, euAbsorption: 80 },
        growthAnchors: { earlyTransitionDrag: 0.025, convergenceBoost: 0.021, crisisPenalty: -0.055, recovery: 0.012, recent: 0.015 },
    },
    IRL: {
        code: 'IRL', name: 'Ireland', color: '#14b8a6',
        population1990: 3.5, population2024: 5.3, gdpPc1990: 14800,
        policy: { institutions: 82, investment: 88, education: 79, exportComplexity: 85, macroStability: 72, stateCapacity: 73, euAbsorption: 85 },
        growthAnchors: { earlyTransitionDrag: 0.048, convergenceBoost: 0.062, crisisPenalty: -0.04, recovery: 0.055, recent: 0.039 },
    },
    KOR: {
        code: 'KOR', name: 'South Korea', color: '#fb923c',
        population1990: 42.9, population2024: 51.8, gdpPc1990: 8300,
        policy: { institutions: 78, investment: 81, education: 91, exportComplexity: 92, macroStability: 75, stateCapacity: 81, euAbsorption: 0 },
        growthAnchors: { earlyTransitionDrag: 0.078, convergenceBoost: 0.051, crisisPenalty: -0.02, recovery: 0.034, recent: 0.021 },
    },
    UKR: {
        code: 'UKR', name: 'Ukraine', color: '#facc15',
        population1990: 51.6, population2024: 37.0, gdpPc1990: 4300,
        policy: { institutions: 38, investment: 42, education: 58, exportComplexity: 44, macroStability: 40, stateCapacity: 39, euAbsorption: 28 },
        growthAnchors: { earlyTransitionDrag: -0.095, convergenceBoost: 0.014, crisisPenalty: -0.065, recovery: 0.018, recent: -0.025 },
    },
};

export const POLICY_DIMENSIONS: { key: keyof CountryPreset['policy']; label: string }[] = [
    { key: 'institutions', label: 'Institutions' },
    { key: 'investment', label: 'Investment' },
    { key: 'education', label: 'Education' },
    { key: 'exportComplexity', label: 'Export complexity' },
    { key: 'macroStability', label: 'Macro stability' },
    { key: 'stateCapacity', label: 'State capacity' },
    { key: 'euAbsorption', label: 'EU absorption' },
];


// ── Historical events ────────────────────────────────────────────

export interface HistoricalEvent {
    year: number;
    label: string;
    scope: 'global' | 'europe' | CountryCode[];
}

export const EVENTS: HistoricalEvent[] = [
    { year: 1991, label: 'USSR dissolution', scope: 'global' },
    { year: 1993, label: 'Czechoslovakia splits', scope: ['CZE', 'SVK'] },
    { year: 1995, label: 'WTO formed', scope: 'global' },
    { year: 2004, label: 'EU eastward expansion', scope: ['POL', 'CZE', 'EST', 'HUN', 'SVK', 'SVN'] },
    { year: 2007, label: 'Romania & Bulgaria join EU', scope: ['ROU', 'BGR'] },
    { year: 2008, label: 'Global financial crisis', scope: 'global' },
    { year: 2013, label: 'Croatia joins EU', scope: 'europe' },
    { year: 2020, label: 'COVID-19 pandemic', scope: 'global' },
    { year: 2022, label: 'Russia invades Ukraine', scope: ['UKR'] },
];


// ── Types ────────────────────────────────────────────────────────

export type TransferMode = 'path' | 'basket';
export type PopulationMode = 'target' | 'scaled-model';
export type ModelBlend = Partial<Record<CountryCode, number>>;  // weights sum to 1

export interface Params {
    preset: PresetKey;
    target: CountryCode;
    models: ModelBlend;           // synthetic control: weighted blend
    mode: TransferMode;
    startYear: number;            // reform begins
    endYear: number;              // reform reverts to baseline after this year
    phaseInYears: number;         // gradual ramp-up of transfer intensity (years)
    transferIntensity: number;    // 0..1
    adoptionLag: number;          // years
    populationMode: PopulationMode;
    convergenceDrag: number;      // pp/year
    policyOverride: number;       // 30..90, used in 'basket' mode
    uncertaintyPct: number;       // 0..25 — confidence band width
    reverseFraming: boolean;      // swap which country gets whose path (symmetric check)
    analysisStart: number;        // chart zoom start year
    analysisEnd: number;          // chart zoom end year
}


// ── Presets ──────────────────────────────────────────────────────

export type PresetKey =
    | 'ro-under-pl' | 'bg-under-cze' | 'hu-under-pl' | 'ua-under-pl' | 'ro-under-synth'
    | 'pt-under-ie' | 'es-under-de' | 'sk-under-cze' | 'si-under-at-synth'
    | 'est-under-kor' | 'ro-under-kor' | 'ua-early-reform' | 'de-under-ro';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    // — Eastern European transition —
    'ro-under-pl': {
        label: 'Romania under Poland',
        question: 'What if Romania had matched Poland’s post-1990 growth path?',
        expectation: 'A cumulative gap around $1.5–1.8T (constant 2010 USD). Gains accelerate after EU accession.',
    },
    'bg-under-cze': {
        label: 'Bulgaria under Czechia',
        question: 'How much output did Bulgaria forgo by not matching the Czech institutional trajectory?',
        expectation: 'Czech-like institutions and export complexity lift cumulative GDP substantially by 2024.',
    },
    'hu-under-pl': {
        label: 'Hungary under Poland',
        question: 'Would Hungary be richer if it had stayed on a Polish-style reform path instead of tacking toward illiberal consolidation?',
        expectation: 'Modest to moderate lift; the counterfactual diverges most in the 2015–2024 window.',
    },
    'ua-under-pl': {
        label: 'Ukraine under Poland',
        question: 'What would Ukraine look like if it had embarked on Polish-style reform in 1991?',
        expectation: 'Very large cumulative gap, bounded by a wide uncertainty band — deep regime change cannot be cheaply counterfactualized.',
    },
    'ro-under-synth': {
        label: 'Romania: synthetic control (CEE)',
        question: 'What if Romania’s path blended Poland, Czechia, and Slovakia in equal parts?',
        expectation: 'Softer curve than any single-country transfer; illustrates why synthetic control > arbitrary single-country comparison.',
    },
    'sk-under-cze': {
        label: 'Slovakia under Czechia',
        question: 'How much did the 1993 Czechoslovak split cost Slovakia — or did the flat-tax reforms close the gap?',
        expectation: 'Small gap; Slovakia’s 2004 reforms and export-led growth largely matched Czech trajectory.',
    },
    'si-under-at-synth': {
        label: 'Slovenia under DE+PRT synth',
        question: 'Would Slovenia have converged faster under a Germany + Portugal blend than its own gradualist path?',
        expectation: 'Modest negative gap — Slovenia’s gradualism performed well, the synthetic shows mild underperformance.',
    },

    // — Southern European convergence —
    'pt-under-ie': {
        label: 'Portugal under Ireland',
        question: 'What if Portugal had pursued an Irish-style FDI-driven export strategy from 1990?',
        expectation: 'Dramatic cumulative gap — Ireland’s growth was extraordinary. Wide uncertainty band reflects how much depends on tax/regulatory specifics.',
    },
    'es-under-de': {
        label: 'Spain under Germany',
        question: 'Could Spain have achieved German-style productivity if it had not overinvested in housing pre-2008?',
        expectation: 'Positive gap in the 2000s, widening after the 2008 crash exposed Spain’s dependence on construction.',
    },

    // — East Asian comparisons —
    'est-under-kor': {
        label: 'Estonia under South Korea',
        question: 'What if Estonia had pursued Korean-style industrial policy and export complexity?',
        expectation: 'Large cumulative gap — Korea’s trajectory is steeper than any CEE country. Sensitive to adoption lag.',
    },
    'ro-under-kor': {
        label: 'Romania under South Korea',
        question: 'A stretch test: what if Romania had taken the developmental-state path Korea took after 1990?',
        expectation: 'Very large gap but wide uncertainty — implausible without major institutional preconditions.',
    },

    // — Reform-timing —
    'ua-early-reform': {
        label: 'Ukraine: early reform + EU absorption',
        question: 'What if Ukraine had started reform in 1991 and gained EU-style absorption capacity, as a synthetic blend of Poland + Estonia?',
        expectation: 'Largest gap in the playground. Illustrates how much is at stake when institutional convergence is delayed by a decade.',
    },

    // — Symmetric / reverse —
    'de-under-ro': {
        label: 'Germany under Romania (reverse)',
        question: 'Symmetric check: what if Germany had experienced Romania’s post-socialist trajectory?',
        expectation: 'Large negative cumulative gap. Demonstrates the framework works both directions — prosperity is not inevitable.',
    },
};

export function presetParams(key: PresetKey): Params {
    const base: Omit<Params, 'preset' | 'target' | 'models'> = {
        mode: 'path',
        startYear: 1990,
        endYear: YEAR_END,
        phaseInYears: 2,
        transferIntensity: 0.85,
        adoptionLag: 0,
        populationMode: 'target',
        convergenceDrag: 0.4,
        policyOverride: 70,
        uncertaintyPct: 12,
        reverseFraming: false,
        analysisStart: YEAR_START,
        analysisEnd: YEAR_END,
    };
    switch (key) {
        case 'bg-under-cze':
            return { ...base, preset: key, target: 'BGR', models: { CZE: 1 } };
        case 'hu-under-pl':
            return { ...base, preset: key, target: 'HUN', models: { POL: 1 }, startYear: 2010 };
        case 'ua-under-pl':
            return { ...base, preset: key, target: 'UKR', models: { POL: 1 }, convergenceDrag: 0.9, uncertaintyPct: 22 };
        case 'ro-under-synth':
            return { ...base, preset: key, target: 'ROU', models: { POL: 0.4, CZE: 0.35, SVK: 0.25 } };
        case 'sk-under-cze':
            return { ...base, preset: key, target: 'SVK', models: { CZE: 1 }, convergenceDrag: 0.3, uncertaintyPct: 8 };
        case 'si-under-at-synth':
            return { ...base, preset: key, target: 'SVN', models: { DEU: 0.55, PRT: 0.45 }, convergenceDrag: 0.6 };
        case 'pt-under-ie':
            return { ...base, preset: key, target: 'PRT', models: { IRL: 1 }, convergenceDrag: 0.8, uncertaintyPct: 18 };
        case 'es-under-de':
            return { ...base, preset: key, target: 'ESP', models: { DEU: 1 }, startYear: 2000, convergenceDrag: 0.5 };
        case 'est-under-kor':
            return { ...base, preset: key, target: 'EST', models: { KOR: 1 }, convergenceDrag: 1.1, uncertaintyPct: 20 };
        case 'ro-under-kor':
            return { ...base, preset: key, target: 'ROU', models: { KOR: 1 }, convergenceDrag: 1.4, uncertaintyPct: 25, transferIntensity: 0.6 };
        case 'ua-early-reform':
            return { ...base, preset: key, target: 'UKR', models: { POL: 0.6, EST: 0.4 }, convergenceDrag: 1.0, uncertaintyPct: 22 };
        case 'de-under-ro':
            return { ...base, preset: key, target: 'DEU', models: { ROU: 1 }, convergenceDrag: 0.2, uncertaintyPct: 15 };
        default:
            return { ...base, preset: key, target: 'ROU', models: { POL: 1 } };
    }
}

export const DEFAULT_PARAMS: Params = presetParams('ro-under-pl');


// ── Utility ──────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function populationForYear(country: CountryPreset, year: number): number {
    const t = (year - YEAR_START) / (YEAR_END - YEAR_START);
    return lerp(country.population1990, country.population2024, t);
}

function growthRateForYear(country: CountryPreset, year: number): number {
    const g = country.growthAnchors;
    if (year <= 1994) return g.earlyTransitionDrag;
    if (year <= 2007) return g.convergenceBoost;
    if (year <= 2010) return g.crisisPenalty;
    if (year <= 2019) return g.recovery;
    return g.recent;
}

function averagePolicyScore(policy: CountryPreset['policy']): number {
    const values = Object.values(policy);
    return values.reduce((a, b) => a + b, 0) / values.length;
}

// Normalize model weights so they sum to 1
export function normalizeBlend(blend: ModelBlend): ModelBlend {
    const entries = Object.entries(blend).filter(([, w]) => (w ?? 0) > 0);
    const sum = entries.reduce((s, [, w]) => s + (w ?? 0), 0);
    if (sum === 0) return {};
    const out: ModelBlend = {};
    for (const [code, w] of entries) {
        out[code as CountryCode] = (w ?? 0) / sum;
    }
    return out;
}


// ── Series ───────────────────────────────────────────────────────

export interface SeriesRow {
    year: number;
    population: number;
    gdpPc: number;
    gdp: number;  // in USD (not billions)
}

export function buildActualSeries(code: CountryCode): SeriesRow[] {
    const country = COUNTRIES[code];
    const rows: SeriesRow[] = [];
    let gdpPc = country.gdpPc1990;
    for (const year of YEARS) {
        if (year > YEAR_START) {
            gdpPc *= 1 + growthRateForYear(country, year);
        }
        const population = populationForYear(country, year);
        rows.push({ year, population, gdpPc, gdp: gdpPc * population * 1_000_000 });
    }
    return rows;
}

// Blended synthetic growth rate for a year
function blendedGrowthRate(blend: ModelBlend, year: number): number {
    let rate = 0;
    for (const [code, weight] of Object.entries(blend)) {
        if (!weight) continue;
        rate += weight * growthRateForYear(COUNTRIES[code as CountryCode], year);
    }
    return rate;
}

// Blended policy snapshot
export function blendedPolicy(blend: ModelBlend): CountryPreset['policy'] {
    const result = { institutions: 0, investment: 0, education: 0, exportComplexity: 0, macroStability: 0, stateCapacity: 0, euAbsorption: 0 };
    for (const [code, weight] of Object.entries(blend)) {
        if (!weight) continue;
        const p = COUNTRIES[code as CountryCode].policy;
        result.institutions += weight * p.institutions;
        result.investment += weight * p.investment;
        result.education += weight * p.education;
        result.exportComplexity += weight * p.exportComplexity;
        result.macroStability += weight * p.macroStability;
        result.stateCapacity += weight * p.stateCapacity;
        result.euAbsorption += weight * p.euAbsorption;
    }
    return result;
}


// ── Counterfactual ───────────────────────────────────────────────

export interface CounterfactualRow extends SeriesRow {
    gdpLow: number;      // lower confidence band
    gdpHigh: number;     // upper confidence band
    gdpPcLow: number;
    gdpPcHigh: number;
}

export function buildCounterfactualSeries(params: Params): CounterfactualRow[] {
    const blend = normalizeBlend(params.models);
    const hasBlend = Object.keys(blend).length > 0;

    // Reverse framing: swap target and (weighted) model if requested
    const targetCode = params.reverseFraming && hasBlend
        ? (Object.entries(blend).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0][0] as CountryCode)
        : params.target;
    const effectiveBlend = params.reverseFraming && hasBlend
        ? { [params.target]: 1 } as ModelBlend
        : blend;

    const targetPreset = COUNTRIES[targetCode];
    const modelPolicy = hasBlend ? blendedPolicy(effectiveBlend) : targetPreset.policy;
    const targetPolicyScore = averagePolicyScore(targetPreset.policy);
    const modelPolicyScore = averagePolicyScore(modelPolicy);

    const rows: CounterfactualRow[] = [];
    let gdpPc = targetPreset.gdpPc1990;

    for (const year of YEARS) {
        if (year > YEAR_START) {
            const targetGrowth = growthRateForYear(targetPreset, year);
            const shiftedYear = clamp(year - params.adoptionLag, YEAR_START, YEAR_END);
            const modelGrowth = hasBlend ? blendedGrowthRate(effectiveBlend, shiftedYear) : targetGrowth;

            const selectedPolicyGain = (params.policyOverride - targetPolicyScore) / 100;
            const baselinePolicyGain = (modelPolicyScore - targetPolicyScore) / 100;
            const policyChannel = 0.35 * (selectedPolicyGain + baselinePolicyGain) / 2;

            // Effective intensity accounts for phase-in ramp and end-year revert
            const yearsSinceStart = year - params.startYear;
            const phaseIn = params.phaseInYears > 0
                ? clamp(yearsSinceStart / params.phaseInYears, 0, 1)
                : 1;
            const afterEnd = year > params.endYear;
            const effectiveIntensity = afterEnd ? 0 : params.transferIntensity * phaseIn;

            const adoptedGrowth = params.mode === 'basket'
                ? lerp(targetGrowth, targetGrowth + policyChannel, effectiveIntensity)
                : lerp(targetGrowth, modelGrowth + policyChannel, effectiveIntensity);

            const draggedGrowth = adoptedGrowth - (params.convergenceDrag / 100) * effectiveIntensity;

            if (year < params.startYear) {
                gdpPc *= 1 + targetGrowth;
            } else {
                gdpPc *= 1 + draggedGrowth;
            }
        }

        const population = params.populationMode === 'target'
            ? populationForYear(targetPreset, year)
            : (() => {
                // Scale model population trajectory onto target's starting size
                let scaled = 0;
                let totalW = 0;
                for (const [code, w] of Object.entries(effectiveBlend)) {
                    if (!w) continue;
                    const model = COUNTRIES[code as CountryCode];
                    scaled += w * populationForYear(model, year) * (targetPreset.population1990 / model.population1990);
                    totalW += w;
                }
                return totalW > 0 ? scaled / totalW : populationForYear(targetPreset, year);
            })();

        const gdp = gdpPc * population * 1_000_000;
        const bandWidth = params.uncertaintyPct / 100;
        const yearsElapsed = year - YEAR_START;
        // Uncertainty compounds over time
        const effectiveBand = bandWidth * Math.sqrt(yearsElapsed / (YEAR_END - YEAR_START + 1));

        rows.push({
            year, population, gdpPc, gdp,
            gdpPcLow: gdpPc * (1 - effectiveBand),
            gdpPcHigh: gdpPc * (1 + effectiveBand),
            gdpLow: gdp * (1 - effectiveBand),
            gdpHigh: gdp * (1 + effectiveBand),
        });
    }
    return rows;
}


// ── Comparison ───────────────────────────────────────────────────

export interface ComparisonRow {
    year: number;
    actualGDP: number;           // USD
    actualGDPB: number;          // Billions
    counterfactualGDP: number;
    counterfactualGDPB: number;
    counterfactualGDPLowB: number;
    counterfactualGDPHighB: number;
    annualGapB: number;
    actualGDPPC: number;
    counterfactualGDPPC: number;
    actualPopulation: number;
    counterfactualPopulation: number;
}

export function buildComparison(params: Params): ComparisonRow[] {
    const target = params.reverseFraming && Object.keys(params.models).length > 0
        ? (Object.entries(normalizeBlend(params.models)).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))[0][0] as CountryCode)
        : params.target;
    const actual = buildActualSeries(target);
    const cf = buildCounterfactualSeries(params);
    return actual.map((row, i) => {
        const c = cf[i];
        return {
            year: row.year,
            actualGDP: row.gdp,
            actualGDPB: row.gdp / 1e9,
            counterfactualGDP: c.gdp,
            counterfactualGDPB: c.gdp / 1e9,
            counterfactualGDPLowB: c.gdpLow / 1e9,
            counterfactualGDPHighB: c.gdpHigh / 1e9,
            annualGapB: (c.gdp - row.gdp) / 1e9,
            actualGDPPC: row.gdpPc,
            counterfactualGDPPC: c.gdpPc,
            actualPopulation: row.population,
            counterfactualPopulation: c.population,
        };
    });
}


// ── KPIs ─────────────────────────────────────────────────────────

export interface Kpis {
    latestActualGDPB: number;
    latestCounterfactualGDPB: number;
    latestGapB: number;
    cumulativeGapB: number;
    pctLift: number;
    gdpPcLift: number;
    gdpPcGap: number;
    bandWidthB: number;
}

export function computeKpis(rows: ComparisonRow[]): Kpis {
    const last = rows[rows.length - 1];
    const cumulativeGapB = rows.reduce((s, r) => s + r.annualGapB, 0);
    const pctLift = ((last.counterfactualGDPB / last.actualGDPB) - 1) * 100;
    const gdpPcLift = ((last.counterfactualGDPPC / last.actualGDPPC) - 1) * 100;
    return {
        latestActualGDPB: last.actualGDPB,
        latestCounterfactualGDPB: last.counterfactualGDPB,
        latestGapB: last.counterfactualGDPB - last.actualGDPB,
        cumulativeGapB,
        pctLift,
        gdpPcLift,
        gdpPcGap: last.counterfactualGDPPC - last.actualGDPPC,
        bandWidthB: last.counterfactualGDPHighB - last.counterfactualGDPLowB,
    };
}


// ── Policy gap decomposition ─────────────────────────────────────

export interface PolicyAttribution {
    key: string;
    label: string;
    targetScore: number;
    modelScore: number;
    gap: number;            // model - target
    contribution: number;   // % of overall policy gap
}

export function decomposePolicy(params: Params): PolicyAttribution[] {
    const blend = normalizeBlend(params.models);
    const target = COUNTRIES[params.target];
    const model = Object.keys(blend).length > 0 ? blendedPolicy(blend) : target.policy;
    const totalGap = POLICY_DIMENSIONS.reduce(
        (s, d) => s + Math.max(0, model[d.key] - target.policy[d.key]),
        0,
    );
    return POLICY_DIMENSIONS.map(d => {
        const gap = model[d.key] - target.policy[d.key];
        return {
            key: d.key,
            label: d.label,
            targetScore: target.policy[d.key],
            modelScore: model[d.key],
            gap,
            contribution: totalGap > 0 ? (Math.max(0, gap) / totalGap) * 100 : 0,
        };
    });
}


// ── Sensitivity ──────────────────────────────────────────────────

export function computeSensitivity(params: Params): SensitivityBar[] {
    const bars: SensitivityBar[] = [];
    const dims: { key: keyof Params; label: string; lo: number; hi: number }[] = [
        { key: 'transferIntensity', label: 'transfer intensity', lo: 0, hi: 1 },
        { key: 'convergenceDrag', label: 'convergence drag', lo: 0, hi: 2 },
        { key: 'adoptionLag', label: 'adoption lag', lo: 0, hi: 10 },
        { key: 'startYear', label: 'reform start year', lo: YEAR_START, hi: 2015 },
        { key: 'policyOverride', label: 'policy override', lo: 30, hi: 90 },
        { key: 'uncertaintyPct', label: 'uncertainty %', lo: 0, hi: 25 },
    ];
    for (const dim of dims) {
        const low = { ...params, [dim.key]: dim.lo };
        const high = { ...params, [dim.key]: dim.hi };
        const lowK = computeKpis(buildComparison(low));
        const highK = computeKpis(buildComparison(high));
        bars.push({ label: dim.label, low: lowK.cumulativeGapB / 1000, high: highK.cumulativeGapB / 1000 });
    }
    bars.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
    return bars;
}


// ── Narrative ────────────────────────────────────────────────────

export function computeNarrative(kpis: Kpis, params: Params): string {
    const target = COUNTRIES[params.target];
    const blend = normalizeBlend(params.models);
    const modelNames = Object.entries(blend)
        .map(([code, w]) => `${COUNTRIES[code as CountryCode].name} (${Math.round((w ?? 0) * 100)}%)`)
        .join(', ');
    const direction = kpis.latestGapB >= 0 ? 'higher' : 'lower';
    const parts: string[] = [];

    if (!modelNames) {
        parts.push(`No model country selected — the counterfactual reduces to ${target.name}’s own trajectory.`);
        return parts.join(' ');
    }

    parts.push(`${target.name} under a ${params.mode === 'basket' ? 'decision-basket' : 'path-transfer'} scenario drawing on ${modelNames} ends in 2024 with GDP ${Math.abs(kpis.pctLift).toFixed(1)}% ${direction} than baseline (±${((kpis.bandWidthB / kpis.latestCounterfactualGDPB) * 50).toFixed(0)}%).`);

    const sign = kpis.cumulativeGapB >= 0 ? 'above' : 'below';
    parts.push(`Cumulative 1990–2024 output ${sign} baseline: ~$${Math.abs(kpis.cumulativeGapB / 1000).toFixed(2)}T (constant 2010 USD).`);

    if (params.convergenceDrag > 1) {
        parts.push('Heavy convergence drag reflects the realism that reform paths cannot be fully imported.');
    }
    if (params.startYear > 2000) {
        parts.push(`Late reform start (${params.startYear}) means most compounding gains are foregone.`);
    }
    if (params.endYear < YEAR_END) {
        parts.push(`Reform truncated at ${params.endYear} — the counterfactual reverts to the target’s native trajectory after that year.`);
    }
    if (params.phaseInYears > 5) {
        parts.push(`Long phase-in (${params.phaseInYears} years) reflects slow institutional adoption; early-period gains are damped.`);
    }
    if (params.reverseFraming) {
        parts.push('Reverse framing active — this shows the symmetric version: what if the model country had the target’s path instead?');
    }

    return parts.join(' ');
}


// ── Formatting ───────────────────────────────────────────────────

export function formatMoney(usd: number): string {
    const abs = Math.abs(usd);
    if (abs >= 1e12) return `${usd < 0 ? '-' : ''}$${(abs / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `${usd < 0 ? '-' : ''}$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${usd < 0 ? '-' : ''}$${(abs / 1e6).toFixed(1)}M`;
    return `${usd < 0 ? '-' : ''}$${abs.toLocaleString()}`;
}

export function formatMoneyBillions(b: number): string {
    return formatMoney(b * 1e9);
}

export function formatPct(v: number): string {
    return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}
