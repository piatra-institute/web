export * from './graph';
export * from './actions';
export * from './pressure';
export * from './frames';
export * from './obstruction';
export * from './metrics';

export type PresetKey =
    | 'broken-trust'
    | 'tragedy-of-commons'
    | 'sanctuary-asylum'
    | 'whistleblower'
    | 'war-crime';

export interface Pressures {
    dopamine: number;          // local-reward bias (0..1)
    empathy: number;           // others' pain salience
    institutional: number;     // strength of court/norm/sanction loop
    scarcity: number;          // resource scarcity
    memory: number;            // historical resilience / hysteresis
    ecology: number;           // ecological coupling strength
}

export interface Params extends Pressures {
    preset: PresetKey;
}

import type { Metrics } from './metrics';
import type { ActionKey } from './actions';

export const PRESET_DESCRIPTIONS: Record<
    PresetKey,
    { label: string; question: string; expectation: string; pressures: Pressures; initialMetrics: Metrics; preplayed: ActionKey[] }
> = {
    'broken-trust': {
        label: 'broken trust',
        question: 'Two agents, one betrayal. Can repair restore the graph?',
        expectation: 'Trust collapses fast; repair recovers slowly. The frames split between forgiveness and prosecution.',
        pressures: { dopamine: 0.55, empathy: 0.6, institutional: 0.5, scarcity: 0.3, memory: 0.7, ecology: 0.4 },
        initialMetrics: { trust: 70, agency: 65, harm: 25, repair: 50, domination: 35, ecology: 60 },
        preplayed: ['betray-promise'],
    },
    'tragedy-of-commons': {
        label: 'tragedy of commons',
        question: 'Scarcity + dopamine + weak institutions = a predictable collapse?',
        expectation: 'Exploit becomes locally rational and globally ruinous. Ecology and trust both decay.',
        pressures: { dopamine: 0.78, empathy: 0.4, institutional: 0.3, scarcity: 0.8, memory: 0.4, ecology: 0.7 },
        initialMetrics: { trust: 55, agency: 60, harm: 35, repair: 35, domination: 45, ecology: 65 },
        preplayed: ['exploit-resource', 'exploit-resource'],
    },
    'sanctuary-asylum': {
        label: 'sanctuary asylum',
        question: 'A coerced agent reaches for institutional shelter, does it hold?',
        expectation: 'Sanctuary lifts agency; punishment by the dominator raises tension across frames.',
        pressures: { dopamine: 0.45, empathy: 0.75, institutional: 0.7, scarcity: 0.4, memory: 0.65, ecology: 0.5 },
        initialMetrics: { trust: 60, agency: 45, harm: 50, repair: 40, domination: 60, ecology: 55 },
        preplayed: ['coerce-agent', 'grant-sanctuary'],
    },
    'whistleblower': {
        label: 'whistleblower',
        question: 'Truth-telling against an institution: solidarity or sanction?',
        expectation: 'Share-knowledge raises trust slightly but harms agency under high institutional pressure. Frames diverge sharply.',
        pressures: { dopamine: 0.4, empathy: 0.7, institutional: 0.85, scarcity: 0.4, memory: 0.6, ecology: 0.3 },
        initialMetrics: { trust: 55, agency: 65, harm: 30, repair: 45, domination: 50, ecology: 55 },
        preplayed: ['share-knowledge'],
    },
    'war-crime': {
        label: 'war crime',
        question: 'Coercion under domination, sanctuary refused, repair impossible?',
        expectation: 'High harm, low repair, low ecology, multiple frames flip sign. Long irreversibility.',
        pressures: { dopamine: 0.6, empathy: 0.35, institutional: 0.55, scarcity: 0.6, memory: 0.85, ecology: 0.45 },
        initialMetrics: { trust: 35, agency: 30, harm: 70, repair: 25, domination: 70, ecology: 35 },
        preplayed: ['coerce-agent', 'punish-defection', 'exploit-resource'],
    },
};

export function presetParams(key: PresetKey): Params {
    const desc = PRESET_DESCRIPTIONS[key];
    return { ...desc.pressures, preset: key };
}

export interface SnapshotMetrics extends Metrics {}

export interface Snapshot {
    params: Params;
    metrics: Metrics;
    viability: number;
    label: string;
}

export type SweepableParam = keyof Pressures;

export const PRESSURE_SPECS: { key: SweepableParam; label: string }[] = [
    { key: 'dopamine', label: 'dopamine bias' },
    { key: 'empathy', label: 'empathy' },
    { key: 'institutional', label: 'institutional strength' },
    { key: 'scarcity', label: 'scarcity' },
    { key: 'memory', label: 'memory / hysteresis' },
    { key: 'ecology', label: 'ecological coupling' },
];

export interface SensitivityBar {
    label: string;
    low: number;
    high: number;
}

import { computeViability } from './metrics';
import { applyAction, ACTIONS } from './actions';

export function computeSensitivity(params: Params, baselineMetrics: Metrics): SensitivityBar[] {
    return PRESSURE_SPECS.map((spec) => {
        const atLow = computeViability(applyAction(baselineMetrics, 'keep-promise', { ...params, [spec.key]: 0 }));
        const atHigh = computeViability(applyAction(baselineMetrics, 'keep-promise', { ...params, [spec.key]: 1 }));
        return {
            label: spec.label,
            low: Math.min(atLow, atHigh),
            high: Math.max(atLow, atHigh),
        };
    }).sort((a, b) => (b.high - b.low) - (a.high - a.low));
}

export interface SweepDatum {
    sweepValue: number;
    viability: number;
    trust: number;
    agency: number;
    harm: number;
    repair: number;
    domination: number;
    ecology: number;
}

export function computeSweep(params: Params, baselineMetrics: Metrics, key: SweepableParam): SweepDatum[] {
    const out: SweepDatum[] = [];
    const steps = 41;
    for (let i = 0; i < steps; i++) {
        const v = i / (steps - 1);
        const m = applyAction(baselineMetrics, 'keep-promise', { ...params, [key]: v });
        out.push({
            sweepValue: v,
            viability: computeViability(m),
            trust: m.trust / 100,
            agency: m.agency / 100,
            harm: m.harm / 100,
            repair: m.repair / 100,
            domination: m.domination / 100,
            ecology: m.ecology / 100,
        });
    }
    return out;
}

export function computeNarrative(metrics: Metrics, params: Params, lastAction: ActionKey | null): string {
    const v = computeViability(metrics);
    const parts: string[] = [];
    const regime = v >= 76 ? 'stable moral topology' : v >= 52 ? 'contested but repairable' : 'fragile or predatory graph';
    parts.push(`Viability ${v.toFixed(0)}/100, ${regime}.`);

    if (metrics.trust < 35) parts.push(`Trust is collapsing (${metrics.trust.toFixed(0)}); promises no longer carry weight.`);
    if (metrics.agency < 40) parts.push(`Agency is depressed (${metrics.agency.toFixed(0)}); coercion or domination is constraining choice.`);
    if (metrics.harm > 60) parts.push(`Harm load is high (${metrics.harm.toFixed(0)}) and the graph is generating victims faster than it repairs them.`);
    if (metrics.domination > 60) parts.push(`Domination pressure exceeds institutional check.`);
    if (metrics.ecology < 35) parts.push(`Ecological resilience has degraded, externalities are accumulating beyond the commons' carrying capacity.`);
    if (params.scarcity > 0.7 && params.dopamine > 0.65) {
        parts.push(`Scarcity × dopamine: local rewards push the graph toward exploit-dominant equilibria.`);
    }
    if (lastAction) {
        const actionLabel = ACTIONS.find((a) => a.key === lastAction)?.label ?? lastAction;
        parts.push(`Most recent edge traversed: ${actionLabel}.`);
    }
    return parts.join(' ');
}
