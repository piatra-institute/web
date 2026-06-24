import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2026',
        description:
            'first cut. places a faithful Newtonian inclined-plane simulation beside the closed-form invariants of SU(2) level-k Chern-Simons theory. the classical core integrates a = g sin(theta) minus mu g cos(theta) with quadratic drag; the topological core reports the three-sphere partition function, the conformal weight, and the unitary braid phase. calibration checks both deterministic cores against their textbook ground truths, and eight assumptions keep the action / bordism connection framed as an analogy rather than an identity.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2026',
        changes: [
            'classical panel: a block on an inclined plane integrated with explicit Euler, net acceleration a = g sin(theta) minus mu g cos(theta) with a static-friction clamp and quadratic air drag, supporting downhill and uphill runs.',
            'TQFT panel: closed-form SU(2)_k readouts, Z(S^3) = sqrt(2/(k+2)) sin(pi/(k+2)), conformal weight h = j(j+1)/(k+2), and a pure braid phase exp(2 pi i h times braids) drawn as an over-and-under strand diagram.',
            'mass-to-spin dictionary j = mass / 2 and a presentational coupling that adds crossings as the block slides, both marked speculative.',
            'calibration: five deterministic checks against textbook ground truths, the frictionless slide, the static hold, Z(S^3) at k = 1, unitary braiding, and the spin-1 conformal weight, all reproducing exactly.',
            'framing kept honest: the action principle and the bordism principle are presented as two analogous ways of turning a process into a number, not as a quantisation of the sliding block.',
        ],
    },
];
