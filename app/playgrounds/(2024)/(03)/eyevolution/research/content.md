# Eyevolution: How an Eye Can Evolve in Small Steps

## Abstract

Darwin called the eye an "organ of extreme perfection" and admitted it seemed
absurd that it could form by natural selection, then argued that it could, given
a graded series of useful intermediates. This playground turns that argument into
a simulation: organisms with simple visual traits mutate and are selected, and
eyes climb a ladder from light-sensitive spot to lens. The evolution is
stochastic, but the fitness and classification rules underneath are exact, which
the calibration pins.

## The Nilsson-Pelger ladder

In 1994 Dan-Eric Nilsson and Susanne Pelger showed, with a step-by-step model,
that a flat patch of light-sensitive cells could evolve into a focused lens eye
through many tiny, individually advantageous changes, in far less geological time
than intuition suggests. The key is that every intermediate is useful: a slight
cupping improves directionality, a narrower aperture sharpens the image, and so on.

The playground encodes that ladder as a sequence of eye types, none, eyespot, pit,
pinhole, lens (plus a compound variant), and lets organisms walk it under
selection. Each organism carries three continuous traits, visual acuity, light
sensitivity, and field of view, and its eye type is decided by where their average
falls on a threshold ladder. The calibration checks the ends of that ladder: a
zero composite gives no eye, a high composite gives the most complex type.

## What drives the climb

Fitness combines a base value for the current eye type (better eyes are worth
more) with environmental bonuses, light intensity rewards light sensitivity,
environmental complexity rewards acuity, predation rewards a wide field, minus a
metabolic cost for building the apparatus. The result is clamped to [0, 1]. The
calibration verifies this arithmetic: a lens eye's base of 0.85, a light bonus
pushing fitness to the cap of 1, and a metabolic penalty driving a costly eyeless
organism to 0.

Selection then favours higher-fitness offspring, and mutation nudges the traits,
so over generations the population tends to climb toward better eyes, when the
environment rewards them. Because the steps are small and each is selected, the
climb is gradual, exactly Darwin's point.

## Convergence

Run several lineages and they can independently arrive at the same eye type, a nod
to one of evolution's most striking facts: eyes have evolved many times over,
and camera-type eyes appear in both vertebrates and cephalopods from separate
starting points. In the model this convergence falls out of a shared fitness
landscape; in nature it has richer, more contingent causes the model does not
capture.

## Honest scope

The three-trait composite is a coarse stand-in for real eye morphology, the
fitness weights are illustrative, and the dynamics are stochastic. The model
demonstrates the logic, that complex eyes can arise by graded selection, not the
actual phylogeny or timing of any lineage. The exact, checkable content is the
fitness function and the eye-type classifier; the evolutionary story is the lens.

## References

- Nilsson, D.-E., and Pelger, S. (1994). A pessimistic estimate of the time
  required for an eye to evolve.
- Darwin, C. (1859). On the Origin of Species. (Organs of extreme perfection.)
- Land, M. F., and Nilsson, D.-E. Animal Eyes.
