# Epistemic Lensing

## Overview

This playground models how mediated information channels deform belief formation. An agent receives evidence about the world through a channel that can attenuate, select, warp, amplify, and recursively feed back on itself. The result is a posterior belief that may diverge systematically from what a higher-fidelity channel would support. The playground makes this divergence visible and measurable.

## Background

The standard vocabulary for public epistemic failure is impoverished. "Low information," "misinformation," "media bias" — these framings treat the problem as a deficit of quantity or a binary of true/false. They miss the structural question: not how much information reaches people, but *in what shape*.

The concept of epistemic lensing draws on three intellectual traditions:

**Active inference and Markov blankets.** Karl Friston's free energy principle (2013) formalizes how agents are separated from their environment by a Markov blanket — sensory and active states that mediate all interaction. The agent's internal model updates only through blanket-facing inputs. A mediating channel interposes between the environment and the blanket, transforming the evidence before it arrives.

**Information theory.** Shannon's mathematical theory of communication (1948) provides the framework for measuring what a channel preserves and what it destroys. Mutual information, channel capacity, and noise are the natural vocabulary for quantifying how much of the world survives mediation.

**Media ecology and political cognition.** Research on filter bubbles (Pariser, 2011), echo chambers (Sunstein, 2001), continued influence effects (Lewandowsky et al., 2012), and identity-protective cognition (Kahan et al., 2017) provides the empirical grounding for why channel structure matters for democratic epistemology.

## The Model

The toy model has three layers:

**World.** A continuous latent state evolving as a random walk. This represents the true state of affairs — the economy, the trajectory of a pandemic, the effects of a policy.

**Channel.** A parameterized transformation that processes the evidence stream before it reaches the agent. The channel has six adjustable properties: signal strength (attenuation), omission rate (selection), warping bias, amplification gain, recursion strength, and additive noise.

**Agent.** A quasi-Bayesian updater that forms a posterior belief based on the channel's output. The agent has three cognitive parameters: prior strength (how much it weights existing belief), trust in the channel, and motivated reasoning (how much it downweights evidence inconsistent with current belief).

At timestep 150, the model injects a "correction" — the agent briefly observes the true world state. This tests whether the agent snaps back to accurate belief or whether distortion persists as hysteresis.

## What the Playground Simplifies

The model makes several deliberate simplifications:

- The world is a single continuous variable, not a high-dimensional state space.
- The agent is a single rational updater, not a population with heterogeneous priors.
- The channel is parameterized by sliders, not by the complex institutional dynamics of real media systems.
- The benchmark is a Bayesian ideal, not a realistic model of human cognition.

These simplifications serve the framework's purpose: to demonstrate the *logic* of distortion — that ignorance and distortion are qualitatively different, that hysteresis is a structural phenomenon, and that correction can fail even when the truth is available.

## What You Can Learn

**Try the four presets.** Each isolates a different distortion operator. Notice how pure attenuation leaves the agent uncertain but correctable, while selection+warping and recursion produce confidence, bias, and resistance to correction.

**Compare channel vs. agent parameters.** Move the warping bias slider and notice that distortion comes from the channel. Then move motivated reasoning and notice that the agent's own cognitive biases amplify channel distortion. The two interact nonlinearly.

**Watch the correction.** At t=150, truth arrives. Under attenuation, the agent snaps back. Under recursion, it partially corrects then drifts back as the channel's memory reasserts. This is the difference between a correctable society and a locked-in one.

**Save a snapshot.** Set one channel configuration, save it, then change the parameters. The orange dashed line shows where you were. The metric deltas show what got better or worse.

## Further Reading

- Friston, K. (2013). Life as we know it. *Journal of the Royal Society Interface*. — The Markov blanket formalism.
- Shannon, C. E. (1948). A mathematical theory of communication. *Bell System Technical Journal*. — Foundation of channel theory.
- Lewandowsky, S. et al. (2012). Misinformation and its correction. *Psychological Science in the Public Interest*. — The continued influence effect.
- Pariser, E. (2011). *The Filter Bubble*. — Algorithmic personalization as a channel distortion.
- Kahan, D. et al. (2017). Motivated numeracy and enlightened self-government. *Behavioural Public Policy*. — Identity-protective cognition.
- Sunstein, C. R. (2001). *Echo Chambers*. — Group polarization through channel homogeneity.
- Walter, N. et al. (2020). Fact-checking: A meta-analysis. *Political Communication*. — When correction works and when it doesn't.
