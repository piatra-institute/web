import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'efe-decomposition',
        statement:
            'expected free energy decomposes into a pragmatic term (risk: divergence of predicted outcomes from preferences) and an epistemic term (ambiguity: expected uncertainty about observations given states). minimising G trades goal-seeking against information gain.',
        citation:
            'Friston et al. 2015, Active Inference and Epistemic Value; Parr, Pezzulo and Friston 2022, Active Inference (MIT Press).',
        confidence: 'established',
        falsifiability:
            'an agent that consistently selects policies neither reducing expected divergence nor expected uncertainty would not be minimising any free-energy functional of this form.',
    },
    {
        id: 'gaussian-linear',
        statement:
            'this playground uses a linear-Gaussian generative model: a zero-drift random walk for the hidden state and additive Gaussian observation noise. that makes risk a sum of squared deviations and ambiguity a constant per-step differential entropy.',
        citation:
            'standard linear-Gaussian state-space assumption; the Laplace and Gaussian forms underlie most analytic active-inference results.',
        confidence: 'contested',
        falsifiability:
            'real perception is non-linear and non-Gaussian; a task whose statistics are heavy-tailed or multimodal would not be captured by these closed forms.',
    },
    {
        id: 'monte-carlo-estimator',
        statement:
            'the live EFE shown on the canvas is a Monte Carlo estimate over sampled trajectories, not an exact integral. its value has sampling variance that shrinks as the number of samples grows.',
        citation:
            'standard Monte Carlo estimation of path integrals; variance scales as 1/N for N independent samples.',
        confidence: 'established',
        falsifiability:
            'increasing the sample count should reduce run-to-run variation toward the closed-form value; if it did not, the estimator would be biased rather than merely noisy.',
    },
    {
        id: 'policy-softmax',
        statement:
            'policies are selected by a softmax of their negative expected free energies, sigma(-gamma G). the precision gamma controls how sharply the agent commits to the lowest-G policy.',
        citation:
            'Friston et al. 2017, Active Inference: A Process Theory; the precision-weighted policy prior.',
        confidence: 'established',
        falsifiability:
            'an agent whose action probabilities are not monotone in -G, or are insensitive to precision, would not be using a softmax policy rule.',
    },
    {
        id: 'preferences-as-prior',
        statement:
            'goals are encoded as a prior preference over outcomes (here a narrow Gaussian about the goal state), not as an external reward. value is the log of this preference, so the agent is reward-free in the reinforcement-learning sense.',
        citation:
            'Friston, Daunizeau and Kiebel 2009; preferences as the parameters of C in the active-inference generative model.',
        confidence: 'contested',
        falsifiability:
            'behaviour that requires a scalar reward signal irreducible to a prior over outcomes would resist the preference-as-prior framing.',
    },
    {
        id: 'efe-vs-kl',
        statement:
            'expected free energy is not the same object as a single KL divergence. the canvas contrasts the two: KL measures divergence between distributions, while EFE adds an ambiguity (expected-entropy) term that rewards information-seeking exploration.',
        citation:
            'the epistemic-value decomposition distinguishes EFE from variational free energy and from raw KL; Schwartenbeck et al. 2019 on exploration.',
        confidence: 'established',
        falsifiability:
            'if removing the ambiguity term left behaviour unchanged across all tasks, the epistemic component would be doing no work and EFE would reduce to risk alone.',
    },
];
