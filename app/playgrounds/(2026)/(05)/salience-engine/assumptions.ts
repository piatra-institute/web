import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'salience-not-intrinsic',
        statement:
            'salience is not a property inside an object. it is constraint-relative relevance: a difference matters because some self-maintaining system is organised so that the difference changes what it must do next.',
        citation:
            'after deacon, how molecules became signs (2021): sign properties are not intrinsic to the sign vehicle but depend on the interpreting system.',
        confidence: 'contested',
        falsifiability:
            'evidence that an object carries a fixed salience across systems with very different constraints, independent of those constraints, would falsify this.',
    },
    {
        id: 'ladder-monotonic',
        statement:
            'the eight rungs from matter to over-salience form an ordered ladder. an object reaches a higher rung only by passing through the lower ones; over-salience is built on narrative, value, and sign function beneath it.',
        citation:
            'a modelling commitment, loosely after layered accounts of meaning in biosemiotics and predictive processing.',
        confidence: 'speculative',
        falsifiability:
            'a documented object that is a world-filter, rung seven, while scoring near zero on sign function, rung three, would falsify the strict ordering.',
    },
    {
        id: 'dopamine-not-pleasure',
        statement:
            'dopamine signals reward prediction error and incentive salience, not pleasure. it marks what is worth reorganising behaviour around, which is why it drives addiction, gambling, novelty, and romantic obsession alike.',
        citation:
            'after schultz, reward prediction error (1997, 2016); berridge and robinson, incentive sensitization theory (2016).',
        confidence: 'established',
        falsifiability:
            'evidence that dopamine release tracks hedonic liking ratings more closely than it tracks motivational wanting would weaken this.',
    },
    {
        id: 'wanting-exceeds-liking',
        statement:
            'wanting and liking are separable. a cue can capture attention and drive pursuit while delivering little or no pleasure. salience can exceed meaning.',
        citation:
            'after berridge and robinson, incentive sensitization (2016): addiction as amplified wanting without proportional liking.',
        confidence: 'established',
        falsifiability:
            'a clean demonstration that high-wanting states always carry proportionally high liking would falsify the dissociation.',
    },
    {
        id: 'uncertainty-is-fuel',
        statement:
            'uncertainty about reciprocation or outcome is the main intensifier of over-salience. ambiguous signals keep the prediction loop running, where clear affection or clear rejection would let it settle.',
        citation:
            'after the 2024 scoping review of limerence describing doubt and hope as core drivers; intermittent-reinforcement literature.',
        confidence: 'contested',
        falsifiability:
            'longitudinal data showing limerence intensity peaks under certain reciprocation rather than ambiguous reciprocation would falsify this.',
    },
    {
        id: 'limerence-is-runaway',
        statement:
            'limerence is not merely strong attraction. it is the runaway regime of an ordinary salience system: a person turned into a high-precision, high-reward, high-uncertainty sign.',
        citation:
            'after tennov, love and limerence (1979); fisher et al., romantic love as a mate-choice drive (2006).',
        confidence: 'contested',
        falsifiability:
            'evidence that limerent and non-limerent attraction recruit categorically different mechanisms, not the same mechanism at different settings, would falsify this.',
    },
    {
        id: 'softmax-attention',
        statement:
            'attention allocation across competing objects is approximated by a softmax over salience, with a temperature that controls how winner-takes-most the allocation becomes.',
        citation:
            'a standard modelling device from reinforcement learning and decision theory; not a claim about neural implementation.',
        confidence: 'speculative',
        falsifiability:
            'this is an explicit approximation. it is falsified for any setting where measured attention shares depart systematically from a softmax fit.',
    },
    {
        id: 'eight-dims-sufficient',
        statement:
            'eight object dimensions and eight field weights are enough to place the six reference objects in their expected status tier. adding a ninth of either kind is unlikely to improve fit in the current range.',
        citation:
            'a pragmatic modelling choice. holds in the calibration table at the time of writing.',
        confidence: 'speculative',
        falsifiability:
            'reproducing the model with an added dimension and obtaining a strictly better calibration would falsify the sufficiency claim.',
    },
    {
        id: 'reality-correction-works',
        statement:
            'reality correction, the brake term standing for evidence, boundaries, sleep, and other relations, reliably pulls salience back toward evidential weight. it is anti-correlated with over-salience.',
        citation:
            'general clinical and behavioural result; consistent with exposure and habituation accounts.',
        confidence: 'contested',
        falsifiability:
            'an intervention study where strengthening reality correction has no effect on observed over-salience would weaken this.',
    },
    {
        id: 'regime-not-time',
        statement:
            'the dynamics of the loop are captured well enough by a single signal regime, stable, ambiguous, or volatile, without an explicit time axis. the configuration alone is the model.',
        citation:
            'a deliberate compression; the original demo used a time-wave that this version replaces.',
        confidence: 'speculative',
        falsifiability:
            'evidence that key phenomena, such as oscillating salience, require an explicit temporal trajectory that no regime setting can reproduce, would falsify this.',
    },
];
