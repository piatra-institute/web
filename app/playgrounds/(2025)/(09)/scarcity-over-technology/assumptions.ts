import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'scarcity-as-dual',
        statement:
            'scarcity is the dual multiplier (shadow price) on the binding resource constraint: it measures how much welfare one more unit of capacity would unlock. when the constraint stops binding, the multiplier goes to zero, the resource becomes like air.',
        citation:
            'Lagrangian duality / shadow prices in constrained optimization; standard microeconomic treatment of scarcity.',
        confidence: 'established',
        falsifiability:
            'the calibration checks scarcity = N / binding capacity; a value that did not track the binding constraint would contradict the dual interpretation.',
    },
    {
        id: 'power-law-capacity',
        statement:
            'technology produces capacity as a power law, (1 - friction) * C0 * T^k, so the efficacy exponent k sets diminishing or increasing returns and friction skims off a fixed fraction.',
        citation:
            'power-law production function; a stylized returns-to-technology form.',
        confidence: 'contested',
        falsifiability:
            'real technological capacity may saturate or jump discontinuously rather than follow a clean power law.',
    },
    {
        id: 'attention-ceiling',
        statement:
            'an optional attention ceiling caps usable capacity regardless of how much is produced. when it binds, scarcity equals users over the ceiling and is completely independent of technology, the central claim that some scarcities cannot be engineered away.',
        citation:
            'attention as a hard, non-multipliable resource (Simon\'s "attention economy").',
        confidence: 'contested',
        falsifiability:
            'the calibration shows a ten-fold technology increase leaving scarcity unchanged once the ceiling binds; if technology could raise the ceiling, the claim would weaken.',
    },
    {
        id: 'log-utility',
        statement:
            'welfare is a log-utility sum, N * log(allocation), so equal proportional gains matter equally and welfare diverges to minus infinity as the per-capita allocation goes to zero.',
        citation:
            'logarithmic (Bernoulli) utility; a standard concave welfare form.',
        confidence: 'contested',
        falsifiability:
            'a different utility curvature would change the welfare verdict on the same allocations.',
    },
    {
        id: 'corruption-friction-exogenous',
        statement:
            'friction and corruption are fixed fractions that remove capacity exogenously; they do not respond to scarcity, technology, or welfare.',
        citation:
            'modelling simplification; both are constant skims in the model.',
        confidence: 'contested',
        falsifiability:
            'endogenous corruption that grows with the value of the resource would create feedback the model omits.',
    },
    {
        id: 'stylized-not-empirical',
        statement:
            'parameters are illustrative and the model is a conceptual argument that artificially maintained scarcity is political, not technical, not an empirical model of any specific market or resource.',
        citation:
            'stated scope; a stylized political-economy sandbox.',
        confidence: 'speculative',
        falsifiability:
            'fitting the model to a real resource would test whether the scarcity it predicts matches observed prices.',
    },
];
