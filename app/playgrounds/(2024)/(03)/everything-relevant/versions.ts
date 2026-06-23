import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2024',
        description:
            'illustrative visualization of unified-physics themes (fields, particles, spacetime, symmetries) inspired by Sean Carroll. Retrofitted with the scientific scaffolding: a logic module and calibration realizing the one exact claim the playground is about, Noether\'s theorem (time-translation symmetry conserves energy on a harmonic oscillator), and assumptions that are explicit the field animation itself is decorative, not a solved model.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2024',
        changes: [
            'animated field/particle/spacetime visualization with symmetry toggles, scale controls, and emergent-phenomenon layers.',
            'logic module implementing a harmonic oscillator with a symplectic integrator.',
            'calibration of Noether\'s theorem: time-translation symmetry conserves energy, and breaking it destroys the conservation.',
            'assumptions make explicit that the field animation is illustrative while the Noether relation is the exact, checkable core.',
        ],
    },
];
