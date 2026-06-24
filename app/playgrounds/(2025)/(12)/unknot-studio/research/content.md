# The Unknot and the Unknotting Problem

## Abstract

A mathematical knot is a closed loop embedded in three-dimensional space, considered up to continuous deformation that never lets the loop pass through itself. The simplest knot is the **unknot**, the plain circle. Deciding whether a given tangled loop is secretly the unknot is the *unknotting problem*, one of the oldest and most studied decision problems in low-dimensional topology. This companion explains what the Unknot Studio playground computes, why most of its live readouts are diagram quantities rather than true invariants, and how the closed-form invariants for torus knots connect to deep results, including the 2025 proof that the unknotting number is not additive.

## 1. Knots, diagrams, and Reidemeister moves

A knot lives in three dimensions, but we usually study it through a **diagram**: a projection onto the plane in which the only singularities are transverse double points, each marked to show which strand passes over and which passes under. A single knot has infinitely many diagrams. Two diagrams represent the same knot if and only if one can be turned into the other by a finite sequence of **Reidemeister moves**:

- **Move I** adds or removes a single kink (a self-crossing twist).
- **Move II** slides one strand over another, creating or removing two crossings.
- **Move III** slides a strand across a crossing of two other strands.

This theorem, due to Reidemeister (and independently Alexander and Briggs) around 1927, is the foundation of combinatorial knot theory. Every quantity that is unchanged by all three moves is a property of the knot itself, a **knot invariant**.

## 2. Invariants versus diagram quantities

The distinction the playground tries to make vivid is between true invariants and quantities that merely describe one diagram.

**Crossing number** is the minimum number of crossings over *all* diagrams of the knot. It is a genuine invariant, but computing it requires a minimisation over the infinite set of diagrams, which is why the live crossing count shown in the playground (read off a single random projection) is only an *upper bound*. The projection search samples many orientations precisely to push that upper bound down toward the true minimum.

**Writhe** is the signed sum of crossings in a chosen diagram, using a right-hand convention to assign plus or minus one to each crossing. Writhe is *not* a knot invariant. A Reidemeister I move changes the writhe by plus or minus one while leaving the knot untouched. Only when writhe is paired with a framing (the self-linking number) does it become invariant under the moves that preserve framing. The playground's writhe readout changes as you rotate the curve, which is a direct demonstration of this non-invariance.

The **unknotting number** u(K) is the minimum number of crossing changes (swapping over and under at a crossing) needed to turn the knot into the unknot, minimised over all diagrams. It is an invariant, but a notoriously hard one to compute or even bound.

## 3. The unknotting problem and its complexity

Given a diagram, is it the unknot? Haken gave an algorithm in the 1960s using normal surface theory. The modern picture is sharper:

- Unknot recognition is in **NP** (Hass, Lagarias, and Pippenger, 1999): a yes-instance has a polynomial-size certificate.
- It is also in **co-NP**, shown by Lackenby (2021) building on earlier work, so the problem is unlikely to be NP-complete.
- No polynomial-time algorithm is known, though practical software (using normal surfaces, sum-of-squares, or the knot group) untangles most real examples quickly.

The gap between "we can certify both yes and no answers efficiently" and "we still have no polynomial algorithm" is what keeps the unknotting problem interesting.

## 4. Torus knots and their closed forms

The playground's curves are **torus knots** T(p, q): curves that wind p times around the longitude and q times around the meridian of a torus. The key facts the model relies on are exact:

- T(p, q) is a single knot exactly when **gcd(p, q) = 1**. When p and q share a common factor d, the curve is a d-component *link*, and the playground's invariant functions correctly return null.
- The **crossing number** of T(p, q) for coprime p, q is

  ```
  c(T(p, q)) = min((p - 1) q, (q - 1) p).
  ```

  This was established by Murasugi. For the unknot T(1, q) it gives min(0, q - 1) = 0, recovering the fact that the trivial knot has crossing number zero.

- The **unknotting number** of T(p, q) is

  ```
  u(T(p, q)) = (p - 1)(q - 1) / 2.
  ```

  This was the **Milnor conjecture**, proved by Kronheimer and Mrowka in 1993 using gauge theory (instanton invariants), and later by other methods including Ozsvath and Szabo's Heegaard Floer homology. For the trefoil T(2, 3) it gives 1; for T(2, 7) it gives 3.

These closed forms are what the calibration panel checks: each predicted value is produced by the same functions the live playground uses, and compared against the textbook value.

## 5. Connected sums and the 2025 non-additivity result

The **connected sum** K1 # K2 is formed by cutting an arc out of each knot and gluing the loose ends together. Many invariants behave nicely under this operation: genus is additive, and the Alexander and Jones polynomials multiply. For decades it was natural to expect the unknotting number to be additive as well,

```
u(K1 # K2) = u(K1) + u(K2),
```

and this was a long-standing open question. In **2025, Mark Brittenham and Susan Hermiller** disproved it. Taking K = T(2, 7), with u(K) = 3, they exhibited an unknotting sequence showing

```
u(K # mirror(K)) <= 5 < 6 = u(K) + u(mirror(K)).
```

The conceptual lesson is striking: the cheapest way to untie a composite knot can require first making the diagram *more* complicated (raising the crossing count) before any crossing change pays off. The playground's preset loads exactly this pair, and the calibration includes a boolean check that the detector flags this configuration.

## 6. What the playground does and does not claim

The Unknot Studio is a geometric sandbox, and its honesty rests on a few distinctions:

- The **closed-form crossing and unknotting numbers** are exact and calibrated.
- The **live crossing count and writhe** are diagram quantities tied to the current projection, not invariants. They are explicitly shown to vary with rotation.
- The **connected sum** is realised geometrically with bezier bridges; it reproduces the topology faithfully but does not recompute summed invariants symbolically.
- **Ropelength** is approximate: thickness is estimated as the nearest distance between non-adjacent samples, a coarse proxy for the ideal-knot tube radius. The **tighten** operation is a smoothing-plus-repulsion heuristic, not a validated ropelength minimiser.

## References

- Reidemeister, K. *Knotentheorie.* 1932.
- Murasugi, K. "On the braid index of alternating links." 1991. (Torus knot crossing number.)
- Kronheimer, P. and Mrowka, T. "Gauge theory for embedded surfaces, I." *Topology*, 1993. (Proof of the Milnor conjecture, hence torus-knot unknotting numbers.)
- Hass, J., Lagarias, J., and Pippenger, N. "The computational complexity of knot and link problems." *Journal of the ACM*, 1999.
- Lackenby, M. "Unknot recognition in quasi-polynomial time." 2021.
- Gonzalez, O. and Maddocks, J. "Global curvature, thickness, and the ideal shapes of knots." *PNAS*, 1999.
- Brittenham, M. and Hermiller, S. "Unknotting number is not additive under connected sum." 2025.
