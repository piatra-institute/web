import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'March 2026',
        description: 'Initial atlas with 25 constructions across 11 modes',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'March 2026',
        changes: [
            '25 product constructions across group theory, ring/algebra, category theory, and topology',
            '11 modes of combination as the primary taxonomy axis',
            'Field × mode matrix visualization',
            'Interactive filtering by field, mode, search, and sort order',
            'Four curated presets: full atlas, universal templates, action hierarchy, topological surgery',
            'Detail panel with intuition, use-when conditions, comparison, and nearby constructions',
        ],
    },
];
