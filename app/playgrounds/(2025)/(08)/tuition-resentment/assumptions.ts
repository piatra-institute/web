import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'dissonance-rectifier',
        statement:
            'cognitive dissonance is the rectified gap between expectation and observed quality, D = max(0, E - Q_obs). only unmet expectation generates tension; exceeding expectation produces no negative dissonance.',
        citation:
            'Festinger 1957, A Theory of Cognitive Dissonance: dissonance arises from a mismatch between an held belief and experience.',
        confidence: 'established',
        falsifiability:
            'the rectifier is exact arithmetic in the model; the empirical claim that pleasant surprise produces no measurable dissonance-like response is what could fail.',
    },
    {
        id: 'attribution-sigmoid',
        statement:
            'the attribution mixer is a logistic of three weighted drivers, lambda = sigma(theta0 + theta1*Power + theta2*Identity + theta3*SocialComparison), bounded in (0,1) and monotone increasing in each driver toward self-blame.',
        citation:
            'Weiner 1985 attribution theory; the logistic link is the standard bounded-probability form for a latent blame propensity.',
        confidence: 'contested',
        falsifiability:
            'the sigmoid shape and additive, separable drivers are a modelling choice; interaction effects or threshold (non-smooth) attribution would break the additive logistic form.',
    },
    {
        id: 'resentment-split',
        statement:
            'a single dissonance pool is split linearly by lambda into self-resentment (lambda*D) and institutional resentment ((1-lambda)*D), so the two channels always sum to the total dissonance.',
        citation:
            'internal vs external locus of attribution, after Rotter 1966; the conservation split is a modelling simplification.',
        confidence: 'contested',
        falsifiability:
            'real affect is not conserved across channels; if self-blame and institutional blame can both grow without trading off, the linear partition is wrong.',
    },
    {
        id: 'grade-inflation-signal',
        statement:
            'grade leniency raises observed quality without raising true quality, Q_obs = trueQuality + gammaG*leniency, so inflated grades mask the genuine quality students receive.',
        citation:
            'Rojstaczer and Healy 2012 on US grade inflation; grades as a quality signal decoupled from learning.',
        confidence: 'contested',
        falsifiability:
            'if higher grades reliably track higher learning, leniency would not be a pure masking term and the decoupling assumption fails.',
    },
    {
        id: 'reputation-recursion',
        statement:
            'reputation is a damped linear recurrence, R_next = clamp(rho*R + psi1*(Q_true-50) - psi2*(complaints) - psi4*penalty + placement), so quality builds reputation slowly while complaints and audit penalties erode it.',
        citation:
            'standard discrete-time reputation / goodwill dynamics; coefficients chosen for legibility rather than fitted.',
        confidence: 'speculative',
        falsifiability:
            'the specific coefficients (rho 0.9, psi weights) are unfitted; a calibration against real institutional reputation series would likely require different values or nonlinear terms.',
    },
    {
        id: 'sunk-cost-suppression',
        statement:
            'high tuition is interpreted as paradoxically suppressing complaints, because cost raises expectation and prestige-driven self-blame faster than it raises institutional blame, protecting institutions from accountability.',
        citation:
            'sunk-cost and effort-justification readings of dissonance (Aronson and Mills 1959); applied here as an interpretive narrative, not a measured effect.',
        confidence: 'speculative',
        falsifiability:
            'this is an interpretation layered on the dynamics; if high-tuition cohorts complain more, not less, the suppression story is refuted.',
    },
];
