import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'April 2026',
        description: 'Initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            '7-scale hierarchy (Cell through Metro) with discrete-time simulation',
            '10 control parameters: demand shock, complementarity, signal fidelity, repair capacity, local veto, incumbent capture, finance misalignment, infrastructure sync, regional steering, gluing strength',
            '4 presets: healthy morphogenesis, NIMBY lock-in, China-style overhang, informal urban explosion',
            'Sheaf-like gluing diagram with cross-scale coherence visualization',
            'Levin-style morphogenetic recruitment: higher scales pull lower scales toward system goals',
            'Metrics: coherence, FAR (functional adaptation rate), misallocation, cohomology defect, price/queue pressure',
            'Time-series charts for coherence, FAR, and price pressure across simulation horizon',
        ],
    },
];
