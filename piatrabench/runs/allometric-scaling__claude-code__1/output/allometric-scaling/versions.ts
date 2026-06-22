import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2026',
        description:
            'first cut, built for the PiatraBench runs harness from the allometric-scaling seed: a tunable B = B0 * M^a power law over a ten-animal metabolic-rate dataset, a log-log viewer with the 2/3, 3/4, and best-fit exponents, an exponent sweep that locates the error minimum, and calibration of the three-quarter prediction against measured basal metabolic rates.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'metabolic-rate model B = B0 * M^a with tunable exponent and coefficient over a ten-animal mass and BMR dataset.',
            'log-log viewer: measured points plus the model line, with 2/3 surface, 3/4 Kleiber, and ordinary-least-squares best-fit references.',
            'exponent sweep of the log-residual error, locating the minimum near the data best fit.',
            'calibration of the three-quarter prediction against measured basal metabolic rates for mouse, human, cow, and elephant.',
            'assumptions separate the robust empirical pattern, a steeper-than-2/3 exponent, from the contested network-theory explanation of the exact value.',
        ],
    },
];
