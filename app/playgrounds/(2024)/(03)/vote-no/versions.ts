import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'network model of consensus by rejection: proposals stand by default and are blocked when enough members vote no, exploring the power of the veto in democratic resistance. Retrofitted with the scientific scaffolding: a logic module with the deterministic decision rules (rejection rate, veto and pass thresholds, consensus strength), calibration against their closed forms, and assumptions separating those exact rules from the stochastic member network.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'agent network where members reject proposals; proposals are vetoed, cool off, or pass by surviving.',
            'logic module with the rejection-rate, veto-threshold, pass, and consensus-strength rules.',
            'calibration checks each rule against its closed form, including the consensus curve peaking at an even split.',
            'assumptions separate the exact decision rules from the random member attributes and votes.',
        ],
    },
];
