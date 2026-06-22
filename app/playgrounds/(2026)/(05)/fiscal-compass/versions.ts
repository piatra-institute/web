import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'May 2026',
        description: 'initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'May 2026',
        changes: [
            'Four tax rationales as separable additive benefit channels: redistribution, state capacity, consolidation, corrective',
            'Five-outcome scorecard (welfare, growth, equality, fiscal repair, legitimacy) with a revenue and a deadweight-loss index',
            'School-matched gains amplified, cross-rationale leverage kept at a fixed 0.4 weight',
            'Fiscal compass: a needle built from the vector sum of how strongly the world-state supports each rationale, independent of the chosen school',
            'Six presets spanning inequality crisis, high-return state, debt squeeze, austerity trap, carbon logic, and the nordic model',
            'Searchable author map placing 19 economists under the rationale they are the strongest reference for',
            'Parameter sweep across all six inputs, sensitivity tornado on welfare, and a calibration table against five historical episodes',
        ],
    },
];
