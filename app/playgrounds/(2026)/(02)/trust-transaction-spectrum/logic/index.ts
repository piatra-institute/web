export interface Inputs {
    threat: number;
    rivalry: number;
    alliance: number;
    institutions: number;
    dependence: number;
    sanctions: number;
    cohesion: number;
    reputation: number;
    horizon: number;
    leverage: number;
    crisis: boolean;
}

export interface Scenario {
    id: string;
    name: string;
    createdAt: string;
    inputs: Inputs;
    score: number;
    posture: string;
}

export interface Posture {
    name: string;
    tagline: string;
    knobs: {
        more: string;
        less: string;
    };
}

export interface ContributionItem {
    key: string;
    weight: number;
    input: number;
    contrib: number;
}

export interface AntiItem {
    key: string;
    value: number;
}

export interface ExitCondition {
    k: string;
    ok: boolean;
}

export interface ChartItem {
    name: string;
    contrib: number;
    weight: number;
    input: number;
}

export interface ModelResult {
    score: number;
    posture: Posture;
    topToward: ContributionItem[];
    anti: AntiItem[];
    suggestions: string[];
    chart: ChartItem[];
    leveragePenalty: number;
    leverageBoost: number;
    exitScore: number;
    exitConditions: ExitCondition[];
}

export interface CompareResult {
    scenario: Scenario;
    diff: Record<string, number>;
}

export const DEFAULT_INPUTS: Inputs = {
    threat: 4,
    rivalry: 5,
    alliance: 6,
    institutions: 6,
    dependence: 6,
    sanctions: 5,
    cohesion: 6,
    reputation: 6,
    horizon: 7,
    leverage: 4,
    crisis: false,
};

export interface Preset {
    key: string;
    name: string;
    desc: string;
    values: Inputs;
}

export const PRESETS: Preset[] = [
    {
        key: 'rules_small_state',
        name: 'Institutionalist equilibrium',
        desc: 'Low threat, robust shelter, high reputational capital',
        values: {
            threat: 2, rivalry: 3, alliance: 7, institutions: 8,
            dependence: 4, sanctions: 3, cohesion: 7, reputation: 8,
            horizon: 8, leverage: 3, crisis: false,
        },
    },
    {
        key: 'frontier_crisis',
        name: 'Acute security dilemma',
        desc: 'Elevated threat, weak shelter, compressed planning horizon',
        values: {
            threat: 9, rivalry: 7, alliance: 4, institutions: 4,
            dependence: 6, sanctions: 7, cohesion: 5, reputation: 5,
            horizon: 3, leverage: 4, crisis: true,
        },
    },
    {
        key: 'trade_hub_hedge',
        name: 'Hedging entrepot',
        desc: 'High dependency concentration, moderate threat, mixed shelter',
        values: {
            threat: 5, rivalry: 7, alliance: 5, institutions: 7,
            dependence: 9, sanctions: 6, cohesion: 6, reputation: 7,
            horizon: 7, leverage: 6, crisis: false,
        },
    },
    {
        key: 'client_state',
        name: 'Patron-client alignment',
        desc: 'Low autonomy, high alliance reliance, asymmetric leverage',
        values: {
            threat: 6, rivalry: 8, alliance: 8, institutions: 5,
            dependence: 7, sanctions: 5, cohesion: 5, reputation: 4,
            horizon: 5, leverage: 2, crisis: false,
        },
    },
];

function clamp(n: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, n));
}

function norm10(v: number): number {
    return clamp(v / 10, 0, 1);
}

/**
 * Weighted factor model for strategic posture index.
 *
 * This is an expert-judgment heuristic, not an empirically calibrated model.
 * Factor selection draws on the small-state diplomacy literature (Thorhallsson's
 * shelter theory, Kuik's hedging framework, Walt's balance-of-threat theory,
 * Hirschman's dependency concentration). Weights are elicited rather than
 * regression-derived — comparable in methodology to the Fragile States Index.
 *
 * Key design choices grounded in the literature:
 *
 * 1. Domestic cohesion is weighted at 0.12 (not 0.08): Kuik identifies domestic
 *    legitimation as the primary explanation for hedging variation across states.
 *
 * 2. Two interaction terms capture nonlinearities the linear model misses:
 *    - threat × alliance_deficit (Walt: threat without credible ally is qualitatively
 *      different from threat with one)
 *    - rivalry × institutional_deficit (Thorhallsson: contested region without
 *      institutional shelter produces compounding pressure)
 *
 * 3. Crisis regime: institutional shelter deficit weight INCREASES (Thorhallsson
 *    argues shelter is most critical during crises), while reputational capital
 *    weight decreases (short-term survival overrides reputation investment).
 *
 * 4. Leverage adjustment is convex: the penalty for very low autonomy is
 *    disproportionately large (partners discount unreliable small actors faster).
 *
 * 5. Posture thresholds (25/45/65) are heuristic decision-theoretic boundaries,
 *    not empirically derived cutpoints.
 */
export function computeModel(inputs: Inputs): ModelResult {
    // Base weights sum to 1.0. Domestic cohesion elevated per Kuik;
    // sanctions reduced (endogeneity: partly consequence of posture).
    // "Short planning horizon" replaces "temporal discounting" — the
    // concept of horizon-dependent strategy is standard in foreign policy
    // analysis, though not formalised under that name in IR theory.
    const baseWeights = {
        threat: 0.15,
        rivalry: 0.10,
        dependence: 0.13,
        sanctions: 0.08,
        allianceGap: 0.10,
        instGap: 0.12,
        cohesionGap: 0.12,
        reputationGap: 0.10,
        shortHorizon: 0.10,
    };

    // Crisis regime: Thorhallsson-corrected reallocation.
    // Institutional shelter deficit weight INCREASES (shelter is most critical
    // during crises — Thorhallsson 2011). Reputational capital weight DECREASES
    // (short-term survival overrides reputation investment under acute threat).
    const weights = inputs.crisis
        ? {
            threat: baseWeights.threat + 0.02,
            rivalry: baseWeights.rivalry - 0.01,
            dependence: baseWeights.dependence,
            sanctions: baseWeights.sanctions - 0.01,
            allianceGap: baseWeights.allianceGap,
            instGap: baseWeights.instGap + 0.02,
            cohesionGap: baseWeights.cohesionGap,
            reputationGap: baseWeights.reputationGap - 0.03,
            shortHorizon: baseWeights.shortHorizon + 0.01,
        }
        : baseWeights;

    const n = {
        threat: norm10(inputs.threat),
        rivalry: norm10(inputs.rivalry),
        alliance: norm10(inputs.alliance),
        institutions: norm10(inputs.institutions),
        dependence: norm10(inputs.dependence),
        sanctions: norm10(inputs.sanctions),
        cohesion: norm10(inputs.cohesion),
        reputation: norm10(inputs.reputation),
        horizon: norm10(inputs.horizon),
        leverage: norm10(inputs.leverage),
    };

    const shortHorizon = 1 - n.horizon;

    // Main additive components (linear terms)
    const components: ContributionItem[] = [
        { key: 'External threat salience', weight: weights.threat, input: inputs.threat, contrib: weights.threat * n.threat },
        { key: 'Great-power rivalry', weight: weights.rivalry, input: inputs.rivalry, contrib: weights.rivalry * n.rivalry },
        { key: 'Dependency concentration', weight: weights.dependence, input: inputs.dependence, contrib: weights.dependence * n.dependence },
        { key: 'Sanctions exposure', weight: weights.sanctions, input: inputs.sanctions, contrib: weights.sanctions * n.sanctions },
        { key: 'Alliance credibility deficit', weight: weights.allianceGap, input: inputs.alliance, contrib: weights.allianceGap * (1 - n.alliance) },
        { key: 'Institutional shelter deficit', weight: weights.instGap, input: inputs.institutions, contrib: weights.instGap * (1 - n.institutions) },
        { key: 'Domestic cohesion deficit', weight: weights.cohesionGap, input: inputs.cohesion, contrib: weights.cohesionGap * (1 - n.cohesion) },
        { key: 'Reputational capital deficit', weight: weights.reputationGap, input: inputs.reputation, contrib: weights.reputationGap * (1 - n.reputation) },
        { key: 'Short planning horizon', weight: weights.shortHorizon, input: inputs.horizon, contrib: weights.shortHorizon * shortHorizon },
    ];

    // Interaction terms (Walt, Thorhallsson): the linear model alone misses
    // that threat without credible alliance, or rivalry without institutional
    // shelter, produces compounding pressure — not merely additive.
    const interactThreatAlliance = n.threat * (1 - n.alliance);
    const interactRivalryInstitutions = n.rivalry * (1 - n.institutions);

    const INTERACTION_COEFF_THREAT_ALLIANCE = 0.08;
    const INTERACTION_COEFF_RIVALRY_INST = 0.06;

    components.push({
        key: 'Threat \u00d7 Alliance deficit',
        weight: INTERACTION_COEFF_THREAT_ALLIANCE,
        input: Math.round(interactThreatAlliance * 10),
        contrib: INTERACTION_COEFF_THREAT_ALLIANCE * interactThreatAlliance,
    });
    components.push({
        key: 'Rivalry \u00d7 Shelter deficit',
        weight: INTERACTION_COEFF_RIVALRY_INST,
        input: Math.round(interactRivalryInstitutions * 10),
        contrib: INTERACTION_COEFF_RIVALRY_INST * interactRivalryInstitutions,
    });

    const raw = components.reduce((acc, c) => acc + c.contrib, 0);
    let score = raw * 100;

    // Convex leverage adjustment: the penalty for very low autonomy is
    // disproportionately large because partners discount unreliable small
    // actors faster (nonlinear reputation erosion). The boost for high
    // autonomy is linear — having resources makes transactionalism feasible
    // but not exponentially so.
    const leveragePenalty = Math.pow(1 - n.leverage, 1.5) * 10;
    const leverageBoost = n.leverage * 5;

    score = score - leveragePenalty + leverageBoost;
    score = clamp(score, 0, 100);

    // Posture classification: heuristic thresholds, not empirical cutpoints.
    // The taxonomy maps loosely onto Kuik's hedging spectrum and the
    // institutionalism–realism–transactionalism continuum in the literature.
    const posture: Posture =
        score < 25
            ? {
                name: 'Rules-first / institutionalist',
                tagline: 'Maximise institutional shelter and reputational capital as primary force multipliers under low threat salience.',
                knobs: {
                    more: 'Narrow domain-specific skepticism where verification costs are low.',
                    less: 'Maintain commitment legibility; invest in multilateral shelter and niche specialisation.',
                },
            }
            : score < 45
                ? {
                    name: 'Selective engagement',
                    tagline: 'Incentive-aware engagement: predictable negotiation posture with credible commitments and clear red lines.',
                    knobs: {
                        more: 'Deploy transactional instruments for specific vulnerability domains (supply chain, energy).',
                        less: 'Avoid gratuitous opportunism that erodes long-term credibility premium.',
                    },
                }
                : score < 65
                    ? {
                        name: 'Hedging / insurance',
                        tagline: 'Diversify dependencies and maintain optionality across alignment axes without signaling unreliability (Kuik 2016).',
                        knobs: {
                            more: 'Increase redundancy across critical supply chains and security partners.',
                            less: 'Clarify minimal commitment thresholds to prevent perception of fickleness.',
                        },
                    }
                    : {
                        name: 'Hard transactionalism',
                        tagline: 'Operate under brittle-guarantee assumptions; prioritise survival, leverage accumulation, and reversible bargains.',
                        knobs: {
                            more: 'Confine this posture to acute crisis windows; preserve de-escalation pathways.',
                            less: 'Rebuild credibility rapidly once acute threat salience subsides.',
                        },
                    };

    const sorted = [...components].sort((a, b) => b.contrib - a.contrib);
    const topToward = sorted.slice(0, 5);

    // Stabiliser contributions: factors that reduce transactionality pressure
    const anti: AntiItem[] = [
        { key: 'Institutional shelter strength', value: weights.instGap * n.institutions },
        { key: 'Alliance credibility', value: weights.allianceGap * n.alliance },
        { key: 'Reputational capital stock', value: weights.reputationGap * n.reputation },
        { key: 'Long planning horizon', value: weights.shortHorizon * n.horizon },
        { key: 'Domestic cohesion', value: weights.cohesionGap * n.cohesion },
        { key: 'Relative autonomy', value: n.leverage * 0.05 },
    ].sort((a, b) => b.value - a.value).slice(0, 4);

    // Policy adjustment vectors conditioned on current input values
    const suggestions: string[] = [];
    if (inputs.dependence >= 7) suggestions.push('Diversify critical dependencies across energy, finance, trade routes, and technology supply chains (Hirschman concentration reduction).');
    if (inputs.institutions <= 5) suggestions.push('Strengthen institutional shelter: deepen treaty compliance, invest in multilateral coalition-building and legal framing (Thorhallsson shelter theory).');
    if (inputs.alliance <= 5) suggestions.push('Enhance alliance credibility: joint exercises, interoperability agreements, visible public commitments.');
    if (inputs.reputation <= 5) suggestions.push('Rebuild reputational capital: reduce policy surprises, increase commitment transparency, maintain consistent signaling.');
    if (inputs.threat >= 7 && inputs.alliance <= 5) suggestions.push('Threat-alliance interaction is high: the combination of elevated threat without credible alliance produces compounding pressure toward transactionalism.');
    if (inputs.threat >= 7) suggestions.push('Under acute threat, prefer reversible bargains and rapid capability acquisition; avoid irreversible reputational depreciation.');
    if (inputs.horizon <= 4) suggestions.push('Extend effective planning horizon: bipartisan policy anchors, stable procurement cycles, predictable diplomatic engagement.');
    if (inputs.cohesion <= 4) suggestions.push('Strengthen domestic cohesion: Kuik identifies domestic legitimation as the primary driver of hedging variation across states.');

    if (suggestions.length < 3) {
        suggestions.push(
            'Maintain domain-selective posture: sceptical assessment paired with reliable commitment execution.',
            'Evaluate partner reliability through observable indicators: delivery history, legal constraints, domestic political incentives.',
            'Preserve strategic redundancy: stockpiles, alternative suppliers, diversified diplomatic channels.',
        );
    }

    const chart: ChartItem[] = components
        .map((c) => ({ name: c.key, contrib: c.contrib, weight: c.weight, input: c.input }))
        .sort((a, b) => b.contrib - a.contrib);

    // Threshold conditions for posture de-escalation.
    // These represent necessary (not sufficient) conditions for transitioning
    // from hedging/transactional posture toward rules-based engagement.
    const exitConditions: ExitCondition[] = [
        { k: 'Threat salience', ok: inputs.threat <= 4 },
        { k: 'Institutional shelter', ok: inputs.institutions >= 7 },
        { k: 'Alliance credibility', ok: inputs.alliance >= 7 },
        { k: 'Reputational capital', ok: inputs.reputation >= 7 },
        { k: 'Planning horizon', ok: inputs.horizon >= 7 },
    ];

    const exitScore = exitConditions.reduce((acc, e) => acc + (e.ok ? 1 : 0), 0);

    return {
        score,
        posture,
        topToward,
        anti,
        suggestions: suggestions.slice(0, 7),
        chart,
        leveragePenalty,
        leverageBoost,
        exitScore,
        exitConditions,
    };
}

export function computeComparison(
    inputs: Inputs,
    scenarios: Scenario[],
    compareId: string | null,
): CompareResult | null {
    if (!compareId) return null;
    const scenario = scenarios.find((s) => s.id === compareId);
    if (!scenario) return null;

    const diff: Record<string, number> = {};
    const keys = Object.keys(inputs).filter((k) => k !== 'crisis') as (keyof Omit<Inputs, 'crisis'>)[];
    for (const k of keys) {
        diff[k] = (inputs[k] as number) - (scenario.inputs[k] as number);
    }

    return { scenario, diff };
}
