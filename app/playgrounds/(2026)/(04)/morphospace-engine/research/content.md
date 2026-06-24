# Morphospace Engine: Theoretical Morphology and the Space of Possible Forms

## Abstract

A morphospace is a coordinate system whose axes are the parameters of form and whose points are organisms, real or hypothetical. The morphospace engine is a node-graph laboratory for this idea: nodes (seeds, fields, constraints, mathematical constants, attractors, and observations) compose into a directed graph whose combined effect generates a two-dimensional morphology field. This companion situates the playground in the lineage of theoretical morphology, explains the deterministic field formula it actually computes, and is honest about where the model's prose claims outrun its classifier.

## 1. Background: what a morphospace is

The term morphospace comes from theoretical morphology, the project of describing not just the forms that exist but the larger space of forms that could exist. Its canonical example is David Raup's 1966 analysis of shell coiling.

### 1.1 Raup's shell cube

Raup showed that a remarkable diversity of molluscs, brachiopods, and other coiled shells can be captured by a logarithmic spiral with a small number of parameters. A common modern parameterisation uses:

- **W**, the whorl expansion rate: the factor by which the generating curve's distance from the coiling axis grows over one full revolution.
- **D**, the distance of the generating curve from the axis (relative to its own size).
- **T**, the rate of translation along the axis per revolution, which turns a flat planispiral into a helicospiral.
- **S**, the shape of the generating aperture.

A point in the W-D-T cube is a possible shell. Raup's striking result was that real organisms occupy only restricted regions of this cube: large swathes of geometrically valid shells are never realised. The empty regions are as informative as the occupied ones, because they raise the question of why evolution avoids them, whether through developmental impossibility, functional disadvantage, or simple historical contingency.

### 1.2 The logarithmic spiral

The geometric heart of Raup's morphospace is the logarithmic (equiangular) spiral:

    r(theta) = r0 * exp(k * theta)

where r0 is the starting radius and k controls the tightness of coiling. After one full turn (theta increases by 2*pi) the radius multiplies by exp(k * 2*pi), which is exactly Raup's whorl expansion rate W. So W = exp(2*pi*k), and the radius ratio between successive whorls is constant, which is why nautilus and snail shells look self-similar at every scale. The logarithmic spiral is also where the golden ratio enters biology: a growth factor that multiplies the radius by the golden ratio per quarter turn produces the "golden spiral" often (loosely) attributed to sunflower heads and nautilus chambers.

It is worth stating plainly that the morphospace engine in this playground does **not** implement Raup's W-D-T-S spiral. It is a more abstract, Levin-inspired field generator. The spiral material above is the intellectual backdrop, not the running code; section 3 describes what the code actually computes.

## 2. From shells to a general morphospace

Raup's cube is one morphospace among many. Theoretical morphology has since produced morphospaces for branching plants, teeth, leaves, and limb skeletons. Two broad styles have emerged:

- **Theoretical (generative) morphospaces**, like Raup's, whose axes are the parameters of a growth model. Every point is a synthesisable form.
- **Empirical (data-driven) morphospaces**, whose axes come from ordination methods such as principal component analysis applied to measured shapes. Points are real specimens; the axes are statistical, not generative.

The morphospace engine is a generative morphospace in spirit, but its "axes" are not a fixed tuple of numbers. Instead the space of forms is parameterised by an editable graph. This reflects a more recent, controversial reframing.

### 2.1 Levin's navigable form-space

Michael Levin and collaborators argue that morphogenesis is usefully modelled as goal-directed navigation through an abstract space of anatomical configurations, with bioelectric signalling acting as the steering system. In this reading, a developmental program is less a blueprint executed bottom-up and more a controller that drives tissue toward a target region of form-space and corrects deviations along the way. Planarian regeneration, where a fragment rebuilds exactly the missing anatomy, is the headline evidence: the system behaves as if it stores a target form and relaxes toward it.

The morphospace engine takes this metaphor literally. Each node is a tendency or constraint acting on a shared field, and the emergent pattern is read as a phenotype. This is an illustrative analogy, not a validated model of any specific organism.

### 2.2 Juarrero's constraints as causes

Alicia Juarrero's work on complex dynamics supplies the playground's treatment of constraints. Her central claim is that constraints are not merely passive boundary conditions but are causally efficacious: enabling constraints create the very possibility space within which a process can unfold. In the engine, a constraint node does not only subtract from the field (local damping); it also channels and sculpts it (the membrane term), so that patterns appear which would not exist without the constraint. A riverbank does not just contain water, it shapes the flow into meanders.

## 3. What the model actually computes

The running model is deterministic. The exported `computeField(graph, time)` function evaluates a scalar field on a square grid of side `FIELD_RESOLUTION` (currently 28, so 784 cells), with no random numbers inside it. The only stochastic step in the whole playground is the random placement of a manually added node; every preset is fully reproducible.

### 3.1 Effective strength and resonance

Before the field is drawn, each node's nominal strength is boosted by its incoming edges. Seeds, fields, constants, and attractors contribute positive resonance; observations contribute a small negative term. The boosted value is clamped to the band [0.04, 1.95]. This is how graph topology, not just node parameters, shapes the result: wiring a field into a constant raises that constant's effective forcing.

### 3.2 Per-node field contributions

For every grid point the field accumulates contributions:

- **Seed**: a Gaussian envelope times a radial sine wave plus a polarity bias. At a seed's own centre and time 0 the wave term is sin(0) = 0, so seeds contribute through their surroundings, not their exact centre.
- **Field**: a radial, horizontal, vertical, or spiral sinusoid plus a turbulence term, scaled by 0.72.
- **Constraint**: a profile (ring, stripe, or spiral band) that both multiplies a local damping factor and adds to a membrane accumulator. This is the Juarrero channel-and-dampen split.
- **Constant**: the forcing term. With c the stored constant value, m the (locally adjusted) mitigation, and a Gaussian halo G, the push is

      push = eff * (1 - m) * sin(c * (d * 1.65 + theta * 0.35) - 0.25 * t + phase) * G(d)

  plus a submerged echo proportional to ingress. Mitigation throttles the constant's surface influence; ingress controls how deeply it penetrates.
- **Attractor**: a recursive Gaussian basin that thickens nascent structure and adds further damping.

The accumulated value is multiplied by the product of all damping factors and passed through tanh for soft saturation. Metrics (energy, coherence, e-leakage, delta-leakage, centre and edge bias, anisotropy, swirl) are then spatial statistics of the resulting field, and a small rule-based classifier assigns one of six morphology labels.

### 3.3 The mathematical constants

The engine stores five constants as forcing terms: e, the golden ratio phi, pi, the Feigenbaum constant delta (4.6692...), and the silver ratio (1 + sqrt(2)). The first three are exact `Math` values; delta is a truncated literal; phi and silver are computed from square roots and therefore satisfy their defining identities exactly. The framing of these constants as "trans-real" forcing terms that leave fingerprints on physical form is a deliberately strong, speculative metaphor, flagged as such in the playground's assumptions panel. It should be read as a provocation about the role of mathematical structure in biology, not as an empirical mechanism.

## 4. Calibration: what is verified

Because the field formula is bespoke, there is no external dataset to calibrate it against in the way one might calibrate a shell model against real molluscs. Instead the calibration suite tests deterministic invariants of the engine, each predicted value computed by the model's own exported functions:

1. **Golden-ratio register.** The stored phi satisfies phi^2 = phi + 1 (predicted 2.618034, expected 2.618034). This confirms the register holds the true golden ratio, the constant that organises real logarithmic-spiral growth.
2. **Silver-ratio register.** The stored silver ratio satisfies s^2 = 2s + 1 (predicted and expected 5.828427).
3. **Quiescent colour floor.** A dead cell (field value 0) renders at lightness 7, the floor of the colour lerp, fixing the background tone.
4. **Discretisation.** `computeField` returns exactly `FIELD_RESOLUTION^2` = 784 cells.
5. **Observation fidelity.** An observation node reports exactly the field value at its grid cell, confirming the probe reads without shaping (encoded as a boolean match).

All five reproduce with zero error. They certify that the engine's arithmetic core and readout pipeline behave as documented, which is the honest scope of what a synthetic generative model of this kind can claim.

## 5. Limitations and honest discrepancies

- **Prose outruns the classifier.** The preset descriptions promise specific phenotypes: a "spiral membrane" for the golden-spiral preset, a "striped corridor" for the Feigenbaum ladder. At time 0 the classifier actually labels several of these presets "ring shell", because edge bias dominates before the animation evolves. The labels are emergent thresholds on noisy spatial statistics, so they shift as the field animates and as parameters change. Treat the preset descriptions as authored intentions, not guaranteed outputs.
- **Not a biological model.** Nothing here is fit to a real organism. The mapping from nodes to anatomy is illustrative. No claim of predictive biological accuracy is made.
- **The "trans-real constant" framing is speculative.** It is a philosophical stance about mathematical structure in nature, not a mechanism with evidence behind it.
- **No real morphospace coordinates.** Unlike Raup's W-D-T cube, the engine has no fixed, interpretable axes; the graph is the parameterisation, which is expressive but harder to compare across runs.

## 6. References

- Raup, D. M. (1966). Geometric analysis of shell coiling: general problems. *Journal of Paleontology*, 40(5), 1178 to 1190.
- McGhee, G. R. (1999). *Theoretical Morphology: The Concept and Its Applications*. Columbia University Press.
- Thompson, D'Arcy W. (1917). *On Growth and Form*. Cambridge University Press.
- Levin, M. (2019). The computational boundary of a "self": developmental bioelectricity drives multicellularity and scale-free cognition. *Frontiers in Psychology*, 10, 2688.
- Pezzulo, G., and Levin, M. (2015). Re-membering the body: applications of computational neuroscience to the top-down control of regeneration of limbs and other complex organs. *Integrative Biology*, 7(12), 1487 to 1517.
- Juarrero, A. (1999). *Dynamics in Action: Intentional Behavior as a Complex System*. MIT Press.
