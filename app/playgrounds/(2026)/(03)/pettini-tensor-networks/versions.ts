import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'March 2026',
        description: 'initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'March 2026',
        changes: [
            'Initial 6-parameter toy model with diffusion, sliding, and resonance terms',
            'Probability distribution visualization over 80 DNA sites',
            'Coupling sweep showing search time / compressibility tradeoff',
            'Qualitative metrics: resonance gain, baseline mobility, target bias, compressibility, search time',
        ],
    },
];
