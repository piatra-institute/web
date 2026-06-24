import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2025',
        description:
            'upgrade to the PiatraBench template. keeps the original information-theory heatmap of fairness over corruption C and randomness R, and adds an honest scientific layer: calibration of the deterministic core against textbook information-theory identities, six assumptions that separate the real sortition argument from the tautological blend the formula bakes in, and a research companion on justice by lottery.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2025',
        changes: [
            'fairness model: each decision becomes a binary outcome distribution P, scored by its distance from the uniform ideal via Shannon entropy, KL divergence, total variation, Jensen-Shannon divergence, and demographic parity.',
            'three corruption types: directional bias (sigmoid tilt), increased variance (deterministic noise), and systematic error (sinusoidal mis-decision).',
            'randomness R blends the biased distribution toward uniform through a preservation factor exp(-2R), so the heatmap shows where added stochasticity raises the effective fairness entropy.',
            'institutional-efficiency closed form encodes a fairness-versus-efficiency tension and locates a "random justice" regime at moderate corruption and randomness.',
            'calibration: the deterministic information-theory and efficiency functions are checked against exact identities (one bit for a fair coin, zero self-divergence, exact distances for a known skew).',
            'assumptions flag that "randomness counteracts corruption" is built into the convex blend, while the underlying sortition argument is a genuine and contested position in political theory.',
        ],
    },
];
