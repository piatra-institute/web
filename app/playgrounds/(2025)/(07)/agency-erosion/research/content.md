# Agency Erosion: When Signaling Substitutes for Action

## Abstract

This playground models a worry about modern movements: that symbolic identity
signaling can quietly replace the slower work of building real collective agency.
Signaling feels like participation, and can even rise while the capacity to
actually mobilize falls. The model makes that substitution visible and separates
its two diagnostic phases, while being honest that the labels are definitions, not
measurements.

## The substitution

Agents divide their effort between two things: agency-building (organizing,
coalition work) and signaling (visible expressions of identity and allegiance).
Each agent leans toward whichever currently has higher marginal returns, with
individual tastes and some exploration noise. When signaling becomes the
high-return move, for instance under purity pressure, where appearing committed
matters more than being effective, effort flows out of agency and into signal.

That shift has a structural cost. Coalition size in the model is agency times
(1 minus fragmentation), and fragmentation grows when signaling runs far ahead of
agency. So a population can look more engaged (signaling up) while its actual
ability to act together erodes (coalition down). That gap is the erosion of
agency.

## Two phases

The model classifies a rise in signaling into two phases:

- **Emancipatory**: signaling rises and the composite mobilization score also
  rises. The visible expression is accompanied by real capacity-building.
- **Anesthetic**: signaling rises but mobilization falls. The expression soothes
  without building anything, a substitute for action rather than a complement to
  it.

This is a definitional threshold on model quantities, not an empirical diagnosis
of any real movement, and the assumptions panel says so. Change the weights in the
mobilization score and the same trajectory can flip phases.

## What is exact and what is not

The simulation is deliberately stochastic: agent preferences are random, agents
add exploration noise, and whether a given step "succeeds" is a coin flip
weighted by coalition size. So no two runs match, and the on-screen numbers are
single samples, not expectations.

Underneath that randomness sit two exact, checkable pieces, and the calibration
panel pins both: the logistic response used for coalition effectiveness, purity
pressure, and success probability; and the rolling ordinary-least-squares
expectation that the substitution index compares signaling and agency against. On
a perfectly linear input the OLS expectation returns the exact line; on a flat
input it returns the mean.

## Limits

This is a stylized conceptual model, not an empirical account. The functional
forms (how fragmentation responds to signaling, how coalition size is defined) are
chosen for legibility, the parameters are illustrative, and the phase labels
depend on a chosen threshold. It is a tool for thinking about the
signaling-versus-agency tradeoff, not evidence about a particular case.

## References

- Literature on collective action, social-movement mobilization, and the role of
  symbolic versus instrumental participation.
- Standard treatments of the logistic function and ordinary least squares.
