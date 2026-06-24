import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    type Params,
    type AuraVector,
    presetParams,
    computeMetrics,
} from './logic';


/**
 * Calibration for the aura model.
 *
 * The aura model is humanities-flavoured: its thirteen inputs and eight output
 * fibers are stipulated weights, not measured quantities, so there is no
 * external empirical dataset to fit against. What IS verifiable is internal
 * consistency: the deterministic core of computeMetrics must reproduce the
 * closed-form identities the model documents in its own comments.
 *
 * Every case below recomputes one quantity from its raw formula here in the
 * calibration module (the `expected` value), independently of logic/index.ts,
 * then compares it against what computeMetrics actually returns (`predicted`).
 * A nonzero error would mean the implementation has drifted from the model it
 * claims to implement. No value is hardcoded: both sides are computed.
 */

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

// Independent reimplementation of the additive Benjamin "distance" term.
function benjaminDistanceRaw(s: Params): number {
    return clamp(
        0.38 * s.ritualDistance +
        0.26 * s.historicalDepth +
        0.20 * s.scarcity +
        0.16 * s.institutionalAuthority -
        0.32 * s.reproductionSaturation,
    );
}

// Independent reimplementation of the aura-intensity sigmoid.
function auraIntensityRaw(s: Params): number {
    const novelty = clamp(0.55 * s.formalDensity + 0.45 * (1 - s.reproductionSaturation));
    const authenticity = clamp(
        0.42 * s.objectSingularity +
        0.31 * s.embodiedTrace +
        0.27 * s.historicalDepth -
        0.35 * s.reproductionSaturation,
    );
    const socialGravity = clamp(
        0.45 * s.institutionalAuthority +
        0.30 * s.marketPressure +
        0.25 * s.observerDesire,
    );
    const benjaminDistance = benjaminDistanceRaw(s);
    return clamp(
        sigmoid(
            2.7 * authenticity +
            2.1 * benjaminDistance +
            1.2 * novelty +
            1.5 * socialGravity +
            1.1 * s.traumaIndex -
            3.05,
        ),
    );
}

// Independent reimplementation of the optimal-transport RMS distance to the
// fixed "relic" attractor in aura-vector space.
const RELIC_TARGET: AuraVector = {
    sacred: 0.9, prestige: 0.55, distance: 0.86, historical: 0.92,
    embodied: 0.82, meme: 0.18, market: 0.3, uncanny: 0.22,
};
const DIM_KEYS: (keyof AuraVector)[] = [
    'sacred', 'prestige', 'distance', 'historical', 'embodied', 'meme', 'market', 'uncanny',
];

function rmsToRelicRaw(av: AuraVector): number {
    const sumSq = DIM_KEYS.reduce((acc, k) => {
        const diff = av[k] - RELIC_TARGET[k];
        return acc + diff * diff;
    }, 0);
    return clamp(Math.sqrt(sumSq / DIM_KEYS.length));
}

// A flat object: every input zero. The model should collapse to its floor.
const FLAT_OBJECT: Params = {
    objectSingularity: 0, formalDensity: 0, embodiedTrace: 0, reproductionSaturation: 0,
    ritualDistance: 0, institutionalAuthority: 0, scarcity: 0, marketPressure: 0,
    observerTraining: 0, observerDesire: 0, observerAlienation: 0,
    historicalDepth: 0, traumaIndex: 0, preset: 'ai-image-feed',
};


export function buildCalibration(): CalibrationResult[] {
    const museum = presetParams('museum-masterpiece');
    const mMuseum = computeMetrics(museum);

    const memeRelic = presetParams('meme-relic');
    const mMeme = computeMetrics(memeRelic);
    const memeBasin = mMeme.basins.find((b) => b.name === 'meme aura');

    const war = presetParams('war-archive');
    const mWar = computeMetrics(war);
    const relicTransport = mWar.transportCosts.find((t) => t.key === 'relic');

    const mFlat = computeMetrics(FLAT_OBJECT);

    return [
        {
            name: 'distance fiber identity (museum)',
            description:
                'The "distance" aura fiber is defined to equal the additive Benjamin distance term. Recomputed independently, it should match the fiber the model returns.',
            predicted: Number((mMuseum.auraVector.distance * 100).toFixed(2)),
            expected: Number((benjaminDistanceRaw(museum) * 100).toFixed(2)),
            source: 'internal identity: auraVector.distance = benjaminDistance (Benjamin 1936, ritual distance term)',
        },
        {
            name: 'aura intensity sigmoid (museum)',
            description:
                'Aura intensity is a clamped sigmoid of weighted authenticity, distance, novelty, social gravity, and trauma. Recomputed from the raw formula, it should reproduce the model output.',
            predicted: Number((mMuseum.auraIntensity * 100).toFixed(2)),
            expected: Number((auraIntensityRaw(museum) * 100).toFixed(2)),
            source: 'internal identity: aura intensity sigmoid; high-aura cohering case',
        },
        {
            name: 'meme basin equals meme fiber',
            description:
                'The "meme aura" attractor basin is defined as exactly the meme fiber value. The basin reported for the meme-relic preset should equal that fiber.',
            predicted: Number(((memeBasin?.value ?? 0) * 100).toFixed(2)),
            expected: Number((mMeme.auraVector.meme * 100).toFixed(2)),
            source: 'internal identity: basin "meme aura" value = auraVector.meme',
        },
        {
            name: 'transport cost to relic (war archive)',
            description:
                'Optimal-transport cost is the root-mean-square distance between the aura vector and the fixed relic attractor. Recomputed by hand, it should match the model cost.',
            predicted: Number((relicTransport?.cost ?? 0).toFixed(4)),
            expected: Number(rmsToRelicRaw(mWar.auraVector).toFixed(4)),
            source: 'internal identity: RMS distance in 8-dimensional aura space to relic target',
        },
        {
            name: 'flat field collapse (null object)',
            description:
                'With every input at zero, aura intensity collapses to a fixed floor set only by the residual novelty term. Recomputed from the formula, it should match the model.',
            predicted: Number((mFlat.auraIntensity * 100).toFixed(2)),
            expected: Number((auraIntensityRaw(FLAT_OBJECT) * 100).toFixed(2)),
            source: 'internal identity: degenerate all-zero input; pure mechanical-reproduction limit',
        },
    ];
}
