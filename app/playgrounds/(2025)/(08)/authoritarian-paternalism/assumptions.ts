import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'logit-choice',
        statement:
            'each citizen supports the regime with probability sigma(lambda * dU), a logit (random-utility) choice driven by the utility gap between supporting and not. lambda is the choice precision.',
        citation:
            'McFadden\'s random-utility / discrete-choice model; the logistic is the canonical binary choice rule.',
        confidence: 'established',
        falsifiability:
            'if support did not rise monotonically and smoothly with the utility gap, the logit form would be the wrong choice model.',
    },
    {
        id: 'linear-state-dynamics',
        statement:
            'paternal signaling F and order each follow a linear AR(1) recurrence (F[t+1] = rho*F + eta*p, Order[t+1] = phi*Order + psi*r), so they converge to closed-form steady states F* = eta*p/(1-rho) and Order* = psi*r/(1-phi).',
        citation:
            'standard linear difference equations; the model definition stated in the playground.',
        confidence: 'established',
        falsifiability:
            'the simulated F and order must converge to these steady states; the calibration panel checks exactly that.',
    },
    {
        id: 'preference-interaction',
        statement:
            'the decisive term is c*theta*F: paternal signaling F matters in proportion to a citizen\'s own preference theta for paternal authority, so the same propaganda polarizes a population by preference.',
        citation:
            'interaction-effect modelling; theta ~ Normal(mu, sigma) is the assumed preference distribution.',
        confidence: 'contested',
        falsifiability:
            'a different preference distribution, or no theta-by-F interaction, would change who responds to signaling and the variance share.',
    },
    {
        id: 'exogenous-policy',
        statement:
            'the policy levers (propaganda p, repression r, transfers g, opposition cost k) are fixed inputs, not endogenous responses to the level of support.',
        citation:
            'modelling simplification; real regimes adjust policy in response to support and unrest.',
        confidence: 'contested',
        falsifiability:
            'endogenizing policy as a feedback on support would change the dynamics and could remove the simple steady states.',
    },
    {
        id: 'myopic-independent-agents',
        statement:
            'citizens decide independently and myopically: no social networks, no learning, no forward-looking expectations. cross-sectional variance comes only from preferences and idiosyncratic shocks.',
        citation:
            'mean-field / independent-agent assumption; a deliberate abstraction.',
        confidence: 'contested',
        falsifiability:
            'social influence or information cascades would correlate choices and break the independent-agent variance decomposition.',
    },
    {
        id: 'stylized-not-empirical',
        statement:
            'parameters are illustrative, not estimated from data. the model is for conceptual exploration of how signaling, order, and preferences interact, not for empirical prediction of real regimes.',
        citation:
            'stated model limitation; a stylized political-economy toy.',
        confidence: 'established',
        falsifiability:
            'quantitative claims about a real regime would require fitting these parameters to data, which this model does not do.',
    },
];
