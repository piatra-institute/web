import { ModelVersion } from '@/components/VersionSelector';
import { ChangelogEntry } from '@/components/ModelChangelog';

export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'Claude Opus 4.6',
        date: 'April 2026',
        description: 'initial implementation with five species presets and Z-scheme control landscape',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1',
        date: 'April 2026',
        changes: [
            'Five species presets: C3, C4, CAM, Cyanobacteria, Red Algae with distinct metabolic strategies',
            'Z-scheme energy ladder visualization with tunable PSII/PSI wavelengths',
            'Light-response landscape showing fixation, ROS, and homeostasis across intensities',
            'Path dependence via five perturbation profiles with damage memory accumulation',
            'Regime classification: efficient, homeostatic, protected, transition, photoinhibition',
            'Invariant window analysis: ATP:NADPH ratio, excitation balance, repair-vs-ROS, homeostatic slack',
            'Three speculative control nodes: adaptive routing, dynamic topology, protonic homeostasis',
            'Parameter sweep and sensitivity analysis for six key control parameters',
        ],
    },
];
