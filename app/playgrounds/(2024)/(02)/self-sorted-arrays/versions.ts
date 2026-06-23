import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2024',
        description:
            'self-sorting arrays: array elements as autonomous cells that sort themselves through local neighbour comparisons, with mixed algotypes, swap policies, and mutation. Retrofitted with the scientific scaffolding: calibration of the exact order metrics (sortedness and aggregation), a fix to the sortedness comparison, and assumptions framing sorting-as-agency after the Levin-lab work, separating the exact metrics from the basal-cognition interpretation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2024',
        changes: [
            'array elements modelled as autonomous cells that swap with neighbours by local rules.',
            'per-cell algotypes (bubble, insertion, selection), swap policies, and mutation strategies.',
            'order metrics: sortedness (fraction of increasing adjacent pairs) and aggregation (fraction of like-algotype adjacent pairs).',
            'fixed the sortedness metric to compare cell values rather than cell objects.',
            'calibration checks sortedness and aggregation against hand-built distributions with known values.',
        ],
    },
];
