import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'four-variable-state',
        statement:
            'a project is reduced to four scalars: maturity, community strength, funding (donations), and commercial cloud pressure. the entire licensing trajectory is treated as motion of this single point through a two-dimensional (pressure, support) phase space.',
        citation:
            'compresses the qualitative narratives of the Redis, Elastic, and MongoDB relicensing debates (2018 to 2022) into four tunable axes.',
        confidence: 'speculative',
        falsifiability:
            'governance structure, contributor concentration, vendor relationships, and legal strategy all move licensing outcomes and cannot be represented by these four numbers; a case driven by one of them would not be reconstructable here.',
    },
    {
        id: 'support-is-synergistic',
        statement:
            'support is not the sum of community and donations. it is the square root of their maturity-weighted average times a sinusoidal synergy factor, so community and funding amplify each other rather than adding linearly.',
        citation:
            'modelling choice; the synergy term encodes the intuition that funded, engaged projects compound, while the square root reflects diminishing returns.',
        confidence: 'contested',
        falsifiability:
            'the sin(pi * community * donations / 10000) synergy term is oscillatory and has no empirical basis; a monotonic real relationship between resources and resilience would contradict its wiggles.',
    },
    {
        id: 'multiplicative-resistance',
        statement:
            'community, funding, and maturity each subtract from a resistance factor, and the three factors multiply. effective pressure is raw cloud pressure times that combined resistance, then squared and rescaled.',
        citation:
            'multiplicative compounding follows the idea that a project needs all three buffers at once; the squaring sharpens the transition near the boundary.',
        confidence: 'contested',
        falsifiability:
            'if any one buffer alone (say, a single large sponsor) were sufficient to absorb pressure, an additive or max-based combination would fit better than the product used here.',
    },
    {
        id: 'saturation-ceiling',
        statement:
            'both support and pressure scores are capped at 100. real well-resourced projects therefore pile up against the support ceiling, which flattens differences between strong projects.',
        citation:
            'the Math.min(100, ...) caps in calculatePhaseCoordinates.',
        confidence: 'established',
        falsifiability:
            'the calibration shows mid-range commercial cases (Redis, Elastic, MongoDB at relicensing) all saturate to permissive, so the ceiling is a known limit, not a hidden one; the model only separates the resource extremes.',
    },
    {
        id: 'moving-boundary',
        statement:
            'the permissive-versus-restrictive boundary is not fixed. community, funding, and maturity each shift it by up to a quarter of its position, so a stronger project tolerates more pressure before the verdict flips.',
        citation:
            'the additive totalShift in determineLicenseState; intended to capture why PostgreSQL stays permissive under pressure that pushed others to relicense.',
        confidence: 'contested',
        falsifiability:
            'the shifts are bounded and symmetric by construction; a project that relicensed despite very high community and funding would sit on the wrong side of this boundary and falsify the additive form.',
    },
    {
        id: 'sandbox-is-stochastic',
        statement:
            'the play loop is a single stochastic run: cloud pressure drifts upward by a random increment each tick and shock events apply random deltas to community and funding. this part is illustrative and is excluded from calibration.',
        citation:
            'the Math.random terms in the playground simulation loop and the shock handler.',
        confidence: 'established',
        falsifiability:
            'only the deterministic core (calculatePhaseCoordinates, determineLicenseState) is verified; quantitative claims about the animated trajectory would require ensemble runs that the toy does not perform.',
    },
];
