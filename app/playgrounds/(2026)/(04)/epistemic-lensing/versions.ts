import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude',
        date: 'April 2026',
        description: 'initial implementation',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            'Initial 9-parameter toy model: 6 channel operators + 3 agent parameters',
            'Posterior trajectory visualization over 200 timesteps with correction at t=150',
            'Five metrics: information loss, posterior divergence, inferential curvature, hysteresis, calibration error',
            'Four presets mapping to paper scenarios: attenuation, selection+warping, amplification, recursion',
            'Parameter sweep and sensitivity analysis across all 9 parameters',
        ],
    },
];
