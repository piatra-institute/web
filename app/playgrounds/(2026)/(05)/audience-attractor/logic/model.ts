import {
    SCENARIOS,
    SCENARIO_KEYS,
    type ScenarioCase,
    type ScenarioKey,
} from './scenarios';
import {
    HORIZON,
    bandLabel,
    detectBands,
    simulate,
    type DetectedBand,
    type SimEvent,
    type SimRow,
    type SimulationParams,
} from './simulation';


export const FIELD_KEYS = [
    'initialFloor',
    'capacity',
    'habit',
    'parasocial',
    'discoverability',
    'cumulativeAdvantage',
    'saturation',
    'identityLock',
    'quality',
    'noise',
    'shockProbability',
    'shockStrength',
] as const;

export type FieldKey = typeof FIELD_KEYS[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
    initialFloor: 'initial audience floor',
    capacity: 'effective niche capacity',
    habit: 'habit strength',
    parasocial: 'parasocial conversion',
    discoverability: 'discoverability',
    cumulativeAdvantage: 'cumulative advantage',
    saturation: 'saturation pressure',
    identityLock: 'identity lock-in',
    quality: 'content quality',
    noise: 'noise',
    shockProbability: 'shock probability',
    shockStrength: 'shock strength',
};

export const FIELD_HINTS: Record<FieldKey, string> = {
    initialFloor: 'starting active audience stock. higher values create stronger inherited floors.',
    capacity: 'approximate ceiling created by niche, time slot, format, and platform category.',
    habit: 'return behaviour independent of current content quality.',
    parasocial: 'how often casual viewers become core viewers.',
    discoverability: 'recommendation placement, raids, search, and external visibility.',
    cumulativeAdvantage: 'how much popularity itself generates more popularity.',
    saturation: 'diminishing returns as the creator approaches the natural market size.',
    identityLock: 'penalty for outgrowing the inherited persona or audience expectation.',
    quality: 'a slow trait: format fitness, production quality, topic timing, host skill.',
    noise: 'day-to-day volatility.',
    shockProbability: 'chance of an exposure shock in any single period.',
    shockStrength: 'magnitude of raids, collaborations, controversies, or platform pushes.',
};

export const FIELD_RANGES: Record<FieldKey, { min: number; max: number; step: number }> = {
    initialFloor: { min: 10, max: 8000, step: 10 },
    capacity: { min: 200, max: 40000, step: 100 },
    habit: { min: 0, max: 10, step: 0.1 },
    parasocial: { min: 0, max: 10, step: 0.1 },
    discoverability: { min: 0, max: 10, step: 0.1 },
    cumulativeAdvantage: { min: 0, max: 10, step: 0.1 },
    saturation: { min: 0, max: 10, step: 0.1 },
    identityLock: { min: 0, max: 10, step: 0.1 },
    quality: { min: 0, max: 10, step: 0.1 },
    noise: { min: 0, max: 8, step: 0.1 },
    shockProbability: { min: 0, max: 25, step: 0.5 },
    shockStrength: { min: 0, max: 80, step: 1 },
};

export const FIELD_GROUPS: { title: string; keys: FieldKey[] }[] = [
    { title: 'audience structure', keys: ['initialFloor', 'capacity'] },
    { title: 'stickiness', keys: ['habit', 'parasocial', 'identityLock'] },
    { title: 'growth', keys: ['discoverability', 'cumulativeAdvantage', 'quality'] },
    { title: 'drag', keys: ['saturation'] },
    { title: 'volatility', keys: ['noise', 'shockProbability', 'shockStrength'] },
];

export interface Params extends SimulationParams {
    case: ScenarioKey;
}

export const DEFAULT_PARAMS: Params = {
    ...SCENARIOS.baseline.profile,
    case: 'baseline',
};

export interface Metrics {
    finalViewers: number;
    peakViewers: number;
    troughViewers: number;
    dwellShare: number;
    coreShare: number;
    logRange: number;
    dominantMidpoint: number;
    regimeIndex: number;
}

export type RegimeKey = 'collapsed' | 'wandering' | 'stable' | 'transitioned';

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

// regime tiers describe the shape of the trajectory, not raw audience size.
// "collapsed" and "transitioned" are the two ways out of a basin; "stable"
// is the attractor-confirming case; "wandering" is the falsifier.
export const REGIMES: RegimeDef[] = [
    {
        key: 'collapsed',
        index: 0,
        title: 'collapsed',
        label: 'final audience below the inherited floor',
        color: '#ea580c',
        description:
            'the trajectory finishes well below the starting floor. either the shock was large enough to break the basin, or the floor itself was not sticky to begin with. retention and habit failed to hold the line.',
        tells: [
            'final viewers < 80 percent of initial floor',
            'no sustained recovery after a shock',
            'core audience erodes alongside casual audience',
        ],
        scenario: 'a schedule collapse or unrecovered trust shock in a host without a strong inherited floor.',
        aphorism: 'when habit goes, the floor goes with it.',
    },
    {
        key: 'wandering',
        index: 1,
        title: 'wandering',
        label: 'noisy walk with no clear dwell band',
        color: '#facc15',
        description:
            'no single band catches more than about a quarter of the dwell time. the trajectory looks closer to a random walk on the log-scale than to a basin orbit. either noise dominates the structural terms, or the attractor metaphor is doing little work for this configuration.',
        tells: [
            'dominant dwell share below 30 percent',
            'log-range across the run is wide',
            'drift curve has no clean negative-slope crossing',
        ],
        scenario: 'a small creator early in their run, before habit and a band have formed.',
        aphorism: 'falsification flavour: a trajectory without a basin is just noise with a story.',
    },
    {
        key: 'stable',
        index: 2,
        title: 'stable basin',
        label: 'most of the dwell time concentrated in one band',
        color: '#84cc16',
        description:
            'the dominant dwell band captures a large share of the trajectory and the final point sits within it. shocks displace the system temporarily, but the drift returns it. this is the attractor-confirming case the metaphor was named for.',
        tells: [
            'dominant dwell share above 45 percent',
            'log-range across the run is narrow',
            'final point inside the dominant band',
        ],
        scenario: 'a mid-tier streamer or talk-radio host running on routine, habit, and parasocial attachment.',
        aphorism: 'the basin is the band the system keeps returning to.',
    },
    {
        key: 'transitioned',
        index: 3,
        title: 'transitioned',
        label: 'final audience in a different band from the initial floor',
        color: '#a3e635',
        description:
            'the system has moved between basins. a breakout campaign or a format pivot has lifted the trajectory into a higher band, and the floor is now where the ceiling used to be. or, more rarely, a sustained negative drift has settled the system into a lower basin without collapsing it outright.',
        tells: [
            'final viewers more than 50 percent above or below the initial floor',
            'dominant dwell band differs from the initial floor band',
            'the post-event tail of the trajectory hugs a new level',
        ],
        scenario: 'a creator after a successful collaboration window or format reset.',
        aphorism: 'a transition is when the next basin keeps the system instead of the old one.',
    },
];

export const REGIME_BY_KEY: Record<RegimeKey, RegimeDef> = REGIMES.reduce(
    (acc, r) => {
        acc[r.key] = r;
        return acc;
    },
    {} as Record<RegimeKey, RegimeDef>,
);

export function statusOf(metrics: { regimeIndex: number }): RegimeDef {
    const i = Math.max(0, Math.min(REGIMES.length - 1, metrics.regimeIndex));
    return REGIMES[i];
}

function classifyRegime(
    initialFloor: number,
    finalViewers: number,
    dominantMidpoint: number,
    dwellShare: number,
): number {
    if (finalViewers < initialFloor * 0.8) return 0; // collapsed
    if (dwellShare < 0.3) return 1; // wandering
    // distinguish stable vs transitioned by whether final is in the same band as the inherited floor.
    const floorBandLog = Math.round(Math.log10(initialFloor + 1) * 4) / 4;
    const finalBandLog = Math.round(Math.log10(finalViewers + 1) * 4) / 4;
    if (Math.abs(floorBandLog - finalBandLog) > 0.4 && Math.abs(finalViewers - initialFloor) > initialFloor * 0.5) {
        return 3; // transitioned
    }
    return 2; // stable basin
}

export interface SimulationOutput {
    rows: SimRow[];
    events: SimEvent[];
    bands: DetectedBand[];
}

export function runSimulation(p: Params): SimulationOutput {
    const { rows, events } = simulate(p, p.case);
    const bands = detectBands(rows);
    return { rows, events, bands };
}

export function scoreModel(p: Params): Metrics {
    const { rows, bands } = runSimulation(p);
    const final = rows[rows.length - 1];
    const finalViewers = final ? final.viewers : 0;
    const peakViewers = rows.reduce((acc, r) => Math.max(acc, r.viewers), 0);
    const troughViewers = rows.length > 0
        ? rows.reduce((acc, r) => Math.min(acc, r.viewers), rows[0].viewers)
        : 0;
    const dominant = bands[0];
    const dwellShare = dominant ? dominant.share : 0;
    const coreShare = final && (final.core + final.casual) > 0
        ? final.core / (final.core + final.casual)
        : 0;
    const logRange = Math.log10(peakViewers + 1) - Math.log10(troughViewers + 1);
    const regimeIndex = classifyRegime(
        p.initialFloor,
        finalViewers,
        dominant ? dominant.midpoint : finalViewers,
        dwellShare,
    );

    return {
        finalViewers,
        peakViewers,
        troughViewers,
        dwellShare,
        coreShare,
        logRange,
        dominantMidpoint: dominant ? dominant.midpoint : finalViewers,
        regimeIndex,
    };
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

export function extractFields(p: Params): Record<FieldKey, number> {
    return FIELD_KEYS.reduce((acc, k) => {
        acc[k] = p[k];
        return acc;
    }, {} as Record<FieldKey, number>);
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

export { bandLabel, HORIZON };
