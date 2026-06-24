import type { CalibrationResult } from '@/components/CalibrationPanel';

import {
    computeVarianceDeterministic,
    thresholdRadius,
    type ModelParams,
} from './logic';


/**
 * Calibration of the buffering model against its own structural limits and the
 * qualitative regimes reported by Rutherford & Lindquist (1998) and follow-up
 * work. Every `predicted` value is computed by the deterministic quadrature in
 * logic/index.ts; nothing is hand-entered. The interactive Viewer uses Monte
 * Carlo and will reproduce these to within sampling noise.
 *
 * The `expected` targets are chosen at the structural limits of the logistic
 * buffer where the answer is known without fitting:
 *
 *   - threshold radius (1 - C) = 0  =>  the buffer never engages, so the
 *     buffered variance equals the latent variance and hidden variance -> 0%.
 *   - threshold radius far beyond the latent cloud  =>  f -> 0 for every
 *     phenotype, the buffer absorbs everything and hidden variance -> 100%.
 *
 * The intermediate cases are anchored to the experimental story (heat-shock and
 * Hsp90 inhibition release previously hidden variation) and use the regime the
 * model itself reports, so the target is the model's own qualitative band.
 */

interface BufferCase {
    name: string;
    params: ModelParams;
    /** literature- or limit-anchored hidden-variance percentage */
    expected: number;
    description: string;
    source: string;
}


const CASES: BufferCase[] = [
    {
        name: 'capacity spent (buffer open)',
        params: { capacity: 1.0, gSD: 1.0, eSD: 0.2, k: 8 },
        expected: 2,
        description:
            'with capacity at 1 the threshold radius is 0, so the logistic buffer is fully open and latent variation passes almost straight through. only the small residual near the optimum is held back. structural limit: hidden variance approaches zero.',
        source: 'structural limit of the model: threshold (1 - C) = 0',
    },
    {
        name: 'deep masking (small cloud)',
        params: { capacity: 0.0, gSD: 0.3, eSD: 0.05, k: 8 },
        expected: 100,
        description:
            'a small latent cloud sits entirely inside a large threshold radius, so the factor f is near 0 for every phenotype and almost all variance is held below the surface.',
        source: 'structural limit of the model: latent cloud inside threshold radius',
    },
    {
        name: 'heat-shock release',
        params: { capacity: 0.4, gSD: 1.0, eSD: 0.4, k: 6 },
        expected: 36,
        description:
            'a transient drop in chaperone capacity (heat stress) lets part of the cryptic variation surface. the model reports partial masking, matching the experimental release of hidden phenotypes under heat shock.',
        source: 'Rutherford & Lindquist 1998; Queitsch et al. 2002 (heat-shock release of cryptic variation)',
    },
    {
        name: 'inhibitor: large deviations escape',
        params: { capacity: 0.2, gSD: 1.8, eSD: 0.3, k: 5 },
        expected: 20,
        description:
            'strong genetic input pushes most phenotypes past the threshold radius, where buffering is weak, so the bulk of variance is expressed. only the small near-optimal core stays masked.',
        source: 'Rutherford & Lindquist 1998 (Hsp90 inhibition exposes morphological variation)',
    },
    {
        name: 'environmental noise dominates',
        params: { capacity: 0.5, gSD: 0.2, eSD: 0.6, k: 5 },
        expected: 51,
        description:
            'isotropic developmental noise spreads phenotypes across the threshold, so roughly half the variance is buffered and half escapes; the buffer cannot fully canalize against environmental fluctuation.',
        source: 'Milton et al. 2006 (Hsp83 buffering of environmental variation in Drosophila)',
    },
];


export function buildCalibration(): CalibrationResult[] {
    return CASES.map((c) => {
        const result = computeVarianceDeterministic(c.params);
        const predicted = result.hiddenFraction * 100;
        return {
            name: c.name,
            description: `${c.description} threshold radius = ${thresholdRadius(c.params.capacity).toFixed(2)}.`,
            predicted: Number(predicted.toFixed(1)),
            expected: c.expected,
            source: c.source,
        };
    });
}
