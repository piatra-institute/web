import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    calculateDelta,
    trajectoryBandwidth,
    defaultMechanisms,
    type MechanismData,
    type Trajectory,
} from './logic';


/**
 * The model is fully deterministic: each trajectory's vertical position is a
 * weighted sum of four mechanism coefficients plus a baseline offset set by the
 * constriction value. There is no stochasticity (the "play" control just sweeps
 * the constriction slider), so every output can be derived by hand and checked
 * exactly.
 *
 * Each case below computes `predicted` from the model and compares it to an
 * `expected` value derived independently from the published beta-coefficients
 * and the documented baseline-offset rules. The aim is reproduction, not a fit
 * to clinical data: these are structural identities the model must satisfy, so
 * a healthy implementation should land at error 0 (modulo float rounding).
 */

const M: MechanismData[] = defaultMechanisms;

// All mechanisms at unit weight: sum of the four influence coefficients per
// trajectory. Hand-derived from the published betas.
//   res     = -0.10 + 0    + -0.13 + 0     = -0.23
//   rec     =  0    + 0.08 + -0.08 + 0     =  0.00
//   chronic =  0.15 + 0.20 + 0     + 0     =  0.35
//   growth  = -0.10 + 0    + 0     + -0.18 = -0.28
const EXPECTED_DELTA: Record<Trajectory, number> = {
    res: -0.23,
    rec: 0.0,
    chronic: 0.35,
    growth: -0.28,
};


function round(x: number): number {
    return Number(x.toFixed(4));
}


export function buildCalibration(): CalibrationResult[] {
    const results: CalibrationResult[] = [];

    // 1. Resilience mechanism delta: appraisal and social support net to a mild
    //    downward (anti-narrowing) pull. Verifies the weighted-sum core.
    results.push({
        name: 'resilience · mechanism delta',
        description:
            'sum of mechanism influences on the resilience path at unit weight; negative means a slight pull away from narrowing.',
        predicted: round(calculateDelta('res', M)),
        expected: round(EXPECTED_DELTA.res),
        source: 'beta-weights, Bonanno 2007 (resilience as the modal outcome); appraisal and social support coefficients',
    });

    // 2. Chronic narrowing is the most strongly positive delta: threat appraisal
    //    plus rumination drive sustained constriction.
    results.push({
        name: 'chronic · mechanism delta',
        description:
            'appraisal (+0.15) plus rumination (+0.20) make chronic narrowing the most upward trajectory; social and neuro-flex contribute zero.',
        predicted: round(calculateDelta('chronic', M)),
        expected: round(EXPECTED_DELTA.chronic),
        source: 'beta-weights, Ehlers and Clark 2000 (appraisal); Nolen-Hoeksema 2008 (rumination)',
    });

    // 3. Growth is driven almost entirely by neuro-flexibility; its delta is the
    //    most negative (largest expansion) among the four.
    results.push({
        name: 'growth · mechanism delta',
        description:
            'neuro-flexibility (-0.18) plus appraisal (-0.10) give post-traumatic growth the strongest expansion pull.',
        predicted: round(calculateDelta('growth', M)),
        expected: round(EXPECTED_DELTA.growth),
        source: 'beta-weights, Tedeschi and Calhoun 1996 (growth); Kalisch 2015 (neuro-flexibility)',
    });

    // 4. Eustress threshold: at constriction = 0 the event node sits exactly on
    //    the baseline, so the chronic path equals its pure mechanism delta with
    //    no narrowing offset. This is the boundary separating distress from
    //    eustress.
    results.push({
        name: 'eustress threshold · chronic at delta=0',
        description:
            'at the neutral threshold (constriction 0) the chronic path has no narrowing offset, so it equals its mechanism delta exactly.',
        predicted: round(trajectoryBandwidth('chronic', M, 0)),
        expected: round(EXPECTED_DELTA.chronic),
        source: 'model threshold: constriction 0 separates distress (positive) from eustress (negative)',
    });

    // 5. Recovery rebound below baseline: under full distress (constriction = 1)
    //    the recovery path relaxes by -0.5 (half the narrowing) plus its zero
    //    mechanism delta, landing at -0.5 in bandwidth units. This encodes the
    //    documented delayed dip below baseline before return.
    results.push({
        name: 'recovery · rebound under full distress',
        description:
            'at constriction 1 the recovery path relaxes by -0.5 below baseline (delayed rebound) plus its zero mechanism delta.',
        predicted: round(trajectoryBandwidth('rec', M, 1)),
        expected: round(-0.5 + EXPECTED_DELTA.rec),
        source: 'model rule: recovery offset = -constriction * 0.5; rebound-below-baseline pattern, Bonanno 2004',
    });

    return results;
}
