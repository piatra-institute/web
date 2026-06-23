# Raupian Morphospace: The Shape of All Possible Shells

## Abstract

In 1966 David Raup showed that the bewildering variety of coiled shells, snails,
ammonites, clams, can be captured by a handful of geometric parameters. Plotting
those parameters as axes defines a morphospace: a space of all possible shell
shapes, most of which never evolved. This playground lets you fly through that
space, and its calibration pins down the exact geometry underneath.

## Three numbers for a shell

Raup's insight was that a shell grows by accretion at its opening, adding to a
tube that sweeps along a logarithmic (equiangular) spiral. Self-similar growth
means the same form scales up as the animal grows. Three parameters describe the
sweep:

- **W**, the whorl expansion rate: how fast the tube widens. The spiral radius
  multiplies by exactly W every full revolution, and by W to the n over n
  revolutions. This is the parameter that separates a tight snail from a rapidly
  flaring limpet.
- **D**, the distance of the generating curve from the coiling axis: whether the
  whorls hug a central column or leave an open umbilicus.
- **T**, the translation rate along the axis: zero gives a flat planispiral
  (an ammonite), positive values give a helicospiral cone (a snail). After one
  whorl the shell has advanced along the axis by T times the current radius.

The calibration panel checks these relations directly: radius growth of W per
whorl, W squared over two whorls, the square root of W over half a whorl, and the
axial offset equal to T times the radius.

## Theoretical versus realized morphospace

The deep point is not the equations but the picture they make. When Raup plotted
real shells in the W-D-T cube, they did not fill it. They clustered in a few
regions, leaving vast volumes of geometrically possible but biologically unseen
forms. Some empty regions are functionally impossible (whorls that would
intersect themselves), others are simply unvisited by evolution. The morphospace
turns "why do shells look the way they do" into a map with occupied and empty
territory, and makes the constraints visible.

## What the renderer does, honestly

The 3D viewer draws the canonical spiral, with one cosmetic adjustment: it
applies a sensitivity exponent to W so the slider feels responsive across its
range, which means the on-screen expansion is a remapped version of the raw
slider value. The mathematics in the logic module, and everything the calibration
checks, is the textbook relation r grows as W per whorl; the viewer's tweak is
purely about the feel of the control, and the assumptions panel says so.

## Limits

This is a descriptive geometric model of the finished shape, not a model of how a
mollusc actually secretes its shell. It captures gross coiling, not ornament,
ribbing, aperture detail, or changes in growth rate through life. It says which
shapes are geometrically possible, not which are developmentally reachable or
selectively favoured. Those are exactly the questions the empty regions of the
morphospace invite.

## References

- Raup, D. M. (1966). Geometric analysis of shell coiling: general problems.
  Journal of Paleontology.
- Subsequent literature on theoretical morphology and the occupation of
  morphospace.
