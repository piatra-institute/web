import type { CalibrationResult } from '@/components/CalibrationPanel';

import { computeFinalGrade } from './logic';


/**
 * Each case runs the estigrade formula (the predicted value is computed here, not
 * stored) for an input whose final grade is known by hand. The rule is
 * deterministic, so these are exact reproductions of the calculator's output.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'perfect estimate',
            description: 'estimate equals the exam score: full reward, no penalty.',
            predicted: computeFinalGrade({ examGrade: 80, estimatedGrade: 80, reward: 0.1, penalty: 0.2 }),
            expected: 90,
            source: 'final = exam + reward*100 when the difference is zero',
        },
        {
            name: 'maximal miss',
            description: 'estimating 0 when the exam is 80: large penalty, small reward.',
            predicted: computeFinalGrade({ examGrade: 80, estimatedGrade: 0, reward: 0.1, penalty: 0.2 }),
            expected: 66,
            source: '80 + 0.1*(100-80) - 0.2*80',
        },
        {
            name: 'no adjustment',
            description: 'with reward and penalty both zero the final grade is just the exam score.',
            predicted: computeFinalGrade({ examGrade: 75, estimatedGrade: 50, reward: 0, penalty: 0 }),
            expected: 75,
            source: 'final = exam when reward = penalty = 0',
        },
        {
            name: 'small miss',
            description: 'estimating 90 when the exam is 80.',
            predicted: computeFinalGrade({ examGrade: 80, estimatedGrade: 90, reward: 0.1, penalty: 0.2 }),
            expected: 87,
            source: '80 + 0.1*(100-10) - 0.2*10',
        },
    ];
}
