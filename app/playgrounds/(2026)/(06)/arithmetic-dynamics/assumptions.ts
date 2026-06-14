import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'tissue-as-network',
        statement:
            'a tissue is modelled as a grid of cells with a continuous internal state u_i and output y_i = tanh(g u_i), coupled by a low-rank associative memory plus local diffusion. this is a continuous Hopfield / Cohen-Grossberg network used as a developmental attractor model.',
        citation:
            'Hopfield 1984 (continuous model); Cohen and Grossberg 1983; the 2D-grid bioelectric framing follows Levin-lab "tissue as distributed connectionist computer".',
        confidence: 'contested',
        falsifiability:
            'real tissues add mechanics, gene regulation, and electrophysiology this two-field model omits; a regulatory behaviour that no attractor network can express would break the analogy.',
    },
    {
        id: 'symmetric-coupling',
        statement:
            'the stored memory uses symmetric, orthonormalised templates, so the deterministic dynamics descend a Lyapunov energy and settle into fixed points (attractors). this is what makes "stored morphology = energy minimum" exact in the toy.',
        citation:
            'Hopfield 1984: a symmetric interaction matrix guarantees an energy function; orthogonalised storage is the classic crosstalk-free variant.',
        confidence: 'established',
        falsifiability:
            'asymmetric or non-normal coupling can produce limit cycles or chaos with no global energy; the clean basin picture is a property of the symmetric choice, not a theorem about tissues.',
    },
    {
        id: 'attractor-not-orbit',
        statement:
            'the "orbit" of arithmetic dynamics and the "attractor" of this tissue are analogous but not identical objects. arithmetic periodic and preperiodic points are exact, discrete, and noise-free; biological attractors are approximate, dissipative, history-sensitive, and only metastable.',
        citation:
            'Silverman, The Arithmetic of Dynamical Systems: "no precise dictionary" between iteration and arithmetic geometry; the analogy is a source of structure, not a derivation.',
        confidence: 'established',
        falsifiability:
            'treating the recovered morphology as an exact periodic point would predict perfect, noise-free repetition; the noise slider shows the basin is only metastable.',
    },
    {
        id: 'low-rank-memory',
        statement:
            'memory is stored at low rank: the field is pulled toward the span of three fixed templates by the term alpha * sum_k p_k <p_k, y>. there is no full N-by-N weight matrix and no learned synapse-level structure.',
        citation:
            'standard low-rank / projection associative memory. a modelling simplification for legibility.',
        confidence: 'contested',
        falsifiability:
            'a morphology outside the stored subspace cannot be recalled; a tissue that regenerates forms it was never "shown" would need a richer memory than this projector.',
    },
    {
        id: 'hebbian-imprint',
        statement:
            'the "imprint" action overwrites a template with the current stabilised output, a one-shot Hebbian write. it stands in for Watson-style evolutionary learning, where selection slowly reshapes the network so past targets become developmental attractors.',
        citation:
            'Watson and Szathmary, How can evolution learn? (TREE 2016): gene-regulatory networks accumulate associative memories of past selection.',
        confidence: 'contested',
        falsifiability:
            'real Hebbian / evolutionary imprinting is incremental and selection-gated; the instant overwrite here is a caricature of a slow process, and over-imprinting can corrupt the stored set.',
    },
    {
        id: 'regeneration-is-recovery',
        statement:
            'regeneration is modelled as relaxation: a lesion pushes the state up an energy hill and the memory pulls it back down into the same basin. the calibration panel measures this as repair fidelity against the intact form.',
        citation:
            'Levin 2018 review on planarian anatomical homeostasis and target morphology; bioelectric pattern memory as a stored setpoint.',
        confidence: 'contested',
        falsifiability:
            'the rigid (low-diffusion) calibration case shows repair failing and leaving a scar, so "always regenerates" is already false in part of the parameter space.',
    },
    {
        id: 'platonic-ontology-excluded',
        statement:
            'the playground deliberately does not model Levin\'s stronger "Platonic space" proposal, in which bodies ingress pre-existing non-physical forms. it shows shared dynamical structure (orbits, basins, memory) without asserting access to a Platonic realm.',
        citation:
            'Levin 2025 calls the Platonic-space proposal "speculative, very much in flux"; the deep-research companion downgrades ontology and upgrades mechanism.',
        confidence: 'speculative',
        falsifiability:
            'the Platonic claim is a metaphysical interpretation, not an output of this model; nothing here tests or assumes it.',
    },
    {
        id: 'alternatives-exist',
        statement:
            'attractor language is one lens, not the only one. positional information, reaction-diffusion, and mechanochemical morphogenesis already explain much spatial patterning without invoking stored memories.',
        citation:
            'mainstream developmental theory (positional information, Turing patterns); a 2025 Development primer treats attractors, basins, and hysteresis as standard tools alongside these.',
        confidence: 'established',
        falsifiability:
            'where a reaction-diffusion or positional-information account fits the data better, the associative-memory framing is the weaker explanation for that case.',
    },
    {
        id: 'single-sample-toy',
        statement:
            'the live grid is a single stochastic run on a 48-by-30 lattice with hand-chosen templates and weights. it is a transparent sandbox for the shared attractor logic, not a validated regenerative simulator.',
        citation:
            'modelling choice. the deep-research companion frames such models as tools for hypothesis generation, not total models of tissue.',
        confidence: 'established',
        falsifiability:
            'quantitative claims would require ensemble runs, real morphologies, and fitted parameters; the qualitative basin / recovery story is what the toy supports.',
    },
];
