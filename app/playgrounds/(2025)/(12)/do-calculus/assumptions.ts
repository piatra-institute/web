import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'no-unmeasured-confounders',
        statement:
            'for the backdoor estimand to equal the true causal effect, the adjustment set must block every backdoor path and leave no unmeasured common cause of X and Y. in the confounder template the single variable U is exactly that sufficient set; the moment a confounder is hidden, P(Y|do(X)) is no longer identified from observation alone. this causal-sufficiency assumption is the crux of the whole method.',
        citation:
            'Pearl 2009, Causality (2nd ed.), backdoor criterion; the unconfoundedness / ignorability condition.',
        confidence: 'contested',
        falsifiability:
            'switch the confounder node to hidden: the adjustment formula now conditions on an incomplete set and the estimate diverges from the interventional truth, which no amount of data can fix.',
    },
    {
        id: 'do-is-graph-surgery',
        statement:
            'an intervention do(X=x) is modelled as graph surgery: the structural equation for X is replaced by the constant x and all incoming edges to X are deleted, while every other mechanism is left untouched (the modularity / autonomy assumption).',
        citation:
            'Pearl 2009, the truncated factorization / manipulation theorem; Spirtes, Glymour and Scheines 2000.',
        confidence: 'established',
        falsifiability:
            'if setting X also perturbs the mechanisms of other variables (a fat-hand intervention), edge deletion is the wrong model and the predicted post-intervention distribution will not match a real manipulation.',
    },
    {
        id: 'observation-vs-intervention',
        statement:
            'observing X=x and setting do(X=x) are different operations: P(Y|X=x) reweights the confounder by the X-conditioned posterior, while P(Y|do(X=x)) reweights by the prior P(U). they coincide only when X has no open backdoor path.',
        citation:
            'Pearl 2009; the seeing-versus-doing distinction is the foundational motivation for the do-operator.',
        confidence: 'established',
        falsifiability:
            'the no-confounder calibration case shows the two becoming equal when U stops affecting X; any persistent gap there would contradict the closed-form identity.',
    },
    {
        id: 'binary-discrete-cpts',
        statement:
            'the calibration model is fully discrete: U, X and Y are binary and every mechanism is a small conditional probability table. this makes the adjustment formula a finite sum that can be checked by hand, at the cost of ignoring continuous, time-varying, or high-cardinality causes.',
        citation:
            'standard discrete Bayesian-network practice; a deliberate legibility choice for the playground.',
        confidence: 'established',
        falsifiability:
            'continuous or feedback-laden systems need integrals or structural equations the table cannot express; the closed-form check is exact only for this finite model.',
    },
    {
        id: 'acyclic-graph',
        statement:
            'the causal diagram is a directed acyclic graph: no variable is its own ancestor, so the joint factorizes as a product of parent-conditioned mechanisms and the backdoor criterion is well defined. the spiking simulation evades cycles only by introducing time delays.',
        citation:
            'Pearl 2009; Spirtes, Glymour and Scheines 2000, the causal Markov condition on a DAG.',
        confidence: 'contested',
        falsifiability:
            'instantaneous mutual causation (a true cycle at one time slice) breaks acyclicity; the delay trick in the simulation is an admission that real feedback needs an unrolled time graph.',
    },
    {
        id: 'spiking-sim-is-illustrative',
        statement:
            'the live spike-based simulation is a stochastic Poisson-style sandbox for intuition, not the object being calibrated. its do-effects, transfer entropy and Granger numbers are sampled and will vary run to run; only the deterministic discrete backdoor model carries the verifiable claims.',
        citation:
            'modelling choice; transfer entropy after Schreiber 2000 and Granger 1969 are predictive, not interventional, measures.',
        confidence: 'speculative',
        falsifiability:
            'reading a single noisy simulation run as an exact causal effect would over-claim; the panel deliberately calibrates the closed-form arithmetic instead, and the sampled estimates are expected to wobble.',
    },
];
