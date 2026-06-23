import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'fitness-landscape',
        statement:
            'strategies are points on a 2D fitness landscape built from two Gaussian peaks; fitness is the peak sum raised to a convexity power, plus a noise floor. it is a stylized caricature of a strategy space, not a measured one.',
        citation:
            'fitness-landscape metaphor from evolutionary biology (Wright 1932), used here illustratively.',
        confidence: 'contested',
        falsifiability:
            'a real strategy space with many independent dimensions or different peak structure would change which strategies coexist.',
    },
    {
        id: 'convexity-concentration',
        statement:
            'raising fitness to a higher power (convex returns to scale) concentrates the distribution: the strongest strategies pull further ahead, so the Gini coefficient and top-share rise. this is a mathematical property of power transforms, independent of the economic story.',
        citation:
            'order statistics under monotone convex transforms; standard inequality-measure behaviour.',
        confidence: 'established',
        falsifiability:
            'if increasing the convexity exponent did not raise the concentration metrics, the implementation would be wrong; the calibration checks the metrics directly.',
    },
    {
        id: 'zero-temperature-analogy',
        statement:
            'the monodominant limit is described as a Boltzmann distribution at temperature T -> 0, where all probability mass collapses onto the single global maximum.',
        citation:
            'statistical-mechanics analogy (softmax / Boltzmann at low temperature).',
        confidence: 'speculative',
        falsifiability:
            'the analogy is illustrative; markets are not literally thermodynamic systems, and the mapping is interpretive rather than derived.',
    },
    {
        id: 'niche-separation',
        statement:
            'the separation parameter sets the distance between the two peaks. with enough separation, multiple winners survive as local monopolists; when niches collapse together, only the global optimum survives.',
        citation:
            'competitive-exclusion / niche-separation reasoning from ecology.',
        confidence: 'contested',
        falsifiability:
            'with more than two niches, or niches of unequal depth, the simple one-winner-versus-several dichotomy would not hold.',
    },
    {
        id: 'concentration-metrics',
        statement:
            'the Gini coefficient and top-5% share are standard inequality measures, applied here to the synthetic landscape grid rather than to real market data.',
        citation:
            'Gini (1912); standard concentration indices.',
        confidence: 'established',
        falsifiability:
            'the metrics are well defined; what is interpretive is reading them on this toy landscape as a statement about real markets.',
    },
    {
        id: 'economic-interpretation',
        statement:
            'the framing as a transition to "algorithmic rentier capitalism" is an interpretive analogy layered on the dynamics, not a validated economic model of any actual market.',
        citation:
            'qualitative political-economy interpretation provided in the outro.',
        confidence: 'speculative',
        falsifiability:
            'an empirical study of algorithmic-finance concentration could support or contradict the qualitative story; this model does not test it.',
    },
];
