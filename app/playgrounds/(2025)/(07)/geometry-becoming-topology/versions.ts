import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'July 2025',
        description:
            'interactive demonstration of how geometry becomes topology: the same points carry exact distances (metric) and connection-only invariants (topology). Retrofitted with the scientific scaffolding: a logic module computing the Betti numbers and Euler characteristic from adjacency, calibration on graphs with known topology, and assumptions separating the exact invariants from the metric picture and the surface-topology aside.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'July 2025',
        changes: [
            'three views of the same point set: metric distances, smoothing, and topological invariants.',
            'logic module computing connected components (b0), cycle rank (b1), and Euler characteristic from the adjacency.',
            'calibration on known graphs: components of disjoint edges, loops in a triangle and in a square with a diagonal, plus a metric-distance check.',
            'assumptions separate the deformation-invariant topology from the coordinate-dependent geometry.',
        ],
    },
];
