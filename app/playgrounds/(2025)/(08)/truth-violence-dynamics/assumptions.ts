import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'three-state-ode',
        statement:
            'the system reduces society to three coupled continuous states (grievance u, truth-seeking t, violence support v) evolving by a deterministic ODE integrated with RK4. it is a compartmental dynamical-systems caricature, not an agent model.',
        citation:
            'standard nonlinear dynamical-systems modelling; RK4 integration of a coupled ODE.',
        confidence: 'contested',
        falsifiability:
            'social processes with strong discreteness, heterogeneity, or memory would need agents or delays this three-variable mean-field model cannot express.',
    },
    {
        id: 'logistic-truth',
        statement:
            'truth-seeking follows a logistic term t(1-t)(...), so 0 and 1 are fixed points and the capacity grows or collapses depending on whether transparency outweighs grievance and violence.',
        citation:
            'logistic / replicator dynamics; the bracket sets the effective growth rate.',
        confidence: 'established',
        falsifiability:
            'if truth-seeking did not saturate near 0 and 1 but grew without bound, the logistic form would be wrong.',
    },
    {
        id: 'violence-decay',
        statement:
            'violence support relaxes at rate lambda toward zero unless actively driven; the driver is the product of grievance, low truth, and a saturating function of emotion, plus a direct emotional term.',
        citation:
            'linear relaxation with a nonlinear source; saturate(E) = E/(1+E).',
        confidence: 'established',
        falsifiability:
            'with the emotional driver off, violence must decay as v0 exp(-lambda T); the calibration checks exactly this and it would fail if the relaxation were not first order.',
    },
    {
        id: 'exogenous-drivers',
        statement:
            'emotion E, disinformation M, and institutional transparency IT are exogenous inputs (with optional pulses), not outcomes of the dynamics. real feedback from violence back onto these drivers is omitted.',
        citation:
            'modelling simplification; the drivers are scheduled, not endogenous.',
        confidence: 'contested',
        falsifiability:
            'endogenizing the drivers (e.g. violence fuelling disinformation) could create feedback loops and equilibria absent from the current model.',
    },
    {
        id: 'parameters-illustrative',
        statement:
            'the coefficients and presets (stabilizing, spiral, shock) are chosen to illustrate qualitative regimes, not estimated from data. the risk index R is a constructed indicator, not a measured quantity.',
        citation:
            'stylized parameterization; presets are hand-tuned scenarios.',
        confidence: 'established',
        falsifiability:
            'fitting the model to real time series could place a society in a different regime than the matching preset suggests.',
    },
    {
        id: 'conceptual-not-predictive',
        statement:
            'this is a tool for reasoning about how transparency, grievance, and emotion interact to suppress truth and enable violence, not a forecast of any actual conflict.',
        citation:
            'stated scope; a conceptual political-dynamics sandbox.',
        confidence: 'established',
        falsifiability:
            'any predictive claim about a real society would require validation against historical data the model is not fit to.',
    },
];
