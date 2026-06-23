import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'November 2025',
        description:
            'fitness-landscape model of how convex returns to scale drive algorithmic competition toward monodominance, with niche separation and a noise floor deciding whether several winners survive. Retrofitted with the scientific scaffolding: a logic module for the concentration metrics, calibration that checks the Gini and top-share measures against known distributions, and assumptions separating the established metric math from the speculative economic interpretation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'November 2025',
        changes: [
            'two-peak fitness landscape with convexity, niche separation, and noise-floor controls, plus four regime presets.',
            'concentration readouts: top-5% fitness share and Gini coefficient over the landscape grid.',
            'logic module with general Gini and top-share metrics, used by the calibration.',
            'calibration checks the metrics against equality (Gini 0), total monodominance (Gini (n-1)/n), and a worked example.',
            'assumptions separate the mathematics of convex concentration from the interpretive economic framing.',
        ],
    },
];
