import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'evolutionary sandbox for the graded emergence of eyes, from eyespot to lens, by mutation and selection on visual traits, after Nilsson and Pelger. Retrofitted with the scientific scaffolding: a logic module with the exact fitness and eye-type-classification functions, calibration against their closed forms, and assumptions separating that exact core from the stochastic evolution and the coarse three-trait abstraction.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'mutation-selection genetic algorithm evolving organisms with visual acuity, light sensitivity, and field of view.',
            'eye-type classification along the Nilsson-Pelger sequence by a composite-trait threshold ladder.',
            'fitness as per-type base plus environmental bonuses minus metabolic cost, with convergence-event detection.',
            'logic module with the exact fitness and classification functions, used by the calibration.',
            'calibration checks base fitness, the light bonus saturating at 1, the metabolic penalty, and the trait thresholds.',
        ],
    },
];
