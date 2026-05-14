import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'taxes-are-not-only-burdens',
        statement:
            'Taxes are not purely deadweight: well-designed taxes finance redistribution, public goods, and social insurance while minimising efficiency losses.',
        citation:
            'Musgrave, 1959, The Theory of Public Finance; Mirrlees Review, 2011',
        confidence: 'established',
        falsifiability:
            'Evidence that across well-designed tax systems, every revenue dollar destroys more than a dollar of social value regardless of how it is spent.',
    },
    {
        id: 'progressive-tax-case',
        statement:
            'Optimal-tax theory supports high top marginal rates when top incomes are inelastic and partly rents, and when social welfare weights are redistributive.',
        citation:
            'Diamond & Saez, 2011, The Case for a Progressive Tax, Journal of Economic Perspectives 25(4)',
        confidence: 'established',
        falsifiability:
            'Credible elasticity estimates showing top-income tax bases collapse well below the rates the theory implies, with no rent component.',
    },
    {
        id: 'welfare-state-growth-neutral',
        statement:
            'Large tax-financed welfare states do not automatically reduce growth: historically, social spending often had neutral or positive growth effects once financing is accounted for.',
        citation:
            'Lindert, 2004, Growing Public',
        confidence: 'contested',
        falsifiability:
            'A clean panel showing that welfare-state size, instrumented away from endogeneity, reduces long-run growth across high-capacity democracies.',
    },
    {
        id: 'spending-vs-tax-austerity',
        statement:
            'In fiscal consolidations, spending-based adjustments tend to be less contractionary than tax-based adjustments of the same size.',
        citation:
            'Alesina, Favero & Giavazzi, 2019, Austerity: When It Works and When It Doesn’t',
        confidence: 'contested',
        falsifiability:
            'Consolidation episodes, properly controlled for the business cycle, where tax-based and spending-based adjustments have indistinguishable output costs.',
    },
    {
        id: 'pigouvian-correction',
        statement:
            'A tax set near the marginal social cost of a negative externality raises welfare by correcting a market failure, before any revenue is spent.',
        citation:
            'Pigou, 1920, The Economics of Welfare; Nordhaus, 2013, The Climate Casino',
        confidence: 'established',
        falsifiability:
            'A well-measured externality where pricing it at marginal social cost reliably lowers total welfare.',
    },
    {
        id: 'state-capacity-conditions-returns',
        statement:
            'The growth value of public investment is conditional on administrative capacity: weak collection and weak implementation sharply cut the realised return.',
        citation:
            'Besley & Persson, 2011, Pillars of Prosperity',
        confidence: 'established',
        falsifiability:
            'Evidence that public-investment multipliers are invariant to measured state capacity across comparable economies.',
    },
    {
        id: 'debt-thresholds-fragile',
        statement:
            'There is no robust universal debt-to-GDP threshold above which growth collapses; debt sustainability depends on the interest-growth differential and the currency regime.',
        citation:
            'Herndon, Ash & Pollin, 2014, critique of Reinhart & Rogoff; Blanchard, 2019, Public Debt and Low Interest Rates',
        confidence: 'established',
        falsifiability:
            'A replicable, sample-robust discontinuity in growth at a fixed debt ratio that survives controls for the interest-growth gap.',
    },
    {
        id: 'separable-additive-channels',
        statement:
            'The model treats the four rationales as separable additive channels with a fixed cross-rationale weight of 0.4; in reality the channels interact and the weights are not observed.',
        citation: 'Modelling choice for legibility',
        confidence: 'speculative',
        falsifiability:
            'Not empirically falsifiable as stated, it is a stipulated structure. Its job is to make the argument shapes comparable, not to estimate any country.',
    },
    {
        id: 'static-no-dynamics',
        statement:
            'Scores are static: there is no business cycle, no expectations channel, no debt accumulation over time, and no behavioural response beyond the distortion term.',
        citation: 'Modelling choice',
        confidence: 'speculative',
        falsifiability:
            'Not falsifiable, a scope limitation. A dynamic version would change the timing verdicts, especially for consolidation.',
    },
    {
        id: 'scores-are-dimensionless',
        statement:
            'All inputs and outputs are dimensionless 0-100 indices calibrated to the demo, not to any currency, country, or year.',
        citation: 'Modelling choice for interpretability',
        confidence: 'established',
        falsifiability:
            'Not falsifiable in absolute terms. The qualitative ordering of the rationales is what carries content, not the numbers.',
    },
];
