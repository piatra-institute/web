import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude Opus 4.6',
        date: 'April 2026',
        description: 'initial implementation with five-variable individuation dynamics and four phase regimes',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            'Five coupled dynamic variables: viability, coherence, novelty, tension, boundary flux',
            'Six control parameters: autonomy, boundary, plasticity, coupling, memory, perturbation',
            'Four phase regimes: World-Oriented Becoming, Metastable Individuation, Rigid Closure, Chaotic Drift, Dissolution',
            'Composite becoming index rewarding joint viability, coherence, novelty, and balanced boundary flux',
            'Temporal dynamics visualization with animated trajectory playback',
            'Boundary flux vs. tension phase space with regime regions',
            'Radar chart parameter profile and derived diagnostics (rigidity, exposure risk, adaptive range)',
            'Parameter sweep and sensitivity analysis for all six control parameters',
        ],
    },
];
