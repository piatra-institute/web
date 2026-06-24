import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    Variant,
    Params,
    DEFAULT_PARAMS,
    computeClicheIndex,
    entanglementSurplus,
    fitness,
} from './logic';


/**
 * Calibration of the deterministic core of the atlas.
 *
 * The live population is stochastic (mulberry32 noise, random mutation), so
 * only the noise-free building blocks are verified here. Each predicted value
 * is COMPUTED by calling the exported model functions on a hand-built variant,
 * never hardcoded to match the expected target.
 *
 * The closed-form targets follow directly from the published formulas:
 *   - Cliche index C = sigmoid(alpha ln(f+1) + beta disp - gamma surp
 *       - delta ret + epsilon mut) with alpha=1.1, beta=0.8, gamma=0.55,
 *       delta=1.0, epsilon=0.7. At the all-zero input, every weighted term
 *       vanishes and C = sigmoid(0) = 0.5 exactly.
 *   - Entanglement surplus E = clamp(a_name - a_src, -1, 1), a plain difference
 *       inside the valid range, so E = a_name - a_src for in-range inputs.
 *   - Fitness is monotone in generality and in name-prestige, holding the rest
 *       fixed; the boolean cases assert the sign of those comparisons.
 */

// a neutral variant: every cliche-driving field is zero, so C must equal 0.5.
const NEUTRAL: Variant = {
    id: 'neutral',
    author: 'Anonymous',
    text: '',
    freq: 0,
    specificity: 0.5,
    dispersion: 0,
    surprisal: 0,
    retention: 0,
    mutability: 0,
    a_name: 0.5,
    a_src: 0.5,
    lengthWords: 9,
    drift: 0,
    createdAt: 0,
    generation: 0,
};

// a maximally cliche variant: high frequency, full dispersion and mutability,
// zero surprisal and zero retention. With ln(f+1)=1 the exponent is
// 1.1 + 0.8 + 0.7 = 2.6, so C = sigmoid(2.6).
const CLICHE: Variant = {
    ...NEUTRAL,
    id: 'cliche',
    freq: Math.E - 1,
    dispersion: 1,
    surprisal: 0,
    retention: 0,
    mutability: 1,
};

// an entanglement case: name-brand 0.8, source verifiability 0.3.
const ENTANGLED: Variant = { ...NEUTRAL, id: 'entangled', a_name: 0.8, a_src: 0.3 };

// two variants differing only in specificity (hence generality) for the
// fitness-monotonicity check.
const GENERAL: Variant = { ...NEUTRAL, id: 'general', specificity: 0.2 };
const SPECIFIC: Variant = { ...NEUTRAL, id: 'specific', specificity: 0.9 };

// two variants differing only in name-prestige for the prestige check.
const HIGH_NAME: Variant = { ...NEUTRAL, id: 'high-name', a_name: 0.9 };
const LOW_NAME: Variant = { ...NEUTRAL, id: 'low-name', a_name: 0.3 };

const P: Params = { ...DEFAULT_PARAMS };


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. cliche index of a neutral variant is the logistic midpoint 0.5.
    results.push({
        name: 'cliche · neutral midpoint',
        description:
            'all cliche-driving fields zero, so the logistic argument is zero and the index sits at its 0.5 midpoint.',
        predicted: Number(computeClicheIndex(NEUTRAL).toFixed(4)),
        expected: 0.5,
        source: 'sigmoid(0) = 0.5 (closed form of the cliche index)',
    });

    // 2. cliche index of the saturated variant equals sigmoid(2.6).
    const sigmoid26 = 1 / (1 + Math.exp(-2.6));
    results.push({
        name: 'cliche · saturated slogan',
        description:
            'high circulation, full dispersion and mutability, zero surprisal and retention: a textbook cliche near the logistic ceiling.',
        predicted: Number(computeClicheIndex(CLICHE).toFixed(4)),
        expected: Number(sigmoid26.toFixed(4)),
        source: 'sigmoid(1.1 ln(e) + 0.8 + 0.7) = sigmoid(2.6)',
    });

    // 3. entanglement surplus is the plain name-minus-source gap, in range.
    results.push({
        name: 'entanglement · name minus source',
        description:
            'name-brand attachment 0.8 against source verifiability 0.3 gives a surplus of exactly 0.5.',
        predicted: Number(entanglementSurplus(ENTANGLED).toFixed(4)),
        expected: 0.5,
        source: 'E = clamp(a_name - a_src, -1, 1) = 0.8 - 0.3',
    });

    // 4. fitness rewards generality: the more general variant must be fitter.
    results.push({
        name: 'fitness · generality monotone',
        description:
            'two variants identical except for specificity; the more general one (lower specificity) must score higher.',
        predicted: fitness(GENERAL, P) > fitness(SPECIFIC, P) ? 1 : 0,
        expected: 1,
        source: 'portability and generalityReward both decrease with specificity',
    });

    // 5. fitness rewards name-prestige: higher a_name must be fitter.
    results.push({
        name: 'fitness · prestige monotone',
        description:
            'two variants identical except for name-prestige; the higher-prestige one must score higher.',
        predicted: fitness(HIGH_NAME, P) > fitness(LOW_NAME, P) ? 1 : 0,
        expected: 1,
        source: 'fitness adds prestigeBonus * a_name, monotone increasing in a_name',
    });

    return results;
}
