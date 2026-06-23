import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'December 2025',
        description:
            'treats self-referential sentences as a discrete dynamical system, so paradoxes like the Liar become temporal rhythms and networks of mutual reference settle into cycles. Retrofitted with the scientific scaffolding: a logic module with the exact truth-value update rules and cycle detection, calibration of the canonical periods (Liar 2, truth-teller 1), and assumptions placing the dynamical reading among other treatments of paradox.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'December 2025',
        changes: [
            'self-referential truth-value simulator with synchronous discrete-time updates and cycle detection.',
            'sentence types: constants, Liar, truth-teller, assertions, implication, biconditional, and a windowed percent controller.',
            'presets for basic examples, mutual negation, and reference rings, plus a companion complex-attractor view.',
            'logic module with the exact update rules and cycle detection, used by the calibration.',
            'calibration checks the canonical periods (Liar 2, truth-teller 1), the IFF and ASSERT single-step logic, and a two-state network cycle.',
        ],
    },
];
