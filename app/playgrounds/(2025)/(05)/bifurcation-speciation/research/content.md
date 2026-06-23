# Bifurcation Speciation: One Species Splits Into Two

## Abstract

How can one population, in one place, with no geographic barrier, split into two
species? This playground dramatizes Ian Stewart's answer: sympatric speciation as
a symmetry-breaking bifurcation. A population of birds spread along a trait axis
stays a single cluster until competition crosses a threshold, then spontaneously
splits in two. The Gaussian machinery underneath is exact and checkable; the
speciation story is the interpretation it supports.

## The BirdSym model

Picture each bird as a point on a one-dimensional trait axis, say beak size,
between 0 and 1. Two forces act on it:

- **Resources**: seeds are distributed as a Gaussian around some mean size, so
  birds near the richest seed size do best.
- **Competition**: birds with similar traits compete for the same seeds. Feeding
  efficiency is a Gaussian of the distance between a bird's trait and the seed it
  targets, so close competitors push each other apart in trait space.

The model steps each bird's trait under the balance of these forces. The
calibration panel pins the kernels directly: the feeding peak height at a matched
trait, the resource peak, the symmetry of the resource curve about its mean, and
the drop to e^(-1/2) of the peak one standard deviation away.

## Speciation as broken symmetry

The interesting behaviour is governed by a single bifurcation parameter, the
strength of competition. When it is weak, a single tight cluster at the
resource peak is stable: everyone eats the best seeds and the symmetric state
holds. As competition strengthens past a critical value, that symmetric state
loses stability. Sitting together becomes too costly, and the population splits
into two clusters that specialize on either side of the resource peak.

This is a pitchfork bifurcation, the same mathematics as a buckling beam or a
magnet picking a direction below its critical temperature. Speciation here is
literally spontaneous symmetry breaking: the system had a symmetric option, the
symmetry became unstable, and it picked a split. The bifurcation diagram sweeps
the competition parameter and shows the single branch forking into two.

## What is exact, and what is interpretation

The Gaussian resource and feeding kernels are deterministic and exact, and the
calibration verifies them. The dynamics are deterministic Euler steps, with one
exception: initial bird positions carry a tiny random perturbation (you need to
break the perfect symmetry for the split to choose a direction), so individual
runs differ slightly while the qualitative fork is robust. That is why the
calibration targets the kernels, not a specific trajectory.

The reading of all this as biological speciation is a model, not a measurement.
Real speciation involves genetics, assortative mating, and ecology this
one-dimensional trait model leaves out. What the playground demonstrates is the
mechanism, how competition alone can make one cluster become two, not the
speciation history of any real lineage.

## References

- Stewart, I., Elmhirst, T., and Cohen, J. (2000). Bifurcation, symmetry and
  patterns. (The BirdSym model.)
- Dieckmann, U., and Doebeli, M. (1999). On the origin of species by sympatric
  speciation. Nature.
- Standard references on pitchfork bifurcation and spontaneous symmetry breaking.
