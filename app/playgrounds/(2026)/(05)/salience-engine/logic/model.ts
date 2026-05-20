import {
    OBJECTS,
    OBJECT_KEYS,
    type ObjectKey,
    type ObjectProfile,
} from './objects';
import { getStatusByScore, type StatusDef } from './ladder';


export const FIELD_KEYS = [
    'reward',
    'surprise',
    'uncertainty',
    'attachment',
    'narrative',
    'habituation',
    'reality',
    'temperature',
] as const;

export type FieldKey = typeof FIELD_KEYS[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
    reward: 'expected value',
    surprise: 'prediction error',
    uncertainty: 'uncertainty',
    attachment: 'attachment',
    narrative: 'narrative binding',
    habituation: 'habituation',
    reality: 'reality correction',
    temperature: 'attention temperature',
};

export const FIELD_SYMBOLS: Record<FieldKey, string> = {
    reward: 'alpha',
    surprise: 'beta',
    uncertainty: 'gamma',
    attachment: 'eta',
    narrative: 'rho',
    habituation: 'lambda',
    reality: 'R',
    temperature: 'tau',
};

export const FIELD_HINTS: Record<FieldKey, string> = {
    reward: 'how much possible reward a cue is allowed to contribute to its salience.',
    surprise: 'how much prediction error, the gap between expected and received signal, amplifies salience.',
    uncertainty: 'how much ambiguity about reciprocation or outcome keeps the loop running. the dangerous term.',
    attachment: 'how much safety, bonding, and regulation relevance lift a cue.',
    narrative: 'how much the self-story amplifies a cue into a sign of identity and future.',
    habituation: 'how quickly novelty and intensity decay. higher means faster fade.',
    reality: 'evidence, boundaries, sleep, friends, context. the brake that pulls salience back toward evidential weight.',
    temperature: 'attention temperature. low temperature makes attention winner-takes-most; high temperature spreads it.',
};

export const FIELD_GROUPS: { title: string; keys: FieldKey[] }[] = [
    { title: 'accelerants', keys: ['reward', 'surprise', 'uncertainty', 'attachment', 'narrative'] },
    { title: 'brakes', keys: ['habituation', 'reality'] },
    { title: 'allocation', keys: ['temperature'] },
];

export type FieldValues = Record<FieldKey, number>;

export type Regime = 'stable' | 'ambiguous' | 'volatile';

export const REGIMES: Regime[] = ['stable', 'ambiguous', 'volatile'];

export const REGIME_LABELS: Record<Regime, string> = {
    stable: 'stable',
    ambiguous: 'ambiguous',
    volatile: 'volatile',
};

export const REGIME_HINTS: Record<Regime, string> = {
    stable: 'the cue arrives predictably. clear affection or clear absence. low intermittency, the loop can settle.',
    ambiguous: 'the cue half-signals. maybe-present, maybe-absent. intermittent reinforcement keeps the system computing.',
    volatile: 'the cue swings hard between presence and absence. maximum intermittency, maximum loop fuel.',
};

const REGIME_INTERMITTENCY: Record<Regime, number> = {
    stable: 0.25,
    ambiguous: 0.62,
    volatile: 0.85,
};

export type PresetKey = 'balanced' | 'limerence' | 'capture' | 'correction';

export const PRESET_KEYS: PresetKey[] = ['balanced', 'limerence', 'capture', 'correction'];

export interface PresetDescription {
    label: string;
    question: string;
    expectation: string;
    field: FieldValues;
}

export const PRESET_DESCRIPTIONS: Record<PresetKey, PresetDescription> = {
    balanced: {
        label: 'balanced love',
        question: 'what does proportional attachment look like as a parameter set?',
        expectation: 'salience present but bounded. attention can leave the object. status ordinary or charged.',
        field: {
            reward: 72,
            surprise: 38,
            uncertainty: 28,
            attachment: 58,
            narrative: 45,
            habituation: 36,
            reality: 42,
            temperature: 62,
        },
    },
    limerence: {
        label: 'limerence loop',
        question: 'high uncertainty, weak brakes, low temperature. what runs away?',
        expectation: 'over-salience for the beloved. attention collapses onto one object. status runaway.',
        field: {
            reward: 82,
            surprise: 82,
            uncertainty: 88,
            attachment: 72,
            narrative: 81,
            habituation: 12,
            reality: 15,
            temperature: 22,
        },
    },
    capture: {
        label: 'incentive capture',
        question: 'maximum reward and surprise, almost no attachment or narrative. wanting without liking.',
        expectation: 'the notification-type cue dominates. high salience, thin meaning. status captured.',
        field: {
            reward: 95,
            surprise: 72,
            uncertainty: 66,
            attachment: 24,
            narrative: 28,
            habituation: 8,
            reality: 22,
            temperature: 18,
        },
    },
    correction: {
        label: 'reality correction',
        question: 'strong brakes, high temperature, modest accelerants. can the field be calmed?',
        expectation: 'salience pulled back toward evidential weight. attention spreads. status ordinary.',
        field: {
            reward: 45,
            surprise: 26,
            uncertainty: 18,
            attachment: 44,
            narrative: 21,
            habituation: 66,
            reality: 72,
            temperature: 88,
        },
    },
};

export interface Params extends FieldValues {
    object: ObjectKey;
    regime: Regime;
    preset: PresetKey;
}

export const DEFAULT_PARAMS: Params = {
    ...PRESET_DESCRIPTIONS.capture.field,
    object: 'notification',
    regime: 'ambiguous',
    preset: 'capture',
};

export interface ObjectState {
    key: ObjectKey;
    rawSalience: number;
    salience: number;
    overSalience: number;
    meaning: number;
    predictionError: number;
    uncertainty: number;
    attachment: number;
    attention: number;
    rungs: number[];
    climb: number;
}

export interface Metrics {
    salience: number;
    overSalience: number;
    attentionShare: number;
    concentration: number;
    meaning: number;
    stability: number;
    stageIndex: number;
    statusIndex: number;
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

function clamp100(x: number): number {
    return Math.max(0, Math.min(100, Math.round(x)));
}

export function temperatureOf(p: FieldValues): number {
    return 0.1 + 1.2 * (p.temperature / 100);
}

// status blends loudness (salience) with world-filter capture (over-salience):
// a loud incentive cue stays charged; only genuine over-salience reaches runaway.
export function statusOf(state: { salience: number; overSalience: number }): StatusDef {
    return getStatusByScore(0.55 * state.salience + 0.45 * state.overSalience);
}

interface RawObjectState {
    key: ObjectKey;
    rawSalience: number;
    salience: number;
    overSalience: number;
    meaning: number;
    predictionError: number;
    uncertainty: number;
    attachment: number;
    rungs: number[];
}

function computeRaw(key: ObjectKey, p: Params): RawObjectState {
    const profile: ObjectProfile = OBJECTS[key].profile;
    const b = {
        matter: profile.matter / 100,
        constraint: profile.constraint / 100,
        proto: profile.proto / 100,
        sign: profile.sign / 100,
        reward: profile.reward / 100,
        affect: profile.affect / 100,
        cognition: profile.cognition / 100,
        narrative: profile.narrative / 100,
    };

    const inter = REGIME_INTERMITTENCY[p.regime];
    const predErr = clamp01(b.sign * (0.3 + 0.7 * inter));
    const unc = clamp01((0.35 + 0.65 * inter) * (0.4 + 0.6 * b.sign));
    const attach = clamp01(0.55 * b.affect + 0.45 * b.narrative);

    const g = {
        reward: p.reward / 100,
        surprise: p.surprise / 100,
        uncertainty: p.uncertainty / 100,
        attachment: p.attachment / 100,
        narrative: p.narrative / 100,
        habituation: p.habituation / 100,
        reality: p.reality / 100,
    };

    const structural =
        0.1 * b.matter + 0.18 * b.constraint + 0.16 * b.proto + 0.3 * b.sign;
    const drive =
        g.reward * b.reward +
        g.surprise * predErr +
        g.uncertainty * unc +
        g.attachment * attach +
        g.narrative * b.narrative;
    const habituationDrag = g.habituation * (0.28 + 0.22 * (1 - b.sign));
    const realityCorrection = g.reality * (0.22 + 0.46 * b.matter + 0.2 * (1 - b.sign));

    const raw = Math.max(0, Math.min(6, structural + drive - habituationDrag - realityCorrection));

    // smooth saturating map: stays responsive at every raw, never pins at 100.
    const salience = clamp100(100 * (1 - Math.exp(-raw / 1.118)));
    const overSalience = clamp01((raw - 1.6) / 1.4);
    const meaning = clamp100(
        (0.25 * b.sign +
            0.22 * b.reward +
            0.2 * b.affect +
            0.15 * b.cognition +
            0.18 * b.narrative) *
            (0.72 + 0.28 * raw) *
            100,
    );

    const valueRung = clamp01(
        b.reward * (0.5 + 0.5 * g.reward) + g.surprise * predErr * 0.3,
    );
    const narrativeRung = clamp01(b.narrative * (0.5 + 0.5 * g.narrative));

    const rungs = [
        clamp100(b.matter * 100),
        clamp100(b.constraint * 100),
        clamp100(b.proto * 100),
        clamp100(b.sign * 100),
        clamp100(valueRung * 100),
        0,
        clamp100(narrativeRung * 100),
        clamp100(overSalience * 100),
    ];

    return {
        key,
        rawSalience: raw,
        salience,
        overSalience: clamp100(overSalience * 100),
        meaning,
        predictionError: clamp100(predErr * 100),
        uncertainty: clamp100(unc * 100),
        attachment: clamp100(attach * 100),
        rungs,
    };
}

export function computeField(p: Params): ObjectState[] {
    const raws = OBJECT_KEYS.map((k) => computeRaw(k, p));
    const tau = temperatureOf(p);
    const maxRaw = Math.max(...raws.map((r) => r.rawSalience));
    const exps = raws.map((r) => Math.exp((r.rawSalience - maxRaw) / Math.max(0.08, tau)));
    const total = exps.reduce((a, b) => a + b, 0) || 1;

    return raws.map((r, i) => {
        const attention = exps[i] / total;
        const rungs = [...r.rungs];
        rungs[5] = clamp100(attention * 100);
        let climb = 0;
        for (let lvl = 0; lvl < rungs.length; lvl++) {
            if (rungs[lvl] >= 50) climb = lvl;
        }
        return {
            ...r,
            attention,
            rungs,
            climb,
        };
    });
}

export function focalState(p: Params): ObjectState {
    const field = computeField(p);
    return field.find((s) => s.key === p.object) ?? field[0];
}

export function scoreModel(p: Params): Metrics {
    const field = computeField(p);
    const focal = field.find((s) => s.key === p.object) ?? field[0];

    const maxEntropy = Math.log2(field.length);
    const entropy = -field.reduce((sum, s) => {
        if (s.attention <= 0) return sum;
        return sum + s.attention * Math.log2(s.attention);
    }, 0);
    const concentration = clamp100((1 - entropy / maxEntropy) * 100);

    const stability = clamp100(
        p.reality * 0.4 + p.habituation * 0.25 + (100 - focal.overSalience) * 0.35,
    );

    return {
        salience: focal.salience,
        overSalience: focal.overSalience,
        attentionShare: clamp100(focal.attention * 100),
        concentration,
        meaning: focal.meaning,
        stability,
        stageIndex: focal.climb,
        statusIndex: statusOf(focal).index,
    };
}

export function presetParams(current: Params, key: PresetKey): Params {
    return {
        ...current,
        ...PRESET_DESCRIPTIONS[key].field,
        preset: key,
    };
}

export function extractField(p: FieldValues): FieldValues {
    return FIELD_KEYS.reduce((acc, k) => {
        acc[k] = p[k];
        return acc;
    }, {} as FieldValues);
}

export function dominantField(p: FieldValues): FieldKey {
    const entries = FIELD_KEYS.filter((k) => k !== 'temperature').map(
        (k) => [k, p[k]] as const,
    );
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
}

export function weakestBrake(p: FieldValues): FieldKey {
    const brakes: FieldKey[] = ['habituation', 'reality'];
    const entries = brakes.map((k) => [k, p[k]] as const);
    entries.sort((a, b) => a[1] - b[1]);
    return entries[0][0];
}
