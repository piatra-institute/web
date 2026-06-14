import { clamp } from '@/lib/playgroundMath';


export interface Actor {
    id: string;
    name: string;
    blind: string;
    traits: string;
}

export interface Outcome {
    id: string;
    label: string;
}

export interface ScenarioAssumption {
    id: string;
    label: string;
    value: number;
    min: string;
    max: string;
}

export interface Reason {
    id: string;
    label: string;
    mult: number;
}

export interface SensitivitySet {
    label: string;
    set: Record<string, number>;
}

export interface Scenario {
    id: string;
    title: string;
    claim: string;
    proposition: string;
    instruction: string;
    actors: Actor[];
    outcomes: Outcome[];
    focusOutcome: string;
    baseline: Record<string, Record<string, number>>;
    assumptions: ScenarioAssumption[];
    defaultAssumptions: Record<string, number>;
    weights: Record<string, Record<string, number>>;
    facts: string[];
    reasons: Reason[];
    timeline: [string, string][];
    sensitivity: SensitivitySet[];
}


export const SCENARIOS: Record<string, Scenario> = {
    fable: {
        id: 'fable',
        title: 'frontier-model access restriction',
        claim: 'The other administration would have imposed the same blanket ban.',
        proposition:
            'Under the same threat evidence, agency pressure, legal tools, and geopolitical context, would the counterfactual administration have imposed the same blanket foreign-national access ban on a frontier AI model?',
        instruction:
            'Allocate 100 percentage points for each administration. The baseline bars move live when you change the assumptions. Your inputs show your counterfactual forecast.',
        actors: [
            {
                id: 'a',
                name: 'Administration A',
                blind: 'Administration A',
                traits: 'high unilateralism, high legal aggressiveness, lower allied-process preference',
            },
            {
                id: 'b',
                name: 'Administration B',
                blind: 'Administration B',
                traits: 'high AI-safety concern, high regulatory-process preference, stronger allied-coordination preference',
            },
        ],
        outcomes: [
            { id: 'none', label: 'No major new restriction' },
            { id: 'review', label: 'Temporary pause + safety review' },
            { id: 'tiered', label: 'Tiered / trusted-access restriction' },
            { id: 'blanket', label: 'Same blanket foreign-national ban' },
        ],
        focusOutcome: 'blanket',
        baseline: {
            a: { none: 0.05, review: 0.18, tiered: 0.33, blanket: 0.44 },
            b: { none: 0.13, review: 0.32, tiered: 0.37, blanket: 0.18 },
        },
        assumptions: [
            { id: 'threat', label: 'Threat severity', value: 55, min: 'Low', max: 'High' },
            { id: 'classified', label: 'Classified evidence strength', value: 35, min: 'Public-only', max: 'Severe' },
            { id: 'agency', label: 'Agency pressure / unanimity', value: 65, min: 'Split', max: 'Unified' },
            { id: 'allied', label: 'Allied pressure against blanket ban', value: 55, min: 'Low', max: 'High' },
            { id: 'law', label: 'Legal affordance', value: 70, min: 'Weak', max: 'Strong' },
            { id: 'public', label: 'Public / political pressure', value: 45, min: 'Low', max: 'High' },
        ],
        defaultAssumptions: { threat: 55, classified: 35, agency: 65, allied: 55, law: 70, public: 45 },
        weights: {
            none: { threat: -0.016, classified: -0.018, agency: -0.014, allied: 0.013, law: -0.006, public: -0.004 },
            review: { threat: 0.002, classified: 0.002, agency: 0.006, allied: 0.006, law: 0.002, public: 0.0 },
            tiered: { threat: 0.006, classified: 0.006, agency: 0.008, allied: 0.012, law: 0.005, public: 0.004 },
            blanket: { threat: 0.018, classified: 0.022, agency: 0.018, allied: -0.014, law: 0.012, public: 0.008 },
        },
        facts: [
            'A frontier model is involved.',
            'The government claims a national-security risk.',
            'A jailbreak or misuse pathway is alleged.',
            'Export-control or emergency administrative tools are available.',
            'The company disputes the scope or severity of the evidence.',
            'The policy lever is access restriction, not only model-weight control.',
        ],
        reasons: [
            { id: 'safety', label: 'A safety-forward posture would favor intervention', mult: 1.8 },
            { id: 'agency', label: 'Security agencies would pressure any president', mult: 2.1 },
            { id: 'law', label: 'Export-control law gives an available mechanism', mult: 1.4 },
            { id: 'classified', label: 'Classified evidence may be much stronger than public evidence', mult: 3.4 },
            { id: 'crisis', label: 'National-security crises compress ideological differences', mult: 1.6 },
            { id: 'active', label: 'Active foreign-adversary exploitation is assumed', mult: 2.8 },
        ],
        timeline: [
            ['Trigger', 'frontier-model security concern'],
            ['Agency memo', 'security-agency style pressure'],
            ['Legal path', 'export-control or emergency directive'],
            ['Policy choice', 'review, tiered access, or blanket ban'],
            ['Aftermath', 'company compliance, litigation risk, allied response'],
        ],
        sensitivity: [
            { label: 'Public facts only', set: { threat: 45, classified: 15, agency: 50, allied: 55, law: 65, public: 40 } },
            { label: 'Moderate classified concern', set: { threat: 60, classified: 50, agency: 65, allied: 45, law: 70, public: 48 } },
            { label: 'Severe classified concern', set: { threat: 82, classified: 88, agency: 82, allied: 35, law: 85, public: 58 } },
            { label: 'Severe concern + allied objection', set: { threat: 82, classified: 88, agency: 82, allied: 82, law: 85, public: 58 } },
            { label: 'Weak threat + process pressure', set: { threat: 25, classified: 20, agency: 42, allied: 75, law: 55, public: 30 } },
        ],
    },

    crisis: {
        id: 'crisis',
        title: 'regional escalation counterfactual',
        claim: 'The other administration would have started the war too.',
        proposition:
            'Under the same regional crisis, intelligence signals, alliance pressure, and domestic political constraints, what military or diplomatic branch would the counterfactual administration most likely choose?',
        instruction:
            'This scenario separates diplomacy, covert action, limited strikes, a joint campaign, and regime-change-scale war. The point is to prevent vague war claims from collapsing distinct outcomes.',
        actors: [
            {
                id: 'a',
                name: 'Administration A',
                blind: 'Administration A',
                traits: 'higher rhetorical escalation, higher unilateral action preference, strong ally alignment',
            },
            {
                id: 'b',
                name: 'Administration B',
                blind: 'Administration B',
                traits: 'institutionalist, alliance-focused, still hawkish on nuclear prevention',
            },
        ],
        outcomes: [
            { id: 'diplo', label: 'Diplomacy + sanctions, no overt war' },
            { id: 'covert', label: 'Cyber / covert action' },
            { id: 'limited', label: 'Limited strikes after severe trigger' },
            { id: 'joint', label: 'Large joint campaign' },
            { id: 'regime', label: 'Regime-change-scale war' },
        ],
        focusOutcome: 'regime',
        baseline: {
            a: { diplo: 0.2, covert: 0.15, limited: 0.22, joint: 0.28, regime: 0.15 },
            b: { diplo: 0.45, covert: 0.18, limited: 0.22, joint: 0.1, regime: 0.05 },
        },
        assumptions: [
            { id: 'threat', label: 'Nuclear / regional threat severity', value: 58, min: 'Low', max: 'High' },
            { id: 'classified', label: 'Intelligence confidence', value: 48, min: 'Ambiguous', max: 'Certain' },
            { id: 'agency', label: 'Military / agency pressure', value: 55, min: 'Restrained', max: 'Escalatory' },
            { id: 'allied', label: 'Allied pressure against escalation', value: 52, min: 'Low', max: 'High' },
            { id: 'law', label: 'Legal / congressional constraint', value: 45, min: 'Strong constraint', max: 'Flexible' },
            { id: 'public', label: 'Domestic pressure for force', value: 40, min: 'Low', max: 'High' },
        ],
        defaultAssumptions: { threat: 58, classified: 48, agency: 55, allied: 52, law: 45, public: 40 },
        weights: {
            diplo: { threat: -0.018, classified: -0.009, agency: -0.013, allied: 0.018, law: -0.01, public: -0.01 },
            covert: { threat: 0.003, classified: 0.006, agency: 0.004, allied: 0.004, law: -0.004, public: -0.002 },
            limited: { threat: 0.011, classified: 0.01, agency: 0.011, allied: -0.004, law: 0.005, public: 0.006 },
            joint: { threat: 0.018, classified: 0.017, agency: 0.016, allied: -0.012, law: 0.012, public: 0.009 },
            regime: { threat: 0.02, classified: 0.018, agency: 0.018, allied: -0.017, law: 0.016, public: 0.014 },
        },
        facts: [
            'The adversary is treated as a serious strategic threat.',
            'Nuclear, missile, proxy, and alliance pressures are in the scenario.',
            'An ally requests or expects support.',
            'Agencies provide intelligence with some uncertainty.',
            'The leader can choose among diplomacy, covert action, limited force, or broader war.',
            'The scope of military action is part of the forecast, not assumed.',
        ],
        reasons: [
            { id: 'nuclear', label: 'Nuclear breakout concern would constrain any leader', mult: 2.2 },
            { id: 'ally', label: 'Alliance security commitments are strong', mult: 1.9 },
            { id: 'attack', label: 'A direct attack on own forces is assumed', mult: 2.7 },
            { id: 'intel', label: 'Intelligence confidence is assumed high', mult: 2.1 },
            { id: 'cred', label: 'Credibility and deterrence pressure are severe', mult: 1.5 },
            { id: 'congress', label: 'Legislative constraint is assumed weak', mult: 1.4 },
        ],
        timeline: [
            ['Node 1', 'adversary accelerates nuclear or proxy activity'],
            ['Node 2', 'an ally requests backing'],
            ['Node 3', 'intelligence estimates breakout or attack risk'],
            ['Node 4', 'leader chooses diplomacy, covert action, or force'],
            ['Node 5', 'force scope: limited strike, joint campaign, or regime-change-scale war'],
        ],
        sensitivity: [
            { label: 'No direct attack, ambiguous intel', set: { threat: 45, classified: 35, agency: 40, allied: 65, law: 30, public: 25 } },
            { label: 'Credible breakout signal', set: { threat: 72, classified: 70, agency: 62, allied: 48, law: 48, public: 42 } },
            { label: 'Direct attack on own forces', set: { threat: 78, classified: 76, agency: 72, allied: 40, law: 58, public: 62 } },
            { label: 'Direct attack + allied objection', set: { threat: 78, classified: 76, agency: 72, allied: 82, law: 58, public: 62 } },
            { label: 'Severe crisis + weak constraints', set: { threat: 90, classified: 86, agency: 84, allied: 30, law: 82, public: 70 } },
        ],
    },
};

export const SCENARIO_KEYS = Object.keys(SCENARIOS);


export type Dist = Record<string, number>;
export type UserForecasts = Record<string, Dist>;


export interface Params {
    scenarioId: string;
    blind: boolean;
    assumptions: Record<string, number>;
    user: UserForecasts;
    selectedReasons: string[];
    focusActor: string;
    focusOutcome: string;
}


export function odds(p: number): number {
    const c = clamp(p, 0.001, 0.999);
    return c / (1 - c);
}

export function logit(p: number): number {
    return Math.log(odds(p));
}

export function softmax(scores: number[]): number[] {
    const max = Math.max(...scores);
    const exps = scores.map((s) => Math.exp(s - max));
    const sum = exps.reduce((a, b) => a + b, 0) || 1;
    return exps.map((e) => e / sum);
}

export function normalizeDist(dist: Dist, outcomes: Outcome[]): Dist {
    const vals = outcomes.map((o) => Math.max(0, Number(dist[o.id] || 0)));
    const sum = vals.reduce((a, b) => a + b, 0) || 1;
    const out: Dist = {};
    outcomes.forEach((o, i) => (out[o.id] = vals[i] / sum));
    return out;
}


export function baselineDist(
    scenario: Scenario,
    actorId: string,
    assumptions: Record<string, number>,
): Dist {
    const base = scenario.baseline[actorId];
    const scores = scenario.outcomes.map((o) => {
        const p0 = clamp(base[o.id], 0.001, 0.999);
        let score = Math.log(p0);
        const w = scenario.weights[o.id] || {};
        for (const a of scenario.assumptions) {
            const val = assumptions[a.id] ?? a.value;
            const def = scenario.defaultAssumptions[a.id] ?? a.value;
            score += (w[a.id] || 0) * (val - def);
        }
        return score;
    });
    const probs = softmax(scores);
    const out: Dist = {};
    scenario.outcomes.forEach((o, i) => (out[o.id] = probs[i]));
    return out;
}


/** Jensen-Shannon divergence in bits, bounded [0, 1]. */
export function jsDivergence(p: Dist, q: Dist, outcomes: Outcome[]): number {
    const eps = 1e-9;
    let klPM = 0;
    let klQM = 0;
    for (const o of outcomes) {
        const pi = Math.max(eps, p[o.id] ?? 0);
        const qi = Math.max(eps, q[o.id] ?? 0);
        const mi = 0.5 * (pi + qi);
        klPM += pi * Math.log2(pi / mi);
        klQM += qi * Math.log2(qi / mi);
    }
    return clamp(0.5 * klPM + 0.5 * klQM, 0, 1);
}


export interface Metrics {
    baselineFocus: number;
    userFocus: number;
    ilr: number;
    bentScore: number;
    brittleness: number;
    labelSensitivity: number;
    factSensitivity: number;
    idr: number;
    inadmissibilityBits: number;
}


/** low / high "facts" extremes used to measure how much the facts move the model. */
function factExtremes(scenario: Scenario, assumptions: Record<string, number>): { low: Record<string, number>; high: Record<string, number> } {
    return {
        low: { ...assumptions, threat: 20, classified: 20, agency: 40 },
        high: { ...assumptions, threat: 85, classified: 85, agency: 80 },
    };
}


export function computeMetrics(scenario: Scenario, params: Params): Metrics {
    const { outcomes } = scenario;
    const a0 = scenario.actors[0].id;
    const a1 = scenario.actors[1].id;

    const baseFocusActor = baselineDist(scenario, params.focusActor, params.assumptions);
    const userFocusActor = normalizeDist(params.user[params.focusActor] || baseFocusActor, outcomes);
    const p = baseFocusActor[params.focusOutcome];
    const q = userFocusActor[params.focusOutcome];
    const ilr = odds(q) / odds(p);

    const b0 = baselineDist(scenario, a0, params.assumptions);
    const b1 = baselineDist(scenario, a1, params.assumptions);
    const u0 = normalizeDist(params.user[a0] || b0, outcomes);
    const u1 = normalizeDist(params.user[a1] || b1, outcomes);

    const modelEffect = logit(b0[params.focusOutcome]) - logit(b1[params.focusOutcome]);
    const userEffect = logit(u0[params.focusOutcome]) - logit(u1[params.focusOutcome]);
    const bentScore = userEffect - modelEffect;

    const labelSensitivity = jsDivergence(u0, u1, outcomes);
    const modelLabel = jsDivergence(b0, b1, outcomes);
    const brittleness = labelSensitivity - modelLabel;

    const { low, high } = factExtremes(scenario, params.assumptions);
    const factSensitivity = jsDivergence(
        baselineDist(scenario, params.focusActor, low),
        baselineDist(scenario, params.focusActor, high),
        outcomes,
    );
    const idr = labelSensitivity / (factSensitivity + 0.02);

    const inadmissibilityBits = Math.max(0, Math.log2(p / Math.max(0.001, q)));

    return {
        baselineFocus: p,
        userFocus: q,
        ilr,
        bentScore,
        brittleness,
        labelSensitivity,
        factSensitivity,
        idr,
        inadmissibilityBits,
    };
}


export interface EvidenceDebt {
    requiredSupport: number;
    suppliedSupport: number;
    gap: number;
    suppressing: boolean;
    suppression: number;
}

export function computeEvidenceDebt(scenario: Scenario, params: Params, ilr: number): EvidenceDebt {
    let supplied = 1;
    for (const r of scenario.reasons) {
        if (params.selectedReasons.includes(r.id)) supplied *= r.mult;
    }
    if (ilr >= 1) {
        return {
            requiredSupport: ilr,
            suppliedSupport: supplied,
            gap: ilr / supplied,
            suppressing: false,
            suppression: 1,
        };
    }
    return {
        requiredSupport: 1,
        suppliedSupport: supplied,
        gap: 1,
        suppressing: true,
        suppression: 1 / ilr,
    };
}


export interface DiagnosisResult {
    headline: string;
    detail: string;
    tone: 'neutral' | 'flatten' | 'exaggerate';
}

export function computeDiagnosis(scenario: Scenario, params: Params, metrics: Metrics): DiagnosisResult {
    const labelA = params.blind ? scenario.actors[0].blind : scenario.actors[0].name;
    const labelB = params.blind ? scenario.actors[1].blind : scenario.actors[1].name;

    let tone: DiagnosisResult['tone'] = 'neutral';
    let headline = '';
    if (Math.abs(metrics.bentScore) < 0.55) {
        headline = 'Near-model actor sensitivity.';
    } else if (metrics.bentScore < -0.55) {
        tone = 'flatten';
        headline = 'Counterfactual flattening.';
    } else {
        tone = 'exaggerate';
        headline = 'Actor exaggeration.';
    }

    let detail = '';
    if (tone === 'neutral') {
        detail = `Your actor difference is close to the baseline difference for this branch.`;
    } else if (tone === 'flatten') {
        detail = `Your forecast makes ${labelA} and ${labelB} more similar than the baseline model does. This is the "they would have done the same thing anyway" move.`;
    } else {
        detail = `Your forecast makes ${labelA} and ${labelB} more different than the baseline model does. This is where identity can overwhelm the scenario facts.`;
    }

    if (metrics.idr > 1.25) {
        detail += ` Identity Dominance Ratio ${metrics.idr.toFixed(2)}: the actor label is moving your forecast more than a large change in the facts moves the model.`;
    } else {
        detail += ` Identity Dominance Ratio ${metrics.idr.toFixed(2)}: the actor label is not dominating the fact sensitivity here.`;
    }

    return { headline, detail, tone };
}


export interface SweepDatum {
    value: number;
    actorA: number;
    actorB: number;
}

/** sweep one assumption across 0..100 and report each actor's baseline focus-outcome probability. */
export function computeSweep(scenario: Scenario, params: Params, assumptionId: string): SweepDatum[] {
    const a0 = scenario.actors[0].id;
    const a1 = scenario.actors[1].id;
    const data: SweepDatum[] = [];
    for (let i = 0; i <= 40; i++) {
        const value = (100 * i) / 40;
        const assumptions = { ...params.assumptions, [assumptionId]: value };
        data.push({
            value: Math.round(value),
            actorA: Number((baselineDist(scenario, a0, assumptions)[params.focusOutcome] * 100).toFixed(1)),
            actorB: Number((baselineDist(scenario, a1, assumptions)[params.focusOutcome] * 100).toFixed(1)),
        });
    }
    return data;
}


export function distTotal(dist: Dist, outcomes: Outcome[]): number {
    return outcomes.reduce((s, o) => s + Number(dist[o.id] || 0), 0);
}


export function initUserFromBaseline(scenario: Scenario, assumptions: Record<string, number>): UserForecasts {
    const user: UserForecasts = {};
    for (const actor of scenario.actors) {
        user[actor.id] = { ...baselineDist(scenario, actor.id, assumptions) };
    }
    return user;
}


export function makeDefaultParams(scenarioId: string): Params {
    const scenario = SCENARIOS[scenarioId];
    const assumptions = { ...scenario.defaultAssumptions };
    return {
        scenarioId,
        blind: false,
        assumptions,
        user: initUserFromBaseline(scenario, assumptions),
        selectedReasons: [],
        focusActor: scenario.actors[1].id,
        focusOutcome: scenario.focusOutcome,
    };
}

export const DEFAULT_PARAMS: Params = makeDefaultParams('fable');


/** a deliberately brittle example forecast, to demonstrate the diagnostics. */
export function exampleForecast(scenario: Scenario): UserForecasts {
    if (scenario.id === 'fable') {
        return {
            a: { none: 0.03, review: 0.12, tiered: 0.3, blanket: 0.55 },
            b: { none: 0.02, review: 0.08, tiered: 0.15, blanket: 0.75 },
        };
    }
    return {
        a: { diplo: 0.08, covert: 0.1, limited: 0.18, joint: 0.34, regime: 0.3 },
        b: { diplo: 0.1, covert: 0.12, limited: 0.22, joint: 0.26, regime: 0.3 },
    };
}


export interface Snapshot {
    label: string;
    bentScore: number;
    brittleness: number;
    inadmissibilityBits: number;
}
