import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'first cut. an interactive tour of the 17 wallpaper groups (plus 3D and 4D companions), each pattern generated as the orbit of a single motif under the cell point group on its Bravais lattice. adds an exact logic module reading off point-group order, rotation order, reflection and glide presence, and lattice type for every group, a calibration panel checking those exact integers against the textbook classification, eight assumptions separating the established theorem from the rendering simplifications, and a research companion on the plane-group classification.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'wallpaper layer: all 17 plane groups rendered by laying out one motif and its point-group orbit across a square, centred, or hexagonal lattice.',
            'space-group companions: a 3D space-group viewer and a 4D crystallographic viewer with stereographic projection, hyperplane slicing, and 4D rotation controls.',
            'logic module: exact per-group specs (point-group order, highest rotation order, reflection flag, glide flag, Bravais lattice) derived from the same construction the canvas draws.',
            'calibration: computed group properties checked against the textbook classification (17 groups, p6 6-fold, p6m order-12 point group, 10 mirror groups), all exact.',
            'assumptions: the Euclidean-plane, infinite-lattice, and crystallographic-restriction premises behind the closed count of 17 made explicit, alongside the discrete-glide and fixed-lattice simplifications.',
            'research companion on the structure and proof history of the plane-group classification.',
        ],
    },
];
