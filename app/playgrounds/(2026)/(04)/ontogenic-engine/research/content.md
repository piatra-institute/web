# Ontogenic Engine: Research Companion

## Abstract

The ontogenic engine is a small dynamical sketch of an idea that runs through twentieth-century philosophy of life: an entity is not a substance that happens to persist, but an ongoing achievement of self-maintenance. The playground couples five state variables (viability, coherence, novelty, tension, boundary flux) under six control parameters (autonomy, boundary, plasticity, coupling, memory, perturbation) and reads out a composite "becoming index". This companion documents what the model actually computes, where it succeeds as a pedagogical object, and where it diverges from the prose claims attached to it. The honest summary is that the algebraic core of the model is exact and verifiable, while the full nonlinear trajectory is fragile and tends to saturate, so the model illustrates a conceptual vocabulary far better than it reproduces stable individuation.

## Background

Four research programs supply the vocabulary.

Gilbert Simondon's theory of individuation (1958) inverts the usual order of explanation. Rather than starting from finished individuals and asking how they relate, Simondon starts from a pre-individual field of tensions and asks how individuals crystallize out of it. Individuation is the operation; the individual is its residue. Crucially, the operation never fully completes, so a living individual carries an unresolved charge that keeps it capable of further becoming.

Maturana and Varela's autopoiesis (1980) gives this a mechanical reading. A living system is a network of processes that produces the very components and relations that constitute the network, including the boundary that distinguishes it from its surroundings. Operational closure, not any particular material, is what makes the system a unity.

The enactivist tradition (Varela, Thompson and Rosch, 1991; Thompson, 2007; Di Paolo, 2005) adds that this self-production is not isolation. The system maintains itself through active sensorimotor engagement with a world it partly brings forth. Autonomy and coupling are complementary, not opposed.

Friston's active inference (2013) and the Markov-blanket formalism (Kirchhoff et al., 2018) recast the boundary in statistical terms: a Markov blanket is a set of states that conditionally separates internal from external states, so that the inside can be modeled as inferring and acting on the outside. This reading is powerful but contested, and the playground treats the boundary parameter as an analogy to it rather than an implementation of it.

## Model description

Let the six control parameters be scaled to the unit interval as a (autonomy), b (boundary), p (plasticity), c (coupling), m (memory), q (perturbation). The model first forms a set of interaction terms intended to be biologically interpretable:

- self-production = 8ab + 6m - 4q
- exploration = 9pc
- repair = 10ab + 4m
- blanket stress = 10q + 6c - 8b
- overfit rigidity = max(0, m + b - p - 0.9) times 18
- reorganization = 7p + 4c - 3m
- exposure = 12qc

These feed five coupled update equations for tension, viability, coherence, novelty, and boundary flux, each clamped to the range 0 to 100 and each carrying a small sinusoidal forcing term meant to evoke a metabolic rhythm. After every step the becoming index is computed as a weighted blend that rewards joint achievement:

B = 0.28 V + 0.22 C + 0.18 N + 0.16 (100 - 2 |50 - flux|) + 0.16 (100 - T)

The flux term peaks at moderate openness (flux near 50) and the tension term is penalized when high, so the index is highest when viability, coherence, and novelty are all strong while the system stays neither sealed shut nor torn open.

Two derived diagnostics are computed in closed form directly from the parameters, independent of the trajectory:

- rigidity = (memory + boundary - plasticity) / 2
- exposure risk = (perturbation + coupling - boundary) / 1.5

A rule-based classifier then labels the final state as one of five phase regimes: World-Oriented Becoming, Metastable Individuation, Rigid Closure, Chaotic Drift, or Dissolution.

## What the model gets right

The conceptual architecture is faithful to the literature. The four loops named in the playground (self-production, sensorimotor coupling, plasticity or memory, boundary) map cleanly onto the four programs above, and the becoming index correctly encodes the central claim that becoming is a joint property rather than any single maximized quantity. Viability without coherence is bare persistence; novelty without viability is drift. The index penalizes both, which is the right qualitative shape.

The derived diagnostics behave exactly as their closed forms dictate, and the calibration suite exploits this. With memory 80, boundary 80, and plasticity 20, rigidity is (80 + 80 - 20) / 2 = 70, and the model returns 70. With perturbation 90, coupling 60, and boundary 30, exposure is (90 + 60 - 30) / 1.5 = 80, and the model returns 80. When a boundary of 90 outweighs the perturbation and coupling load, the raw exposure term goes negative and the lower clamp pins it to exactly zero. The rigid-organism preset satisfies rigidity above 70 with collapsed novelty and is correctly classified as Rigid Closure. Every one of these is reproduced with zero error, because each is an algebraic identity rather than an emergent outcome of the fragile loop.

## Where the model diverges from its claims

The honest finding is that the full trajectory does not behave the way the preset descriptions promise. The "world-oriented learner" preset is described as the picture of healthy becoming, yet running the actual dynamics drives viability to 0 and tension to 100 within the horizon, and the classifier reports Dissolution rather than World-Oriented Becoming. The "autopoietic core" and "chaotic drift" presets also saturate to Dissolution. Only the rigid-organism preset lands in the regime its description anticipates, and it does so largely because its low plasticity keeps the reorganization term small enough to avoid blow-up.

The cause is structural. The update equations sum several terms whose coefficients and base offsets are large relative to the 0 to 100 clamp, so under most parameter settings one or more variables ride a clamp boundary after only a few steps. Once a variable is pinned at 0 or 100 the coupling that was supposed to produce metastable balance is gone, and the trajectory degenerates. The sinusoidal forcing is too small to matter against terms of this magnitude. In short, the model has the right ingredients but unbalanced gains, so it demonstrates the vocabulary of individuation without demonstrating stable individuation.

This is why the calibration targets the algebraic core and not the trajectory. Calibrating against the saturated trajectory metrics would either be trivially satisfied by the clamp values or would silently launder a divergence as if it were a confirmed prediction.

## Limitations

The five-variable reduction is a pedagogical compression of phenomena that, in any realistic treatment, involve many more dimensions, genuine nonlinear interaction across nested timescales, and parameter learning in which the update rule itself adapts. The Markov-blanket reading of the boundary is borrowed as an analogy and inherits the open debate about whether biological boundaries play a genuinely statistical role. The phase classifier uses fixed thresholds rather than detecting attractors, so its labels are heuristic summaries rather than dynamical facts. And, as documented above, the loop gains are not tuned for the metastability the model is meant to showcase. A faithful revision would rescale the coefficients so that the default presets sit inside the clamp interior, would replace hard clamps with soft saturations, and would verify that World-Oriented Becoming is an actual attractor of the tuned dynamics rather than a label the prose asserts.

## How to read the playground

Treat the dynamics tab and phase-space tab as illustrations of a conceptual landscape, not as validated simulations. Treat the derived diagnostics (rigidity, exposure risk) and the calibration panel as the load-bearing, reproducible part of the model. The most useful experiment is the sweep: hold five parameters fixed and watch how a derived diagnostic moves, which is where the model's behavior is both legible and trustworthy.

## References

- Simondon, G. (1958). L'individuation a la lumiere des notions de forme et d'information.
- Maturana, H. and Varela, F. (1980). Autopoiesis and Cognition: The Realization of the Living.
- Varela, F., Thompson, E. and Rosch, E. (1991). The Embodied Mind.
- Di Paolo, E. (2005). Autopoiesis, adaptivity, teleology, agency.
- Thompson, E. (2007). Mind in Life.
- Barandiaran, X., Di Paolo, E. and Rohde, M. (2009). Defining Agency.
- Friston, K. (2013). Life as we know it.
- Kirchhoff, M., Parr, T., Palacios, E., Friston, K. and Kiverstein, J. (2018). The Markov blankets of life.
- Abraham, W. and Robins, A. (2005). Memory retention: the synaptic stability versus plasticity dilemma.
- Kelso, J. A. S. (1995). Dynamic Patterns. Tognoli, E. and Kelso, J. A. S. (2014). The metastable brain.
