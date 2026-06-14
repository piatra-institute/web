# Arithmetic Dynamics, Evolutionary Learning, and the Shared Logic of Form

## Abstract

Three literatures that rarely meet, Joseph Silverman's arithmetic dynamics, Richard Watson's evolution-as-learning, and Michael Levin's bioelectric morphogenesis, share one move: they describe form as the outcome of iterated dynamics on structured state spaces. This companion separates that genuinely productive shared structure from a stronger metaphysical reading. The defensible thesis is graded: orbits, attractors, memory, and basins are real and useful across mathematics, evolution, and development, but the leap from "shared dynamical structure" to "biology downloads pre-existing Platonic forms" is not established. The playground is a continuous associative-memory model of a tissue that makes the shared logic tangible while keeping the speculative interpretation clearly labelled.

## The common denominator

In each domain a system moves through a space of possible states under a repeated update rule, and certain regions of that space behave as destinations.

In **arithmetic dynamics**, Silverman studies the iteration of rational maps on algebraic varieties. The field is, in his own framing, an "amalgamation" of dynamical systems and number theory with "no precise dictionary" between them, even though powerful correspondences exist. The central one sends torsion points on abelian varieties to periodic and preperiodic points of a rational map: special algebraic points become points whose forward orbit is finite or eventually repeating. The Markoff surface gives a vivid example, where non-commuting Vieta involutions generate a graph on the solution set whose orbit structure is, for all but finitely many primes, essentially one giant connected component.

In **evolutionary learning**, Watson and Szathmary argue that development, ecology, and evolution accumulate structure from past selection in ways formally analogous to associative memory. Recurrent gene-regulatory networks can evolve so that previously selected phenotypes become developmental attractors, sometimes generalising to related targets. The vocabulary of training set, generalisation, and inductive bias is used literally, not as loose metaphor.

In **bioelectric morphogenesis**, Levin's lab shows that endogenous bioelectric states and gap-junctional coupling can store non-genetic patterning information and stabilise large-scale anatomy. Planarian experiments show transient manipulations that permanently change the morphology to which fragments regenerate, consistent with a stored target morphology or setpoint. Mainstream developmental theory now treats gene networks and tissues as dynamical systems with attractors, basins, hysteresis, and limit cycles.

## What the playground models

The playground implements the one object all three share: a low-rank associative memory whose minima are stored forms.

A tissue is a grid of cells, each with a continuous internal state `u_i` and output `y_i = tanh(g u_i)`. Three target morphologies (a single body axis, a bifurcated two-headed plan, a tri-lobed form) are stored as orthonormalised patterns `p_k`. The field relaxes by

```
du_i/dt = -u_i + alpha * sum_k p_k[i] <p_k, y> + D * laplacian(y)_i + sigma * noise.
```

The memory term pulls the state toward the span of the stored patterns; diffusion couples neighbours; noise makes the basins metastable. Because the coupling is symmetric and the templates are orthonormal, the deterministic dynamics descend a Lyapunov energy,

```
E = -(alpha/2) sum_k <p_k, y>^2 + (D/2) sum_<ij> (y_i - y_j)^2,
```

whose minima are the stored morphologies. A lesion zeroes a patch of the field, pushing the state up an energy hill; if the memory strength is above a retrieval threshold, the same memory rolls it back down and the form regenerates.

## Calibrating the regeneration claim

The calibration panel seeds each morphology, lesions it, and relaxes the noise-free dynamics, then reports the lesioned recovery as a fraction of the intact recovery. The literature target is full repair: a healthy associative memory rebuilds small damage back to its stored target, the toy analogue of Levin's anatomical homeostasis.

In the retrieval and high-diffusion regimes the repair fidelity is at or near 100%: the lesion is erased. The panel deliberately includes a rigid, low-diffusion case where fidelity drops to roughly three-quarters, because there the local coupling is too weak to smooth the scar. The honest reading is that this model regenerates in part of its parameter space and scars in another part, which is exactly what a real regenerative system does.

## Correcting the formal story

A draft synthesis is tempting to over-tighten. Two corrections keep it sound.

First, the energy descent is a property of **symmetric** coupling. Hopfield's continuous model has a Lyapunov function when the interaction matrix is symmetric; Cohen and Grossberg make the same point for a broad class of self-organising networks. Asymmetric or non-normal coupling can produce limit cycles or chaos with no global energy. The clean basin picture here is a consequence of a modelling choice, not a theorem about tissues. The claim that evolutionary learning slowly reshapes the stored memory is then a separate layer, justified by Watson's framework rather than by Hopfield theory alone.

Second, an arithmetic periodic point and a biological attractor are **analogous but not identical**. The arithmetic object is exact, discrete, and noise-free; the biological object is approximate, dissipative, history-sensitive, and only locally stable under noise. The noise slider in the playground makes the difference visible: turn it up and the basin shimmers. Keeping that distinction in view lets the mathematics strengthen the biology section instead of distorting it.

## Where the synthesis is strongest, and where it overreaches

The synthesis is strongest stated this way: biological systems, like many mathematical systems, can be fruitfully modelled as trajectories through structured state spaces; evolution and development can reshape those spaces; and bioelectric or regulatory memories can stabilise high-level morphological outcomes as attractors. That claim is supported by Silverman's dictionary, Watson's evolution-learning formalism, mainstream dynamical-systems treatments of development, and Levin's empirical work.

It overreaches at two points. It would overreach to treat Silverman's mathematics as proving a general metaphysics of biological form; he is careful that the dictionary is useful but not precise. And it would overreach to treat Levin's "Platonic space" language as an established biological result; Levin himself calls that proposal speculative and very much in flux, and his peer-reviewed work describes the same program in terms of bioelectric communication, collective intelligence, setpoints, and pattern memories. A critical reviewer would also note that positional information, reaction-diffusion, and mechanochemical morphogenesis already explain much spatial patterning without invoking stored memories at all.

The cleanest move is to downgrade ontology and upgrade mechanism: replace "biology downloads pre-existing Platonic forms" with "biological systems exploit pre-structured dynamical regularities and learned internal memories, often producing robust forms that look form-like or goal-like at the organismal scale."

## Limitations

The central limitation is evidential. The mathematics of arithmetic dynamics is rigorous; the evolution-learning analogy is formal and partly simulation-based; the bioelectric-morphogenesis literature has substantial experimental support; but the Platonic-space ontology is not an empirical result on the same footing. Treating all four as equally established would weaken the account.

The second limitation is scope. This two-field model on a small lattice, with hand-chosen templates and weights, is a tool for conceptual clarification and hypothesis generation, not a regenerative simulator. It captures the shared attractor logic and nothing more, which is precisely what it is for.

## References

- J. H. Silverman, *The Arithmetic of Dynamical Systems*, Springer, 2007; and ICM 2022 lecture notes on arithmetic dynamics.
- R. A. Watson and E. Szathmary, "How can evolution learn?", *Trends in Ecology and Evolution*, 2016.
- C. Buckley, T. Lewens, M. Levin, B. Millidge, A. Tschantz, R. Watson, "Natural Induction: Spontaneous Adaptive Organisation without Natural Selection", 2024.
- M. Levin, work on planarian anatomical homeostasis, bioelectric pattern memory, and target morphology; and the 2025 essay on the Platonic-space proposal (described there as speculative).
- J. J. Hopfield, "Neurons with graded response have collective computational properties like those of two-state neurons", PNAS, 1984; M. Cohen and S. Grossberg, 1983.
- A primer on dynamical-systems concepts (attractors, basins, hysteresis, limit cycles) in development, *Development*, 2025.
