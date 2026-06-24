import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'December 2025',
        description:
            'first cut. builds an interactive torus-knot studio: parametric T(p,q) curves, a geometric connected sum with bezier bridges, projection-dependent crossing and writhe counts, a random-rotation search for low-crossing diagrams, an approximate ropelength with a smoothing-plus-repulsion tighten step, and the closed-form crossing and unknotting numbers. ships calibration against textbook invariants, eight assumptions separating exact closed forms from projection-dependent diagram quantities, and a research companion on the unknotting problem and the 2025 non-additivity result.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'December 2025',
        changes: [
            'torus knot geometry: T(p,q) curves embedded on a torus, with optional mirror, sampled as a polyline.',
            'connected sum K1 # K2 realised geometrically by cutting each summand and rejoining with smooth bezier bridges.',
            'projection invariants: crossing count and signed writhe computed from a fixed 2D projection of the rotated curve, reported live.',
            'random-rotation projection search that samples orientations to find diagrams with fewer crossings, illustrating crossing number as a diagram minimum.',
            'closed-form invariants: crossing number min((p-1)q, (q-1)p) and unknotting number (p-1)(q-1)/2 for coprime torus knots, with null returned for non-coprime links.',
            'approximate ropelength (length over nearest-non-neighbour thickness) and a laplacian-smoothing tighten heuristic.',
            'Brittenham-Hermiller (2025) preset: T(2,7) summed with its mirror, the connected sum that disproves additivity of the unknotting number.',
            'calibration against textbook invariants and assumptions distinguishing exact closed forms from projection-dependent, non-invariant diagram quantities.',
        ],
    },
];
