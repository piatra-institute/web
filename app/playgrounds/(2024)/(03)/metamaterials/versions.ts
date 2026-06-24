import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'first cut of the life-like metamaterial lattice: a 2D mass-spring network with Hookean connections, an auxetic (negative-Poisson) stiffening law, and layered toggles for self-assembly, adaptation, self-healing, and memory. ships with a pure mechanics module, six calibration cases that recompute Hooke and auxetic closed forms, six assumptions separating the real elasticity from the illustrative life-like rules, and a research companion on auxetic and active metamaterials.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'lattice model: hexagonal, square, and re-entrant auxetic node layouts connected by Hookean springs at the unit-cell spacing.',
            'force law: F = k_eff (L - R) / L with effective stiffness k_eff = k (1 + |nu| * |strain|) for auxetic (negative Poisson) materials and a sinusoidal nonlinear stiffening factor.',
            'life-like rules layered on the elastic dynamics: self-assembly toward a moving target, stress-history adaptation, damage self-healing, and a rolling memory buffer.',
            'environmental forcing (mechanical wave or pulse, thermal drift) and an overdamped explicit integrator with boundary clamping.',
            'live readout of node count, connection count, average stress, and four normalised life metrics.',
            'calibration of the deterministic core: rest equilibrium, Hooke under 20% tension, auxetic stiffening, the linear limit, and the Poisson lateral-strain relation.',
        ],
    },
];
