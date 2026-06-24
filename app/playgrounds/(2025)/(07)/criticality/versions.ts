import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'first cut. A Galton-Watson branching process with Bernoulli offspring whose mean (the branching ratio) is the slider parameter sigma. Live Monte-Carlo avalanche-size distribution on a log-log plot, a bifurcation diagram of the fitted power-law slope against sigma, and a regime classifier. The deterministic core (branching ratio, closed-form mean avalanche size, the -3/2 critical exponent) is exposed for calibration; the distance-to-criticality framing is summarised as context.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'branching process: each active site activates a successor with probability sigma, so the branching ratio is exactly sigma and criticality is sigma = 1.',
            'live avalanche-size distribution sampled over thousands of trials, plotted log-log alongside a fitted power-law slope.',
            'bifurcation diagram sweeping sigma from 0.5 to 1.5 and tracking the estimated slope, with the current sigma marked.',
            'regime classifier labelling sub-critical, critical and super-critical, and the distance-to-criticality (d-squared) interpretation presented as context.',
            'calibration of the deterministic core: branching ratio = 1 at criticality, closed-form mean avalanche size 1/(1 - sigma), and recovery of the -3/2 critical exponent from an exact power law.',
            'six assumptions separating the exact branching-process facts from the contested self-organized-criticality setpoint claim and the speculative d-squared metric.',
        ],
    },
];
