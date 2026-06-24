import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'branching-ratio-is-sigma',
        statement:
            'activity propagates as a Galton-Watson branching process: each active site independently activates a successor with probability sigma, so the mean number of descendants per site (the branching ratio) is exactly sigma. The process is critical when sigma = 1.',
        citation:
            'Harris, The Theory of Branching Processes (1963); Beggs and Plenz 2003 first measured a branching ratio near 1 in cortical avalanches.',
        confidence: 'established',
        falsifiability:
            'this is an exact property of the model. It fails as a description of real data if measured offspring counts depend on history or on the number of currently active sites, i.e. if the process is not memoryless.',
    },
    {
        id: 'mean-size-closed-form',
        statement:
            'for a subcritical run the expected total avalanche size is 1/(1 - sigma), diverging as sigma approaches 1. This is the exact total-progeny mean of the branching process and is what the simulated mean converges to.',
        citation:
            'standard Galton-Watson total-progeny result; see Harris (1963), or Otter 1949 for the progeny distribution.',
        confidence: 'established',
        falsifiability:
            'a finite mean above the critical point, or a sampled mean that does not approach 1/(1 - sigma) as trials increase, would contradict the closed form.',
    },
    {
        id: 'critical-exponent-three-halves',
        statement:
            'at criticality the avalanche-size distribution is a power law P(s) ~ s^(-3/2). The -3/2 exponent is the mean-field branching / directed-percolation universality class, and the log-log slope estimator recovers it from an exact power law.',
        citation:
            'Zapperi, Lauritsen and Stanley 1995; Beggs and Plenz 2003 report a size exponent near -3/2 in neuronal avalanches.',
        confidence: 'established',
        falsifiability:
            'a finite-size or non-mean-field system can show a different exponent; a measured slope far from -3/2 at criticality would place the system in another universality class.',
    },
    {
        id: 'self-organized-criticality',
        statement:
            'the brain is treated as poised near sigma = 1 as a setpoint, where dynamic range, information transmission and susceptibility are jointly maximised. The slider lets the user leave that setpoint to see the regimes on either side.',
        citation:
            'Hengen and Shew 2025, "Is criticality a unified setpoint of brain function?" (Neuron); Shew and Plenz 2013 review of benefits of criticality.',
        confidence: 'contested',
        falsifiability:
            'if cortex operated reliably in a clearly sub- or super-critical regime, or if the proposed benefits did not peak at sigma = 1 in the system, the setpoint claim would fail.',
    },
    {
        id: 'bernoulli-offspring',
        statement:
            'each site produces at most one successor per step (Bernoulli 0/1 offspring), and avalanches are seeded from a single active site on an unbounded substrate with no refractory period or spatial structure.',
        citation:
            'a deliberate minimal-model choice; richer models use Poisson offspring, finite lattices, and refractoriness (e.g. the Bak-Tang-Wiesenfeld sandpile).',
        confidence: 'contested',
        falsifiability:
            'real neuronal branching has variable fan-out and spatial embedding; multi-offspring or lattice variants shift finite-size cutoffs and can change the apparent exponent.',
    },
    {
        id: 'd2-distance-interpretation',
        statement:
            'the distance-to-criticality framing (d-squared accumulated across timescale shells) is presented as an interpretation of how far a recorded system sits from sigma = 1. The live simulation does not compute d-squared; it only varies sigma directly.',
        citation:
            'Hengen-lab temporal renormalization-group methodology; the metric is summarised, not reproduced, in this toy.',
        confidence: 'speculative',
        falsifiability:
            'd-squared is a proposed analysis pipeline whose robustness across noise, subsampling and recording modality is still being established; it is descriptive context here, not an output of the model.',
    },
];
