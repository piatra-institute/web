# Coordination under complementarity

## Abstract

Housing, infrastructure, and other spatially fixed systems must function at the metro or regional scale, yet the strongest incentives, vetoes, and feedback loops act at smaller units: the parcel, the neighborhood, the municipality. When the unit of function and the unit of selection diverge, a demand shock that should produce more homes is instead converted into price inflation, queues, vacancy misallocation, or informal settlement. This playground models that divergence as a coordination game with strategic complementarity across a seven scale hierarchy (Cell through Metro), borrowing language from supermodular game theory, sheaf theory, and Michael Levin's work on morphogenetic hierarchy. This companion documents what the simulator actually computes, which of its prose claims the dynamics reproduce, and where the model is a metaphor rather than a fit.

## Background: complementarity and coordination

A coordination game with strategic complementarity is one where each player's incentive to act rises with the actions of others. Housing supply is a textbook case. A unit of housing is not produced by any single input. It requires land, permissive zoning, trunk infrastructure, utility hookups, finance, permits, and political consent, all available at the same place and roughly the same time. If any one node can block, the demand signal does not recruit coordinated supply. This is the supermodularity studied by Milgrom and Roberts: complements raise each other's marginal value, so systems with strong complementarity have multiple equilibria and sharp tipping behavior between them.

The political economy layer is the homevoter hypothesis (Fischel) and the spatial misallocation literature (Hsieh and Moretti; Glaeser, Gyourko and Saks). Existing owners are organized, vote locally, and benefit from scarcity because it raises the value of what they already hold. The costs of undersupply fall on would be buyers and renters, who are politically weaker in local decisions. The result is a locally rational, globally pathological equilibrium: each jurisdiction blocks supply that the region needs.

## The model

The simulator advances a discrete time trajectory over a fixed horizon (48 steps by default) across seven nested scales. Each scale `i` carries a desired state and an actual state. Ten control parameters drive the dynamics: demand shock, complementarity, signal fidelity, repair capacity, local veto, incumbent capture, finance misalignment, infrastructure sync, regional steering, and gluing strength.

The model is fully deterministic. What reads like noise in the code is a fixed sine of the time and scale indices scaled by one minus the signal fidelity, so a given parameter set always yields the same trajectory. This is what makes the model verifiable: the calibration cases simply rerun `simulate` and read back metrics.

### Per scale update

At each step the global goal is set by the demand shock plus a cyclical term:

```
baseGoal = clamp(0.35 + demandShock * 0.52 + 0.18 * sin(phase * 2.4 pi))
```

Each scale forms a perceived signal from the goal, a memory trace, and a fidelity dependent local distortion. It then forms a gluing target by averaging its own perceived signal with the desired states of the scale below and the scale above. The desired state relaxes toward that gluing target. Adaptation, the rate at which actual moves toward desired, is increased by repair capacity, infrastructure sync, and signal fidelity, and decreased by veto load, finance penalty, and the complementarity cost of trying to exceed local support. A Levin style morphogenetic pull lets higher scales recruit lower scales toward the system goal, but only in proportion to the product of repair capacity and gluing strength.

### Aggregate metrics

From the per scale states the model derives:

- **Coherence**: one minus the mean absolute difference between adjacent scales, penalized by mean gluing error.
- **FAR (functional adaptation rate)**: how much of the demand shock is absorbed as coordinated capacity. It blends absorption, coherence, infrastructure, and steering, less a finance penalty.
- **Misallocation**: mean gap between desired and actual, plus finance and veto terms.
- **Cohomology defect**: a sheaf inspired measure of how badly local sections fail to glue into a global section.
- **Basin stability**: how much shock the current regime can absorb before transitioning.
- **Harm obstruction**: a four part decomposition (agency, material, stability, mobility) of what breaks when scales fail to glue.

A regime label (Adaptive, Rigid lock-in, Chaotic drift, Collapse) is assigned by thresholding coherence, FAR, veto load, misallocation, and cohomology defect.

## Results: what the dynamics reproduce

The calibration suite checks five claims by rerunning the deterministic core. All five reproduce with error below one percent.

### Ordering of absorption across presets

The four presets produce a clean ordering of horizon mean FAR: healthy morphogenesis near full absorption (about 100%), then NIMBY lock-in and China style overhang in the middle (about 75% and 77%), then informal explosion lowest (about 59%). This is the qualitative ordering the housing literature predicts: an elastic, well steered metro absorbs nearly all of a demand shock, while veto heavy or infrastructure starved systems leak a large share of it.

### Supply suppression raises prices

Mean price pressure under NIMBY lock-in (about 0.51) exceeds the healthy baseline (about 0.33). The model reproduces the basic supply to price pass through: when adaptation is blocked, unabsorbed demand shows up as price pressure rather than completions.

### Best response direction under complementarity

Raising regional steering from zero to one, holding all other parameters at default, raises FAR (from about 85% to about 105% on the FAR index). This is the supermodular signature: a higher scale that steers local choices makes alignment self reinforcing, pulling local best responses toward the system goal.

### Finance misalignment is the dominant lever

The sensitivity sweep ranks finance misalignment as the single parameter whose zero to one swing moves FAR the most (range about 20 FAR points), narrowly ahead of regional steering and infrastructure sync. Capital that steers building toward balance sheet logic is the strongest brake on system level absorption in this parameterization, consistent with the finance led misallocation reading of China's property overhang.

## Limitations: where the model is metaphor

Honesty requires flagging where the prose outruns the dynamics.

**Regime classification is inert for the presets.** Although the model defines four regimes and the outro narrates lock-in and collapse, every one of the four shipped presets stays in the Adaptive regime for all 48 steps. Coherence remains above 0.93 in every preset because the adjacent scale smoothing is strong and the support bound is loose, so the coherence and FAR thresholds that would trigger Rigid lock-in, Chaotic drift, or Collapse are never crossed by the default presets. The differences between presets are real and correctly ordered (FAR, price pressure, defect all move in the expected directions), but the discrete regime label does not flip. To see non Adaptive regimes a user must push parameters by hand well beyond the preset envelopes. The regime classifier is therefore best read as a conceptual map of possible failure modes, not as a fitted typology of the four named cases.

**The scales are a metaphor, not a measured hierarchy.** The Cell through Metro labels borrow Levin's morphogenetic framing, but the seven scales here are an abstract chain with hand chosen coupling weights, not calibrated jurisdictional levels. The morphogenetic pull and the sheaf cohomology defect are evocative formalizations, classified as speculative in the assumptions panel, not empirical claims.

**No stochastic shocks or path branching.** Real housing systems have continuous interactions, lumpy capital, and genuine randomness. The only path dependence here is a single hysteresis channel: accumulated misallocation slowly degrades effective signal fidelity. There is no demand stochasticity, so the model cannot speak to the variance of outcomes, only their central tendency.

**Parameter weights are unfit.** The numeric coefficients in the update rules were chosen to produce sensible qualitative behavior, not estimated from data. The calibration anchors (100% and 75% FAR targets) are qualitative bands drawn from the supply elasticity literature, not point estimates, and they are within tolerance largely by construction.

## How to read the playground

Treat the simulator as an argument made in equations rather than a forecast. Its load bearing claims are directional and ordinal: more steering helps, more finance misalignment hurts, suppressed supply becomes price pressure, and the harm of a coordination failure has a profile (agency, material, stability, mobility) that depends on which loop broke. Those claims hold up under the deterministic checks. The regime labels and the biological scale names are scaffolding for intuition, and should be held more loosely.

## References

- Milgrom, P. and Roberts, J. (1990). The Economics of Modern Manufacturing: Technology, Strategy, and Organization. American Economic Review.
- Hsieh, C. and Moretti, E. (2019). Housing Constraints and Spatial Misallocation. American Economic Journal: Macroeconomics.
- Glaeser, E., Gyourko, J. and Saks, R. (2005). Why Is Manhattan So Expensive? Regulation and the Rise in Housing Prices. Journal of Law and Economics.
- Fischel, W. (2001). The Homevoter Hypothesis. Harvard University Press.
- Rogoff, K. and Yang, Y. (2021). Has China's Housing Production Peaked? China and World Economy.
- Levin, M. (2019). The Computational Boundary of a Self: Developmental Bioelectricity Drives Multicellularity and Scale Free Cognition. Frontiers in Psychology.
- Robinson, M. (2014). Topological Signal Processing. Springer (sheaf cohomology for data fusion).
