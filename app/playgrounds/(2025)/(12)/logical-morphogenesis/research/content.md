# Logical Morphogenesis: Paradoxes as Rhythms

## Abstract

"This sentence is false." Classical logic chokes on it: call it true and it is
false, call it false and it is true. This playground takes a different stance,
borrowed from the revision theory of truth: instead of demanding a single answer,
let the truth value update in time. The Liar then stops being a contradiction and
becomes an oscillation. Networks of self-referential sentences become dynamical
systems with cycles and attractors, and the dynamics underneath are exact, which
the calibration pins.

## Truth in time

Each sentence has a truth value that updates from the previous step according to
what it asserts:

- A **constant** is always true or always false.
- The **Liar** ("this sentence is false") returns the negation of its own
  previous value, so it flips every step.
- A **truth-teller** ("this sentence is true") keeps its value.
- **Assertions** copy or negate another sentence's previous value.
- A **biconditional** is true exactly when it and its target agreed last step.

All sentences update synchronously from the previous global state, the same
discrete-time convention as a cellular automaton. The calibration checks the
single-step logic of these rules directly (the biconditional, the negating
assertion).

## Paradox becomes period

Run the Liar and it produces ...true, false, true, false..., a cycle of period 2.
The calibration confirms it. The truth-teller, by contrast, is a fixed point,
period 1. This is the heart of the revision-theoretic reading: a paradox is not a
broken statement but a statement with no stable value, whose revision sequence
never settles, instead it cycles.

Because the global state is a finite vector of bits, the trajectory must
eventually repeat (pigeonhole), so every run ends in a cycle. The first repeated
state marks where the attractor begins, and the distance to it is the period. The
calibration verifies the detector on a constructed two-state alternation (period
2). This eventual periodicity is a theorem, not a hope.

## Networks and "morphogenesis"

Wire many sentences together, mutual negation, reference rings, mixed assertions,
and the cycles get richer: longer periods, transients before the attractor,
sensitivity to the initial assignment. Calling the resulting stable temporal
patterns "morphogenesis" is a metaphor: just as morphogenesis is the emergence of
biological form, here logical form (rhythm, cycle, fixed point) emerges from
local self-referential rules. It is a lens on self-reference, not a model of
development, and the assumptions panel says so.

## One sentence with memory

Most rules look back one step, but a "percent controller" looks at a moving
average of its own recent history and tries to hold its truth rate near a target.
That adds memory and changes the achievable cycles. It is an honest extension; the
calibration deliberately targets the memoryless rules, where the periods are
unambiguous.

## Where this sits among theories of paradox

The dynamical reading is one of several responses to the Liar. Truth-value-gap
theories say the Liar is neither true nor false; glut (paraconsistent) theories
let it be both; the revision theory used here says it has no stable value and
models the unstable revision process itself. The playground commits to the
revision/dynamical view because it is the one that turns into something you can
watch and measure.

## References

- Gupta, A., and Belnap, N. (1993). The Revision Theory of Truth.
- Kripke, S. (1975). Outline of a theory of truth.
- Standard references on finite-state dynamics and eventual periodicity.
