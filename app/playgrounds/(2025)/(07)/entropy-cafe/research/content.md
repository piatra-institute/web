# The Rise and Fall of Complexity: Coffee, Cream, and the Second Law

## Abstract

A cup of coffee with a splash of cream is the most-cited everyday illustration of the second law of thermodynamics. Stir it and the cream disperses; the cup never spontaneously unmixes. But the cup tells a second, subtler story that the bare second law does not. Entropy increases monotonically from the moment the cream lands until the cup is uniform, yet the *visible* structure does not. It is dull at the start (cream sitting on coffee), intricate in the middle (filaments and tendrils), and dull again at the end (a flat milky brown). This playground simulates the cup as a real particle fluid, measures entropy and an apparent-complexity proxy by coarse-graining, and shows the two curves on a shared time axis. The point is the contrast: entropy rises and stays risen; apparent complexity rises and then falls.

## Background

### Entropy is observer-relative

The version of entropy that increases in the second law is not a property of the exact microstate. The exact microstate of the cup, the position and velocity of every molecule, carries the same (zero) information-theoretic entropy at every instant if you could track it perfectly; microscopic dynamics are reversible and information-preserving. The entropy that increases is a *coarse-grained* entropy: you partition the system into macroscopically distinguishable cells and count how many microstates are compatible with what you can actually see. Boltzmann's `S = k log W` and Gibbs's ensemble entropy are both coarse-grained in this sense.

This is why, in the playground, entropy is computed by binning the cup into a grid of voxels and asking, per voxel, what fraction of the particles are cream. A voxel that is pure coffee or pure cream is informative and low-entropy; a voxel that is a fifty-fifty mix is maximally uncertain and high-entropy. The grid resolution is a modelling choice, and the absolute entropy depends on it. That dependence is not a defect. It is the content of the statement that entropy is relative to a level of description, made operational.

### The coffee automaton

Scott Aaronson, Sean Carroll, and Lauren Ouellette made this precise in *Quantifying the Rise and Fall of Complexity in Closed Systems* (2014). They modelled a 2D fluid of two interacting species (a "coffee automaton") and asked how a measure of apparent complexity behaves over time while entropy increases. The crucial finding: with realistic interactions, a measure of *structure* (roughly, the size of the smoothed image after compression, or the amount of non-trivial spatial correlation) rises from near zero, reaches an interior maximum, and falls back toward zero, even as entropy increases monotonically throughout. Without interactions, the complexity bump is much weaker. Interactions are what let tendrils and filaments form, and tendrils are where the apparent complexity lives.

Carroll has popularised the same picture in *From Eternity to Here* (2010) and in talks: the universe began in a low-entropy state and is heading toward high-entropy heat death, and the interesting complex structures, galaxies, stars, planets, life, are a transient feature of the middle of that history, not its endpoint.

## The model

### Fluid

The cup is simulated with roughly sixty thousand particles, each tagged coffee or cream. Coffee particles are denser and sink; cream particles are lighter and float. The dynamics combine:

- buoyancy and soft restoring forces that keep the two species stratified when undisturbed,
- a smoothed-particle density and pressure pass that resists compression and gives the fluid cohesion,
- Brownian diffusion that slowly blurs sharp interfaces,
- a stirring vortex with a faster core, a secondary radial flow, and a gentle vertical lift that together produce helical swirls,
- viscous damping that removes injected energy,
- collisions with a cylindrical glass.

The fluid surface is reconstructed in screen space: each particle is splatted to a depth map, the depth map is smoothed with a bilateral filter, and a glass overlay is composited on top. The result reads as a cohesive liquid rather than a cloud of dots. The rendering never feeds back into the physics or the metrics.

### Metrics

Every twenty frames the particle positions are binned into a 32 by 32 by 32 voxel grid. For each voxel with cream fraction `c`:

- **entropy** is the binary Shannon entropy `H(c) = -[c log2 c + (1 - c) log2 (1 - c)]`, in bits, between 0 and 1,
- **mixedness** is `1 - |2c - 1|`, which is 1 at a fifty-fifty mix and 0 at a pure voxel,
- **apparent complexity** is the mean magnitude of the concentration gradient across neighbouring voxels, weighted by mixedness.

The cup-level values are particle-weighted averages over voxels. Entropy and mixedness are naturally in [0, 1]. Apparent complexity is small and its absolute scale depends on the grid and the gradient definition, so the playground shows it as a time-series auto-scaled to its own peak rather than calibrating it to a fixed number.

A note on honesty: an earlier version of this playground multiplied the raw metrics by gain and power curves to make the on-screen bars look fuller. That has been removed. The numbers you see are the coarse-grained quantities as computed, clamped only to remove non-finite values.

## Results

Three qualitative regimes recur, matching the three glasses in the reference photograph:

1. **Layered.** Just after the pour, cream sits above coffee. Most voxels are pure, so entropy is low. There is a sharp interface, but little of the cup is both gradient-rich and well-mixed, so apparent complexity is modest.
2. **Swirling.** Stirring stretches the interface into filaments. Many voxels are now partially mixed and sit next to voxels of different concentration, so both the gradient and the mixedness are high. Apparent complexity peaks here. Entropy is climbing through its mid-range.
3. **Uniform.** Eventually every voxel approaches the same concentration. Gradients vanish, so apparent complexity collapses toward zero, while entropy saturates near its maximum.

Across these stages the apparent complexity is non-monotone, with a clear interior peak, while the coarse-grained entropy trends upward. In this particle model both quantities are small in absolute terms, because cream and coffee remain separate particle domains rather than dissolving molecule by molecule, so the overlay sparklines and the time-series chart auto-scale to make the shapes legible. The rise-and-fall of complexity is the robust, demonstrable signature; the entropy rise is present but modest at this coarse-graining.

The presets move the peak around. A thin (low-viscosity) fluid forms and breaks filaments quickly, giving a sharp early complexity peak. A thick (high-viscosity) fluid swirls sluggishly, giving a broad late peak. Diffusion-only settling never forms strong filaments, so the peak is low and entropy plateaus before reaching its maximum.

## Limitations

- **Binary species.** Real cream is a polydisperse emulsion mixing by molecular diffusion; here it is a single indivisible particle type. Only the two-phase mixing story is modelled.
- **Soft pressure.** The density and pressure pass is a local penalty, not a global incompressible projection, so the fluid is slightly compressible.
- **One complexity measure.** Apparent complexity is gradient times mixedness. Other measures (compressed image size, structure factor, persistent homology) would shift the height and timing of the peak. The existence of an interior peak should be robust; its exact shape is not.
- **Immiscible domains.** Cream and coffee are distinct particle species that do not interpenetrate at sub-voxel scale, so even a well-stirred cup is mostly single-species voxels and the coarse-grained binary entropy stays small in absolute terms. Real molecular diffusion would drive it higher. The qualitative shapes, not the absolute magnitudes, are the point.
- **Stochastic single runs.** Particle initialisation and diffusion noise are random per run, so the curves are single samples, not averages.
- **Closed cup.** Damping stands in for dissipation and there is no thermal reservoir. The cup reaches equilibrium; a real cup also cools.

## Why it matters

The cup is a small lesson about the arrow of time. The second law guarantees that disorder, properly coarse-grained, increases. It does not guarantee that anything interesting happens along the way, and it certainly does not guarantee that the interesting things last. Complex structure is a feature of the journey between a low-entropy past and a high-entropy future, sustained, where it persists, by a flow of low-entropy energy through an open system. The cup closes and goes uniform. The Earth stays interesting only because the Sun keeps pouring.

## References

- S. Aaronson, S. M. Carroll, L. Ouellette. *Quantifying the Rise and Fall of Complexity in Closed Systems*. arXiv:1405.6903 (2014).
- S. M. Carroll. *From Eternity to Here: The Quest for the Ultimate Theory of Time*. Dutton (2010).
- L. Boltzmann. *Lectures on Gas Theory* (1896 to 1898), for the statistical reading of entropy.
- W. J. van der Laan, S. Green, M. Sainz. *Screen Space Fluid Rendering with Curvature Flow* (2009), for the surface reconstruction technique.
