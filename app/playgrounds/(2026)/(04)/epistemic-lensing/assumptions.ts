import { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'markov-blanket',
        statement: 'Agents interact with the world only through a Markov blanket: sensory and active states that mediate all information exchange.',
        citation: 'Pearl, 1988; Friston, 2013 — Markov blanket formalism in active inference',
        confidence: 'established',
        falsifiability: 'An agent that updates beliefs based on information that bypasses all sensory channels.',
    },
    {
        id: 'bayesian-benchmark',
        statement: 'A well-calibrated Bayesian updater serves as the benchmark for undistorted inference.',
        citation: 'Jaynes, 2003 — maximum entropy as rational inference; Cox, 1961 — probability as logic',
        confidence: 'established',
        falsifiability: 'A systematic decision procedure that outperforms Bayesian updating on calibration across all domains.',
    },
    {
        id: 'relative-fidelity',
        statement: 'Distortion is measured relative to a higher-fidelity channel, not against unmediated access to the world state.',
        citation: 'Framework design choice following Shannon, 1948 — channel capacity is always relative to a reference',
        confidence: 'established',
        falsifiability: 'Not falsifiable per se — this is a methodological commitment, not an empirical claim.',
    },
    {
        id: 'operator-decomposition',
        statement: 'Any real mediating channel can be decomposed into five elementary operations: attenuation, selection, warping, amplification, and recursion.',
        citation: 'Novel taxonomy; closest precedent in Shannon channel models and media effects typologies (McQuail, 2010)',
        confidence: 'speculative',
        falsifiability: 'A real-world channel distortion that cannot be expressed as a composition of these five operators.',
    },
    {
        id: 'systematic-distortion',
        statement: 'Epistemic lensing requires systematic (structured) deformation, not merely random noise.',
        citation: 'Lewandowsky et al., 2012 — misinformation effects are directional, not random',
        confidence: 'established',
        falsifiability: 'A population-level belief distortion that arises purely from unstructured noise with no directional component.',
    },
    {
        id: 'hysteresis-persistence',
        statement: 'Corrective evidence may fail to fully undo accumulated distortion due to path dependence in belief updating.',
        citation: 'Lewandowsky et al., 2012; Walter et al., 2020 — continued influence effect; fact-checking meta-analysis',
        confidence: 'established',
        falsifiability: 'A correction intervention that reliably reduces posterior divergence to zero regardless of prior distortion history.',
    },
    {
        id: 'gaussian-world',
        statement: 'The toy model uses a Gaussian random walk for the world state. Real-world states may have non-Gaussian dynamics.',
        citation: 'Modeling simplification; Mandelbrot, 1963 — many real-world processes have fat-tailed distributions',
        confidence: 'contested',
        falsifiability: 'The qualitative results (ignorance vs. distortion distinction, hysteresis patterns) change fundamentally under non-Gaussian world dynamics.',
    },
    {
        id: 'motivated-reasoning',
        statement: 'Agents may downweight evidence inconsistent with their current beliefs, modeled as a consistency-dependent learning rate.',
        citation: 'Kunda, 1990 — motivated reasoning; Kahan et al., 2017 — identity-protective cognition',
        confidence: 'established',
        falsifiability: 'Experimental evidence that humans process confirming and disconfirming evidence with equal weight regardless of identity relevance.',
    },
];
