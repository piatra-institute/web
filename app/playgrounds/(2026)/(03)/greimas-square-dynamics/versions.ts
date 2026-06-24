import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2026',
        description:
            'first cut. builds the Greimas semiotic square as a typed opposition graph with two interchangeable readings: a logic view (contradiction, contrariety, sub-contrariety, implication) and a group view that encodes the four corners as two bits and treats moves as composable involutions in the Klein four-group V4. adds calibration of the fixed relational skeleton (negation as involution, the contradiction and contrariety edges, four-position closure), six assumptions separating the structural claims from the interpretive ones, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2026',
        changes: [
            'four positions S1, S2, not-S1, not-S2 placed on a square, with six typed relations from the default Greimas configuration.',
            'logic view: contradiction (vertical), contrariety (top), sub-contrariety (bottom), implication / deixis (directed diagonals), each toggleable, with greimas / minimal / implication presets.',
            'group view: corners encoded as Z2 x Z2, with generators a (contradiction flip), b, and ab (contrariety flip), all involutions composing the Klein four-group.',
            'particle flow as an illustrative reachability layer (from selected node, random walk, all directed), kept separate from the semiotic claim.',
            'live adjacency matrix and re-labelable corners so a concrete opposition (Legal / Illegal, Life / Death) can be dropped onto the fixed skeleton.',
            'calibration verifies the deterministic core: double negation cancels, the contradictory of S1 is not-S1, S1 is contrary to S2, the negative terms are sub-contrary, and the four positions are closed.',
        ],
    },
];
