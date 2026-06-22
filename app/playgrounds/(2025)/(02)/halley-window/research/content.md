# Halley Windows: Root-Finding as Complex Dynamics

## Abstract

This playground colours the complex plane by where Halley's root-finding method
lands when started at each point. The result is a fractal: smooth basins where
convergence is well-behaved, separated by infinitely intricate boundaries where
it is not. This companion explains the method, why it produces a fractal, and how
one parameter slides the whole picture between Newton's method and Halley's.

## From Newton to Halley

To find a root of a function f, Newton's method repeatedly steps

> z -> z - f(z) / f'(z),

following the tangent line to where it crosses zero. It converges quadratically:
the number of correct digits roughly doubles each step, near a simple root.

Halley's method, published by Edmond Halley in 1694, adds the second derivative:

> z -> z - 2 f f' / (2 f'^2 - f f''),

which uses local curvature as well as slope and converges cubically, roughly
tripling the correct digits per step. The playground exposes a weight on the
f f'' term: at weight 1 the iteration is exactly Halley, and at weight 0 the term
vanishes and the update collapses back to z - f/f', which is Newton's method. The
calibration confirms both special cases find the right roots.

## Why a fractal appears

The rendered polynomial is p(z) = z^n - 1, whose n roots are the n-th roots of
unity, equally spaced around the unit circle. Start the iteration somewhere and
it usually converges to one of those roots. Colour each starting point by the
root it reaches and you get the basins of attraction.

The surprise, first posed by Arthur Cayley in 1879 for Newton's method, is that
the boundaries between basins are not smooth. They are fractal: between any two
basins lies a sliver of a third, and zooming in never resolves a clean edge. This
is the same phenomenon as Julia sets in complex dynamics. Tiny changes in the
starting point can flip which root you reach, so the boundary encodes a sensitive
dependence on initial conditions, the signature of chaos.

The calibration here deliberately stays in the well-behaved interior: it starts
near a root and verifies the iteration converges to an exact root of unity (every
such root has modulus one). It does not try to put a number on the fractal
boundary, which is where the dynamics are genuinely chaotic.

## What the controls do

- **degree** sets n, the number of roots and the rotational symmetry of the
  picture.
- **constant** weights the second-derivative term, sliding between Newton (0) and
  Halley (1) and beyond, where convergence is no longer guaranteed.
- **center, zoom** pan and magnify; deep zooms eventually hit the limits of the
  shader's floating-point precision.

## Honest limits

The image is computed per pixel with a finite iteration cap and a bailout radius,
so the basin boundaries are approximations that sharpen as you raise the budget.
The shader works in single precision, so very deep zooms show numerical artifacts
rather than true mathematical detail. And weights far from 0 or 1 are exploratory:
the iteration can diverge or land on spurious points, which is part of what makes
the parameter interesting to sweep.

## References

- Halley, E. (1694). A new, exact, and easy method of finding the roots of
  equations.
- Cayley, A. (1879). The Newton-Fourier imaginary problem.
- Standard references on Newton/Halley fractals and basins of attraction in
  complex dynamics.
