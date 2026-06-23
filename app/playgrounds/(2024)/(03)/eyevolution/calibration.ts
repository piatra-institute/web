import type { CalibrationResult } from '@/components/CalibrationPanel';

import { EyeType, calculateFitness, determineEyeType, type Environment, type Thresholds } from './logic';


/**
 * Mutation and selection are stochastic, but the fitness function and the
 * eye-type classifier are exact. Each case computes one here (not stored) for
 * inputs whose result is known: the per-type base fitness, an environmental
 * bonus saturating fitness at 1, the metabolic penalty, and the trait-to-eye-type
 * thresholds at the bottom and top of the sequence.
 */
const DEFAULT_THRESHOLDS: Thresholds = {
    eyespot: 0.1, pitEye: 0.3, pinhole: 0.5, lens: 0.7, compound: 0.6,
};
const NO_ENV: Environment = { lightIntensity: 0, environmentComplexity: 0, predatorPresence: 0 };

export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'lens-eye base fitness',
            description: 'with no environmental bonuses or cost, a lens eye sits at its base fitness 0.85.',
            predicted: Number(calculateFitness({ eyeType: EyeType.LensEye, visualAcuity: 0, lightSensitivity: 0, fieldOfView: 0, metabolicCost: 0 }, NO_ENV).toFixed(4)),
            expected: 0.85,
            source: 'base fitness for LensEye',
        },
        {
            name: 'light bonus saturates fitness at 1',
            description: 'a lens eye in bright light with high light sensitivity reaches the fitness cap.',
            predicted: Number(calculateFitness({ eyeType: EyeType.LensEye, visualAcuity: 0, lightSensitivity: 0.5, fieldOfView: 0, metabolicCost: 0 }, { ...NO_ENV, lightIntensity: 1 }).toFixed(4)),
            expected: 1,
            source: '0.85 + 1*(0.5*0.3) = 1.0, clamped',
        },
        {
            name: 'metabolic penalty floors fitness',
            description: 'a costly eyeless organism is penalized to the fitness floor of 0.',
            predicted: Number(calculateFitness({ eyeType: EyeType.None, visualAcuity: 0, lightSensitivity: 0, fieldOfView: 0, metabolicCost: 0.5 }, NO_ENV).toFixed(4)),
            expected: 0,
            source: '0.1 - 0.5*0.2 = 0, clamped',
        },
        {
            name: 'low traits give no eye',
            description: 'a composite trait score below the first threshold classifies as no eye.',
            predicted: determineEyeType(0, 0, 0, DEFAULT_THRESHOLDS) === EyeType.None ? 1 : 0,
            expected: 1,
            source: 'composite 0 < eyespot threshold 0.1',
        },
        {
            name: 'high traits give a compound eye',
            description: 'a high composite trait score reaches the top of the eye-type sequence.',
            predicted: determineEyeType(0.8, 0.8, 0.8, DEFAULT_THRESHOLDS) === EyeType.CompoundEye ? 1 : 0,
            expected: 1,
            source: 'composite 0.8 exceeds all thresholds',
        },
    ];
}
