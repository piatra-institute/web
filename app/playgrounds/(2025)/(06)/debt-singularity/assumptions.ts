import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'affine-balance-map',
        statement:
            'the nominal debt evolves by a single affine recurrence, B_{t+1} = (1 + r) B_t - P: interest compounds annually on the whole balance and a fixed payment P is subtracted once per year. there are no fees, no amortisation schedule, no variable payment, and the balance is floored at zero.',
        citation:
            'standard discrete compound-interest / annuity recurrence; the closed form B_t = (1+r)^t (B_0 - P/r) + P/r is textbook fixed-point analysis of an affine map.',
        confidence: 'established',
        falsifiability:
            'a real loan with mid-year compounding, changing payment, or refinancing would diverge from this single annual map; the model is exact only for the idealised yearly schedule it defines.',
    },
    {
        id: 'real-value-fisher',
        statement:
            'the real (felt) value of the debt is the nominal balance deflated by cumulative inflation, B_t / (1 + i)^t, and the sign of the real interest rate (1 + r)/(1 + i) - 1 is the order parameter: positive means the burden grows (liability phase), negative means it decays (asset phase).',
        citation:
            'Fisher equation relating nominal rate, real rate, and inflation; the exact multiplicative form is used rather than the r - i approximation.',
        confidence: 'established',
        falsifiability:
            'if a borrower\'s income or the relevant price index moves very differently from the single inflation rate i, the deflated curve no longer tracks the felt burden, and the phase label can mislead.',
    },
    {
        id: 'constant-rates',
        statement:
            'interest and inflation are held constant for the whole horizon. a single (r, i) pair defines one point on the phase diagram and one trajectory; regime changes within the period are not modelled.',
        citation:
            'modelling simplification; the historical scenarios collapse multi-year episodes (Weimar, Volcker, ZIRP) into a single representative pair.',
        confidence: 'contested',
        falsifiability:
            'real episodes are paths through the phase plane, not single points; the Volcker era moved from high inflation to high real rates within a few years, which one fixed pair cannot represent.',
    },
    {
        id: 'phase-transition-is-sign-change',
        statement:
            'the "singularity" is a continuous phase boundary, not a true mathematical singularity: it is the line r = i where the real growth factor crosses one. crossing it flips the long-run direction of the real balance but nothing blows up.',
        citation:
            'order-parameter framing borrowed from statistical physics; the diagonal of the interest-inflation grid is the critical line.',
        confidence: 'contested',
        falsifiability:
            'the name "singularity" is evocative; the dynamics are smooth in r and i, so anyone expecting a divergence at the boundary would be misled.',
    },
    {
        id: 'inflation-cap',
        statement:
            'inflation is capped at 50% per year for visual scale, so hyperinflation episodes such as Weimar 1923 (often thousands of percent per month) are represented only qualitatively, not at their true magnitude.',
        citation:
            'INFLATION_MAX = 50 in the viewer; the Weimar scenario description states the cap explicitly.',
        confidence: 'established',
        falsifiability:
            'at true hyperinflation rates the real value collapses far faster than the capped model shows; the playground understates the speed of debt erosion in those tails.',
    },
    {
        id: 'single-debtor-no-feedback',
        statement:
            'this is a one-debtor, partial-equilibrium model. the borrower\'s choices do not feed back into interest rates or inflation, and there is no default, no creditor behaviour, and no macroeconomic loop.',
        citation:
            'partial-equilibrium framing; macro models (debt-deflation, fiscal sustainability) add exactly the feedbacks this omits.',
        confidence: 'contested',
        falsifiability:
            'in aggregate, inflating away debt changes expectations and future rates (creditors demand higher nominal yields); a model that ignores this overstates how cheaply debt can be eroded at scale.',
    },
];
