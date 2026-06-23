import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'particle-system metaphor for narrative coherence under suffering: a connected harmony state, a fragmented burnout state, and a weaving state where the user rebuilds connections. Retrofitted with the scientific scaffolding: calibration of the deterministic coherence score (its harmony, burnout, and weaving branches, plus the clamp), and assumptions separating that exact scoring from the interpretive narrative-identity metaphor.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'particle system with three regimes: harmony (slow, connected), burnout (fast, fragmented), weaving (user-built connections).',
            'proximity-based automatic connections and a click-to-weave interaction for the weaving state.',
            'a deterministic coherence score with distinct harmony, burnout, and weaving formulas.',
            'calibration checks each score branch against its closed form, including the burnout floor and the harmony clamp at 100.',
            'assumptions separate the exact scoring from the narrative-identity metaphor it illustrates.',
        ],
    },
];
