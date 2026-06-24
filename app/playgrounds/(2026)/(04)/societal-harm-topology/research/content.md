# Societal Harm Topology

## Abstract

This playground models the distributed harm produced by a single concentrated private actor across overlapping domains of social life. Instead of collapsing damage into one number, it tracks an eight dimensional harm vector per domain, aggregates the vectors into a global profile, and then derives a scalar index only at the very end. The novel move is to treat society as a covered space, a collection of overlapping local contexts, and to ask a topological question: do the local stories of harm glue together into one coherent global account, or is there an obstruction that prevents assembly? The obstruction is the model's stand in for fragmented accountability. This document describes exactly what the code computes, separates the verified mathematics from the interpretive framing, and lists the assumptions and limitations.

## Background

Three research traditions feed the model.

The first is the capability approach of Amartya Sen and Martha Nussbaum, in which wellbeing is what a person can actually do and become, not the utility they report. Harm in that frame is the degradation of capabilities, so a vector of distinct capability losses is more faithful than a single welfare scalar.

The second is the literature on multidimensional poverty and wellbeing indices (Alkire and Foster; Decancq and Lugo), which is explicit that any weighting that compresses many dimensions into one index is a value choice, never a neutral measurement. The model inherits that honesty by exposing the per dimension moral weights as adjustable parameters.

The third is applied sheaf theory (Curry; Ghrist), which formalizes the question of when local data over the pieces of a cover can be assembled into consistent global data. When it cannot, the failure is measured by a cohomology class. The model borrows this language to talk about why responsibility can be locally visible in every sector yet globally hard to assign.

## The harm state vector

For each affected domain the model carries an eight dimensional intensity vector over the dimensions life years, health, material, agency, political voice, ecological, epistemic, and tail risk. Three of these (political, ecological, tail) are flagged future sensitive and receive an extra multiplier from the `futureWeight` parameter, reflecting that their consequences extend across generations.

A domain (the code calls it a sector) carries, in addition to its raw harm vector, five context scalars: the share of population it touches, the actor's network centrality inside it, the actor's institutional leverage, a claimed local benefit, the epistemic uncertainty of the estimate, and a gluing score for how compatible the domain is with its neighbors.

## Model description

The pipeline runs in six stages, all deterministic.

1. Local harm. For each sector the model forms a reach factor

    `exposure = (population / 100) * (centrality / 100) * (leverage / 100)`

    and three modifiers: an uncertainty penalty `1 - uncertainty / 250`, a gluing factor `0.6 + gluing / 250`, and a power factor `0.55 + actorPower / 100`. Each raw harm component is multiplied by its moral weight and by all four factors, with future sensitive dimensions taking the extra `futureWeight` multiplier. The result is the local dimension score vector.

2. Aggregation. The global harm vector is the componentwise sum of the local vectors. This additivity is exact and is one of the calibration checks.

3. Net harm. Gross harm is the sum of all local components. A benefit offset of `gross * (benefit / 100) * 0.45` is subtracted per sector to get net, then a global repair term `netRaw * (repairCapacity / 100) * 0.55` is removed. Net total is therefore non-increasing in repair capacity, another calibration check.

4. Sheaf consistency. The model computes the average pairwise cosine similarity of the sector dimension vectors, rescales it to a structural coherence in the unit interval, blends it with the declared gluing scores, and reports the result on a 0 to 100 scale. The topological obstruction is its complement, `100 - sheafConsistency`. The two summing to 100 is the third calibration check.

5. Fragility. A weighted combination of global tail mass, ecological mass, governance mass (political plus agency plus epistemic), and an intensity term flags systemic vulnerability.

6. Scalar index. Only now is a single number formed, from net total scaled by a blend of the discount factor, the future weight, and an obstruction surcharge. Deriving the scalar last is the methodological point: the vector geometry, not the scalar, is the object of study.

## What is and is not verified

The calibration file checks five exact properties of the deterministic core rather than fitting external data, because the model has no external ground truth and the prose claims are interpretive. The checks are: the closed form for exposure (0.5 x 0.8 x 1.0 = 0.40 for a probe sector), global vector additivity over all eight dimensions, obstruction and consistency summing to 100, net harm monotonicity in repair capacity, and the closed form Gini coefficient (n - 1) / n = 0.875 for a vector with all mass in one of eight dimensions. All five reproduce with zero error.

What the model does not verify is the empirical accuracy of any sector's harm numbers. The preset profiles (platform monopoly, extractive finance, fossil incumbent) are illustrative stylizations chosen to make the qualitative claims legible, not calibrated measurements of real firms. The cosine similarity used for sheaf consistency is a heuristic proxy for true gluing compatibility, not a computed cohomology class; the H^1 language in the outro is a metaphor for the failure of local accountability to assemble, not a literal cohomology computation. These framing claims are honest about being framing.

## Results

Sweeping actor power and repair capacity shows the expected monotonic responses. Raising actor power lifts every harm dimension proportionally through the shared power factor, while raising repair capacity drives net harm down. The presets reproduce their stated qualitative profiles: the platform monopoly preset makes epistemic harm dominant and lowers sheaf consistency because the media vector diverges from the labor and ecological vectors, and the fossil incumbent preset pushes ecological, health, and tail risk to the top while political capture keeps repair low.

## Limitations

The counterfactual baseline ("median firm behavior") is asserted rather than constructed; the model does not simulate the alternative world it differences against. Moral weights are a value choice with no neutral default. The cosine proxy can report high consistency for sectors that merely share a harm shape even when their actual gluing differs. The benefit offset and repair terms use fixed coefficients (0.45 and 0.55) with no empirical grounding. None of the sector numbers are measurements. The model is a transparent reasoning aid for thinking about distributed harm, not a measurement instrument.

## References

- Sen, A. (1999). Development as Freedom.
- Nussbaum, M. (2011). Creating Capabilities.
- Alkire, S. and Foster, J. (2011). Counting and Multidimensional Poverty Measurement.
- Decancq, K. and Lugo, M. A. (2013). Weights in Multidimensional Indices of Wellbeing.
- Curry, J. (2014). Sheaves, Cosheaves and Applications.
- Vitali, S., Glattfelder, J. B. and Battiston, S. (2011). The Network of Global Corporate Control.
- Pearl, J. (2009). Causality: Models, Reasoning, and Inference.
- Weitzman, M. (2009). On Modeling and Interpreting the Economics of Catastrophic Climate Change.
