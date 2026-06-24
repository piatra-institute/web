import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'binary-outcome-space',
        statement:
            'every decision is collapsed to a two-outcome distribution P = [p, 1 - p] and fairness is its closeness to the uniform [0.5, 0.5]. real allocations (sentencing, hiring, sortition) live in much larger outcome spaces, and "fair" there is rarely "uniform".',
        citation:
            'standard simplification; demographic-parity definitions in the algorithmic-fairness literature (Dwork et al. 2012) are stated over richer outcome and group structures.',
        confidence: 'contested',
        falsifiability:
            'any setting where the just distribution is non-uniform (e.g. need-based allocation) breaks the identification of fairness with maximum entropy used throughout the model.',
    },
    {
        id: 'corruption-as-fixed-bias',
        statement:
            'institutional corruption is parameterised by a single scalar C that, for the directional type, maps through a sigmoid to a fixed bias magnitude 0.4 / (1 + exp(-5(C - 0.5))). corruption is treated as a static tilt of the distribution, not as a strategic, adaptive, or principal-agent process.',
        citation:
            'modelling choice; principal-agent and rent-seeking accounts of corruption (Rose-Ackerman 1999) describe responsive actors this scalar omits.',
        confidence: 'contested',
        falsifiability:
            'corrupt actors who re-target their bias in response to added randomness would not be captured by a corruption value fixed independently of R.',
    },
    {
        id: 'randomness-washes-bias',
        statement:
            'for directional corruption the observed distribution is preservation * biased + (1 - preservation) * uniform, with preservation = exp(-2R). so increasing randomness mechanically blends the biased distribution toward uniform. the headline result that "randomness counteracts corruption" is built into this convex blend; it is a definition, not an empirical discovery.',
        citation:
            'this is a direct property of the observedDistribution function in logic/index.ts; see the research companion for the lottery-and-sortition literature it gestures at.',
        confidence: 'established',
        falsifiability:
            'the claim is tautological for this functional form; it would be informative only if randomness were applied to a real institution and bias still fell, which the toy does not test.',
    },
    {
        id: 'lottery-as-fairness-device',
        statement:
            'the substantive idea behind the toy, that allocating contested goods by lottery can defeat capture and bias better than a corruptible deterministic rule, is a real and defended position in political theory (sortition, random selection, tie-breaking by lot).',
        citation:
            'Stone, The Luck of the Draw: The Role of Lotteries in Decision Making (2011); Goodwin, Justice by Lottery (1992).',
        confidence: 'contested',
        falsifiability:
            'lotteries also destroy desert-based and merit-based selection; where outcomes should track relevant differences, randomisation is unfair, so the device is domain-specific rather than universal.',
    },
    {
        id: 'information-theory-as-fairness-proxy',
        statement:
            'Shannon entropy, KL divergence, total variation, and Jensen-Shannon divergence are used as fairness scores. these are genuine, well-defined distances between the outcome distribution and the uniform ideal, and the calibration panel checks the model computes them exactly.',
        citation:
            'Shannon 1948; Kullback and Leibler 1951; demographic parity as 1 - TVD from uniform follows Dwork et al. 2012.',
        confidence: 'established',
        falsifiability:
            'these quantities are exact for the chosen distributions; the open question is normative, namely whether distance-from-uniform is the right thing to call fairness, not whether the numbers are right.',
    },
    {
        id: 'efficiency-tradeoff-is-stipulated',
        statement:
            'institutional efficiency is the stipulated closed form max(0, 1 - C - max(0, (R - 0.5) / 2)): corruption costs efficiency linearly and randomness above 0.5 costs a smaller linear penalty. the resulting fairness-versus-efficiency tension is asserted by these coefficients, not measured.',
        citation:
            'modelling choice; the general fairness-efficiency trade-off is discussed across mechanism design and public administration, but the specific slopes here are illustrative.',
        confidence: 'speculative',
        falsifiability:
            'different but equally plausible penalty shapes would relocate the "random justice" sweet spot, so any policy reading of the optimum is an artefact of the chosen coefficients.',
    },
];
