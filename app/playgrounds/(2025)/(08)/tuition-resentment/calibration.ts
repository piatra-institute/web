import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    expectation,
    observedQuality,
    dissonance,
    lambda,
    gradePenalty,
} from './logic';


/**
 * The model is fully deterministic, so each case below has a closed-form ground
 * truth ("expected") that can be derived by hand from the published coefficients.
 * Every "predicted" value is produced by calling the pure logic functions, never
 * by copying the expected number. The cases probe the four exact sub-formulas the
 * Viewer plots: expectation formation, observed-quality (grade inflation),
 * dissonance non-negativity, and the audit penalty threshold.
 */
export function buildCalibration(): CalibrationResult[] {
    // Case 1 - expectation formation in the unclamped regime.
    // E = b0 + b1*tuition + b2*marketing + b3*prestige + b4*reputation
    //   = 5 + 0.0005*10000 + 0.5*0 + 0.5*0 + 0.6*0 = 5 + 5 = 10.
    const expLow = expectation(10000, 0, 0, 0);

    // Case 2 - observed quality with zero quality investment and zero leniency.
    // Q_obs = clamp(50 + 0.5*qi + gammaG*leniency, 0, 100) = 50 + 0 + 0 = 50.
    const obsFloor = observedQuality(0, 0);

    // Case 3 - grade inflation: qi = 40, leniency = 20.
    // Q_obs = 50 + 0.5*40 + 0.35*20 = 50 + 20 + 7 = 77.
    const obsInflated = observedQuality(40, 20);

    // Case 4 - dissonance is rectified: when observed quality exceeds
    // expectation, D = max(0, E - Q_obs) must be exactly 0.
    const dissFloor = dissonance(30, 50);

    // Case 5 - audit penalty fires only above the leniency threshold of 65.
    // At leniency = 85: penalty = (85 - 65) / 5 = 4. Below threshold it is 0.
    const penaltyActive = gradePenalty(85, true);

    return [
        {
            name: 'expectation formation (low cost)',
            description:
                'tuition 10k, no marketing, prestige, or reputation. expectation is the linear cost-and-signal sum, well below the clamp.',
            predicted: Number(expLow.toFixed(2)),
            expected: 10,
            source: 'closed form E = 5 + 0.0005*10000 = 10',
        },
        {
            name: 'observed-quality floor',
            description:
                'zero quality investment and zero grade leniency. observed quality is the baseline 50, with no genuine or inflated lift.',
            predicted: Number(obsFloor.toFixed(2)),
            expected: 50,
            source: 'closed form 50 + 0.5*0 + 0.35*0 = 50',
        },
        {
            name: 'grade inflation lift',
            description:
                'modest investment plus modest leniency. true quality is 70, grade inflation adds 7, giving observed quality 77.',
            predicted: Number(obsInflated.toFixed(2)),
            expected: 77,
            source: 'closed form 50 + 0.5*40 + 0.35*20 = 77',
        },
        {
            name: 'dissonance rectifier',
            description:
                'when observed quality beats expectation, the model must report no dissonance rather than a negative value.',
            predicted: Number(dissFloor.toFixed(2)),
            expected: 0,
            source: 'closed form max(0, 30 - 50) = 0',
        },
        {
            name: 'audit penalty threshold',
            description:
                'a grade audit at leniency 85, above the 65 threshold, levies a reputation penalty of 4 points.',
            predicted: Number(penaltyActive.toFixed(2)),
            expected: 4,
            source: 'closed form (85 - 65) / 5 = 4',
        },
    ];
}
