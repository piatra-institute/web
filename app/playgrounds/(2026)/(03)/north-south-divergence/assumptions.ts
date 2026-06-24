import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'accelerants-are-scores',
        statement:
            'each of the nine accelerants (energy, institutions, state capacity, human capital, innovation, finance, trade, empire, geography) is reduced to a single value in [0, 1] per region per time bin. a whole bundle of historical processes becomes one number.',
        citation:
            'this is a deliberate modelling reduction in the tradition of unified-growth and proximate-versus-fundamental cause accounts (Galor; Acemoglu, Johnson and Robinson).',
        confidence: 'contested',
        falsifiability:
            'if two regions with identical accelerant scores in this scheme had very different growth outcomes, the chosen factor set would be missing something load-bearing.',
    },
    {
        id: 'values-are-illustrative',
        statement:
            'the default North and South values across the ten time bins are hand-set illustrative estimates, not reconstructed data. they encode a stylised story (near-parity before 1750, a widening gap through the industrial era, partial catch-up after 1950) rather than measured series.',
        citation:
            'the stylised trajectory follows long-run GDP reconstructions such as the Maddison Project; the specific numbers here are placeholders the user is meant to override.',
        confidence: 'speculative',
        falsifiability:
            'replacing the defaults with fitted Maddison-style per-capita series would change every chart; any quantitative claim that depends on the exact defaults is not robust.',
    },
    {
        id: 'aggregator-choice',
        statement:
            'the composite region score is one of three aggregators: additive (perfect substitutes), multiplicative or Cobb-Douglas (unit elasticity, weakest factors drag the product down), or CES (a tunable elasticity that nests both). the chosen aggregator is a hypothesis about how factors combine, not a fact.',
        citation:
            'constant-elasticity-of-substitution production functions; Arrow, Chenery, Minhas and Solow 1961. the additive and Cobb-Douglas forms are the rho = 1 and rho to 0 limits.',
        confidence: 'established',
        falsifiability:
            'the calibration verifies these limit identities hold exactly; if a future edit broke the CES nesting, the rho = 1 and rho to 0 calibration rows would diverge.',
    },
    {
        id: 'weights-renormalise',
        statement:
            'accelerant weights are renormalised to sum to one before scoring, so the composite is a proper weighted mean. the lock-weight-sum control keeps this invariant when a user drags a single slider.',
        citation:
            'standard index-construction practice; the additive normalisation identity in the calibration confirms a constant input returns that constant.',
        confidence: 'established',
        falsifiability:
            'if weights were not renormalised, the additive score of an all-0.5 input would drift away from 0.5; the calibration pins this to zero error.',
    },
    {
        id: 'shapley-is-model-conditioned',
        statement:
            'the Shapley attribution splits the gap among accelerants fairly given the chosen aggregator, but the split is conditional on that aggregator. switching from additive to CES changes which factor gets the most credit, because factor interactions change.',
        citation:
            'Shapley 1953, cooperative game theory; the marginal-contribution-over-all-orderings value is unique only once the characteristic function v (here, the gap under a fixed model) is fixed.',
        confidence: 'established',
        falsifiability:
            'there is no model-free credit split: if changing only the aggregator reorders the attribution bars, then no single ordering is the true cause decomposition.',
    },
    {
        id: 'monte-carlo-approximation',
        statement:
            'the Shapley values are estimated by sampling random permutations (default 200) rather than enumerating all 9! orderings. a fixed deterministic seed per bin makes the result reproducible but still approximate.',
        citation:
            'Castro, Gomez and Tejada 2009 on polynomial Monte Carlo estimation of Shapley values; exact enumeration is factorial in the number of players.',
        confidence: 'established',
        falsifiability:
            'attribution bars shift slightly as the sample count changes; only the deterministic aggregation core, not the sampled attribution, is checked in the calibration panel.',
    },
];
