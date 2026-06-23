import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'April 2025',
        description:
            'interactive 3D explorer of David Raup\'s theoretical shell morphospace, with the three coiling parameters W, D, and T. Retrofitted with the scientific scaffolding: a logic module holding the canonical logarithmic-spiral equations, calibration that checks the whorl-expansion and axial-translation relations, and assumptions separating Raup\'s established geometry from the renderer\'s visual sensitivity tweak and the model\'s descriptive limits.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'April 2025',
        changes: [
            '3D shell renderer driven by Raup\'s whorl expansion rate (W), distance from axis (D), and translation rate (T), with morphospace markers to navigate.',
            'logic module with the canonical logarithmic-spiral equations (radius growth and axial translation), used by the calibration.',
            'calibration checks that the radius grows by W per whorl, W^n over n whorls, and that axial offset after a whorl equals T times the radius.',
            'assumptions separate the established three-parameter geometry from the renderer\'s visual W sensitivity and the gap between theoretical and realized morphospace.',
        ],
    },
];
