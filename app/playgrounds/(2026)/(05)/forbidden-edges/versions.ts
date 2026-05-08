import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'May 2026',
        description: 'initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'May 2026',
        changes: [
            'Multi-scale moral graph: 14 nodes across 5 layers (neural, interpersonal, institutional, ecological, historical)',
            'Hyperedges for non-pairwise actions: bribe, commons use, truth telling',
            'Eight actions: keep promise, betray, offer repair, coerce, grant sanctuary, punish defection, exploit, share knowledge',
            'Six pressure parameters: dopamine bias, empathy, institutional strength, scarcity, memory, ecological coupling',
            'Six metric channels: trust, agency, harm, repair, domination, ecology, with weighted viability score',
            'Five moral frames (medical, military, kin, legal, market) each rating every action under current state',
            'Sheaf-style obstruction matrix: per-action consistency radius and spread across frames',
            'Forbidden-action heatmap: net viability delta for every action under current pressures',
            'Trajectory recording with 30-tick history; per-metric line chart',
            'Five scenario presets: broken trust, tragedy of commons, sanctuary asylum, whistleblower, war crime',
        ],
    },
];
