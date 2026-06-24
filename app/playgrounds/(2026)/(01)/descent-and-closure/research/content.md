# Descent and Closure

## Abstract

This playground asks an old question in a categorical key: when does a heap of local micro-events become a single coherent process? It answers with two moves borrowed from mathematics. The first is **descent**: the sheaf-theoretic test of whether local observations on overlapping pieces of time fit together into one global story. The second is **closure**: the Mori-Zwanzig test of whether a coarse-grained macro-description is self-contained, so that its future depends only on its present and not on the buried micro-history. A process, in this reading, is a presheaf of trajectories that satisfies descent and whose coarse-graining is closed.

## Background

### From events to processes

A primitive event is local and pointlike. A process is extended and coherent: it persists, it has identity, its parts agree. The gap between the two is exactly the gap a sheaf is built to bridge. Sheaf theory studies how local data over the open sets of a space can be glued into global data, and what obstructions stand in the way. Replacing "open sets of a space" with "intervals of time" turns the sheaf condition into a precise criterion for when local micro-histories cohere into one process.

### Descent

Given a cover of an interval [0, T] by overlapping sub-intervals, a **presheaf** assigns to each sub-interval the set of admissible local histories, together with restriction maps that truncate a history to a smaller interval. The presheaf is a **sheaf** when it satisfies *descent*: any family of local sections that agree on every pairwise overlap glues to a unique global section. The agreement-on-overlaps requirement is checked here pairwise (the gluing condition) and on triples (the Cech cocycle condition). Failure of descent is an obstruction: the locals describe genuinely different micro-worlds that cannot be a single process.

### Coarse-graining as a natural transformation

The macro-observable here is a centred moving average of the micro-trajectory. Treating both micro-histories and macro-observables as presheaves, coarse-graining is a map **q** between them. If q commutes with restriction (coarse-graining a restricted history equals restricting a coarse-grained one) it is a **natural transformation**, and the macro picture is consistent across scales. The playground does not assume this; it measures the commutator on every interval inclusion and reports the deviation, which is largest near interval boundaries where the moving-average window is clipped.

### Closure and the Mori-Zwanzig formalism

Projecting microscopic dynamics onto a few macroscopic variables produces, exactly, a generalised Langevin equation,

```
dm/dt = R(m) + integral_0^t K(t - s) m(s) ds + eta(t),
```

with a streaming term R, a **memory kernel** K, and a noise term eta. The macro-description is **closed** (Markovian) precisely when the memory kernel decays fast compared with the macroscopic timescale, so that the convolution term can be dropped. This is the formal content of "timescale separation". The playground fits both a memoryless reduced model and an exponential / finite-impulse-response kernel, reports the kernel's half-life, and runs a Ljung-Box portmanteau test on the residuals: white residuals are evidence that the dropped memory term was indeed negligible.

## Model description

The pipeline has five stages, all in `logic/index.ts`:

1. **Micro-trajectory.** A seeded linear-congruential generator drives a drift-plus-jump random walk: at each step an event fires with probability `lambda*dt` and contributes a Gaussian jump of scale `stepSigma`, on top of a constant drift. The seed makes every run reproducible.
2. **Cover.** `buildCover(T, k, overlapFrac)` returns k intervals tiling [0, T], each extended by `overlapFrac` of its width into its neighbours. With zero overlap it is a strict partition.
3. **Local sections.** Each interval carries either the restriction of the global trajectory plus measurement noise (the *consistent* case) or an independently simulated local history (the *inconsistent* case).
4. **Descent.** Strict gluing accepts only if the maximum pointwise spread across overlaps stays under the tolerance epsilon; otherwise it reports an obstruction. Sheafification instead repairs the disagreement by a weighted average, the best-fit global section.
5. **Closure.** The glued (or fallback) series is coarse-grained, a reduced model is fitted, the memory kernel is estimated, and the Ljung-Box test is applied.

## Results and how to read them

- Turning **consistent restrictions off** makes local sections independent micro-worlds; strict gluing then fails and the Cech panels light up.
- Adding **measurement noise** raises the overlap spread; gluing succeeds only when the tolerance epsilon is widened to absorb it.
- Increasing the memory timescale **tau** thickens the kernel and pushes the Ljung-Box p-value down, the signature of a process that is not Markovian-closed at the chosen window.

## Calibration

Because the micro-trajectory is stochastic, the calibration suite never grades the random walk. It grades the deterministic algebraic identities the machinery must satisfy for any input:

- a zero-overlap cover of [0, T] has interval lengths summing exactly to T;
- the cover returns exactly the requested number of intervals;
- strict gluing of consistent, noise-free locals has zero overlap spread;
- gluing a genuine global section reproduces it exactly (gluing is idempotent there);
- the moving average with a width-1 window is the identity;
- the memoryless reduced model exactly recovers the linear coefficient of a synthetic deterministic macro-orbit.

Each predicted value is computed by calling the logic functions directly, and all six reproduce their targets to floating-point precision.

## Limitations

The sheaf condition is approximated by a finite cover with pairwise and triple checks, not the full Grothendieck topology of the continuous site. The Mori-Zwanzig kernel is approximated by a short exponential / finite-impulse-response fit, which can mislabel a long-memory process as Markovian when the lag budget is too small. The Ljung-Box test sees only linear autocorrelation, so nonlinearly dependent residuals can slip through. The coarse-graining is only approximately natural near interval boundaries. These are honest approximations, surfaced in the assumptions panel rather than hidden.

## References

- S. Mac Lane and I. Moerdijk, *Sheaves in Geometry and Logic*, Springer, 1992.
- M. Robinson, *Topological Signal Processing*, Springer, 2014.
- R. Zwanzig, *Nonequilibrium Statistical Mechanics*, Oxford University Press, 2001.
- H. Mori, "Transport, collective motion, and Brownian motion", *Prog. Theor. Phys.* 33 (1965) 423.
- A. J. Chorin, O. H. Hald, R. Kupferman, "Optimal prediction and the Mori-Zwanzig representation of irreversible processes", *PNAS* 97 (2000) 2968.
- G. M. Ljung and G. E. P. Box, "On a measure of lack of fit in time series models", *Biometrika* 65 (1978) 297.
- R. Cont and P. Tankov, *Financial Modelling with Jump Processes*, Chapman and Hall, 2004.
