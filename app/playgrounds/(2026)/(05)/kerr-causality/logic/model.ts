import {
    SCAN_MAX_R,
    SCAN_MIN_R,
    allowedIntervals,
    getRoots,
    horizons,
    isBoundaryUnbounded,
    mainAllowedInterval,
    radialPotential,
    type KerrParams,
} from './kerr';
import { CASES, type CaseKey, type KerrCase } from './cases';


export const FIELD_KEYS = ['a', 'E', 'L', 'Q'] as const;
export type FieldKey = typeof FIELD_KEYS[number];

export const FIELD_LABELS: Record<FieldKey, string> = {
    a: 'spin a',
    E: 'energy E',
    L: 'angular momentum L',
    Q: 'Carter constant Q',
};

export const FIELD_SYMBOLS: Record<FieldKey, string> = {
    a: 'a',
    E: 'E',
    L: 'L',
    Q: 'Q',
};

export const FIELD_HINTS: Record<FieldKey, string> = {
    a: 'black-hole angular momentum per unit mass. keep below 1 for a non-extremal hole.',
    E: 'killing energy measured at infinity. inside the ergoregion E can be zero or negative.',
    L: 'axial angular momentum, signed. negative means counter-rotating relative to the hole.',
    Q: 'Carter constant, controlling motion away from the equatorial plane.',
};

export const FIELD_RANGES: Record<FieldKey, { min: number; max: number; step: number }> = {
    a: { min: 0.05, max: 0.99, step: 0.01 },
    E: { min: -1.0, max: 1.5, step: 0.01 },
    L: { min: -5, max: 5, step: 0.05 },
    Q: { min: 0.01, max: 8, step: 0.01 },
};

export interface Params extends KerrParams {
    case: CaseKey;
}

export const DEFAULT_PARAMS: Params = {
    M: 1,
    ...CASES.ergoregion.profile,
    case: 'ergoregion',
};

export interface Metrics {
    rPlus: number;
    rMinus: number;
    rMin: number;
    rMax: number;
    allowedSpan: number;
    crossings: number;
    regimeIndex: number;
    energyClass: number;
}

export type RegimeKey =
    | 'unbounded'
    | 'capturedOutside'
    | 'trappedAcross'
    | 'trappedInside';

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
        key: 'unbounded',
        index: 0,
        title: 'unbounded escape',
        label: 'the photon reaches infinity',
        color: '#a3e635',
        description:
            'R(r) stays non-negative out to the scan boundary. the allowed corridor has no outer turning point in range, so the orbit either escapes the hole or threads through it and emerges on a far sheet.',
        tells: [
            'no upper root of R(r) in the plot window',
            'a single open allowed band touching r -> infinity',
            'positive killing energy at infinity',
        ],
        scenario: 'an ordinary infalling-or-escaping photon outside the ergoregion.',
        aphorism: 'the simplest causal story: a photon goes where R lets it go.',
    },
    {
        key: 'capturedOutside',
        index: 1,
        title: 'captured outside',
        label: 'bounded in the exterior, never crosses the outer horizon',
        color: '#facc15',
        description:
            'both turning points sit outside r+. the photon shuttles between two radii in the exterior region, like a bound orbit, and never enters the between-horizons sector.',
        tells: [
            'rmin > r+',
            'two roots, both outside the outer horizon',
            'no horizon crossings',
        ],
        scenario: 'a bound or marginally bound photon orbit outside the Kerr black hole.',
        aphorism: 'a closed corridor in the open exterior.',
    },
    {
        key: 'trappedAcross',
        index: 2,
        title: 'trapped across horizons',
        label: 'the photon spans r- and r+ but cannot escape',
        color: '#f59e0b',
        description:
            'the allowed corridor straddles both horizons: rmin < r- < r+ < rmax. the photon crosses the outer horizon inward, threads the between-horizons region, crosses the inner horizon, and emerges into the inner sheet of the maximally extended geometry, then turns back. this is the figure-like case.',
        tells: [
            'rmin < r-',
            'rmax > r+',
            'two horizon crossings per radial bounce',
        ],
        scenario: 'the E = 0 ergoregion photon shown in the original Carter-Penrose figure.',
        aphorism: 'the corridor that walks through every horizon and still does not escape.',
    },
    {
        key: 'trappedInside',
        index: 3,
        title: 'trapped inside r-',
        label: 'the photon lives entirely behind the inner horizon',
        color: '#ea580c',
        description:
            'both turning points sit inside the inner horizon. the photon never reaches the between-horizons region, never reaches the exterior, and oscillates near or across the ring singularity sheet structure.',
        tells: [
            'rmax < r-',
            'two roots, both inside the inner horizon',
            'no contact with the exterior universe',
        ],
        scenario: 'a deep-interior orbit in the maximally extended Kerr geometry.',
        aphorism: 'inside r-, the geometry rewrites what time and direction can mean.',
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
    rMin: number,
    rMax: number,
    unbounded: boolean,
    rMinusH: number,
    rPlusH: number,
): number {
    if (unbounded) return 0;
    if (!Number.isFinite(rMin) || !Number.isFinite(rMax)) return 0;
    if (rMax <= rMinusH) return 3;
    if (rMin >= rPlusH) return 1;
    if (rMin < rMinusH && rMax > rPlusH) return 2;
    // mixed: spans at least one horizon. classify by which horizon the corridor crosses.
    if (rMax > rPlusH) return 2; // touches above r+, partial cross
    if (rMin < rMinusH) return 2; // touches below r-, partial cross
    return 1;
}

export function scoreModel(p: Params): Metrics {
    const { rPlus, rMinus } = horizons(p.M, p.a);
    const fn = (r: number) => radialPotential(r, p);
    const roots = getRoots(fn, SCAN_MIN_R, SCAN_MAX_R);
    const intervals = allowedIntervals(p, roots);
    const main = mainAllowedInterval(intervals);

    let rMin = NaN;
    let rMax = NaN;
    let allowedSpan = 0;
    let unbounded = false;
    if (main) {
        rMin = main.lo;
        rMax = main.hi;
        allowedSpan = main.span;
        unbounded = isBoundaryUnbounded(main);
    }

    let crossings = 0;
    if (Number.isFinite(rMin) && Number.isFinite(rMax)) {
        if (rMinus > rMin && rMinus < rMax) crossings += 1;
        if (rPlus > rMin && rPlus < rMax) crossings += 1;
    }

    const regimeIndex = classifyRegime(rMin, rMax, unbounded, rMinus, rPlus);
    const energyClass = Math.sign(p.E);

    return {
        rPlus,
        rMinus,
        rMin,
        rMax,
        allowedSpan,
        crossings,
        regimeIndex,
        energyClass,
    };
}

export function applyCase(current: Params, key: CaseKey): Params {
    const profile = CASES[key].profile;
    return {
        ...current,
        ...profile,
        case: key,
    };
}

export function extractFields(p: Params): Record<FieldKey, number> {
    return {
        a: p.a,
        E: p.E,
        L: p.L,
        Q: p.Q,
    };
}

export function dominantField(p: Params): FieldKey {
    // for the narrative: which parameter is doing the most work versus its canonical value.
    const canon = CASES[p.case].profile;
    const ranges = FIELD_RANGES;
    const score = (k: FieldKey) => {
        const span = ranges[k].max - ranges[k].min;
        return span === 0 ? 0 : Math.abs(p[k] - canon[k]) / span;
    };
    const sorted = FIELD_KEYS.map((k) => [k, score(k)] as const)
        .sort((x, y) => y[1] - x[1]);
    return sorted[0][0];
}

export function currentCase(p: Params): KerrCase {
    return CASES[p.case];
}
