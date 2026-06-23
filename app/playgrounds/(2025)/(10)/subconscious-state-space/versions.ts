import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'October 2025',
        description:
            'state-space model of conscious and unconscious regimes as trajectories of coupled excitatory and inhibitory neural populations under varying conductances and thalamic drive. Retrofitted with the scientific scaffolding: a logic module with the deterministic primitives (sigmoid firing response, Pearson synchrony), calibration against their closed forms, and assumptions separating that exact core from the stochastic simulation and the consciousness interpretation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'October 2025',
        changes: [
            'two-population neural-mass simulation (excitatory/inhibitory) with conductance, thalamic, coupling, and noise controls.',
            'metrics for slow-wave frequency, E-I synchrony, and a heuristic access-probability proxy for global ignition.',
            'logic module with the sigmoid firing response and Pearson synchrony measure.',
            'calibration checks the sigmoid at and beyond threshold and the Pearson measure on aligned, opposed, and unrelated signals.',
            'assumptions separate the exact primitives from the noise-driven dynamics and the consciousness interpretation.',
        ],
    },
];
