import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.7',
        date: 'May 2026',
        description:
            'first cut. an eight-rung ladder from matter to over-salience, six salience objects with eight-dimensional profiles, an eight-weight salience field, and a softmax attention layer. four presets and three signal regimes.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'May 2026',
        changes: [
            'replaced the original demo time-wave with a deterministic signal regime, so the configuration alone is the model.',
            'kept the eight-dimensional object profile but renamed it to matter, constraint, proto, sign, reward, affect, cognition, narrative.',
            'made the eight-rung ladder a first-class structure: matter, constraint, proto-salience, sign, value, attention, narrative, over-salience.',
            'added a sixth object, a shared song, to isolate narrative binding from reward.',
            'replaced the single salience number with a six-metric panel: salience, over-salience, attention share, concentration, meaning, stability.',
            'four status tiers, ordinary to runaway, classify the focal object by its salience band.',
            'softmax attention over all six objects feeds the attention rung and the concentration metric.',
            'sweep, sensitivity, snapshot comparison, and a comparative ranking added throughout.',
        ],
    },
];
