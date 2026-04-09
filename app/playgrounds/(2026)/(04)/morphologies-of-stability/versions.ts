import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude Opus 4.6',
        date: 'April 2026',
        description: 'initial implementation with four canonical stabilizing patterns',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            'Four dynamical systems: point attractor, bistable switch, Hopf limit cycle, DeGroot consensus',
            'Real-time simulation with requestAnimationFrame and configurable noise injection',
            'Custom SVG phase portraits: state line with flow arrows, double-well potential landscape, 2D orbit trail, network graph',
            'Five presets encoding distinct stability morphologies including near-bifurcation regime',
            'Lyapunov exponent estimation and stability index for each pattern',
            'Kramers escape rate approximation for bistable barrier crossings',
            'Parameter sweep and sensitivity analysis across pattern-relevant parameters',
            'Perturbation, randomization, and state reset controls',
        ],
    },
];
