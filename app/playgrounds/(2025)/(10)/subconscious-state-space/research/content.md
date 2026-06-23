# Subconscious State Space: Consciousness as a Trajectory

## Abstract

What separates waking from deep sleep or anesthesia, at the level of brain
dynamics? This playground models the brain as two coupled neural populations,
excitatory and inhibitory, and lets you steer their activity through a state space
where different regions correspond to different regimes. The dynamics are
stochastic, but they rest on exact primitives, a sigmoid firing response and a
correlation-based synchrony measure, and the calibration pins those.

## A two-population model

The model is a neural-mass system: instead of tracking individual neurons, it
tracks the average activity of an excitatory population E and an inhibitory
population I. Their interaction, tuned by synaptic conductances and a thalamic
drive, produces the rhythms and regimes the playground visualizes. This is a
coarse, mean-field caricature of cortex, the Wilson-Cowan tradition, useful for
seeing qualitative regimes, not for cellular detail.

## The exact primitives

Two pieces are deterministic and checkable, and the calibration verifies both:

- **Sigmoid firing response.** A population's firing rate is a logistic function
  of its input, saturating at high drive and vanishing at low drive. At the
  threshold the response is exactly one half; well above it, it approaches one.
- **Synchrony as correlation.** How locked-together E and I activity are is
  measured by the Pearson correlation: +1 when they rise and fall together, -1
  when one rises as the other falls, near 0 when unrelated. The calibration checks
  all three cases exactly.

These are the load-bearing math; everything richer is built on them.

## Regimes and "access"

The model attaches a heuristic "access probability" to sustained, synchronized
high activity, a stand-in for global ignition in global-workspace theories of
consciousness, where information becomes available across the brain. High
synchrony with sustained activity reads as conditions permitting ignition; total,
flat synchrony (as in slow-wave sleep or anesthesia) reads as unconscious.

This mapping is interpretive, and the assumptions panel says so. The access
probability is defined on model signals, not measured against any real index of
awareness. It is a way to think about the dynamics, not a detector of
consciousness.

## What is exact, and what is not

The trajectory you watch is noise-driven, so no two runs match and the on-screen
metrics are single samples. The reproducible content is the primitive layer, the
firing curve and the synchrony measure, which is why the calibration targets those
rather than a specific run. And the leap from "synchronized sustained activity" to
"conscious access" is a theoretical interpretation, not a result the simulation
proves.

## What it is

A conceptual sandbox for the idea that conscious and unconscious states are
different regions of a neural state space, reachable by changing a few global
parameters. It is for building intuition about excitation, inhibition, synchrony,
and ignition, not a clinical or diagnostic model.

## References

- Wilson, H. R., and Cowan, J. D. (1972). Excitatory and inhibitory interactions
  in localized populations of model neurons.
- Dehaene, S. Consciousness and the Brain. (Global workspace and ignition.)
- Standard references on the sigmoid firing-rate function and Pearson correlation.
