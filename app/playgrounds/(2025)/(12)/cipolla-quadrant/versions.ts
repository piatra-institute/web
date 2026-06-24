import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'December 2025',
        description:
            'builds Cipolla\'s two-axis stupidity plane as an interactive playground: a deterministic quadrant classifier on gain-to-self by gain-to-others, the net-welfare diagonal that splits helpless and bandit actions, a stochastic four-component mixture that maps national macro indicators into a population cloud, calibration of the classifier against Cipolla\'s four definitions, six assumptions separating the falsifiable classifier from the speculative macro model, and a research companion on the basic laws.',
    },
];


export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'December 2025',
        changes: [
            'core classifier: classify(selfGain, otherGain) maps the sign pair to one of intelligent, helpless, bandit, stupid, using the closed gain >= 0 boundary convention.',
            'net-welfare diagonal (the P-O-M line, gain-to-self plus gain-to-others equals zero) refines helpless and bandit actions into net-positive and net-negative variants.',
            'population sampler: a four-component bivariate normal mixture, each component reflected into its quadrant, drawn from a seeded deterministic PRNG so a run is reproducible.',
            'country model: macro indicators drive latent prosperity, institutions, inequality, and stress, which set mixture weights through a softmax over directional logits.',
            'calibration measures the deterministic classifier against Cipolla\'s four quadrant definitions; the stochastic macro model is left untested by design.',
            'six assumptions mark the two-axis reduction and macro mapping as contested or speculative while keeping the classifier itself established and falsifiable.',
        ],
    },
];
