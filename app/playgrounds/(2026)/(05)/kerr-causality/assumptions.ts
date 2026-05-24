import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'maximal-extension',
        statement:
            'the diagram shows the maximally extended exact Kerr solution, including the inner sheets, the second exterior copy, and the formal continuation across both horizons.',
        citation:
            'after Carter, global structure of the Kerr family (1968); Hawking and Ellis, the large scale structure of space-time (1973), chapter 5.',
        confidence: 'established',
        falsifiability:
            'this is a mathematical fact about the Kerr metric. it is falsified only by a derivation showing the extension is not unique or analytically continuable.',
    },
    {
        id: 'inner-horizon-instability',
        statement:
            'real rotating black holes are not expected to have a clean traversable inner-horizon structure: infalling radiation is infinitely blueshifted in the classical model, producing mass inflation and a singularity at r-.',
        citation:
            'after Poisson and Israel, internal structure of black holes (1990); Ori, structure of singularities inside realistic rotating black holes (1992).',
        confidence: 'established',
        falsifiability:
            'evidence that the Cauchy horizon survives perturbations in a fully nonlinear collapse calculation would weaken this. the playground treats the inner-horizon corridors as idealised.',
    },
    {
        id: 'test-particle',
        statement:
            'the photon is a test particle: it follows a null geodesic of the background Kerr metric and does not backreact on the geometry.',
        citation:
            'standard Kerr geodesic literature; Carter (1968); Chandrasekhar (1983).',
        confidence: 'established',
        falsifiability:
            'a regime where the photon stress-energy non-negligibly perturbs r+ or r- on a single bounce would falsify the test-particle assumption.',
    },
    {
        id: 'zero-energy-closed-form',
        statement:
            'for E = 0 the turning points are given exactly by r_{min,max} = M -/+ sqrt(M^2 - a^2 Q / (Q + L^2)) whenever the radicand is non-negative.',
        citation:
            'direct algebraic identity from R(r) = a^2 L^2 - Delta (Q + L^2) when E = 0.',
        confidence: 'established',
        falsifiability:
            'falsified only by an algebra error in the derivation. the calibration table treats this row as a numerical regression check on the root-finder.',
    },
    {
        id: 'topological-tiling',
        statement:
            'the Carter-Penrose tile diagram is a topological schematic of the causal sectors, not a metric-accurate embedding. distances between tiles do not reflect proper distance.',
        citation:
            'after Penrose, conformal treatment of infinity (1964); Hawking and Ellis (1973).',
        confidence: 'established',
        falsifiability:
            'this is a definitional commitment about the diagram, not a physical claim. the playground restates it in the subtitle and outro.',
    },
    {
        id: 'unit-choice',
        statement:
            'units are chosen so that M = 1. all lengths and the spin a are expressed in units of M.',
        citation: 'standard convention in general relativity texts.',
        confidence: 'established',
        falsifiability:
            'this is a choice of units. results scale trivially with M and are not affected by the choice.',
    },
    {
        id: 'root-finder',
        statement:
            'roots of R(r) over [-1.6, 3.8] are located by 1200-sample sign-change detection followed by bisection to ~12 digits. roots outside this range are not modelled.',
        citation: 'standard numerical method; bisection is unconditionally convergent on monotone sign changes.',
        confidence: 'established',
        falsifiability:
            'a case where two real roots of R(r) lie within ~1.6/1200 of each other would be missed by the sampling. the calibration table flags any sub-percent disagreement with closed-form expected values.',
    },
    {
        id: 'carter-separability',
        statement:
            'the Carter constant Q is a true constant of motion: the Hamilton-Jacobi equation in Kerr separates, so each null geodesic carries three independent conserved quantities E, L, Q.',
        citation:
            'Carter, Hamilton-Jacobi and Schrodinger separable solutions of Einstein\'s equations (1968).',
        confidence: 'established',
        falsifiability:
            'a counterexample to separability in the Kerr metric would falsify the very setup of the playground.',
    },
    {
        id: 'regime-classification',
        statement:
            'the four-tier regime classification (unbounded escape, captured outside, trapped across horizons, trapped inside r-) is a coarse summary of the orbit. mixed cases are mapped to the closest tier rather than introducing further subdivisions.',
        citation: 'a modelling choice for legibility; standard Kerr orbit taxonomies are richer.',
        confidence: 'speculative',
        falsifiability:
            'a worked example where two visibly different orbit families end up in the same tier with no useful distinction would motivate a finer classification.',
    },
    {
        id: 'astrophysical-realism',
        statement:
            'astrophysical Kerr black holes are not test geometries: accretion flows, magnetic fields, and radiation backreaction all matter. the playground is a clean-room study of the vacuum Kerr metric.',
        citation:
            'after Frolov and Novikov, black hole physics (1998); standard reviews of accreting Kerr models.',
        confidence: 'established',
        falsifiability:
            'this is a scoping commitment, not a physical claim about real holes. the outro repeats it.',
    },
];
