# Knife Edge

A research companion for the playground that simulates wave fate across subcritical, critical, and supercritical regimes on a small periodic lattice, and reads off sheaf-Laplacian diagnostics from the resulting field.

## Abstract

Many systems share one structural fact. There is a control parameter with a critical value. Below it, perturbations decay and the system has a typical scale of response. Above it, perturbations amplify and the system commits to a new regime. At the threshold, scale disappears. Correlation length grows large, response becomes nearly unbounded, and the same coarse equations describe magnets, branching cascades, neuronal avalanches, percolation clusters, and pre-seizure cortex.

This playground makes the knife edge tangible. It integrates a one-dimensional reaction-diffusion field with a linear growth term, local diffusive coupling, a global mean-field coupling, cubic saturation, and additive noise. From the live field it estimates a correlation length, log-bins avalanche sizes and fits a power-law exponent, coarsens the lattice into patches, builds a cellular sheaf Laplacian over those patches, and reports its kernel dimension and spectral gap. A separate analytical layer predicts the regime from a linearised eigenvalue. The intent is not to model any specific brain or material but to expose, in real time, the structural difference between absorbing, scale-free, and runaway dynamics.

## What the model computes

### The field equation

The state is a `Float32Array` of 96 sites on a periodic ring. Each simulation step advances the field with an explicit Euler update at time step `dt = 0.18`, following the continuous-time form

du/dt = (gain - 1 - damping) u + localCoupling (u_left - 2 u + u_right) + distantCoupling (mean(u) - u) - 0.55 u^3 + noise dW

where `dW` is a Box-Muller Gaussian draw. The term `(gain - 1 - damping)` is the linear growth rate at the zero state. The discrete Laplacian `(u_left - 2 u + u_right)` is local diffusive smoothing. The `(mean(u) - u)` term is an all-to-all mean-field pull that drags every site toward the lattice average. The fixed cubic coefficient `0.55` provides the saturating nonlinearity that pins amplitudes once they cross order unity, so the supercritical regime never literally diverges.

Pulses are injected as Gaussians of tunable width. The user can fire a strong central pulse, and the loop fires weaker spontaneous pulses at random sites with a small probability after a refractory wait. Resetting seeds the field with small uniform noise of amplitude about 0.05.

### The analytical layer

Separately from the running simulation, the model computes a closed-form prediction from the parameters alone:

lambda_max = gain - 1 - damping + 0.4 distantCoupling

This dominant linearised eigenvalue is the diagnostic for the knife edge. The regime is classified by thresholds on it. If `lambda_max < -0.04` the regime is subcritical, if `lambda_max > 0.04` it is supercritical, and otherwise it is critical. The analytical layer also reports a distance to threshold `|lambda_max|`, a correlation-length estimate `min(48, 1/(0.04 + distance))`, a theoretical avalanche exponent `tau = -1.5 - 0.45 tanh(6 lambda_max)`, and a spectral-gap estimate `0.02 + 0.85 distance`. These are heuristic interpolations chosen so the analytical curves track the qualitative behavior of the live field, not derivations from first principles.

### Avalanches and the power-law fit

At every step the model counts active sites, those with `|u| > 0.22`, and pushes that count into a ring buffer of the last 320 nonzero events. The buffer is log-binned into geometric bins, and a linear regression of `log(count)` against `log(size)` returns a slope. That slope is the empirical exponent reported as the avalanche tau-fit. At criticality the size distribution loses its characteristic scale and the slope drifts toward the mean-field branching value near -3/2. Off criticality the distribution carries a scale and the slope departs from that line. The fit returns null when fewer than four bins survive, so transient or near-silent states report no exponent.

### The sheaf diagnostic

The lattice is coarsened into 16 patches, each the mean of 6 contiguous sites. These patches are the vertices of a cyclic graph. The model builds a weighted graph Laplacian whose edge weights are restriction strengths

c_{p,q} = exp(-5 |patch_p - patch_q|)^2

so adjacent patches that agree contribute a strong edge and patches that disagree contribute a weak one. This is the Laplacian of a cellular sheaf with one-dimensional vertex stalks over the cyclic patch graph. Its eigenvalues are extracted with a cyclic Jacobi rotation routine. Eigenvalues below a tolerance of 0.06 are counted as the kernel, the constant mode always lies there so the kernel dimension is at least one, and the smallest remaining eigenvalue is the spectral gap. When the field is smooth the restriction maps are strong and the gap is large. When the field is heterogeneous across patch boundaries the maps weaken, the gap collapses, and extra near-zero eigenvalues appear, signaling many almost-global sections but no rigid global one.

### Derived views

From these primitives the playground derives a parameter sweep that recomputes the analytical metrics while sliding one parameter across its range, a sensitivity tornado that swings each parameter from its minimum to its maximum and records the change in `lambda_max`, a phase grid and critical curve in the gain-damping plane where the boundary is `damping = gain - 1 + 0.4 distantCoupling`, and a plain-language narrative that assembles sentences from the current regime, the live tau-fit, the spectral gap, and the kernel dimension. A snapshot can freeze the current analytical and live metrics for side-by-side comparison after a parameter change.

## Exact versus interpretive

Some parts of this model are exact in the sense that they are direct, checkable computations on the field. Other parts are interpretive bridges chosen for legibility.

Exact, in this sense:

- The Euler integration of the stated field equation. The update is literally what the code runs.
- The active-site count, the log-binned histogram, and the least-squares slope. These are mechanical statistics of the field.
- The cyclic Jacobi eigendecomposition of the patch Laplacian. The eigenvalues are computed to tolerance, not approximated by a formula.
- The kernel-cohomology correspondence for cellular sheaves. That the Laplacian kernel equals the zeroth sheaf cohomology, the global sections, is established mathematics from Hansen and Ghrist.

Interpretive, chosen to illustrate rather than to derive:

- The analytical `lambda_max` formula and its `0.4 distantCoupling` correction. The leading `(gain - 1 - damping)` is the true linear rate at the origin, but the coupling correction is a fitted heuristic, not the exact dominant eigenvalue of the full linearised operator.
- The correlation-length, theoretical-tau, and spectral-gap estimates in the analytical layer. These are smooth interpolations tuned to mirror the live behavior, not predictions from a renormalization calculation.
- The restriction-weight choice `exp(-beta |difference|)` with `beta = 5`. The exponential form and the constant are modeling decisions that make agreement visible, not measured couplings.
- The mapping from regime to consciousness. The claim that a sheaf spectral gap over neural activity tracks conscious state is a speculative analogy, well motivated by the criticality literature but unproven.

The calibration table makes the same point empirically. It compares the model's analytical tau against literature values for waking cortex near -1.5, propofol-anaesthetised cortex near -2.4, ketamine dissociation near -1.55, two-dimensional percolation at about -2.05, seizure onset near -1.1, and the Bak-Tang-Wiesenfeld sandpile near -1.5. The point of the table is to show where the cartoon agrees with measured systems and where it does not, not to assert that one 96-site ring reproduces all of them.

## Honest limitations

The lattice is a cartoon, not a brain. With 96 sites the avalanche distribution spans only about one and a half decades, which undersamples the long-range, low-frequency fluctuations that dominate true critical behavior. Doubling or quadrupling the lattice would sharpen the power law and could shift the apparent regime boundaries.

The analytical `lambda_max` is a single mean-field number. Real systems have spatially heterogeneous local growth rates, and a single scalar can mispredict the global regime when local critical points differ enough across the medium.

The cubic saturation, the fixed coefficient, the active-site threshold of 0.22, the kernel tolerance of 0.06, and the restriction `beta` are all stipulated. They are calibrated to make the demo legible and are not fit to any external dataset. The units of time, amplitude, and field are dimensionless. The qualitative phase structure carries the scientific content, not the absolute numbers.

The consciousness link is contested. The avalanche evidence from Beggs and Plenz and the anaesthesia shifts reported by Maschke and colleagues are empirical, but the inference that near-criticality is an enabling regime for consciousness, and that a sheaf gap tracks it, remains an interpretive hypothesis. This playground is built to make that hypothesis inspectable, not to confirm it.

## References

- Beggs and Plenz, 2003, Neuronal Avalanches in Neocortical Circuits, Journal of Neuroscience 23(35):11167.
- Maschke and colleagues, 2024, Anesthetics shift cortical critical dynamics, Communications Biology.
- Hobbs and colleagues, 2010, Critical dynamics in cortical activity, Journal of Clinical Neurophysiology.
- Bak, Tang and Wiesenfeld, 1987, Self-organized criticality, Physical Review Letters 59:381.
- Stauffer and Aharony, 1994, Introduction to Percolation Theory.
- Harris, 1989, The Theory of Branching Processes.
- Goldenfeld, 1992, Lectures on Phase Transitions and the Renormalization Group.
- Strogatz, 1994, Nonlinear Dynamics and Chaos.
- Cross and Hohenberg, 1993, Pattern Formation Outside of Equilibrium.
- Stanley, 1971, Introduction to Phase Transitions and Critical Phenomena.
- Hansen and Ghrist, 2019, Toward a Spectral Theory of Cellular Sheaves.
- Robinson, 2018, Assignments to Sheaves of Pseudometric Spaces.
