import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'ramsey-theorem',
        statement:
            'Ramsey\'s theorem is exact: for integers s, t there is a finite least N = R(s,t) such that every 2-coloring of the complete graph K_N contains a monochromatic K_s or K_t. Above N, monochromatic structure is unavoidable, not merely likely.',
        citation:
            'Ramsey 1930, On a Problem of Formal Logic; Greenwood and Gleason 1955 for the small exact values used here.',
        confidence: 'established',
        falsifiability:
            'a 2-coloring of K_6 with no monochromatic triangle would refute R(3,3) = 6; none exists, and the model enumerates this directly.',
    },
    {
        id: 'cost-is-combinatorial',
        statement:
            'the "cost of chaos" is the fraction of edges trapped inside forced monochromatic cliques (structureRatio = involved edges / total edges). It is a combinatorial bookkeeping quantity, not a physical energy or money cost.',
        citation:
            'modelling choice; the metric is defined in computeChaosStats and counts edges that lie in at least one detected clique.',
        confidence: 'contested',
        falsifiability:
            'a different reasonable definition of cost (vertices removed to destroy all cliques, the graph edit distance to a clique-free coloring) would give different numbers; the chosen ratio is one operationalization among several.',
    },
    {
        id: 'greedy-not-optimal',
        statement:
            'the adversarial coloring is a greedy heuristic, not an optimal clique-avoiding coloring. For each edge it picks the color that creates the fewest immediate monochromatic triangles. This can leave monochromatic cliques even below the Ramsey threshold, where a clique-free coloring provably exists.',
        citation:
            'measured behavior: at n = 5 (below R(3,3) = 6) the heuristic at the default seed leaves one triangle, while an optimal coloring would leave zero; see the calibration panel.',
        confidence: 'established',
        falsifiability:
            'the claim "below threshold the adversary always reaches zero cliques" is already false in the model; finding any below-threshold case with a nonzero count confirms suboptimality.',
    },
    {
        id: 'threshold-only-2color-diagonal',
        statement:
            'the displayed Ramsey threshold applies only to the symmetric 2-color diagonal case R(s,s) and is read from a small lookup table. For more than 2 colors or off-diagonal s, t the model shows no threshold (ramseyNumber is null).',
        citation:
            'getRamseyNumber returns a value only for 2-color cases in a hardcoded RAMSEY table; multicolor Ramsey numbers are mostly unknown.',
        confidence: 'established',
        falsifiability:
            'asking for a 3-color threshold returns null by construction; the model never asserts a multicolor Ramsey bound it cannot back with the table.',
    },
    {
        id: 'cliques-not-orbits',
        statement:
            'despite the "cost of chaos" framing, this model is static combinatorics, not a dynamical system. There is no time evolution, no Lyapunov exponent, and no sensitive dependence on initial conditions; "chaos" here means absence of forced pattern, not deterministic unpredictability.',
        citation:
            'the logic computes a fixed edge coloring and enumerates cliques; nothing iterates a map or integrates a flow.',
        confidence: 'established',
        falsifiability:
            'searching the source for any time-stepped state finds none; the metaphor of dynamical chaos does not correspond to any computation performed.',
    },
    {
        id: 'exact-enumeration-small-n',
        statement:
            'clique detection is exact brute-force enumeration over all C(n, cliqueSize) subsets. This is tractable only for the small graphs the playground allows; it is not an approximation but does not scale.',
        citation:
            'findMonochromaticCliques iterates every size-k subset and checks monochromaticity; complexity grows combinatorially with n.',
        confidence: 'established',
        falsifiability:
            'for large n the enumeration would be infeasible; the model bounds nodeCount precisely because the exact method is exponential.',
    },
];
