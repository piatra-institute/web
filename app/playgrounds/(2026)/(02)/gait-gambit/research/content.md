# Gait Gambit: Choosing How to Move as Active Inference

## Abstract

Why does a five-year-old skip down a hallway that an adult walks? Both bodies can do both gaits, so the difference is not anatomical capacity but choice. This companion treats the choice of gait as a policy-selection problem under active inference: each candidate gait is scored by an expected free energy that trades off physical cost, social cost, injury risk, arousal regulation, and the information a movement reveals, and the lowest-scoring gait is selected. The playground makes this trade-off tangible across four gaits (walk, skip, run, stroll). The model is principled in its scoring rule and deliberately unfitted in its parameters: the active-inference equation is real, but the per-gait constants are hand-chosen ordinal intuitions, not measured biomechanics. The honest claim is structural, that gait selection looks like a small inference problem, not quantitative, that these particular numbers predict real behaviour.

## From biomechanics to decision

Locomotion research has two long traditions. The first is biomechanical and metabolic: gaits are energy-optimal solutions, walking and running each minimise the metabolic cost of transport in their own speed range, and the walk-to-run transition sits near a predictable point. The dimensionless Froude number, the ratio of inertial to gravitational forces for a leg of length L moving at speed v, captures much of this, with the walk-run transition clustering near a Froude value around one half across body sizes. That tradition explains why we transition between gaits, but it says little about why someone would choose a manifestly inefficient gait like skipping.

The second tradition is about choice and affect: movement signals identity, regulates arousal, manages social attention, and explores the body's own capabilities. A skip is metabolically wasteful and conspicuous, yet it is fun, expressive, and proprioceptively rich. To explain it we need a scoring rule in which energy is one term among several, not the only one.

Active inference supplies exactly such a rule. An agent selects among policies by minimising expected free energy, which decomposes into pragmatic value (reaching preferred outcomes, avoiding costs and risk) and epistemic value (resolving uncertainty, gaining information). This playground keeps that backbone and adds gait-specific cost terms for social penalty, injury, and arousal regulation.

## What the playground computes

Four gaits are scored. Each gait pi carries six fixed specification numbers: impact, signal amplitude (proprioceptive richness), energy per distance, conspicuousness, complexity, and speed. The ten context variables (crowd, distance, surface hardness, hurry, mastery, norm pressure, current and desired arousal, novelty, carrying load) combine with those specs to produce seven components per gait. The expected free energy is

```
G(pi) = w_risk * Risk + w_amb * Ambiguity + w_energy * Energy
        + w_social * Social + w_injury * Injury + w_arousal * ArousalMismatch
        - w_info * InfoGain.
```

Every component is a clamped closed form. For example, injury probability rises with the gait's impact, surface hardness, crowd density, and carried load, and falls with mastery; social penalty multiplies the gait's conspicuousness by crowd density and norm pressure; energy scales with distance and the gait's per-distance cost; information gain is largest when novelty is high, mastery is low, the gait is complex and signal-rich, and the crowd is sparse enough to attend to it. The gait with the lowest G is selected. Information gain is the only term that lowers G, so exploration is a genuine drive: a novel, complex gait can win on epistemic value alone when its costs happen to be small.

## The child-adult gambit

The playground's central demonstration is that the same equation and the same four gaits produce a skipping child and a walking adult purely through a change in the weight vector. A child weights information gain up and social cost down, so the conspicuous, complex, proprioceptively rich skip becomes attractive. An adult raises the social, energy, and injury weights, which penalises skipping enough that walking takes over. Sweeping mastery or norm pressure along one axis shows the crossover as an explicit intersection of G curves.

This is an interpretive overlay, not a fitted developmental trajectory. Children and adults also differ in limb proportion, strength, and balance, so attributing the whole crossover to weighting alone is a simplification the assumptions panel flags as speculative.

## Calibrating an unfitted model

A model with no fitted parameters has no external empirical target to match, so calibrating it against, say, a measured walk-run speed would be dishonest. What is genuinely verifiable is internal consistency: that each deterministic component the model computes reproduces its own published closed form. The calibration panel does exactly this. Each case fixes a context, asks the live scoring function for a component (injury probability, energy cost, social penalty, predicted arousal, information gain), and compares it against the value derived by hand from the formula. Agreement is exact to four decimals, which confirms the implementation matches the documented equations. The stochastic time-stepping used for the live preview is left out of the calibration on purpose; only the deterministic scoring core is checked.

## Limitations

This is a toy. The gait specifications are hand-tuned ordinal intuitions, not motion-capture or metabolic measurements, so the playground predicts the shape of a trade-off rather than any particular behaviour. The four-gait, linear-additive structure cannot express continuous speed and cadence variation or non-additive interactions between costs. Absolute G values are arbitrary; only rankings within one parameter setting carry meaning. The biomechanical literature (cost of transport, Froude scaling) would be needed to pin the constants down and turn the structural story into a quantitative one. The defensible reading is that choosing how to move resembles a small active-inference problem, and that energy is one term in that problem rather than the whole of it.

## References

- Friston, K. et al. Active inference and the free-energy principle; expected free energy as the scoring rule for policy selection.
- Alexander, R. McN. Optimization and gaits in the locomotion of vertebrates; Froude number and the walk-run transition.
- Srinivasan, M. and Ruina, A. Computer optimization of a minimal biped model discovers walking and running.
