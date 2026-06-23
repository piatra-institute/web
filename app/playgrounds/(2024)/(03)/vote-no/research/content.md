# Vote No: Governance by Rejection

## Abstract

Most voting models ask who approves. This one asks who objects. Vote No models a
community where proposals are live by default and survive only as long as too few
members veto them. It is a picture of consensus as the absence of sustained
objection, and of the quiet power of the "no". The network animation is
stochastic, but the decision rules underneath are exact, and the calibration pins
them.

## Consent, not majority

In majority voting a proposal needs active support to pass. In consent-based or
consensus governance, the polarity flips: a proposal stands unless someone raises
a sufficient objection. This is the logic of sociocracy and many consensus
assemblies, and it changes where power sits. A determined minority can block; the
default is motion, not stasis; and the meaningful act is the veto, not the
endorsement.

## The decision rules

The model makes this concrete with a few exact rules, all checked by the
calibration:

- **Rejection rate** is the number of members who actively vote no divided by the
  number of active members. Thirty of fifty gives 0.6.
- **Veto**: a proposal is blocked when the rejection rate exceeds a tunable veto
  threshold. At 0.6 against a 0.5 threshold, it is vetoed.
- **Passing by survival**: a proposal passes only after it has been live long
  enough and its rejection rate has stayed below (1 minus the consensus
  threshold). Passing is endurance, not acclaim.

## What "consensus strength" means here

The model tracks a consensus-strength signal defined as 1 minus twice the
distance of the rejection rate from one half. It peaks at an even split and falls
to zero at either unanimous extreme. This is a deliberate, and arguable, choice:
it treats maximal contestation, not unanimity, as the point of strongest
collective engagement. The assumptions panel flags that one could just as
reasonably define consensus to peak at agreement; the calibration simply verifies
the curve the model actually uses (1 at a split, 0 at unanimity).

## Stochastic members, deterministic rules

Each member has random trust, influence, participation, and sentiment, and every
vote is a random draw gated by participation and information access. So the
network you watch differs every run. The reproducible content is the rule layer:
how a set of votes becomes a rejection rate, and how that rate decides a
proposal's fate. That separation, random behaviour applied through exact rules, is
why the calibration targets the rules and not any single simulated assembly.

## What it is

A stylized sandbox for the dynamics of rejection-based governance, the leverage
of the veto, the role of participation and information, the difference between
blocking and passing. It is not a model of any real assembly, and its parameters
are illustrative. The defensible content is the decision logic; the politics you
read into it is yours.

## References

- Literature on consensus and consent-based decision making (sociocracy,
  Quaker-style consensus).
- Work on minority veto power and blocking coalitions in collective choice.
