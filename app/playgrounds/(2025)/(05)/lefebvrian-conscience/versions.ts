import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'May 2025',
        description:
            'agent-based exploration of Vladimir Lefebvre\'s algebra of conscience: two ethical systems and four moral archetypes (saint, hero, opportunist, hypocrite) acting out help/harm dynamics. Retrofitted with the scientific scaffolding: a logic module encoding the exact archetype-to-attitude mapping, calibration of the self-evaluation and the System-dependent tendency flip, and assumptions separating the formal algebra from the stylized agent dynamics and the cultural interpretation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'May 2025',
        changes: [
            'agents typed by ethical system and archetype, with self-evaluation and tendency derived from Lefebvre\'s algebra.',
            'help/harm resource dynamics with in-group factors, awareness, and emergent statistics.',
            'logic module encoding the exact archetype-to-(self-evaluation, tendency) mapping per ethical system.',
            'calibration checks each archetype\'s self-evaluation and the System-1-to-System-2 tendency reversal.',
            'assumptions separate the formal two-system algebra from the stylized agent simulation and its cultural reading.',
        ],
    },
];
