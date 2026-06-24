# Polity Coalition Attractors

## Abstract

This playground is a low-dimensional dynamical-systems sketch of when a polity tips toward inclusive versus exclusionary coalition politics. Two aggregate quantities evolve over time: the share of the population backing an exclusionary coalition, and the level of institutional trust. Their joint motion is governed by replicator dynamics with a perceived-threat feedback that depends on seven coarse parameters. The model has two competing attractors, an inclusive one and an exclusionary one, separated by a basin boundary. The aim is not to predict any particular country but to make the feedback loops legible: to show how stress, polarization, elite opportunism, norms, contact, and redistribution push a system toward one basin or the other.

## Background

Politics is full of self-reinforcing dynamics. A small rise in perceived out-group threat can license exclusionary rhetoric, which erodes trust, which makes the next round of threat feel more credible. Several traditions formalize pieces of this. Replicator dynamics, from evolutionary game theory, model how the frequency of a strategy grows in proportion to how much better than average it pays. Intergroup-threat theory describes how perceived threat drives hostility toward out-groups. Social-capital research links bridging contact and generalized trust to cooperative outcomes, and ethnic-outbidding models show how political entrepreneurs can amplify a latent cleavage for advantage.

None of these gives a closed account of a whole polity. This playground stitches a minimal version of each into one coupled system and asks a narrow question: given a fixed parameter regime and a starting point, which basin does the polity fall into?

## Model description

### State

There are two state variables, both bounded to the unit interval:

- `x`: the share of the population supporting an exclusionary coalition.
- `t`: institutional trust, or civic confidence.

### Parameters

Seven static parameters set the regime:

- `S`, stress: economic or security shocks that raise threat salience.
- `D`, diversity: the salience of group boundaries in this toy.
- `P`, polarization: a fragmented information space that amplifies perceived threat.
- `N`, norms: rule-of-law and rights constraints that raise the cost of exclusion.
- `C`, contact: bridging social capital that lowers perceived threat.
- `R`, redistribution: material inclusion that raises trust and the inclusive payoff.
- `O`, elite opportunism: identity entrepreneurship that strengthens the exclusionary narrative.

### Perceived threat

Perceived threat is an algebraic function of the current state and the parameters. It rises with diversity scaled by polarization, with stress, and with elite opportunism multiplied by the current exclusionary share. It falls with contact, trust, norms, and redistribution. The result is passed through a clamp to stay in [0, 1]. The opportunism term is multiplicative in `x`: elites amplify a cleavage that already exists rather than conjuring one from nothing.

### Payoffs and replicator update

Two payoffs are computed, one for the exclusionary coalition and one for the inclusive coalition. The exclusionary payoff grows with stress, perceived threat, polarization, distrust, and opportunism, and shrinks with norms, redistribution, and contact. The inclusive payoff grows with trust, contact, redistribution, and the absence of stress, and shrinks with perceived threat and polarization.

The exclusionary share then follows replicator dynamics:

```
dx = dt * x * (1 - x) * (piE - piI) + dt * noise
```

The factor `x(1 - x)` is the heart of the model. Change is fastest when the population is split and vanishes at the two pure states, so `x = 0` and `x = 1` are always fixed points. Whether `x` drifts up or down is set by the sign of the payoff difference `piE - piI`.

### Trust update

Trust has its own slower update. It rises with redistribution, contact, and norms, and falls with polarization, a high exclusionary share, stress, and perceived threat. Because a high exclusionary share erodes trust and low trust raises the exclusionary payoff, the two fields are locked in a two-way feedback.

## Attractors and basins

Outcomes are classified by the final exclusionary share:

- Inclusive, `x < 0.2`: exclusionary support is marginal and trust-building dominates.
- Mixed, `0.2` to `0.8`: neither coalition dominates; a contested or transitional zone.
- Exclusionary, `x > 0.8`: exclusionary politics dominate and trust erodes in a self-reinforcing cycle.

The basin map sweeps the starting point over the trust-by-share plane and colors each cell by which attractor it ends in. The boundary between basins is the interesting object: near it, a small shock or a small policy change can flip the outcome.

## Results

Three robust, regime-level results hold under the noise-free dynamics and are checked in the calibration panel:

1. The pure states are fixed points. A polity that starts with no exclusionary support keeps none, and one that starts saturated stays saturated, because the replicator factor `x(1 - x)` is zero at both edges.

2. Strongly inclusive regimes flow inclusive. A high-trust, high-contact, low-stress, low-opportunism regime started near the inclusive corner settles into the inclusive basin.

3. Crisis regimes flow exclusionary. A mirror-image regime with extreme stress and opportunism, weak constraints, and low trust settles into the exclusionary basin.

A fourth structural check confirms that perceived threat saturates at its clamp ceiling rather than overshooting, even at the worst-case state under a crisis regime.

These are properties of the model's structure, not of a lucky random seed, which is why the calibration switches noise off and checks them directly.

## Limitations

This is a toy. Its purpose is to reason about feedback loops and basins, not to estimate real-world quantities.

- The reduction to two aggregate fields throws away almost all institutional, geographic, and historical detail. That detail is compressed into seven static numbers.
- The parameter weights are illustrative. Their signs encode plausible directions from the cited literatures, but the magnitudes are not fitted to data.
- The historical presets are hand-set guesses that position a regime in parameter space. They are not reconstructions, and treating a preset's trajectory as a claim about what actually happened would be a mistake.
- The live view adds a small stochastic kick each step, so a single run is path dependent. Only the deterministic core is calibrated.

## References

- Taylor, P. and Jonker, L. (1978). Evolutionarily stable strategies and game dynamics.
- Hofbauer, J. and Sigmund, K. Evolutionary Games and Population Dynamics.
- Stephan, W. and Stephan, C. (2000). An integrated threat theory of prejudice.
- Rabushka, A. and Shepsle, K. (1972). Politics in Plural Societies.
- Putnam, R. (2000). Bowling Alone.
- Rothstein, B. and Stolle, D. The quality of government and generalized trust.
