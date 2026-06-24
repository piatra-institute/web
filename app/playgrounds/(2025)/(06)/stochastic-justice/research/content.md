# Stochastic Justice

## Abstract

This playground asks an old question in a quantitative dress: can deliberate randomness make an institution *fairer* than a deterministic rule that is open to capture? It models each decision as a binary outcome distribution, scores that distribution against a uniform ideal with standard information-theoretic distances, and lets the user blend a corruption-induced bias toward uniform by turning up a "randomness" dial. The heatmap that results shows a region, at moderate corruption and moderate randomness, where the effective fairness is high.

The honest reading is split. The *idea* the toy points at, allocation by lottery as a defence against bias and capture, is a real and defended position in political theory. The *mechanism* the toy uses to demonstrate it, a convex blend of a biased distribution with the uniform one, makes "randomness raises fairness" true by construction. This companion keeps those two things apart: it upgrades the political argument and downgrades the demonstration.

## Background: justice by lottery

Allocating contested goods by lot is far older than the modern administrative state. Athenian democracy filled most offices by sortition rather than election, on the explicit theory that random selection resists the concentration of power and the cultivation of patronage. The modern revival runs through Barbara Goodwin's *Justice by Lottery* (1992) and Peter Stone's *The Luck of the Draw* (2011), which argue that the lottery has a distinctive normative property: it is **sanitising**, in Stone's term, because it admits no reasons at all into a decision. Where every available reason for choosing between candidates is a bad reason (bias, bribe, favour), refusing to give reasons is exactly the right move.

This is the substantive claim the playground gestures at. It is genuine, defended, and contested. It is contested because the same property that defeats bad reasons also defeats good ones: a lottery cannot track desert, merit, or need. Sortition is therefore a *domain-specific* device, powerful precisely where the decision should not depend on relevant differences between candidates, and perverse where it should.

## The model

### Outcome distribution

Each decision is reduced to a two-outcome distribution `P = [p, 1 - p]`. Perfect fairness is identified with the uniform distribution `[0.5, 0.5]`. Corruption `C` in `[0, 1]` and randomness `R` in `[0, 1]` jointly produce `P`.

For the **directional** corruption type, corruption first produces a fixed bias magnitude through a sigmoid,

```
biasMagnitude = 0.4 / (1 + exp(-5 (C - 0.5)))
biased = [0.5 + biasMagnitude, 0.5 - biasMagnitude]
```

and randomness then blends that biased distribution back toward uniform with a preservation factor that decays exponentially in `R`,

```
preservation = exp(-2 R)
P = preservation * biased + (1 - preservation) * [0.5, 0.5]
```

Two other corruption types are offered. **Variance** corruption injects deterministic pseudo-random noise whose amplitude grows with `C` and is then amplified by `R`; this is the one genuinely stochastic branch. **Systematic** corruption tilts the distribution by a sinusoid of `C`, standing in for institutional incompetence rather than malice.

### Fairness scores

Given `P` and the ideal `Q = [0.5, 0.5]`, the model reports:

- **Shannon entropy** `H(P) = - sum p_i log2 p_i`, maximised at one bit for the fair coin.
- **KL divergence** `D(P || Q) = sum p_i log2 (p_i / q_i)`, zero exactly when `P = Q`.
- **Total variation** `(1/2) sum |p_i - q_i|`, the largest probability gap a single event can show.
- **Jensen-Shannon divergence**, the symmetric, bounded smoothing of KL.
- **Demographic parity**, defined here as `1 - TVD(P, uniform)`, following the parity criterion of Dwork et al. (2012).
- An **effective fairness entropy** `H_fair = log2(2) - D(P || Q)`, which is what the heatmap colours.

### Efficiency

A stipulated closed form encodes a cost to both corruption and excess randomness:

```
efficiency = max(0, 1 - C - max(0, (R - 0.5) / 2))
```

Corruption costs efficiency one-for-one; randomness above `0.5` costs half as steeply. This is what creates the fairness-versus-efficiency tension and the "random justice" sweet spot at intermediate values.

## What the calibration checks, and what it cannot

The calibration panel verifies only the **deterministic core**. Each predicted value is computed by the model's own functions and compared against the value information theory fixes:

| case | computed | target |
| --- | --- | --- |
| entropy of a fair coin | `entropy([0.5, 0.5])` | 1 bit |
| self-divergence | `klDivergence([0.5,0.5], [0.5,0.5])` | 0 |
| total variation of a 3:1 skew | `totalVariationDistance([0.75,0.25], [0.5,0.5])` | 0.25 |
| demographic parity of a 3:1 skew | `demographicParity([0.75,0.25])` | 0.75 |
| efficiency at full corruption | `institutionalEfficiency(1, 0)` | 0 |
| efficiency at zero corruption | `institutionalEfficiency(0, 0.5)` | 1 |

These are identities, so the errors are zero by construction; the panel's job is to catch a regression that silently breaks one of the distance functions. It deliberately does **not** calibrate the variance corruption branch, which is stochastic and has no fixed expected value, and it does not calibrate the headline "randomness counteracts corruption" claim, because that claim is not an empirical fact about institutions but a property of the blend.

## Limitations

1. **Fairness is identified with uniformity.** The whole model equates "just" with "maximum entropy". Where the just distribution is non-uniform (need-based or desert-based allocation), the central identification fails.
2. **The headline result is tautological.** For directional corruption the observed distribution is a convex combination of the biased distribution and the uniform one with weight `exp(-2R)`. Increasing `R` *must* move `P` toward uniform. The toy demonstrates a definition, not a discovery.
3. **Corruption is a static scalar.** Real corrupt actors are strategic and adaptive; a fixed bias that does not respond to the introduction of randomness omits the principal-agent dynamics that make sortition interesting in the first place.
4. **The efficiency penalties are stipulated.** The location of the "random justice" optimum is an artefact of the chosen linear coefficients, so any policy reading of it is fragile.

## How to read the playground honestly

Treat the heatmap as a **geometry lesson**, not an empirical claim. It shows, exactly and correctly, how several information-theoretic distances behave as you slide a binary distribution between a biased point and the uniform point. The numbers are right. The interesting normative content lives one level up: whether distance-from-uniform deserves the name "fairness", and whether a real institution would let you blend toward uniform as cleanly as this convex combination does. The sortition literature says the political bet is sometimes worth making; the model cannot, and does not, settle that.

## References

- Goodwin, B. (1992). *Justice by Lottery*. University of Chicago Press.
- Stone, P. (2011). *The Luck of the Draw: The Role of Lotteries in Decision Making*. Oxford University Press.
- Shannon, C. E. (1948). A Mathematical Theory of Communication. *Bell System Technical Journal*.
- Kullback, S., and Leibler, R. A. (1951). On Information and Sufficiency. *Annals of Mathematical Statistics*.
- Dwork, C., Hardt, M., Pitassi, T., Reingold, O., and Zemel, R. (2012). Fairness Through Awareness. *ITCS*.
- Rose-Ackerman, S. (1999). *Corruption and Government*. Cambridge University Press.
