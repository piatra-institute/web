import { SCENARIOS, SCENARIO_KEYS, type ScenarioCase, type ScenarioKey } from './scenarios';
import {
    HORIZON,
    simulate,
    type Placement,
    type SimResult,
    type SimulationParams,
    type StepRecord,
} from './simulation';


export const FIELD_KEYS = [
    'childSafety',
    'separationHarm',
    'rightsCost',
    'culturalBias',
    'povertyBias',
    'supportEffect',
    'contactGuarantee',
    'interventionThreshold',
    'adoptionThreshold',
    'noise',
] as const;

export type FieldKey = typeof FIELD_KEYS[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
    childSafety: 'child safety weight',
    separationHarm: 'separation harm weight',
    rightsCost: 'family-rights cost',
    culturalBias: 'cultural-mismatch bias',
    povertyBias: 'poverty-as-neglect bias',
    supportEffect: 'support effectiveness',
    contactGuarantee: 'minimum contact after removal',
    interventionThreshold: 'removal threshold',
    adoptionThreshold: 'permanent-separation threshold',
    noise: 'observation noise',
};

export const FIELD_HINTS: Record<FieldKey, string> = {
    childSafety: 'how much the institution weighs preventing hidden harm. high values make it more interventionist.',
    separationHarm: 'how much the institution weighs the cost of removing a child from their family.',
    rightsCost: 'how much it penalises coercive or irreversible action. high values protect family-life rights.',
    culturalBias: 'how much cultural distance inflates suspicion at the observation layer.',
    povertyBias: 'how much poverty inflates suspicion (the "messy home" trap).',
    supportEffect: 'how strongly home-based support actually improves the caregiver capacity and harm risk.',
    contactGuarantee: 'minimum parental contact when a child is removed. higher values slow attachment collapse.',
    interventionThreshold: 'belief above which removal becomes cheap. lower values make removal easier.',
    adoptionThreshold: 'belief above which permanent separation becomes cheap. lower values make permanence easier.',
    noise: 'how unreliable individual reports and observations are.',
};

export const FIELD_RANGES: Record<FieldKey, { min: number; max: number; step: number }> = {
    childSafety: { min: 0, max: 12, step: 0.1 },
    separationHarm: { min: 0, max: 12, step: 0.1 },
    rightsCost: { min: 0, max: 12, step: 0.1 },
    culturalBias: { min: 0, max: 3, step: 0.05 },
    povertyBias: { min: 0, max: 3, step: 0.05 },
    supportEffect: { min: 0, max: 1.5, step: 0.05 },
    contactGuarantee: { min: 0, max: 1, step: 0.05 },
    interventionThreshold: { min: 0.1, max: 0.95, step: 0.01 },
    adoptionThreshold: { min: 0.1, max: 0.95, step: 0.01 },
    noise: { min: 0, max: 0.35, step: 0.01 },
};

export const FIELD_GROUPS: { title: string; keys: FieldKey[] }[] = [
    { title: 'moral weights', keys: ['childSafety', 'separationHarm', 'rightsCost'] },
    { title: 'observation biases', keys: ['culturalBias', 'povertyBias', 'noise'] },
    { title: 'intervention shape', keys: ['supportEffect', 'contactGuarantee'] },
    { title: 'thresholds', keys: ['interventionThreshold', 'adoptionThreshold'] },
];


export interface Params extends SimulationParams {
    case: ScenarioKey;
}

export const DEFAULT_PARAMS: Params = {
    ...SCENARIOS.ambiguous.profile,
    case: 'ambiguous',
};


export interface Metrics {
    finalBelief: number;
    finalHarm: number;
    finalAttachment: number;
    finalFamily: number;
    finalTrust: number;
    cumulativeLoss: number;
    removalCount: number;
    reunifyCount: number;
    placement: Placement;
    outcomeIndex: number;
}


export type RegimeKey = 'preserved' | 'monitored' | 'separated' | 'ruptured';

export interface RegimeDef {
    key: RegimeKey;
    index: number;
    title: string;
    label: string;
    color: string;
    description: string;
    tells: string[];
    scenario: string;
    aphorism: string;
}

export const REGIMES: RegimeDef[] = [
    {
        key: 'preserved',
        index: 0,
        title: 'preserved',
        label: 'family intact, attachment and integrity held',
        color: '#a3e635',
        description:
            'the child finishes at home with the original family, attachment above 0.6 and family integrity above 0.6. the institution may have offered support or monitoring, but never crossed the removal threshold or did so only briefly before reunification.',
        tells: [
            'final placement: home',
            'final attachment above 0.6',
            'final family integrity above 0.6',
            'no permanent-separation step taken',
        ],
        scenario: 'a poverty-stress or low-belief case where the system used support correctly.',
        aphorism: 'when the institution can wait, the family can stay.',
    },
    {
        key: 'monitored',
        index: 1,
        title: 'monitored',
        label: 'family intact but degraded under surveillance',
        color: '#facc15',
        description:
            'the child is still at home, but attachment, trust, or family integrity has eroded under repeated monitoring or pressure. the system did not remove but never settled into trust. this is the silent cost of a high-vigilance posture.',
        tells: [
            'final placement: home',
            'final family integrity or attachment below 0.6',
            'no removal taken, but support did not bend the trajectory',
            'belief stuck mid-range across the run',
        ],
        scenario: 'an ambiguous or low-cultural-distance case where the system over-surveils and under-supports.',
        aphorism: 'monitoring is the slow cost of refusing both trust and action.',
    },
    {
        key: 'separated',
        index: 2,
        title: 'separated',
        label: 'child currently removed, attachment and trust eroding',
        color: '#f59e0b',
        description:
            'the child is in care at the end of the horizon. removal happened and reunification did not, or did not stick. attachment is decaying, trust collapsed, family integrity weakened. the path-dependence machine has started running.',
        tells: [
            'final placement: removed',
            'attachment dropping over the trajectory',
            'trust below 0.4',
            'no reunification step took place after the removal',
        ],
        scenario: 'a hidden-abuse case where removal was justified, or a cultural-mismatch case where it was not.',
        aphorism: 'removal protects today and rewrites the conditions for tomorrow.',
    },
    {
        key: 'ruptured',
        index: 3,
        title: 'ruptured',
        label: 'permanent separation reached; family integrity collapsed',
        color: '#ea580c',
        description:
            'the system crossed the permanent-separation threshold at some point in the run. the child is no longer with the original family, attachment and family integrity have collapsed, and the trajectory is near-irreversible. the loss here is real even when the alternative would have been worse.',
        tells: [
            'final placement: permanent',
            'family integrity below 0.3',
            'the trajectory hit the adoption threshold',
            'reunification became progressively harder over time',
        ],
        scenario: 'a severe-danger case, or any case where high childSafety and low rightsCost compound under noise.',
        aphorism: 'rupture is the answer the system gives when uncertainty became unbearable.',
    },
];

export function statusOf(metrics: { outcomeIndex: number }): RegimeDef {
    const i = Math.max(0, Math.min(REGIMES.length - 1, metrics.outcomeIndex));
    return REGIMES[i];
}


function classifyOutcome(
    placement: Placement,
    finalState: { A: number; F: number },
    cumulativeRemovals: number,
): number {
    if (placement === 'permanent') return 3;
    if (placement === 'removed') return 2;
    // home placement: did it degrade?
    if (finalState.A < 0.6 || finalState.F < 0.6 || cumulativeRemovals > 0) return 1;
    return 0;
}


export interface SimulationOutput extends SimResult {
    metrics: Metrics;
}


export function runSimulation(p: Params): SimulationOutput {
    const scenario = SCENARIOS[p.case];
    const seed0 = scenario.seed;
    const result = simulate(seed0, p);
    const outcomeIndex = classifyOutcome(
        result.finalPlacement,
        result.finalState,
        result.removalCount,
    );
    const metrics: Metrics = {
        finalBelief: result.finalBelief,
        finalHarm: result.finalState.H,
        finalAttachment: result.finalState.A,
        finalFamily: result.finalState.F,
        finalTrust: result.finalState.T,
        cumulativeLoss: result.cumulativeLoss,
        removalCount: result.removalCount,
        reunifyCount: result.reunifyCount,
        placement: result.finalPlacement,
        outcomeIndex,
    };
    return { ...result, metrics };
}


export function scoreModel(p: Params): Metrics {
    return runSimulation(p).metrics;
}


export function applyCase(current: Params, key: ScenarioKey): Params {
    return {
        ...current,
        ...SCENARIOS[key].profile,
        case: key,
    };
}

export function currentCase(p: Params): ScenarioCase {
    return SCENARIOS[p.case];
}

export function dominantField(p: Params): FieldKey {
    const canon = SCENARIOS[p.case].profile;
    const ranges = FIELD_RANGES;
    const score = (k: FieldKey) => {
        const span = ranges[k].max - ranges[k].min;
        return span === 0 ? 0 : Math.abs(p[k] - canon[k]) / span;
    };
    const sorted = FIELD_KEYS.map((k) => [k, score(k)] as const).sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
}

export { HORIZON };
export type { StepRecord };
