import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude Opus 4.6',
        date: 'April 2026',
        description: 'initial implementation with full damage functional, sheaf consistency, sensitivity analysis, and presets',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            '8-dimensional harm vector with capability-approach grounding',
            '6-sector local-to-global aggregation with sheaf consistency',
            'cosine-similarity-based coherence and obstruction metrics',
            'damage functional with temporal discount, future weight, repair capacity',
            '4 presets: baseline, platform monopoly, extractive finance, fossil incumbent',
            'sensitivity analysis across all global parameters',
            'parameter sweep with multi-metric tracking',
            'narrative generation comparing current state to baseline',
        ],
    },
];
