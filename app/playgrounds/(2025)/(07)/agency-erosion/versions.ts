import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'agent-based model of agency erosion: when symbolic identity signaling substitutes for agency-building participation, fragmenting coalitions and dampening mobilization. Retrofitted with the scientific scaffolding: calibration of the deterministic core (the logistic response and the rolling OLS expectation behind the substitution index), and assumptions separating that exact core from the stochastic agents and the interpretive emancipatory-versus-anesthetic labels.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'agent-based simulation of effort allocation between agency and signaling, with fragmentation, coalition size, distortion, and a success outcome.',
            'substitution index and composite mobilization score, with emancipatory / anesthetic / neutral phase labels.',
            'calibration of the deterministic core: the logistic response and the rolling ordinary-least-squares expectation.',
            'assumptions separate the exact core from the stochastic agents and the threshold-based phase classification.',
        ],
    },
];
