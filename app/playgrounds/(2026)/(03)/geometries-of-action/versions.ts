import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'March 2026',
        description: 'Initial implementation with six-panel manifold laboratory',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'March 2026',
        changes: [
            'Six-panel visualization: manifold geometry, population activity, dynamics, alignment, decoder, sweep',
            'Four presets mapping manifold framework claims: motor reach, timing + cooling, cross-subject, spinal decoding',
            'Linear vs nonlinear projection comparison with distortion metric',
            'Continuous trajectory animation with play/pause and speed modulation via cooling',
            'Cross-subject alignment with configurable warping',
            'Clinical decoder cursor driven by residual manifold structure',
            'Parameter sweep and sensitivity analysis on decoder confidence',
        ],
    },
];
