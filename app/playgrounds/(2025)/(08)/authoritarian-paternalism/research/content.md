# Authoritarian Paternalism: Signaling, Order, and Support

## Abstract

This playground is a stylized agent-based model of how an authoritarian regime
manufactures support. Citizens differ in how much they value paternal authority,
and the regime pulls levers (propaganda, repression, transfers) that shift two
slow-moving states: how strongly it signals paternal authority, and how much
order it has imposed. The model asks a sharp question: when does support track
genuine preference, and when is it just bought or coerced?

## The choice rule

Each citizen weighs supporting the regime against not, and the difference in
utility is

> dU = a*g - d*r + b*Order + c*theta*F - kappa*k + noise,

where g is material transfers, r is repression, Order is the public-good benefit
of stability, F is paternal signaling, k is the cost of opposition, and theta is
the citizen's own taste for paternal authority. Support happens with probability
sigma(lambda * dU), the logistic (logit) choice familiar from random-utility
theory: lambda controls how sharply the choice responds to the utility gap.

The decisive, and most political, term is c*theta*F. Paternal signaling F only
sways a citizen in proportion to their own preference theta. Crank up propaganda
and you do not move everyone uniformly; you polarize the population by
preference, pulling the paternally-inclined toward support and leaving the rest
unmoved.

## The slow states

Two regime states evolve as simple linear recurrences:

> F[t+1] = rho*F[t] + eta*p,    Order[t+1] = phi*Order[t] + psi*r.

Propaganda p builds paternal signaling F, which decays at rate 1 - rho.
Repression r builds Order, which erodes at rate 1 - phi. Both are first-order
autoregressive processes, so each settles at a closed-form steady state:

> F* = eta*p / (1 - rho),    Order* = psi*r / (1 - phi).

The calibration panel runs the model's own recurrence forward and confirms it
lands on these values. This is the model's one hard, checkable claim, and it is
exact: everything downstream (support, agentiality) is a function of where F and
Order settle.

## Reading the outputs

- **Support** is the population-average probability of backing the regime.
- **Agentiality** measures how much an individual's choice is driven by their own
  preference (the c*theta*F term) versus the regime's flat levers. High signaling
  raises agentiality for those with strong preferences.
- **Variance share** is the fraction of cross-sectional variation in utility
  explained by preference heterogeneity rather than idiosyncratic noise; it rises
  with signaling and with a wider spread of preferences, and falls as noise grows.

## Honest limits

This is a toy, and it says so. Policies are exogenous levers, not endogenous
responses to unrest; agents are myopic and independent, with no networks,
learning, or expectations; preferences are a convenient normal distribution. Real
authoritarian systems involve feedback from support to policy, information
asymmetries, elite politics, and historical contingency that this model omits. It
is built for conceptual exploration of the signaling-order-preference triangle,
not for empirical prediction of any actual regime.

## References

- McFadden, D. (1974). Conditional logit analysis of qualitative choice behavior.
  (The random-utility choice model.)
- Standard treatments of linear difference equations and AR(1) steady states.
- The political-economy literature on propaganda, repression, and authoritarian
  support, here compressed into a deliberately minimal model.
