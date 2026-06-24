# Trauma, Eustress, and the Bandwidth of Response

## Abstract

This playground renders a deliberately simple picture of how a single stressful event can fan out into very different long-run outcomes. A person starts at a pre-event baseline, encounters an event, and then follows one of four prototypical paths: resilience, recovery, chronic narrowing, or post-traumatic growth. The visual organizing idea is a single signed bandwidth axis. Upward is narrowing, the defensive constriction of attention and behaviour under threat. Downward is expansion, the widening associated with eustress, the activating good stress that opens rather than closes. This document explains what the model actually computes, which parts of it are well supported, and which parts are illustrative scaffolding rather than validated science.

## Background

### Eustress and distress

Hans Selye distinguished eustress from distress in the 1970s. Both are forms of stress in the sense of a demand placed on an organism, but eustress is experienced as activating, meaningful, and within coping capacity, while distress overwhelms. The playground treats these as two directions on one axis: a positive constriction value is distress and narrows the bandwidth, a negative value is eustress and widens it, and zero is the neutral threshold separating them.

This single-axis collapse is a strong simplification. Eustress and distress may recruit partly distinct appraisal and physiological systems rather than being one quantity with opposite sign. The playground marks this as a speculative framing in its assumptions panel.

### Attentional narrowing under threat

The narrowing pole has firmer empirical footing. The Easterbrook hypothesis holds that high arousal narrows the range of cues an organism uses, which is adaptive for acute danger but maladaptive when it persists. Chronic narrowing in this model stands in for that persistence: a response that never reopens.

### Four trajectories after adversity

George Bonanno and colleagues used latent growth-mixture modelling to argue that, across bereavement and trauma samples, outcomes cluster into a small number of prototypical trajectories, with resilience being the modal path rather than the exception. The four nodes in this playground (resilience, recovery, chronic, growth) follow that taxonomy. Whether outcomes are truly discrete classes or a continuum that classes only approximate is itself contested, which is why the playground flags the four-trajectory bucketing as a contested assumption.

### Post-traumatic growth

Tedeschi and Calhoun proposed that some people report positive psychological change in the aftermath of struggle with highly challenging circumstances, including deeper relationships and a changed sense of possibility. Growth is the expansion pole of the model. The playground makes neuro-flexibility the dominant driver of growth, reflecting work by Kalisch and others framing resilience and growth as flexible recalibration rather than mere absence of symptoms.

## Model description

The model is fully deterministic. There is no randomness anywhere; the play control simply sweeps the constriction slider back and forth so the branch diagram animates.

### Mechanisms

Four mechanisms each carry a slider weight and a fixed table of signed influences, one per trajectory:

- Appraisal: threat versus meaning. Pushes toward chronic narrowing, slightly away from resilience and growth.
- Rumination: intrusive versus deliberate. Pushes toward chronic narrowing and a slower recovery.
- Social support: pushes away from narrowing on the resilience and recovery paths.
- Neuro-flexibility: the dominant pull toward growth.

### The weighted sum

For a given trajectory, the mechanism delta is the sum over mechanisms of weight times influence. With all four sliders at unit weight the deltas are:

- resilience: -0.10 + 0 + -0.13 + 0 = -0.23
- recovery: 0 + 0.08 + -0.08 + 0 = 0.00
- chronic: 0.15 + 0.20 + 0 + 0 = 0.35
- growth: -0.10 + 0 + 0 + -0.18 = -0.28

Chronic is the most strongly positive (most narrowing), growth the most strongly negative (most expansion), and recovery exactly zero in mechanism terms.

### The baseline offset

On top of the mechanism delta, each trajectory gets a baseline offset from the constriction value. The chronic path starts at the event node, which sits at the constriction value itself, so a more distressing event lifts chronic narrowing directly. The growth path hangs off an expansion node. The recovery path relaxes below baseline by half the constriction value, encoding the documented dip-below-baseline-then-return pattern of a delayed rebound. Resilience hangs near baseline, barely moved.

## Results

The calibration panel verifies the model against itself, because the deterministic core has exact answers. It checks that the per-trajectory mechanism deltas equal their hand-derived sums, that at the eustress threshold (constriction zero) the chronic path carries no narrowing offset and equals its pure mechanism delta, and that under full distress the recovery path relaxes to negative one half plus its zero delta. These are structural identities, so a faithful implementation lands at zero error.

This is reproduction, not validation. The calibration confirms the code computes what the documentation says it computes. It does not confirm that real trauma outcomes follow these numbers.

## Limitations

This is a transparent linear sandbox, not a clinical predictor. The most important caveats, all surfaced in the assumptions panel:

1. The single bandwidth axis cannot represent cases where cognitive and behavioural responses dissociate.
2. The weighted sum is additive with no interactions or saturation, so it cannot express buffering effects that only appear under high threat.
3. The trajectories are static endpoints, not states integrated through time, so the model gestures at temporal patterns like the recovery dip without actually simulating timing.
4. The coefficients are population-average directions, not individual predictions. Applied to a single person the model would frequently be wrong.

The honest claim is narrow: the sign and rough ordering of these mechanism effects match the trauma literature, and the branch diagram is a faithful, checkable rendering of a simple additive rule. Everything beyond that ordering is illustrative.

## References

- Selye, H. (1974). Stress Without Distress.
- Easterbrook, J. A. (1959). The effect of emotion on cue utilization and the organization of behavior.
- Bonanno, G. A. (2004). Loss, trauma, and human resilience.
- Tedeschi, R. G., and Calhoun, L. G. (1996, 2004). The Posttraumatic Growth Inventory and foundations of posttraumatic growth.
- Ehlers, A., and Clark, D. M. (2000). A cognitive model of posttraumatic stress disorder.
- Nolen-Hoeksema, S., Wisco, B. E., and Lyubomirsky, S. (2008). Rethinking rumination.
- Kalisch, R., Muller, M. B., and Tuscher, O. (2015). A conceptual framework for the neurobiological study of resilience.
