import type { CalibrationResult } from '@/components/CalibrationPanel';

import { feedingEfficiency, resourceDistribution } from './logic/birdsym';


/**
 * The simulation has small random initial positions, so trajectories are only
 * near-reproducible. These cases instead check the deterministic Gaussian kernels
 * the model is built on (resource availability and feeding efficiency): their
 * peak height, their symmetry, and their one-standard-deviation falloff. The
 * predicted values are computed here by those functions, not stored.
 */
export function buildCalibration(): CalibrationResult[] {
    return [
        {
            name: 'feeding peak at matched trait (var 0.01)',
            description: 'feeding efficiency peaks when the bird trait matches the seed, at 1/sqrt(2 pi sigma^2).',
            predicted: Number(feedingEfficiency(0.5, 0.5, 0.01).toFixed(4)),
            expected: 3.9894,
            source: '1/sqrt(2*pi*0.01)',
        },
        {
            name: 'resource peak (var 0.5)',
            description: 'the resource Gaussian peaks at its mean with height 1/sqrt(2 pi sigma^2).',
            predicted: Number(resourceDistribution(0, 0, 0.5).toFixed(4)),
            expected: 0.5642,
            source: '1/sqrt(2*pi*0.5)',
        },
        {
            name: 'resource symmetry about the mean',
            description: 'the resource distribution is symmetric: equal distances either side of the mean give equal values.',
            predicted: Number((resourceDistribution(0.3, 0.5, 0.1) - resourceDistribution(0.7, 0.5, 0.1)).toFixed(4)),
            expected: 0,
            source: 'R(mean - d) = R(mean + d)',
        },
        {
            name: 'feeding falloff at one sigma',
            description: 'one standard deviation from the matched trait, feeding efficiency drops by a factor e^(-1/2).',
            predicted: Number(feedingEfficiency(0.5, 0.6, 0.01).toFixed(4)),
            expected: 2.4197,
            source: 'peak * exp(-0.5) = 3.9894 * 0.60653',
        },
    ];
}
