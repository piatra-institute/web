import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    SimulationParams,
    DEFAULT_PARAMS,
    priorWeight,
    analgesiaAt,
    noceboAt,
    netEffectAt,
} from './logic';


/**
 * Calibration anchors for the deterministic core of the model. Each `predicted`
 * value is computed by the same logic functions the Viewer uses, never hardcoded.
 * The `expected` targets are hand-derived from the closed-form definitions, so a
 * passing row certifies that the implemented formulas reproduce their own algebra.
 *
 * Derivations (all using saturate(x) = x / (1 + |x|)):
 *
 *  1. prior weight, balanced precision: Pi_p = Pi_y = 2, attention 0
 *       w = 2 / (2 + 2) = 0.5
 *
 *  2. prior weight, attention erases the prior advantage: Pi_p = 2, Pi_y_base = 1,
 *     attention = 1 so Pi_y = 1 * (1 + 1) = 2
 *       w = 2 / (2 + 2) = 0.5
 *
 *  3. zero-expectation neutral cue gives zero placebo: at s = 0 both s_+ and s_-
 *     are 0, so analgesia = nocebo = net = 0 regardless of pathway strengths.
 *
 *  4. saturating analgesia at a known drive: w = 0.5, analgesic gain set to 4 via
 *     r_mu = 4 (CB1 off), s = +1. raw = 0.5 * 1 * 4 = 2, saturate(2) = 2/3 ~ 0.6667
 *
 *  5. net effect = analgesia - nocebo at a known input: w = 0.5, s = +1,
 *     analgesic gain 2 -> raw 1 -> analgesia 0.5; at s = +1 nocebo s_- = 0 so the
 *     net equals the analgesia, 0.5. (the subtraction is exercised structurally;
 *     the signed landscape never mixes both branches at one s.)
 */

interface CalCase {
    name: string;
    description: string;
    params: SimulationParams;
    s: number;
    metric: 'priorWeight' | 'analgesia' | 'nocebo' | 'net';
    expected: number;
    source: string;
}

const CASES: CalCase[] = [
    {
        name: 'prior weight · balanced precision',
        description: 'equal prior and sensory precision splits control evenly, w = Pi_p / (Pi_p + Pi_y).',
        params: { ...DEFAULT_PARAMS, priorPrecision: 2, sensoryPrecision: 2, attention: 0 },
        s: 0,
        metric: 'priorWeight',
        expected: 0.5,
        source: 'Bayesian precision weighting; w = 2 / (2 + 2) = 0.5',
    },
    {
        name: 'prior weight · attention cancels prior',
        description: 'attention doubles sensory precision (Pi_y = 1 x (1 + 1) = 2), pulling w back to 0.5.',
        params: { ...DEFAULT_PARAMS, priorPrecision: 2, sensoryPrecision: 1, attention: 1 },
        s: 0,
        metric: 'priorWeight',
        expected: 0.5,
        source: 'attentional gain on sensory precision; w = 2 / (2 + 1 x (1 + 1)) = 0.5',
    },
    {
        name: 'neutral cue · zero placebo',
        description: 'at cue-drug similarity 0 both the positive and negative cue vanish, so net effect is 0.',
        params: { ...DEFAULT_PARAMS },
        s: 0,
        metric: 'net',
        expected: 0,
        source: 'expectation-free baseline; s_+ = s_- = 0 gives analgesia = nocebo = 0',
    },
    {
        name: 'saturating analgesia · strong drive',
        description: 'w = 0.5, analgesic gain 4 (mu-opioid only), drug-like cue: raw 2, saturate(2) = 2/3.',
        params: {
            ...DEFAULT_PARAMS,
            priorPrecision: 1, sensoryPrecision: 1, attention: 0,
            rOpioid: 4, rCB1: 0, conditioning: 0,
        },
        s: 1,
        metric: 'analgesia',
        expected: 2 / 3,
        source: 'signed saturation; saturate(0.5 x 1 x 4) = saturate(2) = 2/(1+2) = 0.6667',
    },
    {
        name: 'net effect · analgesia minus nocebo',
        description: 'w = 0.5, analgesic gain 2, drug-like cue: net equals the saturated analgesia, 0.5.',
        params: {
            ...DEFAULT_PARAMS,
            priorPrecision: 1, sensoryPrecision: 1, attention: 0,
            rOpioid: 2, rCB1: 0, conditioning: 0,
        },
        s: 1,
        metric: 'net',
        expected: 0.5,
        source: 'net = analgesia - nocebo; saturate(0.5 x 1 x 2) - 0 = saturate(1) = 0.5',
    },
];


function evaluate(c: CalCase): number {
    switch (c.metric) {
        case 'priorWeight':
            return priorWeight(c.params);
        case 'analgesia':
            return analgesiaAt(c.params, c.s);
        case 'nocebo':
            return noceboAt(c.params, c.s);
        case 'net':
            return netEffectAt(c.params, c.s);
    }
}


export function buildCalibration(): CalibrationResult[] {
    return CASES.map((c) => ({
        name: c.name,
        description: c.description,
        predicted: Number(evaluate(c).toFixed(4)),
        expected: Number(c.expected.toFixed(4)),
        source: c.source,
    }));
}
