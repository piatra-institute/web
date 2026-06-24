import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'torus-closed-form',
        statement:
            'for coprime positive integers p and q, the crossing number of the torus knot T(p,q) is min((p-1)q, (q-1)p) and its unknotting number is (p-1)(q-1)/2. these are exact closed forms, not numerical estimates.',
        citation:
            'crossing number proved by Murasugi via the genus of alternating-like diagrams; unknotting number is the Milnor conjecture, proved by Kronheimer and Mrowka (1993) using gauge theory.',
        confidence: 'established',
        falsifiability:
            'a torus knot whose minimal diagram has fewer crossings than the formula, or that unties in fewer than (p-1)(q-1)/2 crossing changes, would refute these results.',
    },
    {
        id: 'coprime-is-a-knot',
        statement:
            'T(p,q) is a single knotted loop only when gcd(p,q) = 1. when p and q share a factor d, the curve is a d-component link, and the invariant functions return null rather than a knot value.',
        citation:
            'standard torus-knot theory: the (p,q) curve on the torus closes into gcd(p,q) parallel strands.',
        confidence: 'established',
        falsifiability:
            'if a curve with gcd(p,q) > 1 traced out a single closed component, the link-component count would be wrong.',
    },
    {
        id: 'crossing-is-projection-dependent',
        statement:
            'the live crossing count and writhe come from one fixed 2D projection of the rotated 3D curve. they are diagram quantities, not the knot invariant. the true crossing number is the minimum over all diagrams, and the live count is only an upper bound for it.',
        citation:
            'by Reidemeister, two diagrams of the same knot differ by a finite sequence of moves; crossing number is the diagram minimum, which is generally larger than the count from a single random projection.',
        confidence: 'established',
        falsifiability:
            'the projection search routinely finds rotations with fewer crossings than the current view, demonstrating directly that one projection is not the invariant.',
    },
    {
        id: 'writhe-not-invariant',
        statement:
            'writhe is the signed sum of crossings in the chosen diagram. it is not a knot invariant: a Reidemeister I move adds or removes a crossing and changes writhe by plus or minus one, while the underlying knot is unchanged.',
        citation:
            'Reidemeister move I changes writhe; only the combination of writhe and a framing (the self-linking number) is a regular-isotopy invariant.',
        confidence: 'established',
        falsifiability:
            'rotating the curve changes the displayed writhe even though the knot type is fixed, which is exactly the non-invariance.',
    },
    {
        id: 'connected-sum-is-geometric',
        statement:
            'the connected sum K1 # K2 is built geometrically: each summand is normalised, cut at an extreme point, and rejoined with bezier bridges. this reproduces the topology of a genuine connected sum but does not compute the summed knots invariants symbolically.',
        citation:
            'connected sum is defined by removing an arc from each knot and gluing along the cut; the bridges here are a faithful geometric realisation of that gluing.',
        confidence: 'contested',
        falsifiability:
            'if the bridges introduced or removed essential crossings, the geometric loop would no longer represent K1 # K2; the construction assumes the bridges stay in a clean separating region.',
    },
    {
        id: 'unknotting-non-additive',
        statement:
            'unknotting number is not additive under connected sum. for K = T(2,7) with u(K) = 3, the sum with its mirror satisfies u(K # mirror K) at most 5, strictly less than 3 + 3 = 6. optimal untying can require first complicating the diagram.',
        citation:
            'Brittenham and Hermiller 2025 disproved additivity of the unknotting number, resolving a long-standing open question.',
        confidence: 'contested',
        falsifiability:
            'a proof that unknotting number is additive, or an independent recomputation giving u(K # mirror K) = 6 for this pair, would overturn the result.',
    },
    {
        id: 'ropelength-is-approximate',
        statement:
            'the reported ropelength is length divided by an approximate thickness, where thickness is the smallest distance between non-adjacent samples. this is a discrete proxy for the global radius of curvature and contact structure, not the true ropelength of the ideal knot.',
        citation:
            'ideal-knot ropelength minimisation (Gonzalez and Maddocks 1999) uses a global-radius-of-curvature thickness that the nearest-non-neighbour distance only approximates.',
        confidence: 'speculative',
        falsifiability:
            'a finer sampling or a true tube-radius computation that gives a materially different ropelength would show the proxy is too coarse for quantitative claims.',
    },
    {
        id: 'tighten-is-heuristic',
        statement:
            'the tighten operation applies laplacian smoothing plus pairwise repulsion and renormalisation. it relaxes the curve toward a tidier configuration but is not a validated ropelength minimiser and can change the apparent diagram without guaranteeing a lower-energy state.',
        citation:
            'modelling choice; genuine ropelength minimisation uses constrained gradient flow with self-contact handling, which this simplified relaxation omits.',
        confidence: 'speculative',
        falsifiability:
            'if tightening ever pushed the curve through itself (a forbidden self-intersection) it would change the knot type, which the heuristic does not strictly prevent at large step sizes.',
    },
];
