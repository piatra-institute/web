# Kerr Causality

## Abstract

This playground models the causal structure of the maximally extended Kerr solution: the geometry of a rotating black hole written down by the exact vacuum equations. It treats one null geodesic at a time, classifies it by which sector of the diagram its allowed corridor lives in, and visualises the corridor in two complementary ways: a Carter-Penrose tile schematic of the causal sectors, and a plot of the radial potential R(r) whose non-negative intervals are the corridor. The figure that prompted the playground shows the singular case where the photon has zero conserved energy at infinity, positive Carter constant, and negative angular momentum; the playground exposes the slider region that case sits in, and several neighbours that contrast with it.

## Background

The Kerr metric describes the vacuum gravitational field outside a stationary, rotating, uncharged black hole. It has two parameters in geometrised units: mass M and spin per unit mass a. Two horizons appear at r± = M ± √(M² − a²): the outer event horizon r+ and the inner Cauchy horizon r−. Between them, an extended ergoregion exists in which the time-translation Killing vector is spacelike. A real particle inside the ergoregion can carry conserved energy E ≥ 0, but also E = 0 or E < 0: this is what makes the Penrose process possible.

A null geodesic of the Kerr metric is fully determined by three independent constants of motion: the energy E at infinity, the axial angular momentum L, and the Carter constant Q. The radial motion separates as a single first-order equation

R(r) = [(r² + a²)E − aL]² − Δ(r) · [Q + (L − aE)²]

with Δ(r) = r² − 2Mr + a². Allowed motion is exactly the set of r where R(r) ≥ 0; the turning points are real roots of R(r). When E = 0 the formula reduces to

R(r) = a²L² − Δ(r) · (Q + L²)

and the two turning points have the closed form

r{min,max} = M ∓ √(M² − a²Q / (Q + L²))

provided the radicand is non-negative.

## What the diagram shows

The Carter-Penrose tile diagram is a topological map of the causal sectors of the maximally extended Kerr geometry. Each tile is a compactified region: two exterior universes M_I and M'_I sit at the top and bottom, the M_II / M'_II sectors lie between the two horizons, and the deep inner sectors M_III / M'_III sit around the ring singularity at r = 0. The outer horizons connect tiles across r = r+ and are drawn here as bright lime X-shapes. The inner horizons at r = r- are drawn as orange X-shapes. Crossing a horizon swaps which coordinate behaves like time.

A photon traverses tiles by moving along its allowed corridor in r. For the figure-like ergoregion case the corridor crosses both horizons, so the photon walks through every causal sector reachable from one side of the diagram, then turns back at r_max, returns through both horizons, and oscillates.

## Model description

The model has six pieces.

**Six named scenarios** in `logic/cases.ts`, each a full `(a, E, L, Q)` profile with a gloss and a literature source. The first three reproduce the demo: the figure-like E = 0 ergoregion case, a positive-energy comparison, and a negative-energy ergoregion case. The other three stress different physics: the Schwarzschild limit (a → 0), the near-extremal limit (a → M), and a polar plunge with L = 0 and large Q.

**Four parameter sliders**: spin a, energy E (allowed exotic), angular momentum L, Carter constant Q. M is fixed at 1.

**A radial potential plot** showing R(r) over r ∈ [−1.6, 3.8], with allowed bands filled and vertical markers at r-, 0, and r+. Roots are extracted by 1200-sample sign-change detection followed by bisection.

**A four-tier regime classification** assigning each configuration to one of `unbounded escape`, `captured outside`, `trapped across horizons`, or `trapped inside r-` based on where the dominant allowed corridor sits relative to the horizons.

**A causal-diagram visualisation** with a Bezier-sampled photon path threading the central tile column, animated and snapshot-able.

**Standard scientific panels**: a parameter sweep that plots six metrics (rMin, rMax, r-, r+, allowed span, crossings) as a function of one constant; a sensitivity tornado on the allowed span; a calibration table whose Schwarzschild and E = 0 rows are checked against closed-form expected values; and ten assumption entries with confidence and falsifiability notes.

## Results

**Trapped across horizons.** Under the figure-like ergoregion preset (a=0.86, E=0, L=−2.0, Q=1.5), the closed-form turning points are r{min,max} = 1 ∓ √(1 − 0.86²·1.5 / (1.5 + 4)) ≈ 0.107 and 1.894. The horizons sit at r- ≈ 0.490 and r+ ≈ 1.510. The corridor straddles both, the photon never escapes to infinity, and the diagram lights up the entire central tile column.

**Wanting an exit.** Switching to the positive-energy comparison (E = 0.65, everything else equal) eliminates the upper turning point: R(r) stays non-negative out to the scan boundary, and the photon escapes. The status flips to `unbounded escape`.

**The Schwarzschild limit holds.** Setting a = 0.01 returns r+ ≈ 2.000 and r- ≈ 0.000 to within 0.01, matching the Schwarzschild horizons.

## Limitations

The model is a clean-room study of the vacuum Kerr metric. It does not include backreaction, accretion flows, magnetic fields, or quantum effects. The Cauchy horizon at r- is believed to be violently unstable in any realistic collapse: mass inflation produces an effectively singular boundary, so the inner-sheet corridors shown here should be read as the geometry the exact equations allow on paper, not as a physical tunnel through any real astrophysical hole. The tile diagram is topological rather than metric-accurate; the radial potential plot is the part that carries the actual physics.

## References

- Carter, B. *Global structure of the Kerr family of gravitational fields*. Physical Review 174 (1968).
- Carter, B. *Hamilton-Jacobi and Schrodinger separable solutions of Einstein's equations*. Communications in Mathematical Physics 10 (1968).
- Penrose, R. *Gravitational collapse: the role of general relativity*. Rivista del Nuovo Cimento (1969).
- Penrose, R. and Floyd, R. M. *Extraction of rotational energy from a black hole*. Nature Physical Science (1971).
- Hawking, S. W. and Ellis, G. F. R. *The Large Scale Structure of Space-Time* (1973), chapter 5.
- Chandrasekhar, S. *The Mathematical Theory of Black Holes* (1983), chapter 7.
- Poisson, E. and Israel, W. *Internal structure of black holes*. Physical Review D 41 (1990).
- Frolov, V. P. and Novikov, I. D. *Black Hole Physics* (1998).
