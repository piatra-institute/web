# Geometries of Action: Neural Manifolds as Geometry, Dynamics, Alignment, and Decoding

## Abstract

The neural manifold hypothesis claims that population activity during a task does not roam freely through the full space of possible firing-rate combinations but stays confined to a smooth, low-dimensional surface whose intrinsic dimension reflects the task's degrees of freedom rather than the number of neurons recorded. This companion accompanies a playground that turns that hypothesis into an interactive laboratory built around four claims drawn from the motor-systems literature (Gallego, Cunningham and Yu, Jazayeri and Shadlen, and related work): that activity lives on a low-dimensional manifold, that linear projection (PCA) can distort a curved manifold, that cooling can slow dynamics without destroying geometry, and that residual structure can be decoded for neuroprosthetic control. Importantly, the playground does not analyze real electrophysiology. It generates manifolds analytically and computes its metrics from closed-form parametric formulas. This document separates what the model computes exactly (its formulas, given its parameters) from what is interpretive or stipulated (the mapping of those formulas onto neuroscientific claims), and it states the limitations plainly.

## What the model computes

The playground exposes a parameter set and derives, from those parameters alone, a generated manifold plus a vector of nine scalar metrics. Nothing is fit to data; every number is a deterministic function of the sliders.

### The generated manifold

A manifold is built procedurally from three parameters: intrinsic dimension (1 or 2), curvature, and task constraint.

When intrinsic dimension is 1, the model produces a closed loop ("1D timing loop"): a parametric curve in three dimensions whose radius is modulated by task constraint and whose vertical component is shaped by curvature. When intrinsic dimension is 2, it produces a "2D motor sheet": a sampled surface (22 by 14 grid) where the height is a product of sinusoids in the two surface coordinates scaled by curvature, plus a bilinear term scaled by task constraint, together with a trajectory curve that winds across that sheet. Each point carries both its embedded three-dimensional coordinates and its underlying flat (intrinsic) coordinates, which is what later lets the model measure projection distortion.

### Projection and distortion

Two projections from three dimensions to the screen are provided. The nonlinear ("unfolded") projection uses the manifold's own flat coordinates, so by construction it preserves intrinsic structure. The linear projection is a fixed linear combination of the embedded coordinates, standing in for PCA. A distortion metric samples pairs of points, compares their flat-coordinate distance against the projected distance, and aggregates the absolute mismatch. The linear path is scaled more aggressively than the nonlinear path, so curvature inflates linear distortion while the unfolded projection stays faithful. This is a stipulated illustration of the Cunningham and Yu point, not a measurement of PCA on real data.

### Neuron activity and the population panels

To populate the heatmap and single-neuron trace, each "neuron" is assigned fixed sinusoidal weights (a deterministic function of its index) over the three embedded coordinates. Its activity is a hyperbolic tangent of a linear term plus a nonlinear term (scaled by task constraint and curvature) plus a noise term (scaled by the noise parameter and oscillating in phase). The heatmap shows a handful of these neurons sampled along a short trailing window of the trajectory; the single-neuron trace shows one fixed neuron over time. These are illustrative tuning curves, not recordings.

### The nine metrics

All metrics are clamped closed-form expressions of the parameters:

- Linear recoverability decreases with curvature and noise, is penalized slightly for the 2D case, and increases with task constraint.
- Geometry preserved starts near 99 and decreases with cooling and noise.
- Timing bias increases with cooling and noise.
- Alignment score increases with the alignment parameter and decreases with noise.
- Decoder confidence increases with the residual parameter and decreases with noise. This is the headline metric used for calibration, sweep, and sensitivity.
- Population coherence decreases with noise and increases with task constraint.
- Effective speed is the speed parameter reduced by a cooling factor (the same factor that drives the trajectory animation).
- Shared task grammar increases with task constraint.
- Cross-map stability is the alignment score reduced by noise.

### Alignment, sweep, sensitivity, narrative

Cross-subject alignment is modeled by warping the trajectory of a second subject: a rotation plus a curvature warp whose magnitude is (1 minus alignment), then interpolated back toward the original by the alignment value. Higher alignment yields a more overlapping second curve. The parameter sweep recomputes the metrics across 51 values of a chosen parameter, plotting decoder confidence, alignment score, and linear recoverability. The sensitivity analysis sweeps each parameter from its min to its max, measures the resulting range in decoder confidence, and sorts the parameters into a tornado chart. The narrative generator emits plain-language sentences triggered by metric thresholds (for example, flagging low linear recoverability, or noting dynamics-versus-geometry dissociation when cooling exceeds 0.3).

## What is exact versus interpretive or stipulated

Exact, in the sense of being fully determined and reproducible from the parameters:

- The generated manifold geometry, the two projections, and the distortion aggregate.
- All nine metric values, the sweep curves, the sensitivity ranges, and the narrative triggers. Given the same sliders, these are identical every time.

Interpretive or stipulated, in the sense of being modeling choices rather than derived facts about brains:

- The specific coefficients in every metric formula (for instance, that decoder confidence is roughly 14 plus 78 times residual minus 18 times noise). These were chosen so that the qualitative direction matches the literature, not estimated from data.
- The claim that the linear projection "is" PCA. It is a fixed linear map standing in for PCA, scaled to make the distortion visible.
- The mapping of presets onto real studies (motor reach, cooled striatal timing, cross-species alignment, residual spinal decoding). The presets set plausible slider values; they do not replay the underlying experiments.
- The calibration "expected" values, discussed next.

## Calibrating the decoder claim

The calibration panel compares the model's decoder-confidence output against four hand-set target values drawn from named studies: an intact motor cortex case (target 78, referencing Gallego et al., 2017), a cooled striatal timing case (target 30, referencing Jazayeri and Shadlen, 2015), a cross-species alignment case (target 35, referencing Gallego et al., 2020), and a severe spinal-cord-injury case (target 26, referencing residual spinal decoding work). For each case the panel feeds the case's parameters into the same decoder-confidence formula and reports the predicted value against the target, with an error percentage.

Two honest caveats apply. First, because decoder confidence depends mainly on the residual and noise parameters, the calibration is really a check that those two sliders were set sensibly for each scenario, not an independent validation. Second, the "expected" numbers are illustrative anchors on the same 0 to 100 scale, not decoding accuracies extracted from the cited papers. The calibration therefore demonstrates internal consistency and plausible ordering (intact above injured, residual driving the spread), not quantitative agreement with experiment.

## Limitations

This playground uses analytic parametric formulas, not neural recordings. The manifold is generated by hand rather than extracted from data via dimensionality reduction, so the model cannot discover an intrinsic dimension; it is told one. The metrics are qualitative proxies whose coefficients were chosen for pedagogical clarity, so their absolute values carry no quantitative meaning and only their directions and orderings should be trusted. The "neurons" have fixed analytic tuning rather than learned or measured tuning. The model omits spike-timing correlations, trial-to-trial variability, the multi-area distributed nature of real manifold computation, and the actual statistics (such as canonical correlation analysis or Procrustes alignment) that the alignment panel only gestures at. The cooling-dissociation panel illustrates the dynamics-versus-geometry distinction by construction rather than demonstrating it. In short, the playground is a faithful illustration of a set of hypotheses and their qualitative interdependencies, and it is not evidence for or against any of them.

## References

- Gallego, J. A., Perich, M. G., Miller, L. E., and Solla, S. A. (2017). Neural manifolds for the control of movement. (M1 population activity in a low-dimensional space during reaching.)
- Cunningham, J. P., and Yu, B. M. (2014). Dimensionality reduction for large-scale neural recordings. Nature Neuroscience. (Linear methods and their distortions.)
- Jazayeri, M., and Shadlen, M. N. (2015). Work on interval timing and the causal manipulation of timing circuits. (Slowing dynamics while geometry is largely preserved.)
- Gallego, J. A., et al. (2020). Cross-subject and cross-species alignment of motor cortical manifolds. Nature Neuroscience.
- Gallego lab and collaborators (2023). Residual spinal decoding in clinically complete spinal cord injury for neuroprosthetic control.
- Gallego et al., The Neural Manifold Manifesto, The Transmitter (popular framing of the neural manifold hypothesis).
