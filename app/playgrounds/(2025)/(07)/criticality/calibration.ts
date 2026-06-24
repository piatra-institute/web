import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    getRegime,
    branchingRatio,
    expectedAvalancheSize,
    extinctionCertain,
    exactPowerLaw,
    slopeEstimate,
    CRITICAL_EXPONENT,
} from './logic';


/**
 * Calibration verifies the deterministic, closed-form core of the branching
 * process, not the Monte-Carlo simulation (which is stochastic and so cannot
 * be reproduced to a fixed target). Every `predicted` value below is COMPUTED
 * by calling the logic functions the playground actually ships.
 *
 * The analytic facts checked here:
 *   - the branching ratio of the model is exactly sigma (criticality at 1);
 *   - the expected total avalanche size of a subcritical process is 1/(1-sigma);
 *   - the regime classifier labels sub-, super-, and critical regimes correctly;
 *   - a critical Galton-Watson process has avalanche-size exponent -3/2, and
 *     the log-log slope estimator recovers that slope from an exact power law.
 */
export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Branching ratio is exactly sigma; at the critical point it equals 1.
    results.push({
        name: 'critical branching ratio',
        description:
            'mean multiplicative growth per step at sigma = 1. A branching process is critical exactly when its branching ratio is 1.',
        predicted: Number(branchingRatio(1.0).toFixed(4)),
        expected: 1,
        source: 'Harris, The Theory of Branching Processes (1963): criticality at mean offspring number 1.',
    });

    // 2. Expected total avalanche size for a subcritical process, sigma = 0.8.
    //    Closed form E[S] = 1/(1 - sigma) = 1/0.2 = 5.
    results.push({
        name: 'mean avalanche size · sigma = 0.8',
        description:
            'expected total number of activations in a subcritical avalanche, E[S] = 1/(1 - sigma).',
        predicted: Number(expectedAvalancheSize(0.8).toFixed(4)),
        expected: 5,
        source: 'Galton-Watson total-progeny mean, E[S] = 1/(1 - m) for mean offspring m < 1.',
    });

    // 3. Expected total avalanche size for a weakly subcritical process, sigma = 0.5.
    //    E[S] = 1/(1 - 0.5) = 2.
    results.push({
        name: 'mean avalanche size · sigma = 0.5',
        description:
            'a deeply subcritical process: most avalanches are tiny, with mean size 2.',
        predicted: Number(expectedAvalancheSize(0.5).toFixed(4)),
        expected: 2,
        source: 'same closed form, 1/(1 - 0.5) = 2.',
    });

    // 4. Regime classifier: subcritical, critical, supercritical, plus extinction
    //    certainty. Boolean checks, expected 1.
    const regimesCorrect =
        getRegime(0.7) === 'Sub-critical' &&
        getRegime(1.0) === 'Critical' &&
        getRegime(1.3) === 'Super-critical' &&
        extinctionCertain(0.9) === true &&
        extinctionCertain(1.2) === false;
    results.push({
        name: 'regime classification',
        description:
            'sigma = 0.7 sub-critical, 1.0 critical, 1.3 super-critical; extinction certain only for sigma <= 1.',
        predicted: regimesCorrect ? 1 : 0,
        expected: 1,
        source: 'sign of (sigma - 1) sets the regime; extinction is almost sure at and below criticality.',
    });

    // 5. Power-law exponent at criticality: slopeEstimate on an exact s^(-3/2)
    //    distribution must recover -3/2.
    const law = exactPowerLaw(CRITICAL_EXPONENT, 200);
    const recovered = slopeEstimate(law);
    results.push({
        name: 'critical avalanche exponent',
        description:
            'log-log slope of an exact s^(-3/2) avalanche distribution; the critical Galton-Watson size exponent.',
        predicted: Number((recovered ?? 0).toFixed(4)),
        expected: -1.5,
        source: 'mean-field branching / directed-percolation size exponent tau = 3/2 (Zapperi, Lauritsen, Stanley 1995).',
    });

    return results;
}
