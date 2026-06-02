import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.7',
        date: 'June 2026',
        description:
            'first cut. ports the ideation prototype to the playground conventions: PlaygroundLayout, controlled-component state, black-and-lime palette, five named scenarios, snapshot comparison, parameter sweep, sensitivity tornado, calibration table, ten assumptions, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'ported the constrained-POMDP simulation from the ideation prototype: seven-dim hidden family state, eight observation channels, sigmoid belief update, six-action loss-minimisation, path-dependent transitions.',
            'replaced the prototype\'s interactive stepping with a deterministic horizon=30 run, seeded via the shared @/lib/rng utility.',
            'classified each run into one of four outcome regimes: preserved, monitored, separated, ruptured.',
            'added the signature belief-vs-harm phase plot showing the trajectory through the four error quadrants.',
            'added the standard scientific panel suite: sweep across each of ten params, sensitivity tornado on final family integrity, calibration table against expected outcome regimes, ten assumptions, narrative + reading.',
            'snapshot comparison: save a configuration, change parameters, see the dashed-orange ghost trajectory in both the phase plot and the time-series chart.',
        ],
    },
];
