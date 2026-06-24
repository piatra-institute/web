import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'two-force-decision',
        statement:
            'a responder\'s choice is modelled as a contest between two scalar forces: desire for the reward and resentment at unfairness. the responder accepts when desire is at least as large as resentment, and rejects otherwise.',
        citation:
            'Guth, Schmittberger and Schwarze 1982: responders reject positive but unfair offers, which a pure payoff-maximiser never would; this is read as a fairness force opposing material gain.',
        confidence: 'contested',
        falsifiability:
            'if rejection rates did not rise as offers became less fair, or did not fall as the responder valued the reward more, the two-force reduction would be wrong.',
    },
    {
        id: 'linear-resentment-ramp',
        statement:
            'resentment is a linear ramp in unfairness: resentment = (fair - offer) times 25, capped at 100, with fair set to half the pie. each coin below the even split adds a fixed quantum of resentment.',
        citation:
            'a modelling choice. the linear form is the simplest monotone map from unfairness to aversion and keeps the decision boundary legible.',
        confidence: 'speculative',
        falsifiability:
            'measured aversion may be nonlinear (for example a sharp threshold near very low offers rather than a straight line); fitting real rejection curves would expose the discrepancy.',
    },
    {
        id: 'fair-is-equal-split',
        statement:
            'the fairness reference point is an exact equal split, so offers at or above half the pie generate no resentment at all.',
        citation:
            'inequity-aversion theory (Fehr and Schmidt 1999) takes the equal split as the salient reference; the modal offer in ultimatum experiments is close to 50/50.',
        confidence: 'established',
        falsifiability:
            'reference points shift with framing, entitlement and stakes; a responder who resents a 50/50 split (feeling entitled to more) would violate the fixed reference assumption.',
    },
    {
        id: 'desire-is-exogenous',
        statement:
            'desire for the reward is a single exogenous dial set by the user, constant across offers within a session, rather than something that scales with the size of the offer.',
        citation:
            'a deliberate simplification to isolate the fairness force; real motivation depends on need, wealth and the absolute stake.',
        confidence: 'contested',
        falsifiability:
            'if acceptance depended strongly on the absolute coin amount at fixed unfairness, a constant scalar desire could not reproduce it.',
    },
    {
        id: 'deterministic-threshold',
        statement:
            'the decision is a hard deterministic threshold: an infinitesimal change that tips desire below resentment flips the predicted choice from accept to reject.',
        citation:
            'a modelling choice. it makes the accept/reject boundary a clean inequality and defines an explicit tipping point near equality.',
        confidence: 'speculative',
        falsifiability:
            'human responses near the boundary are noisy and probabilistic; a softmax or logistic choice rule fits aggregate data better than a step function.',
    },
    {
        id: 'fixed-pie-conservation',
        statement:
            'the stake is a fixed pie of ten coins, so the offer to the responder and the amount kept by the proposer always sum to ten; rejection yields zero to both parties.',
        citation:
            'the canonical one-shot ultimatum game: a fixed sum, take-it-or-leave-it, with rejection destroying the entire surplus.',
        confidence: 'established',
        falsifiability:
            'this is definitional for the game as posed; relaxing it (variable pies, outside options, partial rejection) would describe a different game, not falsify this one.',
    },
];
