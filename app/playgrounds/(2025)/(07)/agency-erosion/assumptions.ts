import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'effort-allocation',
        statement:
            'each agent splits effort between agency-building and symbolic signaling in proportion to the marginal returns of each, weighted by individual tastes and exploration noise. it is a logit-style allocation, not an optimisation.',
        citation:
            'marginal-return allocation with logistic weighting; a behavioural rule, not a derived equilibrium.',
        confidence: 'contested',
        falsifiability:
            'agents who allocate effort by some non-marginal heuristic (habit, imitation) would break the proportional-allocation assumption.',
    },
    {
        id: 'coalition-fragmentation',
        statement:
            'coalition size is C = A*(1-H), where fragmentation H rises with the purity pressure created by high signaling relative to agency, and decays otherwise. the specific functional forms are stylized choices.',
        citation:
            'model definition; fragmentation as a signaling side-effect.',
        confidence: 'contested',
        falsifiability:
            'movements where signaling builds rather than fragments coalitions would contradict the assumed sign of the effect.',
    },
    {
        id: 'emancipatory-vs-anesthetic',
        statement:
            'a rise in signaling is classed as emancipatory when the composite mobilization score also rises, and anesthetic when it falls. this is a definitional threshold on model quantities, not an empirical diagnosis.',
        citation:
            'phase classification defined on the composite mobilization score.',
        confidence: 'speculative',
        falsifiability:
            'the labels depend on a chosen threshold and weighting; different weights reclassify the same trajectory.',
    },
    {
        id: 'stochastic-single-sample',
        statement:
            'agent preferences are random, agents add exploration noise, and the outcome is a Bernoulli draw on the success probability, so each run differs and the on-screen metrics are single-sample estimates, not expectations.',
        citation:
            'use of Math.random for preferences, noise, and the outcome draw.',
        confidence: 'established',
        falsifiability:
            'running the same parameters repeatedly yields different trajectories, which is why the calibration targets the deterministic core only.',
    },
    {
        id: 'deterministic-core',
        statement:
            'underneath the randomness sit two deterministic pieces: the logistic response used throughout, and the rolling ordinary-least-squares expectation that the substitution index is measured against. these are exact and checkable.',
        citation:
            'sigmoid and OLS rolling expectation in the logic module.',
        confidence: 'established',
        falsifiability:
            'the calibration checks both against closed-form values; a mismatch would be an implementation error.',
    },
    {
        id: 'stylized-social-model',
        statement:
            'parameters are illustrative and the model is a conceptual account of when symbolic signaling substitutes for agency-building, not an empirical model of any specific movement.',
        citation:
            'stated scope; a stylized social-dynamics sandbox.',
        confidence: 'speculative',
        falsifiability:
            'empirical movement data could place real cases outside the regimes the model produces.',
    },
];
