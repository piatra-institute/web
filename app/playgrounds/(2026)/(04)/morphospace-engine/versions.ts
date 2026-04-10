import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'April 2026',
        description: 'Initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            'Node-graph architecture with 6 node types: seed, field, constraint, constant, attractor, observation',
            'Field computation on 28\u00D728 grid with Gaussian envelopes, directional fields, and constraint damping',
            '3 presets: e-mitigating moat, Feigenbaum ladder, outside/ingressed',
            'Metrics: energy, coherence, e/\u03B4 leakage, center/edge bias, swirl, anisotropy, platonic depth, constraint index',
            'Morphology classification: 6 emergent phenotype classes',
            'Draggable node canvas with SVG edge rendering and real-time field visualization',
        ],
    },
];
