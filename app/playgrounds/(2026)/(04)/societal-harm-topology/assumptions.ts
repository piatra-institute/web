import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'counterfactual-baseline',
        statement: 'Harm is measured as the difference between actual social state and a counterfactual state without the actor\'s intervention. The counterfactual is "median-firm behavior" — not removal of all economic activity.',
        citation: 'Pearl, 2009 — Causality: Models, Reasoning, and Inference',
        confidence: 'established',
        falsifiability: 'If no coherent counterfactual can be constructed for a given sector (e.g., due to path dependence), the framework breaks down for that sector.',
    },
    {
        id: 'capability-approach',
        statement: 'The 8-dimensional harm vector is grounded in the capability approach: harm is degradation of what people can do, become, and avoid — not just utility loss.',
        citation: 'Sen, 1999 — Development as Freedom; Nussbaum, 2011 — Creating Capabilities',
        confidence: 'established',
        falsifiability: 'If a harm type exists that cannot be captured by any of the 8 dimensions (life, health, material, agency, political, ecological, epistemic, tail risk), the vector space is incomplete.',
    },
    {
        id: 'cosine-coherence',
        statement: 'Sheaf consistency is approximated by average pairwise cosine similarity of sector harm profiles. This is a heuristic for the Čech-style cohomological obstruction that would appear in a full sheaf-theoretic treatment.',
        citation: 'Curry, 2014 — Sheaves, Cosheaves and Applications',
        confidence: 'speculative',
        falsifiability: 'If two sectors with very different harm profiles are genuinely compatible (e.g., due to complementary rather than contradictory effects), cosine similarity underestimates coherence.',
    },
    {
        id: 'linear-aggregation',
        statement: 'The global harm vector is the sum of local sector vectors. This assumes local harms are additive across sectors, ignoring synergistic or cancelling cross-sector interactions.',
        citation: 'Decancq & Lugo, 2013 — Weights in Multidimensional Indices of Wellbeing',
        confidence: 'contested',
        falsifiability: 'If cross-sector interactions are large (e.g., housing extraction amplifies labor harm multiplicatively), additive aggregation underestimates true harm.',
    },
    {
        id: 'power-scaling',
        statement: 'Actor power enters as a multiplicative factor on all sector harms: powerFactor = 0.55 + actorPower/100. This captures concentration but not the structural position of the actor in the network.',
        citation: 'Vitali, Glattfelder & Battiston, 2011 — The Network of Global Corporate Control',
        confidence: 'contested',
        falsifiability: 'If an actor with low nominal power occupies a critical structural position (e.g., a ratings agency), the linear power model underpredicts their harm.',
    },
    {
        id: 'moral-weights',
        statement: 'There is no morally neutral weighting of harm dimensions. The default weights embed a specific ethical position. Different ethical frameworks (utilitarian, Rawlsian, capabilities-based) would yield different weights.',
        citation: 'Rawls, 1971 — A Theory of Justice; Sen, 1985 — Commodities and Capabilities',
        confidence: 'established',
        falsifiability: 'Not falsifiable — this is an axiom of the framework. The model is transparent about this.',
    },
    {
        id: 'tail-risk-future',
        statement: 'Tail risk, ecological damage, and political capture are "future-sensitive" — they receive additional weighting via the futureWeight parameter because their consequences extend intergenerationally.',
        citation: 'Stern, 2006 — The Economics of Climate Change; Weitzman, 2009 — On Modeling and Interpreting the Economics of Catastrophic Climate Change',
        confidence: 'contested',
        falsifiability: 'If future generations develop technologies that neutralize present ecological damage, the extra weighting overestimates long-run harm.',
    },
    {
        id: 'scalar-derived-last',
        statement: 'A single scalar index is derived only after vector aggregation, repair adjustment, temporal weighting, and obstruction correction. It is a policy-facing summary, not the primary truth object.',
        citation: 'Alkire & Foster, 2011 — Counting and Multidimensional Poverty Measurement',
        confidence: 'established',
        falsifiability: 'If decision-makers require a single number and treat it as authoritative regardless of the underlying vector, the framework\'s philosophical design is undermined in practice.',
    },
];
