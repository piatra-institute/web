# Resentment Against Desire: The Ultimatum Game and the Price of Fairness

## Abstract

The ultimatum game is the smallest experiment that breaks the textbook picture of economic man. One player proposes how to split a fixed sum; the other accepts, in which case the split stands, or rejects, in which case both walk away with nothing. A purely self-interested responder should accept any positive offer, because something beats nothing. Real responders routinely reject offers they judge unfair, paying with their own money to punish a stingy proposer. This playground models that refusal as a contest between two scalar forces, desire for the reward and resentment at unfairness, and predicts acceptance when desire is at least as large as resentment. The model is intentionally minimal; this companion explains what it captures, what it leaves out, and how it relates to the experimental and theoretical literature.

## Background: the 1982 experiment

In 1982 Werner Guth, Rolf Schmittberger and Bernd Schwarze ran the first ultimatum bargaining experiment at the University of Cologne. Proposers were given a sum to divide and responders could accept or reject the proposed split, with rejection leaving both with nothing. The subgame-perfect prediction from standard game theory is stark: the proposer should offer the smallest possible positive amount and the responder should accept it. Instead, proposers offered far more than the minimum (the even split was the single most common offer), and responders rejected low offers often enough that lowballing was a losing strategy. The paper is the founding document of a research program showing that fairness considerations are a real, measurable input to economic decisions.

The result has since been replicated thousands of times across cultures, age groups and stake sizes. Two robust regularities recur: offers cluster well above the self-interested minimum, and low offers are rejected at high rates even when the absolute amount on the table is substantial. Cross-cultural work (notably the Henrich et al. studies of small-scale societies) shows the precise numbers vary with local norms of exchange and cooperation, but the qualitative pattern, costly rejection of unfair offers, is widespread.

## The model in this playground

The playground reduces the responder to two numbers.

Resentment is computed from the offer alone. With a pie of ten coins and a fairness reference at the even split of five, each coin below five adds a fixed quantum of aversion:

resentment = min((5 - offer) times 25, 100)

So a 5-coin offer produces zero resentment, a 3-coin offer produces 50, a 1-coin offer saturates the scale at 100, and any offer at or above the even split produces no resentment at all. The ramp is linear and capped.

Desire is a single dial the user controls, running from indifference to desperation. It does not change with the offer; it represents how much this particular responder wants the reward in general.

The decision rule is a hard threshold. The responder accepts when desire is at least as large as resentment and rejects otherwise. Near equality the playground flags a tipping point, the knife-edge where a small change in either force flips the outcome. When the offer is rejected, both parties get nothing, and the proposer share is whatever is left of the fixed pie, so offer plus kept always sums to ten.

This is the entire model. Its appeal is legibility: the accept-or-reject boundary is a single inequality, and the tipping point is exactly where the two bars meet.

## Relation to inequity-aversion theory

The two-force sketch is a stripped-down cousin of inequity-aversion models, most prominently Fehr and Schmidt (1999). In that framework a player's utility is their own payoff minus a penalty for disadvantageous inequality (getting less than the other) and a smaller penalty for advantageous inequality (getting more). A responder rejects when the disadvantageous-inequality penalty of accepting a lopsided split outweighs the material gain. The playground's resentment term plays the role of the disadvantageous-inequality penalty, and its desire dial plays the role of the weight on own payoff. The differences are deliberate simplifications: Fehr and Schmidt keep utility in money units and let the inequality penalty scale with the actual payoff gap, whereas the playground uses a fixed linear ramp and a hard threshold rather than a smooth utility comparison.

Other accounts emphasize different mechanisms: reciprocity and intention (responders punish unkind intentions, not just unequal outcomes), social-image and spite, and emotion-driven rejection. Neuroeconomic studies have linked rejection of unfair offers to activity in the anterior insula, consistent with a felt aversion rather than a cool calculation, which is the spirit the word resentment is meant to capture here.

## What the calibration checks

The calibration panel verifies the deterministic core of the model by calling the actual logic functions, not by restating constants. It checks that the resentment ramp produces 100 at an insulting 1-coin offer, 50 at a 3-coin offer and 0 at a fair 5-coin split; that the offer and the proposer share always sum to the full pie; that a low-desire responder facing a very unfair offer is predicted to reject; and that desire meeting resentment lands exactly on the tipping point. The one stochastic part of the model, the biased offer generator, is excluded from calibration on purpose, because a random draw has no single correct value to check against.

## Limitations

The model is a caricature, and the assumptions panel says so. Three simplifications are the most consequential. First, the resentment ramp is linear; real aversion may be sharply nonlinear, with most of the action near very low offers. Second, the choice rule is a hard step; human responses near the boundary are noisy and are better described by a probabilistic rule such as a logistic or softmax over the two forces. Third, desire is exogenous and constant, ignoring the well-documented effect of absolute stake size on acceptance. The model also takes the equal split as a fixed fairness reference, whereas reference points shift with framing, entitlement and how the roles were assigned.

None of these undermine the core demonstration, which is qualitative: there is a regime where wanting the reward wins, a regime where resentment wins, and a tipping point between them whose location depends on how unfair the offer is and how badly the responder wants the money. That is the durable lesson of the 1982 experiment, rendered as something you can move with a slider.

## References

- Guth, W., Schmittberger, R., and Schwarze, B. (1982). An experimental analysis of ultimatum bargaining. Journal of Economic Behavior and Organization, 3(4), 367-388.
- Fehr, E., and Schmidt, K. M. (1999). A theory of fairness, competition, and cooperation. Quarterly Journal of Economics, 114(3), 817-868.
- Henrich, J., et al. (2001). In search of homo economicus: behavioral experiments in 15 small-scale societies. American Economic Review, 91(2), 73-78.
- Sanfey, A. G., Rilling, J. K., Aronson, J. A., Nystrom, L. E., and Cohen, J. D. (2003). The neural basis of economic decision-making in the ultimatum game. Science, 300(5626), 1755-1758.
- Camerer, C. F. (2003). Behavioral Game Theory: Experiments in Strategic Interaction. Princeton University Press.
