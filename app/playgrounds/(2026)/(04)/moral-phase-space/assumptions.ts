import type { Assumption } from '@/components/AssumptionPanel';

export const assumptions: Assumption[] = [
    {
        id: 'hohfeldian-rights',
        statement: 'Rights are modeled as structured normative relations (claim/duty, liberty/no-claim, power/liability, immunity/disability) rather than natural properties or sentiments.',
        citation: 'Hohfeld 1917 \u2014 Fundamental Legal Conceptions as Applied in Judicial Reasoning; Wenar 2005 \u2014 The Nature of Rights',
        confidence: 'established' as const,
        falsifiability: 'Falsified if a coherent rights framework can be constructed without correlative duties or without distinguishing claim-rights from liberties.',
    },
    {
        id: 'deontic-constraints',
        statement: 'Some actions are categorically forbidden regardless of aggregate welfare outcomes. Rights function as side-constraints on optimization, not as terms within a utility function.',
        citation: 'Nozick 1974 \u2014 Anarchy, State, and Utopia; von Wright 1951 \u2014 Deontic Logic',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if a consistent moral framework can justify any rights violation when aggregate welfare gains are sufficiently large (threshold consequentialism).',
    },
    {
        id: 'capability-approach',
        statement: 'Social states should be compared by the real freedoms (capabilities) persons have to do and be what they value, not by reported satisfaction, resource holdings, or aggregate welfare.',
        citation: 'Sen 1999 \u2014 Development as Freedom; Nussbaum 2011 \u2014 Creating Capabilities',
        confidence: 'established' as const,
        falsifiability: 'Falsified if interpersonal welfare comparisons based on subjective utility are shown to be more reliable and action-guiding than capability profiles.',
    },
    {
        id: 'capability-floor',
        statement: 'The minimum capability across all dimensions (the floor) is morally significant: a society with one collapsed freedom is not redeemed by high performance elsewhere.',
        citation: 'Nussbaum 2006 \u2014 Frontiers of Justice; Wolff & De-Shalit 2007 \u2014 Disadvantage',
        confidence: 'established' as const,
        falsifiability: 'Falsified if societies with very low floors in one capability but high averages are empirically shown to have better long-term stability and human flourishing outcomes.',
    },
    {
        id: 'domination-persistence',
        statement: 'Domination can become self-reinforcing through institutional feedback loops: coercion erodes repair capacity, which reduces correction, which enables further coercion.',
        citation: 'Pettit 1997 \u2014 Republicanism: A Theory of Freedom and Government; Young 1990 \u2014 Justice and the Politics of Difference',
        confidence: 'established' as const,
        falsifiability: 'Falsified if institutional domination is shown to be inherently self-correcting without external intervention across all historical cases.',
    },
    {
        id: 'repair-as-counterforce',
        statement: 'Repair institutions (courts, ombudsmen, truth commissions) function as dynamic counter-forces to domination, not merely as ex post remedies.',
        citation: 'Teitel 2000 \u2014 Transitional Justice; De Greiff 2012 \u2014 Theorizing Transitional Justice',
        confidence: 'contested' as const,
        falsifiability: 'Falsified if repair institutions are shown to consistently entrench rather than reverse patterns of domination across diverse political contexts.',
    },
    {
        id: 'naive-utility-foil',
        statement: 'A single-scalar welfare maximization function is included as a deliberately crude foil to demonstrate how it can rate coercive systems as tolerable when rights are violated.',
        citation: 'Sen 1979 \u2014 Utilitarianism and Welfarism; Williams 1973 \u2014 A Critique of Utilitarianism',
        confidence: 'established' as const,
        falsifiability: 'Falsified if naive utility maximization is shown to never produce morally objectionable rankings when applied to historical regimes.',
    },
    {
        id: 'threshold-values',
        statement: 'The specific threshold values for deontic violations (detention > 15, discrimination > 20, due process < 65, etc.) are modeling choices, not empirical constants. They are calibrated to produce clear regime distinctions.',
        citation: 'Model assumption \u2014 thresholds are illustrative, drawing on OHCHR indicator frameworks',
        confidence: 'speculative' as const,
        falsifiability: 'Falsified if a principled, non-arbitrary method for setting exact violation thresholds is demonstrated.',
    },
];
