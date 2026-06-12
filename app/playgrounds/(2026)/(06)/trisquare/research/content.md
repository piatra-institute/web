# TriSquare: Conformal Gravity, a Perfect Square, and Phi-Fourth

## Abstract

Neil Turok's program proposes a three-way correspondence: a constrained limit of quantum gravity, a perfect-square scalar action, and four-dimensional scalar phi-fourth theory may be mutually translatable. Diffeomorphism invariance supplies a Ward identity that restricts the form of the action in the ultraviolet, and a single dimensionless coupling controls the structure, by analogy with gauge theory. The correspondence is currently established only for conformally flat metrics. This companion explains each leg of the claim, separates what is textbook from what is conjecture, and describes the toy explorer that accompanies it.

## The proposal

The proposal asserts, schematically:

> QG (gamma to 0)  -->  PS  <-->  ‖phi‖_4^4,
> extending to low energies including mass terms and the Einstein-Hilbert term,
> so far only for conformally flat metrics.

The symbols:

- **QG (gamma to 0)** is a special limiting version of quantum gravity, not generic quantum gravity. The notation is author-specific.
- **PS** is a perfect-square action: a dimension-zero scalar theory whose action can be written as a square.
- **‖phi‖_4^4** is the L4 norm to the fourth power, essentially a 4D quartic scalar theory, where the coupling is dimensionless.

The arrows carry annotations: diffeomorphism invariance gives a Ward identity that drives the UV action into the perfect-square form; a single coupling controls it, "cf. gauge theory"; the correspondence is claimed even at low energies, but so far only for conformally flat metrics.

## Conformally flat metrics

A conformally flat metric is flat up to a position-dependent scale factor:

> g_{mu nu}(x) = Omega^2(x) eta_{mu nu}.

Distances stretch or shrink from point to point, but angles and light cones are preserved locally. Conformally flat is not the same as flat: Omega(x) can vary, so curvature is present. In four dimensions a metric is conformally flat exactly when its Weyl tensor vanishes,

> C_{mu nu rho sigma} = 0.

The Weyl tensor carries the free gravitational field: tidal structure, gravitational radiation, generic black-hole geometries. Restricting to conformally flat metrics keeps the conformal-factor sector of gravity and throws away the genuinely spin-2 part. That is why this sector maps so easily onto a scalar field, and why the caveat matters so much.

## The conformal sector as one scalar field

On a 2D Euclidean slice ds^2 = Omega^2 (dx^2 + dy^2), the Gaussian curvature is

> K = -Omega^{-2} Laplacian(ln Omega),    R = 2K.

Writing Omega = e^{phi}, the whole geometry of the slice is the dynamics of one scalar field phi. The playground's conformal tab makes this literal: you pick a conformal factor (a bump, a well, an oscillating wave, a lumpy field), and the curvature heatmap is computed directly from it with a five-point finite-difference Laplacian. The calibration panel validates the method against metrics of known constant curvature: the round sphere (K = +1/c^2 for Omega = 2c/(1+r^2)) and the Poincare disk (K = -1 for Omega = 2/(1-r^2)). Agreement is better than one percent.

## The Ward identity as compression

The claim that the Ward identity restricts the form of the Lagrangian in the UV is the most interesting part. Start with a messy Lagrangian:

> L = a1 phi^4 + a2 (d phi)^2 + a3 phi^2 + a4 R + a5 R^2 + a6 C^2 + a7 Lambda + ...

Then turn on symmetries:

- **Scale invariance** removes every term whose coupling carries mass dimension: the scalar mass, the Einstein-Hilbert term (whose coupling is the Planck mass squared), and the cosmological constant.
- **Conformal invariance** removes non-Weyl curvature couplings; among curvature terms only the Weyl-squared action survives.
- **Diffeomorphism invariance** removes frame-fixed, non-covariant terms.
- **Single coupling** collapses the surviving dimensionless couplings into one, as a single gauge coupling controls a Yang-Mills theory in the UV.

The Ward game in the playground is a schematic of this: toggling symmetries thins a fixed menu of terms, with a verdict and a reason for each. Real Ward identities are constraints on correlation functions, not a checklist on terms, so this is an illustration of the intuition, not a derivation.

## Why phi-fourth, and the single coupling

In four dimensions, lambda phi^4 is special: lambda is dimensionless, so the theory is classically scale invariant and renormalizable. Its one-loop running is

> d lambda / d ln mu = 3 lambda^2 / (16 pi^2),

with the closed-form solution lambda(t) = lambda0 / (1 - (3 lambda0 / 16 pi^2) t), developing a Landau pole at t* = 16 pi^2 / (3 lambda0). The flow tab plots this. The point of the "single coupling cf. gauge theory" annotation is structural: if one dimensionless coupling controls the whole UV structure, the theory has gauge-theory-like simplicity. That is the prize the correspondence is reaching for.

## What is solid and what is not

The playground tags every claim into three tiers, shown on the triangle edges and in the status ledger:

- **Exact in the toy model**: the 2D conformal curvature formula and its numerical implementation; the symmetry-compresses-terms statement of the Ward game.
- **Known physics**: conformal invariance of light cones; Weyl tensor vanishing for conformally flat metrics; the one-loop phi-fourth beta function and its Landau pole; the reduction of conformally flat gravity to a single scalar.
- **Speculative / paper claim**: the central correspondence that constrained quantum gravity equals a perfect-square scalar theory mapping to phi-fourth, and its extension to low-energy mass and Einstein-Hilbert terms. This is research-level, shown only for conformally flat metrics, and not textbook physics.

## The broader program

Boyle and Turok previously proposed that 36 conformally coupled dimension-zero scalar fields could cancel the Standard Model's vacuum energy and Weyl anomalies, while implying three fermion generations with right-handed neutrinos and an emergent composite Higgs (arXiv:2110.06258). Their cosmology work tries to explain primordial perturbations without inflation, extending a radiation-dominated, CPT-symmetric universe through the big bang (arXiv:2302.00344). The dimension-zero four-derivative scalar construction has negative-norm states in canonical quantization; the program claims these are removed by an infinite-dimensional symmetry or superselection rule. The playground isolates only the geometry-to-scalar correspondence and does not model the quantization or the particle content.

## Takeaway

If the correspondence holds, it would give quantum gravity a gauge-theory-like simplicity, controlled by symmetry and a single coupling. The weak point is that the result is shown only for conformally flat metrics, which is like having a theory of the ocean for perfectly flat waves: useful and elegant, but not the whole sea. The playground exists to make the correspondence intelligible without pretending the speculative part is already established.

## References

- L. Boyle and N. Turok, "Cancelling the vacuum energy and Weyl anomaly in the standard model with dimension-zero scalar fields," arXiv:2110.06258.
- L. Boyle and N. Turok, cosmology without inflation, arXiv:2302.00344.
- Standard references on conformal geometry, the Weyl tensor, and the phi-fourth renormalisation group.
