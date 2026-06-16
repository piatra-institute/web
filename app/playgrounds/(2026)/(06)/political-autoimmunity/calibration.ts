import type { CalibrationResult } from '@/components/CalibrationPanel';

import { SCENARIOS, grossPriorityRisk, populationWeightedGross } from './logic';


/**
 * The model is a transparent scoring engine over synthetic inputs, so
 * calibration verifies that the implementation reproduces the ideation's own
 * worked example (its section P2) rather than empirical data. The "expected"
 * column is the hand-computed value from the source; "predicted" is this
 * engine's output for the same synthetic cells. Agreement means the formula is
 * implemented faithfully, nothing more: these are not predictions about real
 * voters.
 */
export function buildCalibration(): CalibrationResult[] {
    const lgbtq = SCENARIOS.lgbtq;
    const muslim = SCENARIOS.muslim;
    const latino = SCENARIOS.latino;

    return [
        {
            name: 'per-supporter risk · LGBTQ',
            description: 'Σ priorityRisk over the three synthetic LGBTQ domains.',
            predicted: Number(grossPriorityRisk(lgbtq).toFixed(3)),
            expected: 0.505,
            source: 'ideation P2: synthetic per-supporter priority risk',
        },
        {
            name: 'per-supporter risk · Muslim',
            description: 'Σ priorityRisk over the three synthetic Muslim domains.',
            predicted: Number(grossPriorityRisk(muslim).toFixed(3)),
            expected: 0.345,
            source: 'ideation P2: synthetic per-supporter priority risk',
        },
        {
            name: 'per-supporter risk · Latino',
            description: 'Σ priorityRisk over the three synthetic Latino domains.',
            predicted: Number(grossPriorityRisk(latino).toFixed(3)),
            expected: 0.189,
            source: 'ideation P2: synthetic per-supporter priority risk',
        },
        {
            name: 'population-weighted · LGBTQ',
            description: 'per-supporter risk times the 0.12 vote share.',
            predicted: Number(populationWeightedGross(lgbtq).toFixed(3)),
            expected: 0.061,
            source: 'ideation P2: population-weighted score',
        },
        {
            name: 'population-weighted · Muslim',
            description: 'per-supporter risk times the 0.21 vote share.',
            predicted: Number(populationWeightedGross(muslim).toFixed(3)),
            expected: 0.072,
            source: 'ideation P2: population-weighted score',
        },
        {
            name: 'population-weighted · Latino',
            description: 'per-supporter risk times the 0.48 vote share; the small group flips below the large one.',
            predicted: Number(populationWeightedGross(latino).toFixed(3)),
            expected: 0.091,
            source: 'ideation P2: population-weighted score',
        },
    ];
}
