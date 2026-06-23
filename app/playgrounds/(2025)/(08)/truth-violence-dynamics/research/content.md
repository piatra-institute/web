# Truth-Violence Dynamics: When Truth-Seeking Collapses

## Abstract

This playground is a small dynamical-systems model of a dangerous feedback: how a
society's capacity for truth-seeking can collapse, and support for violence rise,
under pressure from emotion, disinformation, and weak institutions. It is a
caricature, three numbers evolving by a differential equation, but it makes the
qualitative logic of suppression legible and gives one exactly checkable claim.

## Three states

The model tracks three quantities over time:

- **u**, grievance or punitive support: how much of the population is primed to
  punish.
- **t**, truth-seeking capacity, between 0 and 1: the society's ability to find
  and accept inconvenient facts.
- **v**, support for violence, between 0 and 1.

They evolve together. Grievance grows when truth is low and disinformation M is
high, and is damped by accountability. Truth-seeking follows a logistic law,
t(1-t) times a bracket that pits institutional transparency IT against grievance
and violence, so it grows toward 1 when institutions are strong and collapses
toward 0 when they are overwhelmed. Violence support relaxes at rate lambda but is
driven up by the combination of grievance, low truth, and emotionally charged
events E.

## The one hard claim

Most of the model is qualitative, but one part is exact. Violence support obeys

> dv/dt = -lambda * v + (driver),

and the driver is the product of grievance, low truth, and a saturating function
of emotion S(E) = E/(1+E), plus a direct emotional term. When there is no
emotional driver (E = 0), both source pieces vanish, S(0) = 0 and the direct term
is zero, so violence support simply decays exponentially:

> v(T) = v0 * exp(-lambda * T).

The calibration panel integrates the full RK4 system with E set to zero and
confirms the simulated violence support lands on that closed-form decay. It also
checks the saturating response S(E) at two points (one half at E = 1, three
quarters at E = 3). These are the model's reproducible anchors; everything else is
interpretation.

## Why truth-seeking is the early casualty

The phrase "the first casualty when war comes is truth" usually refers to
wartime propaganda. This model suggests truth-seeking can be the *earlier*
casualty: the logistic collapse of t can happen before violence rises, because
low truth and high grievance feed each other, and a society that has lost its
capacity to agree on facts is one where violence becomes acceptable. The presets
make the regimes concrete: a stabilizing regime with strong institutions holds
truth high, a spiral regime lets it collapse, and a shock regime injects pulses
to test resilience.

## Honest limits

This is a stylized, deterministic, mean-field model. Society is three numbers; the
drivers are scheduled inputs rather than outcomes of the dynamics; the parameters
are hand-tuned to illustrate regimes, not estimated from data; and the risk index
R is a constructed indicator. It is a tool for reasoning about how transparency,
grievance, and emotion interact, not a forecast of any actual conflict. Feedbacks
the model omits (violence reshaping institutions, networks, historical memory)
would all change the picture.

## References

- Standard references on nonlinear dynamical systems, logistic dynamics, and RK4
  integration.
- The political-science literature on disinformation, institutional resilience,
  and political violence, here compressed into a deliberately minimal model.
