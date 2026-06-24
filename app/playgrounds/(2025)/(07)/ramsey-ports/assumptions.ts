import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'ramsey-pricing',
        statement:
            'the "Ramsey" here is Frank Ramsey optimal-pricing theory, not Ramsey-number combinatorics. A regulated airport sets prices to maximize weighted welfare W = CS + lambda * PS subject to a break-even constraint, so prices rise above marginal cost in inverse proportion to demand elasticity.',
        citation:
            'Ramsey (1927), A contribution to the theory of taxation; applied to airport access charges by Ivaldi, Sokullu and Toru (2015).',
        confidence: 'established',
        falsifiability:
            'if observed airport charges did not vary inversely with the elasticity of the relevant demand side, the Ramsey-pricing framing would be the wrong model for that airport.',
    },
    {
        id: 'two-sided-market',
        statement:
            'an airport is a two-sided platform that prices airlines on one side and passengers (via aeronautical and commercial revenue) on the other, internalizing cross-side network effects between the two groups.',
        citation:
            'Rochet and Tirole (2006) on two-sided markets; the aviation application in Ivaldi, Sokullu and Toru (2015).',
        confidence: 'established',
        falsifiability:
            'if airline and passenger demand were independent (no cross-side externality), the single network-effect slider would have no welfare consequence and the two-sided framing would collapse to two separate one-sided markets.',
    },
    {
        id: 'welfare-decomposition',
        statement:
            'social welfare is the sum of consumer surplus and producer surplus (profit). The model treats this Marshallian decomposition as exact, which is why the calibration can check welfare = CS + PS to machine precision.',
        citation:
            'standard partial-equilibrium welfare accounting; holds exactly in the published baseData table.',
        confidence: 'established',
        falsifiability:
            'income effects, externalities (noise, congestion, emissions), or distributional weights would break the plain sum; the model omits all of these.',
    },
    {
        id: 'observed-vs-counterfactual',
        statement:
            'the "current model" numbers are the observed/estimated outcomes from the 2015 study, while the "privatized model" numbers are a counterfactual benchmark for an unregulated profit-maximizing operator. They are not two measurements of the same world.',
        citation:
            'Ivaldi, Sokullu and Toru (2015), structural estimation plus counterfactual simulation.',
        confidence: 'contested',
        falsifiability:
            'the privatized branch is a model-generated counterfactual; an actual privatization experiment could land far from the simulated figures.',
    },
    {
        id: 'linear-network-effect',
        statement:
            'the passenger network effect is applied as a single linear multiplier (1 + e/100) on consumer surplus and a separate multiplier on privatized profit. This is a transparent stand-in for the structural cross-side elasticities, not those elasticities themselves.',
        citation:
            'modelling simplification for the interactive sandbox; the underlying study estimates demand jointly.',
        confidence: 'speculative',
        falsifiability:
            'real network effects are nonlinear and saturate; a regime where doubling flights less than doubles surplus would contradict the strict linearity used here.',
    },
    {
        id: 'lambda-toy-coupling',
        statement:
            'the welfare-weight slider lambda enters the toy in a deliberately simplified way: it both discounts the profit focus of the current operator (1 - (lambda - 0.5)) and reweights profit inside welfare (CS + profit * lambda). This is a legibility choice, not the constrained optimization of the source paper.',
        citation:
            'sandbox parameterization; the source solves a constrained welfare program rather than scaling fixed surpluses.',
        confidence: 'contested',
        falsifiability:
            'a proper Ramsey program would re-solve quantities and prices for each lambda; here the surpluses are scaled, so the lambda response is illustrative, not optimized.',
    },
    {
        id: 'sample-airports',
        statement:
            'the nine US hub airports in baseData are a fixed sample drawn from the study and are treated as representative anchor points, not as a complete or randomly sampled set.',
        citation:
            'airport sample from Ivaldi, Sokullu and Toru (2015).',
        confidence: 'established',
        falsifiability:
            'conclusions drawn here do not generalize to airports outside this sample, especially smaller or non-hub airports with different demand structure.',
    },
];
