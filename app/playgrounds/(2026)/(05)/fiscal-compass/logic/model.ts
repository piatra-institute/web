// Core toy model for the fiscal compass.
//
// The question: when can higher taxes be beneficial? Four serious rationales
// each have a different target and a different failure mode. The model is a
// teaching device, not a forecast: it makes the *structure* of the arguments
// legible by scoring a tax package against five outcomes.

export type SchoolKey =
    | 'redistribution'
    | 'state-capacity'
    | 'consolidation'
    | 'corrective';

export type PresetKey =
    | 'inequality-crisis'
    | 'high-return-state'
    | 'debt-squeeze'
    | 'austerity-trap'
    | 'carbon-logic'
    | 'nordic-model';

export interface Params {
    school: SchoolKey;
    // tax-increase intensity (how aggressive the package is), 0-100
    taxRate: number;
    // how damaging concentration is assumed to be, 0-100
    inequality: number;
    // how binding deficits, debt service, or market pressure are, 0-100
    debtPressure: number;
    // expected social return on public spending, 0-100
    investmentReturn: number;
    // scale of pollution, congestion, climate, or health harms, 0-100
    externalityDamage: number;
    // ability to collect taxes and spend competently, 0-100
    adminCapacity: number;
    preset: PresetKey;
}

export interface Metrics {
    welfare: number;     // aggregate model score, higher is better
    growth: number;      // output-side pressure
    equality: number;    // distributional compression
    fiscalRepair: number;// budget / debt repair
    legitimacy: number;  // political durability
    revenue: number;     // revenue index
    distortion: number;  // deadweight-loss index
}

export const SCHOOL_KEYS: SchoolKey[] = [
    'redistribution',
    'state-capacity',
    'consolidation',
    'corrective',
];

export interface School {
    key: SchoolKey;
    label: string;       // short institutional label
    rationale: string;   // the "if you mean..." phrasing
    thesis: string;
    bestTaxes: string[];
    risks: string[];
    keywords: string[];
}

export const SCHOOLS: Record<SchoolKey, School> = {
    'redistribution': {
        key: 'redistribution',
        label: 'redistribution',
        rationale: 'higher taxes are good because inequality is harmful',
        thesis:
            'Higher taxes on top incomes, wealth, inheritance, rents, and capital can raise social welfare when concentration itself produces economic and political damage.',
        bestTaxes: [
            'top marginal income tax',
            'inheritance tax',
            'net wealth tax',
            'capital gains reform',
            'land and rent taxes',
        ],
        risks: [
            'capital flight',
            'avoidance and evasion',
            'weak administrative capacity',
            'badly designed thresholds',
        ],
        keywords: [
            'optimal taxation',
            'top marginal rate',
            'wealth concentration',
            'social welfare',
            'rent extraction',
        ],
    },
    'state-capacity': {
        key: 'state-capacity',
        label: 'state capacity',
        rationale: 'higher taxes are good because public investment has high returns',
        thesis:
            'Taxes can be beneficial when they finance high-return public goods: infrastructure, education, health, science, courts, cadasters, and digital state capacity.',
        bestTaxes: [
            'broad income tax',
            'property tax',
            'VAT with compensation',
            'land value tax',
            'corporate rent taxation',
        ],
        risks: [
            'wasteful spending',
            'low implementation capacity',
            'clientelism',
            'under-maintenance after construction',
        ],
        keywords: [
            'public goods',
            'fiscal multiplier',
            'state capacity',
            'innovation system',
            'social returns',
        ],
    },
    'consolidation': {
        key: 'consolidation',
        label: 'consolidation',
        rationale: 'higher taxes are good because debt or deficits must fall',
        thesis:
            'Tax increases can be part of deficit reduction when debt-service risk, inflation pressure, market confidence, or fiscal space become binding constraints.',
        bestTaxes: [
            'base-broadening',
            'VAT',
            'excise taxes',
            'property tax',
            'closing exemptions',
        ],
        risks: [
            'recessionary timing',
            'regressive burden',
            'pro-cyclical consolidation',
            'lower private demand',
        ],
        keywords: [
            'primary balance',
            'fiscal space',
            'debt sustainability',
            'bond yields',
            'consolidation',
        ],
    },
    'corrective': {
        key: 'corrective',
        label: 'corrective',
        rationale: 'taxes are good because they discourage bad things',
        thesis:
            'Taxes can improve welfare by pricing harms that markets ignore: carbon emissions, congestion, tobacco, alcohol, and pollution.',
        bestTaxes: [
            'carbon tax',
            'congestion charge',
            'pollution tax',
            'tobacco excise',
            'fuel tax',
        ],
        risks: [
            'distributional backlash',
            'measurement error',
            'industry lobbying',
            'border leakage',
        ],
        keywords: [
            'externality',
            'Pigouvian tax',
            'social cost',
            'carbon pricing',
            'deadweight loss correction',
        ],
    },
};

export const PRESET_DESCRIPTIONS: Record<
    PresetKey,
    { label: string; question: string; expectation: string }
> = {
    'inequality-crisis': {
        label: 'inequality crisis',
        question: 'High concentration, credible state. Does redistribution carry?',
        expectation:
            'Equality and welfare rise; legitimacy is fragile because the package is aggressive.',
    },
    'high-return-state': {
        label: 'high-return state',
        question: 'When the state converts revenue into real returns, is tax a free lunch?',
        expectation:
            'Growth and welfare stay high even at moderate tax; the investment channel dominates.',
    },
    'debt-squeeze': {
        label: 'debt squeeze',
        question: 'Debt service is crowding out policy space. Is tax-based repair worth it?',
        expectation:
            'Fiscal repair improves, but growth and legitimacy take the hit. Timing matters.',
    },
    'austerity-trap': {
        label: 'austerity trap',
        question: 'Tax-based austerity into a weak economy with low capacity. What breaks?',
        expectation:
            'Distortion is high, growth collapses, legitimacy erodes. The repair is not worth the damage.',
    },
    'carbon-logic': {
        label: 'carbon logic',
        question: 'A real harm is unpriced. Is the cleanest case for a tax also the easiest?',
        expectation:
            'Welfare rises by correcting the externality; legitimacy still drags on distributional backlash.',
    },
    'nordic-model': {
        label: 'nordic model',
        question: 'High tax, high capacity, high returns. Can a large fiscal state just work?',
        expectation:
            'All five outcomes land high together: the configuration the welfare-state literature points to.',
    },
};

export function presetParams(key: PresetKey): Params {
    switch (key) {
        case 'inequality-crisis':
            return {
                school: 'redistribution', taxRate: 62, inequality: 86, debtPressure: 42,
                investmentReturn: 55, externalityDamage: 32, adminCapacity: 74, preset: key,
            };
        case 'high-return-state':
            return {
                school: 'state-capacity', taxRate: 40, inequality: 52, debtPressure: 40,
                investmentReturn: 88, externalityDamage: 42, adminCapacity: 84, preset: key,
            };
        case 'debt-squeeze':
            return {
                school: 'consolidation', taxRate: 46, inequality: 48, debtPressure: 86,
                investmentReturn: 44, externalityDamage: 34, adminCapacity: 66, preset: key,
            };
        case 'austerity-trap':
            return {
                school: 'consolidation', taxRate: 72, inequality: 58, debtPressure: 80,
                investmentReturn: 30, externalityDamage: 30, adminCapacity: 38, preset: key,
            };
        case 'carbon-logic':
            return {
                school: 'corrective', taxRate: 44, inequality: 46, debtPressure: 36,
                investmentReturn: 52, externalityDamage: 90, adminCapacity: 78, preset: key,
            };
        case 'nordic-model':
            return {
                school: 'state-capacity', taxRate: 66, inequality: 40, debtPressure: 38,
                investmentReturn: 80, externalityDamage: 46, adminCapacity: 92, preset: key,
            };
    }
}

export const DEFAULT_PARAMS: Params = presetParams('inequality-crisis');

function clamp01(n: number): number {
    return Math.max(0, Math.min(1, n));
}

// School-matched gains are amplified; the same lever still does something
// under a non-matching rationale, just weaker.
function schoolMultiplier(active: SchoolKey, target: SchoolKey): number {
    return active === target ? 1 : 0.4;
}

export function scoreModel(p: Params): Metrics {
    const t = p.taxRate / 100;
    const ineq = p.inequality / 100;
    const debt = p.debtPressure / 100;
    const ret = p.investmentReturn / 100;
    const ext = p.externalityDamage / 100;
    const cap = p.adminCapacity / 100;

    // revenue actually collected scales with both the package and capacity
    const revenue01 = t * (0.55 + 0.45 * cap);
    // deadweight loss rises superlinearly with the package, eased by capacity
    const distortion01 = Math.pow(t, 1.6) * (1 - 0.4 * cap);

    // four benefit channels, each routed through its rationale
    const gIneq = ineq * t * schoolMultiplier(p.school, 'redistribution');
    const gInv = revenue01 * ret * schoolMultiplier(p.school, 'state-capacity');
    const gDebt = debt * t * schoolMultiplier(p.school, 'consolidation');
    const gExt = ext * t * schoolMultiplier(p.school, 'corrective');
    const benefit = gIneq + gInv + gDebt + gExt;

    // taxes above ~55% start to bite output on their own
    const excessTax = Math.max(0, t - 0.55) * 0.7;

    const welfare = clamp01(0.45 + 0.34 * benefit - 0.55 * distortion01);
    const growth = clamp01(
        0.56 + 0.4 * gInv + 0.12 * gExt - 0.6 * distortion01 - excessTax,
    );
    const equality = clamp01(0.34 + 1.15 * ineq * t + 0.22 * t);
    const fiscalRepair = clamp01(
        0.3 + 0.85 * gDebt + 0.5 * revenue01 - 0.18 * distortion01,
    );
    const legitimacy = clamp01(
        0.82 - 0.62 * t - 0.12 * ineq + 0.32 * cap - (p.school === 'corrective' ? 0.06 : 0),
    );

    return {
        welfare: Math.round(welfare * 100),
        growth: Math.round(growth * 100),
        equality: Math.round(equality * 100),
        fiscalRepair: Math.round(fiscalRepair * 100),
        legitimacy: Math.round(legitimacy * 100),
        revenue: Math.round(revenue01 * 100),
        distortion: Math.round(distortion01 * 100),
    };
}

// How strongly the current world-state supports each rationale, independent
// of which school is selected. This drives the compass needle.
export interface SchoolStrength {
    key: SchoolKey;
    strength: number; // 0-1
}

export function schoolStrengths(p: Params): SchoolStrength[] {
    const ineq = p.inequality / 100;
    const debt = p.debtPressure / 100;
    const ret = p.investmentReturn / 100;
    const ext = p.externalityDamage / 100;
    const cap = p.adminCapacity / 100;
    return [
        { key: 'redistribution', strength: clamp01(ineq) },
        { key: 'state-capacity', strength: clamp01(ret * (0.4 + 0.6 * cap)) },
        { key: 'consolidation', strength: clamp01(debt) },
        { key: 'corrective', strength: clamp01(ext) },
    ];
}

// The school the world-state most supports, and whether the chosen school
// agrees with it.
export function dominantSchool(p: Params): { key: SchoolKey; aligned: boolean } {
    const strengths = schoolStrengths(p);
    const top = strengths.reduce((a, b) => (b.strength > a.strength ? b : a));
    return { key: top.key, aligned: top.key === p.school };
}

export function policyVerdict(m: Metrics, p: Params): string {
    if (m.welfare >= 72 && m.legitimacy >= 48) {
        return 'Strong case for this tax package, assuming competent implementation.';
    }
    if (m.welfare >= 62 && m.legitimacy < 48) {
        return 'Economically plausible, but politically fragile. Compensation or gradualism matters.';
    }
    if (m.growth < 45 && m.fiscalRepair < 50) {
        return 'Weak case. The tax burden is high relative to the modelled returns.';
    }
    if (p.school === 'consolidation' && p.debtPressure < 40) {
        return 'Debt pressure is not high enough to justify consolidation-first logic.';
    }
    return 'Mixed case. Design details decide whether this is reform or just extraction.';
}
