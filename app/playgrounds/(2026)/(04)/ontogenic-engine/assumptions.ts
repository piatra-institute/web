import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'autopoietic-closure',
        statement: 'Entityhood requires operational closure: the system must regenerate the components and relations that constitute it.',
        citation: 'Maturana & Varela, 1980 — Autopoiesis and Cognition: The Realization of the Living',
        confidence: 'established',
        falsifiability: 'A system that persists as an identifiable entity without any self-production would refute this. Crystals and vortices present borderline cases.',
    },
    {
        id: 'simondon-individuation',
        statement: 'Individuation is an ongoing process, not a terminal state. The entity is constituted by the process of becoming, not prior to it.',
        citation: 'Simondon, 1958 — L\'individuation à la lumière des notions de forme et d\'information',
        confidence: 'established',
        falsifiability: 'If all entities could be fully specified by their initial conditions without reference to their process of formation, the ontogenetic framing would be unnecessary.',
    },
    {
        id: 'markov-blanket-boundary',
        statement: 'The self/world distinction is modeled as a boundary integrity parameter analogous to a Markov blanket separating internal from external states.',
        citation: 'Friston, 2013 — Life as we know it; Kirchhoff et al., 2018 — The Markov blankets of life',
        confidence: 'contested',
        falsifiability: 'The Markov blanket interpretation is debated. If boundaries in living systems are shown to be non-statistical (e.g., purely physical membranes without informational role), the analogy weakens.',
    },
    {
        id: 'five-variable-reduction',
        statement: 'The five dynamic variables (viability, coherence, novelty, tension, boundary flux) are sufficient to capture the essential dynamics of individuation.',
        citation: 'Heuristic reduction for pedagogical purposes; inspired by Di Paolo, 2005 — Autopoiesis, adaptivity, teleology, agency',
        confidence: 'speculative',
        falsifiability: 'Real individuation involves vastly more dimensions. If critical phenomena (e.g., symmetry breaking, memory consolidation) cannot be captured in five variables, the reduction fails.',
    },
    {
        id: 'becoming-index-composite',
        statement: 'The becoming index is a weighted linear combination of viability, coherence, novelty, boundary moderation, and low tension.',
        citation: 'No direct precedent; composite inspired by Barandiaran et al., 2009 — Defining Agency',
        confidence: 'speculative',
        falsifiability: 'If becoming is better captured by a nonlinear interaction (e.g., a threshold phenomenon requiring all loops simultaneously), the linear composite would misrank parameter regimes.',
    },
    {
        id: 'enactive-coupling',
        statement: 'The system maintains itself through active engagement with the environment (sensorimotor coupling), not through passive isolation.',
        citation: 'Varela, Thompson & Rosch, 1991 — The Embodied Mind; Thompson, 2007 — Mind in Life',
        confidence: 'established',
        falsifiability: 'A system that achieves genuine autonomy through complete environmental isolation (zero coupling) would challenge the enactive requirement for world-engagement.',
    },
    {
        id: 'memory-plasticity-tradeoff',
        statement: 'Memory (structural retention) trades off against plasticity (reorganization capacity). High memory with low plasticity leads to rigid closure.',
        citation: 'Abraham & Robins, 2005 — Memory retention — the synaptic stability versus plasticity dilemma; biological stability-plasticity dilemma',
        confidence: 'established',
        falsifiability: 'If biological systems are found to achieve high retention and high plasticity simultaneously without any tradeoff mechanism (e.g., complementary learning systems), the simple tradeoff model is wrong.',
    },
    {
        id: 'metastability-regime',
        statement: 'The most interesting regime for individuation is metastable: stable enough to persist, unstable enough to transform.',
        citation: 'Kelso, 1995 — Dynamic Patterns; Tognoli & Kelso, 2014 — The metastable brain',
        confidence: 'established',
        falsifiability: 'If individuation is shown to occur optimally at strict equilibrium rather than far-from-equilibrium metastability, this assumption fails.',
    },
];
