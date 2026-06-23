import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'September 2025',
        description:
            'Neo-Riemannian harmony explorer: navigate the 24 triads by the P, L, and R transformations and find shortest paths between chords. Retrofitted with the scientific scaffolding: a logic module holding the exact PLR transforms and pitch-class sets, calibration against Neo-Riemannian ground truth, and assumptions covering the dihedral group structure and the voice-leading (not acoustic) scope.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'September 2025',
        changes: [
            'triad space of 24 major/minor chords with P (parallel), L (leading-tone), R (relative) transforms.',
            'shortest-path search (BFS and weighted) between any two triads through PLR moves.',
            'logic module with the exact transforms, pitch-class sets, and shared-tone count.',
            'calibration against Neo-Riemannian ground truth: the transforms, their involution property, and two-shared-notes parsimony.',
            'assumptions cover the dihedral-group structure and the voice-leading (not acoustic) scope of the model.',
        ],
    },
];
