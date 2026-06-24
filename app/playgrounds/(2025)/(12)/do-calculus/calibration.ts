import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    BackdoorModel,
    pYdoX,
    averageCausalEffect,
    naiveAssociation,
    observationalMass,
} from './logic';


/**
 * Calibration for the closed-form backdoor model.
 *
 * Every `predicted` below is computed by the same pure functions the playground
 * uses (no Monte-Carlo, no hardcoding), and every `expected` is a value worked
 * out by hand from the conditional probability tables. The stochastic spiking
 * simulation is intentionally NOT calibrated here, because its outputs are
 * sampled and would not reproduce exactly; only the deterministic
 * adjustment-formula arithmetic is checkable against a known answer.
 *
 * Graph for all models:  U -> X,  U -> Y,  X -> Y.
 */

// Model A: a strong confounder U drives both X and Y, but X has NO real effect
// on Y (the Y table ignores x). Truth: P(Y|do(X=1)) = P(Y|do(X=0)), ACE = 0.
const PURE_CONFOUND: BackdoorModel = {
    pU: 0.5,
    pX: [0.2, 0.8],
    pY: [
        [0.2, 0.8],
        [0.2, 0.8],
    ],
};

// Model B: same confounder, plus a genuine positive X -> Y effect.
const CONFOUND_PLUS_EFFECT: BackdoorModel = {
    pU: 0.5,
    pX: [0.2, 0.8],
    pY: [
        [0.2, 0.5],
        [0.5, 0.8],
    ],
};

// Model C: U does not affect X (P(X=1|U) is the same for both u), so the
// backdoor path is closed and the naive association equals the true effect.
const NO_CONFOUND: BackdoorModel = {
    pU: 0.5,
    pX: [0.5, 0.5],
    pY: [
        [0.1, 0.3],
        [0.6, 0.8],
    ],
};

// Model D: an asymmetric prior on U, used only for the normalization check.
const ASYMMETRIC: BackdoorModel = {
    pU: 0.4,
    pX: [0.3, 0.7],
    pY: [
        [0.1, 0.4],
        [0.5, 0.9],
    ],
};


export function buildCalibration(): CalibrationResult[] {
    const round = (x: number) => Number(x.toFixed(6));

    return [
        {
            name: 'pure confounder · P(Y | do(X=1))',
            description:
                'X has no real effect; backdoor adjustment over U gives 0.2(0.5)+0.8(0.5).',
            predicted: round(pYdoX(PURE_CONFOUND, 1)),
            expected: 0.5,
            source: 'hand computation from the CPT; Pearl backdoor adjustment formula',
        },
        {
            name: 'pure confounder · true ACE',
            description:
                'do(X=1) and do(X=0) coincide, so the average causal effect is exactly zero.',
            predicted: round(averageCausalEffect(PURE_CONFOUND)),
            expected: 0,
            source: 'hand computation; X is not a cause of Y in this model',
        },
        {
            name: 'pure confounder · naive association',
            description:
                'P(Y|X=1)-P(Y|X=0) over the X-conditioned posterior on U; spurious 0.36 despite zero true effect.',
            predicted: round(naiveAssociation(PURE_CONFOUND)),
            expected: 0.36,
            source: 'hand computation; deterministic confounding bias',
        },
        {
            name: 'confounder + effect · true ACE',
            description:
                'genuine X->Y effect: 0.65 under do(X=1) minus 0.35 under do(X=0).',
            predicted: round(averageCausalEffect(CONFOUND_PLUS_EFFECT)),
            expected: 0.3,
            source: 'hand computation from the CPT',
        },
        {
            name: 'no confounder · naive equals ACE',
            description:
                'with U not affecting X, observation and intervention agree; naive minus ACE is 0.',
            predicted: round(naiveAssociation(NO_CONFOUND) - averageCausalEffect(NO_CONFOUND)),
            expected: 0,
            source: 'hand computation; closed backdoor path => no confounding bias',
        },
        {
            name: 'normalization · observational mass',
            description:
                'the four (X,Y) observational cells of the asymmetric model sum to one.',
            predicted: round(observationalMass(ASYMMETRIC)),
            expected: 1,
            source: 'probability axiom; sum over a complete event space',
        },
    ];
}
