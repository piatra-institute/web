import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    entropy,
    klDivergence,
    totalVariationDistance,
    demographicParity,
    institutionalEfficiency,
} from './logic';


/**
 * The live playground draws an outcome distribution that, for the VARIANCE
 * corruption type, is stochastic. Stochastic outputs cannot be calibrated
 * against a fixed expected value, so this panel deliberately calibrates only
 * the deterministic core: the information-theoretic functions and the
 * institutional-efficiency closed form.
 *
 * Every `predicted` below is COMPUTED by calling the model's own functions on a
 * known input, then compared against the textbook value that information theory
 * fixes for that input. These are identities, not fitted curves: a fair coin
 * has exactly one bit of entropy, identical distributions have zero relative
 * entropy, and a distance metric between two known vectors has one exact value.
 * If a refactor breaks one of these, the panel turns it red.
 */
export function buildCalibration(): CalibrationResult[] {
    const fair = [0.5, 0.5];
    const skewed = [0.75, 0.25];

    return [
        {
            name: 'fair coin entropy',
            description:
                'Shannon entropy of a perfectly fair two-outcome distribution. A maximally uncertain binary choice carries exactly one bit.',
            predicted: Number(entropy(fair).toFixed(4)),
            expected: 1,
            source: 'Shannon 1948: H(1/2, 1/2) = 1 bit, the entropy maximum for a binary alphabet.',
        },
        {
            name: 'zero divergence at fairness',
            description:
                'KL divergence of the fair distribution from the fair ideal. A distribution measured against itself diverges by nothing.',
            predicted: Number(klDivergence(fair, fair).toFixed(4)),
            expected: 0,
            source: 'Kullback and Leibler 1951: D(P || P) = 0, with equality iff the distributions coincide.',
        },
        {
            name: 'total variation of a 3:1 skew',
            description:
                'Total variation distance between a 75/25 outcome split and the uniform ideal. For two binary distributions this equals the gap in either coordinate.',
            predicted: Number(totalVariationDistance(skewed, fair).toFixed(4)),
            expected: 0.25,
            source: 'TVD(P, Q) = (1/2) sum |p_i - q_i| = |0.75 - 0.5| = 0.25 for a binary skew.',
        },
        {
            name: 'demographic parity of a 3:1 skew',
            description:
                'Demographic parity score for the same 75/25 split, defined as one minus the total variation from uniform.',
            predicted: Number(demographicParity(skewed).toFixed(4)),
            expected: 0.75,
            source: 'parity = 1 - TVD(P, uniform) = 1 - 0.25 = 0.75; perfect parity is 1.',
        },
        {
            name: 'efficiency collapse under full corruption',
            description:
                'Institutional efficiency at maximum corruption (C = 1) with deterministic process (R = 0). Total corruption leaves no usable efficiency.',
            predicted: Number(institutionalEfficiency(1, 0).toFixed(4)),
            expected: 0,
            source: 'closed form 1 - C - max(0, (R - 0.5) / 2) = 1 - 1 - 0 = 0 at C = 1, R = 0.',
        },
        {
            name: 'efficiency intact at zero corruption',
            description:
                'Institutional efficiency with no corruption and moderate randomness (C = 0, R = 0.5). No corruption and no excess randomness means no efficiency loss.',
            predicted: Number(institutionalEfficiency(0, 0.5).toFixed(4)),
            expected: 1,
            source: 'closed form 1 - 0 - max(0, (0.5 - 0.5) / 2) = 1; the randomness penalty only bites above R = 0.5.',
        },
    ];
}
