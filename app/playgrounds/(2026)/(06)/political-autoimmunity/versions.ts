import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2026',
        description:
            'first cut. builds the rights-dependence voting misalignment model from the ideation into playground conventions: the exposure · dependence · hostility · implementation · magnitude risk chain, foreseeability and salience layers, gross vs net with a protective benefit and tolerance, six competing interest functions as weight profiles, a seeded Monte Carlo uncertainty band, a tornado sensitivity view, a cross-model ranking matrix, an illustrative disillusionment proxy, calibration against the ideation\'s worked example, and ten assumptions.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'risk chain: per-domain priority risk = exposure · dependence · hostility · implementation · magnitude · awareness · salience, exactly as specified in the ideation.',
            'net autoimmunity: voteShare · Σ interest-weight · max(0, priorityRisk − benefit − τ), with a gross vs net toggle and a per-supporter vs population-weighted toggle.',
            'competing interest functions: rights-dependence, material, balanced, expressive/status, punitive protest, and long-run institutional, each a weight profile over domain kinds; the case ranking reorders across them.',
            'uncertainty: a deterministic, seeded Monte Carlo perturbs every cell with a Beta around its value and reports a 90% interval.',
            'sensitivity: a tornado view sweeps each assumption family min→max to show which one drives the focus score.',
            'cross-model matrix: population-weighted net score for every case under every interest model, flagging when the top case changes.',
            'calibration verifies the engine reproduces the ideation\'s synthetic worked example rather than empirical data.',
        ],
    },
];
