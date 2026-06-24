# From the Action Principle to the Bordism Principle

## Abstract

Two of the deepest ways physics turns a process into a number sit side by side in this playground. The classical action principle assigns to a path through space a single real value, the action, and the realized motion is the one that extremizes it. The bordism principle of topological quantum field theory assigns to a piece of spacetime, viewed as a cobordism between boundary manifolds, a single algebraic value that depends only on its topology. The playground runs a faithful Newtonian simulation of a block on an inclined plane next to the closed-form invariants of SU(2) level-k Chern-Simons theory. The point is not that one becomes the other; it is that both are functors from a category of processes to a category of values, and seeing them together clarifies what each one keeps and what each one throws away.

## The action side: a path that extremizes a functional

In Lagrangian mechanics the state of the world at an instant is a point in phase space: a position and a velocity. Given those, the future is determined by integrating Newton's second law. The playground does exactly this for a block on a plane. The net acceleration along the incline is

```
a = g sin(theta) - mu g cos(theta)
```

when the block is sliding, clamped to zero when static friction holds it (when tan(theta) is at most mu). A quadratic air-drag term, proportional to the square of the velocity and opposing motion, is added on top. The integrator is explicit Euler with a capped timestep, which produces the qualitatively correct trajectory through space.

Behind this differential picture stands the action principle. Among all conceivable paths between two configurations, nature selects the one for which the action, the time integral of the Lagrangian, is stationary. The differential equation the playground integrates is the Euler-Lagrange equation of that variational problem. The defining feature of this side is locality in time: to know what happens next you only need the present instant. The answer carries units. It is a position in meters, a velocity in meters per second, a number anchored to a metric world.

## The bordism side: an invariant of spacetime shape

Topological quantum field theory makes a different move. Following Atiyah's axioms, a TQFT is a rule that assigns a vector space to each boundary manifold and a linear map to each cobordism between them, in a way that respects gluing. Baez and Dolan's cobordism hypothesis, made precise by Lurie, says that a fully extended TQFT is determined by a single object, its value on a point. The slogan is that the theory is fully local: cut spacetime down to points, assign data there, and reconstruct the whole by composition.

The concrete model in the playground is SU(2) Chern-Simons theory at level k, the theory whose Wilson-line expectation values are the Jones polynomial. Three closed-form quantities are reported, and all three are exact, not approximate:

- The three-sphere partition function,

```
Z(S^3) = sqrt(2 / (k + 2)) * sin(pi / (k + 2)),
```

a single real number summarizing the whole theory on the simplest closed 3-manifold.

- The conformal weight of a spin-j primary in the associated Wess-Zumino-Witten model,

```
h = j (j + 1) / (k + 2),
```

which sets the eigenvalue of the braiding operation.

- The braid amplitude itself, a pure phase

```
amplitude = exp(2 pi i * h * braids).
```

Because braiding is unitary, the magnitude of this amplitude is exactly 1 for any level and any number of crossings. Only the phase moves. The defining feature of this side is that nothing metric survives. There is no velocity, no instant, no meters. What matters is the topology of the worldlines: how many times they cross and in what order. The answer is a dimensionless complex number.

## What the two principles share, and what they do not

The honest thesis is an analogy at the level of structure, and the playground is built to make that analogy visible without overstating it.

Both principles are functors. The action principle sends a path to a real number; the bordism principle sends a cobordism to an algebraic value. Both are, in a precise sense, ways of integrating over a process: one literally integrates a Lagrangian along a worldline, the other assembles a value from local pieces of spacetime. The dictionary the playground draws, level versus angle, spin versus mass, braids versus friction, is a teaching device that lets the two panels move together.

But the two values live in different categories and answer different questions. The classical number has units and depends on the full metric geometry of the path; deform the path slightly and the action changes smoothly. The TQFT number is dimensionless and depends only on topology; deform the worldlines without changing their crossings and the amplitude does not move at all. That insensitivity is the whole content of the word topological. Treating one number as if it were the other, reading the dimensionless amplitude as a mechanical quantity or the action as a topological invariant, is a category error.

The playground also adds two frankly invented links so the picture animates as one: it identifies spin with half the mass and adds braid crossings as the block slides. Neither has any derivation from mechanics or from Chern-Simons theory. They are presentational, and the assumptions panel marks them as speculative. The serious claim is narrower and survives that disclaimer: the action principle and the bordism principle are two members of one family of constructions, each turning a process into a number, each keeping exactly the information its category can see.

## Calibration

Because both cores are deterministic with closed-form ground truths, the calibration panel checks the implementation against textbook identities rather than against noisy data. The frictionless slide reproduces g sin(theta); the static-hold case returns exactly zero acceleration when friction dominates; the three-sphere partition function at level 1 matches sqrt(2/3) sin(pi/3); the unknotted two-strand braid has unit modulus; and the spin-1 conformal weight at level 2 is one half. Every case reproduces exactly, which is what one expects when calibrating closed-form mathematics against itself: the panel is a regression test on the formulas, not a fit to an experiment.

## Limitations

This is a toy. It does not quantize the sliding block, does not evaluate a path integral, and does not derive the topological theory from the mechanical one. It places a faithful first-order mechanics simulation beside a faithful set of closed-form topological invariants and invites the comparison. The deep structures it gestures at, geometric quantization, the path integral that links a classical action to a quantum amplitude, and the full machinery of extended TQFT, are exactly the bridges the playground does not build. What it offers instead is a clear view of the two endpoints.

## References

- M. Atiyah, Topological quantum field theories, Publications Mathematiques de l'IHES, 1988.
- E. Witten, Quantum field theory and the Jones polynomial, Communications in Mathematical Physics, 1989.
- J. Baez and J. Dolan, Higher-dimensional algebra and topological quantum field theory, 1995.
- J. Lurie, On the classification of topological field theories, 2009.
- D. Freed, lectures on extended and fully local topological quantum field theory.
- N. Reshetikhin and V. Turaev, Invariants of 3-manifolds via link polynomials and quantum groups, 1991.
