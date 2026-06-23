import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'September 2024',
        description:
            'calculator for the estigrade grading rule, which adjusts a final grade by how accurately a student estimated their exam score. Retrofitted with the scientific scaffolding: a logic module holding the grading formula, calibration that reproduces hand-computed final grades, and assumptions separating the exact formula from the unproven pedagogical and incentive claims.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'September 2024',
        changes: [
            'estigrade calculator: final = exam + reward*(100-|gap|) - penalty*|gap|, with live inputs for the estimate, exam score, and reward/penalty factors.',
            'split into Settings and Viewer components; the final grade is derived from a shared logic module.',
            'calibration reproduces hand-computed final grades for perfect, maximal-miss, and no-adjustment cases.',
            'assumptions flag that the final grade is unclamped and that incentive-compatibility is not guaranteed.',
        ],
    },
];
