# Criticality: branching processes at the edge

## Abstract

This playground simulates a branching process, the simplest tractable model of a system poised between dying out and running away. A single parameter, the branching ratio sigma, controls everything: below 1 activity fades, above 1 it explodes, and at exactly 1 the system is critical and produces avalanches whose sizes follow a power law with no characteristic scale. The same arithmetic underlies sandpiles, forest fires, epidemics, nuclear chain reactions, and a much-debated proposal that the cerebral cortex tunes itself to sit near this critical point. This companion sets out what the model computes exactly, what it only suggests, and where the honest boundary between the two lies.

## The model

Activity propagates in discrete time. At each step every currently active site independently activates a successor with probability sigma, and then becomes inactive. Starting from one active site, the expected number of active sites one step later is sigma, after two steps sigma squared, and so on. The quantity sigma is the **branching ratio**: the mean multiplicative growth of activity per step.

Three regimes follow immediately from the value of sigma:

- **Subcritical (sigma < 1).** Activity shrinks on average and every avalanche terminates almost surely. Avalanches are typically tiny.
- **Critical (sigma = 1).** Activity is conserved on average. Avalanches still terminate with probability one, but their sizes have no typical scale: the distribution is a power law.
- **Supercritical (sigma > 1).** Activity grows on average and the seeded simulation runs away without bound.

An **avalanche** is the total number of activations from a seed until activity dies out. Its size is the central observable.

## What is exact

Two closed-form facts anchor the model and are what the calibration panel verifies. They are properties of the mathematics, not of any dataset.

**Mean avalanche size.** For a subcritical process the expected total avalanche size is

$$ E[S] = \frac{1}{1 - \sigma}, \qquad \sigma < 1. $$

This is the classical total-progeny mean of a Galton-Watson process. At sigma = 0.5 it is 2; at sigma = 0.8 it is 5; as sigma approaches 1 it diverges, which is the analytic signature of the approaching critical point. The Monte-Carlo mean reported in the viewer converges to this value as the number of trials grows.

**Critical exponent.** At criticality the avalanche-size distribution is a power law

$$ P(S = s) \sim s^{-3/2}. $$

The exponent 3/2 is the mean-field branching / directed-percolation value. The playground fits a slope to the log-log avalanche distribution; on an exact power law that estimator returns -3/2, which the calibration confirms.

These are the load-bearing quantitative claims. Everything else is interpretation built on top of them.

## What is contested: criticality as a brain setpoint

The motivating reference (Hengen and Shew, *Is criticality a unified setpoint of brain function?*, Neuron 2025) asks whether the cortex actively tunes itself toward sigma = 1. The appeal is that several desirable quantities, dynamic range, information transmission, and susceptibility to inputs, are predicted to peak at the critical point. Beggs and Plenz (2003) reported cortical avalanches with a branching ratio near 1 and a size exponent near -3/2, matching the mean-field branching process strikingly well.

This is a genuine and active hypothesis, not settled fact. Apparent power laws can arise from subsampling, from sums of exponentials, or from non-stationarity, and a finite system has a cutoff that complicates exponent estimation. The setpoint claim is marked **contested** in the assumptions for these reasons: the mathematics of the branching process is exact, but the assertion that a particular biological system lives at its critical point is an empirical question still being argued.

## What is speculative: the distance-to-criticality metric

The original framing of this playground emphasised a scalar d-squared "distance to criticality," accumulated across timescale shells via a temporal renormalization-group analysis. That metric is a proposed analysis pipeline for recordings; it is summarised here as context but is **not computed** by the simulation, which simply sets sigma directly. Its robustness across noise, subsampling, and recording modality is still being established, so it is flagged speculative.

## Limitations of the toy

The simulation makes deliberately minimal choices:

- **Bernoulli offspring.** Each site produces at most one successor per step. Real branching has variable fan-out; Poisson-offspring or lattice variants shift the finite-size cutoff and can alter the apparent exponent.
- **No spatial structure or refractoriness.** There is no lattice, no conduction delay, no recovery period. The Bak-Tang-Wiesenfeld sandpile and directed-percolation models add these and live in the same universality class but differ in finite-size behaviour.
- **Single seed, unbounded substrate.** Avalanches start from one site with no boundary, so the only cutoff is the simulation step limit.

None of these undermine the exact results above; they bound how far the toy can be read as a model of any particular physical or biological system.

## References

- T. E. Harris, *The Theory of Branching Processes* (1963).
- J. M. Beggs and D. Plenz, "Neuronal avalanches in neocortical circuits," *Journal of Neuroscience* (2003).
- S. Zapperi, K. B. Lauritsen, H. E. Stanley, "Self-organized branching processes: mean-field theory for avalanches," *Physical Review Letters* (1995).
- W. L. Shew and D. Plenz, "The functional benefits of criticality in the cortex," *The Neuroscientist* (2013).
- K. B. Hengen and W. L. Shew, "Is criticality a unified setpoint of brain function?," *Neuron* (2025).
