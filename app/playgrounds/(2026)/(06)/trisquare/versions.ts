import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2026',
        description:
            'first cut. ports the Turok dimension-zero scalar correspondence ideation into playground conventions: PlaygroundLayout, black-and-lime palette, the correspondence triangle with status-tagged edges, a status ledger, the Ward identity constraint game, a conformally flat sector with finite-difference curvature, the phi-fourth RG flow, an action translator, calibration of the curvature method against analytic metrics, and nine assumptions.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2026',
        changes: [
            'correspondence triangle: the three nodes (constrained quantum gravity, perfect-square action, 4D phi-fourth) with every edge tagged exact-in-toy, known-physics, or speculative.',
            'status ledger: each claim sorted into the same three confidence tiers.',
            'Ward identity constraint game: scale, conformal, and diffeomorphism invariance delete terms and single-coupling merges the dimensionless survivors, with a per-term verdict and reason.',
            'conformally flat sector: an Omega(x, y) explorer with five presets and a finite-difference curvature heatmap computing K = -Omega^{-2} Laplacian(ln Omega).',
            'phi-fourth flow: the one-loop running coupling 3 lambda^2 / 16 pi^2 with its Landau pole.',
            'action translator: the rough gravity-side / scalar-side dictionary from the proposal.',
            'calibration: the finite-difference curvature is validated against constant-curvature sphere and Poincare-disk metrics to better than one percent.',
        ],
    },
];
