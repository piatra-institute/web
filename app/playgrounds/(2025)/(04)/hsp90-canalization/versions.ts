import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'April 2025',
        description:
            'first cut. visualizes Hsp90 as an evolutionary capacitor: a three-dimensional cloud of latent phenotypes pulled back toward the canalized optimum by a logistic buffering factor with capacity C and sharpness k. reports the buffered-to-latent variance ratio as a measure of canalization, with a deterministic quadrature core, calibration against the structural limits and the heat-shock release story, six assumptions separating the established capacitor result from the speculative buffering form, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'April 2025',
        changes: [
            'phenotype model: latent deviation (x, y, z) from anisotropic genetic variation plus isotropic environmental noise, radius r = sqrt(x^2 + y^2 + z^2).',
            'buffering: logistic factor f(r) = 1 / (1 + exp(-k (r - (1 - C)))) scales each phenotype toward the optimum; capacity C sets the threshold radius (1 - C).',
            'canalization readout: buffered-to-latent variance ratio E[r_buffered^2] / E[r_latent^2], reported as a hidden-variance percentage.',
            'deterministic quadrature core mirrors the interactive Monte Carlo Viewer, giving reproducible calibration values.',
            'calibration: hidden-variance percentage checked against the open-buffer and deep-masking structural limits and against the heat-shock and inhibition release regimes.',
            'six assumptions mark the capacitor result as established while flagging the logistic buffering form and uniform draws as modelling choices.',
        ],
    },
];
