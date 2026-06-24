# Social Propagation: Contagion, Thresholds, and Policy Friction

## Abstract

This playground models how content spreads across a large social network and how
platform policy can suppress coordinated political manipulation. It treats sharing
as a branching contagion process governed by a reproduction number, applies the
epidemic threshold to decide whether a cascade self-sustains, and accumulates an
expected count of successful manipulations as content ages and friction is applied.
The companion below sets out the model, its grounding in epidemiology and the
sociology of diffusion, the closed-form results used to calibrate it, and where it
should not be trusted.

## Background: two traditions of contagion

Two research traditions describe how things spread through populations.

The first is mathematical epidemiology. The compartmental SIR model of Kermack and
McKendrick (1927) partitions a population into Susceptible, Infected, and Recovered
and tracks flows between them. In its simplest deterministic form the infected
fraction grows according to dS/dt = minus beta S I, dI/dt = beta S I minus gamma I,
and dR/dt = gamma I, with the basic reproduction number R0 = beta over gamma. The
single most important result is the threshold theorem: an outbreak grows only when
R0 exceeds 1. Below 1 each infection produces on average fewer than one further
infection and the chain dies out. Above 1 a finite fraction of the population is
eventually reached, given by the final-size relation, which for a well-mixed
population settles near 1 minus 1 over R0.

The second tradition is the sociology of diffusion. Granovetter's threshold model
(1978) and Watts's cascade model (2002) describe adoption that requires social
proof: a person acts only when the fraction of their contacts who have already
acted crosses a personal threshold theta. Centola and Macy (2007) sharpened the
distinction between simple contagion, where a single exposure can transmit (like a
virus), and complex contagion, where multiple reinforcing exposures are needed
(like risky or costly behaviour). Political persuasion sits uneasily between the
two: a single viral post can plant a claim, but durable belief change usually needs
repetition and corroboration.

The social propagation playground borrows the reproduction number and threshold
from epidemiology for its running simulation, and exposes the linear-threshold rule
as a contrast object in its logic and calibration.

## The model

The Viewer runs a discrete-time mean-field branching process at one-minute
resolution. Rather than tracking individual accounts, it carries aggregate state:
the number of currently active shares, cumulative reach, and a cumulative
manipulation index. The core quantities are as follows.

**Basic reproduction number.** A fresh share reaches `avgDegree` followers, each of
whom reshares with probability `shareProb`, optionally amplified by an algorithmic
boost. The product

```
R0 = avgDegree x shareProb x amplification
```

is the branching analogue of R0 = contacts times transmission probability. With the
default fan-out of 150, reshare probability 0.02, and amplification 1.0, R0 equals
3.0.

**Effective reproduction number.** Policy levers act as multipliers. Forward caps
halve the effective fan-out (degree factor 0.5); question gating scales down the
reshare probability (share factor 0.75); delayed visibility (coolup) damps ignition
(damping 0.55). The effective reproduction number is

```
R_eff = R0 x degreeFactor x shareProbFactor x coolupIgnitionDamp
```

**Epidemic threshold.** The cascade is supercritical, meaning self-sustaining and
growing, exactly when R_eff exceeds 1. Stacking enough friction to drive R_eff below
1 is the whole game of the policy scenario: it converts a growing cascade into one
that fades.

**Saturation and final size.** Growth cannot continue forever in a finite audience.
With susceptible fraction s = 1 minus reach over N, the per-step multiplier is
R_eff times s, so growth halts at the fixed point where R_eff s = 1. The eventual
attack-rate fraction is 1 minus 1 over R_eff, the social-contagion analogue of the
SIR final-size relation. At R_eff = 2 this is one half of the audience.

**Attention decay and manipulation.** Persuasive potency fades with content age by a
half-life: freshness equals 2 to the power of minus age over half-life. The
effective per-exposure conversion probability is the baseline conversion times a
gating-skepticism factor times freshness. The Political Manipulation Impact (PMI)
index accumulates, at each minute, the new exposures times this effective
conversion. Delayed-visibility policies reduce PMI not only by cutting reach but by
ageing content before it is seen, so it lands with diminished potency.

## Calibration

Because the live simulation is stochastic and tuned for pedagogical visibility
rather than quantitative forecasting, only its deterministic skeleton is calibrated.
Each calibration case checks a logic function against a closed-form target:

- **R0 product form.** Fan-out 150, reshare 0.02, amplification 1.0 gives R0 = 3.0
  exactly.
- **Threshold, supercritical side.** Forward caps and gating leave R_eff = 1.125,
  still above 1, so the cascade spreads (boolean check).
- **Threshold, subcritical side.** Lower fan-out plus full friction drives R_eff
  below 1, so the cascade dies out.
- **Final-size relation.** At R_eff = 2.0 the eventual reach is 1 minus one half,
  that is half the audience.
- **Freshness decay.** Content one half-life old retains exactly half its potency.
- **Complex contagion.** A node with threshold 0.25 and 40 percent active neighbours
  adopts, as the linear-threshold rule requires.
- **Cooldown clamp.** A ten-hour posting lock caps any account at 24 over 10 = 2.4
  posts per day.

All seven reproduce their analytic targets with zero error.

## Limitations

The model is a deliberately transparent caricature and several of its simplifications
matter.

The mean-field collapse assumes well-mixed contact. Real social graphs are clustered
and heavy-tailed; hubs and communities mean a single R_eff is not enough, and on
strongly heterogeneous networks the epidemic threshold can vanish entirely. The
running simulation uses simple contagion, so where adoption is genuinely complex and
threshold-gated it overstates spread. Policy levers are static multipliers with no
adaptive adversary, yet real spammers buy aged accounts, shift timing, and evade
caps, so measured effectiveness erodes over time. The PMI index is a proxy for
expected conversions, not a model of belief change, persuasion heterogeneity, or
downstream behaviour. Finally, finite stochastic cascades can fade out early even
when R_eff exceeds 1, so the deterministic final-size figure is only an expectation
over surviving cascades.

The playground is therefore a tool for reasoning about mechanism and comparative
policy effect, not a calibrated forecaster of any specific information operation.

## References

- Kermack, W. O. and McKendrick, A. G. (1927). A contribution to the mathematical
  theory of epidemics.
- Anderson, R. M. and May, R. M. (1991). Infectious Diseases of Humans.
- Diekmann, O., Heesterbeek, J. A. P. and Metz, J. A. J. (1990). On the definition
  and computation of the basic reproduction ratio R0.
- Pastor-Satorras, R. and Vespignani, A. (2001). Epidemic spreading in scale-free
  networks.
- Granovetter, M. (1978). Threshold models of collective behavior.
- Watts, D. J. (2002). A simple model of global cascades on random networks.
- Centola, D. and Macy, M. (2007). Complex contagions and the weakness of long ties.
- Wu, F. and Huberman, B. A. (2007). Novelty and collective attention.
