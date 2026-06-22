import type { CalibrationResult } from '@/components/CalibrationPanel';

import { ANIMALS, KLEIBER_COEFFICIENT, KLEIBER_EXPONENT, metabolicRate } from './logic';


/**
 * Each case takes a real animal's body mass, predicts its basal metabolic rate
 * from Kleiber's three-quarter-power law, and compares it to the measured
 * literature value. The predicted number is computed here by metabolicRate, not
 * stored, so the honesty gate can confirm it is genuinely reproduced. A good
 * 3/4-law fit lands most animals within roughly fifteen to thirty-five percent.
 */
const CASES = ['mouse', 'human', 'cow', 'elephant'];


export function buildCalibration(): CalibrationResult[] {
    return CASES.map((name) => {
        const a = ANIMALS.find((x) => x.name === name);
        if (!a) {
            return {
                name,
                description: 'missing animal',
                predicted: 0,
                expected: 0,
                source: 'n/a',
            };
        }
        const predicted = metabolicRate(a.mass, KLEIBER_COEFFICIENT, KLEIBER_EXPONENT);
        return {
            name: `${a.name} (${a.mass} kg)`,
            description: `Kleiber three-quarter prediction vs measured basal metabolic rate for the ${a.name}.`,
            predicted: Number(predicted.toFixed(2)),
            expected: a.bmr,
            source: 'Kleiber (1932); representative BMR from standard physiology tables',
        };
    });
}
