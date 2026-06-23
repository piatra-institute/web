import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'May 2025',
        description:
            'BirdSym simulation of sympatric speciation as a symmetry-breaking bifurcation: birds on a trait axis split into two clusters as a competition parameter crosses a threshold. Retrofitted with the scientific scaffolding: calibration of the deterministic Gaussian resource and feeding kernels, and assumptions separating that exact core from the stochastic initial conditions and the speciation interpretation.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'May 2025',
        changes: [
            'BirdSym trait-dynamics model: birds move on a 1D trait axis under Gaussian resource availability and competition.',
            'bifurcation diagram sweeping the competition parameter to show the single-cluster to two-cluster transition.',
            'time-series view of individual trait trajectories converging or splitting.',
            'calibration of the deterministic resource and feeding kernels (peak height, symmetry, one-sigma falloff).',
            'assumptions separate the exact kernels from the random initial conditions and the symmetry-breaking interpretation of speciation.',
        ],
    },
];
