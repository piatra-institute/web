# Counterfactual Growth, Synthetic Control, and the Limits of "What If"

## Abstract

This companion documents the counterfactual growth engine: a stylized framework for asking what a country's output might have looked like had it inherited part of another country's growth trajectory or policy basket. The engine is built on the same conceptual scaffolding that economists use for serious counterfactual inference (the convergence hypothesis, growth accounting, and Abadie's synthetic control method), but it is deliberately a teaching and exploration instrument, not a causal estimator. The honest framing matters: the numbers it produces are outcome proxies that make a comparison precise enough to debate, not damages figures that survive contact with the identification problem. This document separates what the model genuinely computes from what its prose suggests, and flags where the two diverge.

## The counterfactual question

The motivating question is concrete. "What would Romania's GDP be today if it had done everything Poland did since 1990?" Both countries left central planning at roughly the same moment with similar per-capita income, yet Poland's measured output trajectory pulled steadily ahead. The naive way to answer is to copy Poland's aggregate GDP onto Romania, but that conflates two unrelated things: population size and per-person growth. Poland is larger, so a direct copy rewards size, not policy.

The engine separates the two cleanly. The target country keeps its own 1990 starting per-capita income and its own population path. What it borrows is a fraction of the model country's annual per-capita growth rate. The counterfactual GDP in year t is

```
GDP_cf(t) = Pop_target(t) * GDPpc_target(1990) * prod_{s=1991..t} (1 + g_cf(s)),
```

so population and growth are factored apart by construction. This is the single most defensible design choice in the model, and the calibration panel verifies the compounding directly against the closed-form product.

## What the growth rate actually is

The counterfactual growth rate blends the target's own growth and the model country's growth at an intensity alpha, then subtracts a convergence-drag term:

```
g_cf(s) = (1 - alpha_eff) * g_target(s) + alpha_eff * (g_model(s) + policy_channel) - delta * alpha_eff.
```

Several details are worth stating plainly because they shape every output.

Growth rates are not annual data. Each country carries five hand-set "growth anchors" keyed to historical regimes: an early-transition rate (through 1994), a convergence-boom rate (through 2007), a crisis penalty (through 2010), a recovery rate (through 2019), and a recent rate. These are stylized values chosen to reproduce the broad shape of each country's post-1990 experience, not estimated from national accounts. The model is therefore a piecewise-constant caricature of growth history, and its absolute GDP levels should not be read as data.

The effective intensity alpha_eff is the headline intensity scaled by a phase-in ramp and zeroed after the reform end year. At intensity zero the whole transfer collapses and the counterfactual equals the baseline exactly; the calibration panel checks this identity.

The convergence drag delta encodes the realism that imported reform paths are never free or frictionless. It is a flat per-year penalty applied only while the transfer is active, and it is the most consequential and least empirically grounded knob in the model: the sensitivity (tornado) analysis routinely ranks convergence drag and transfer intensity at the top, which means the cumulative-gap number is highly assumption-dependent. That is a feature for a teaching tool and a fatal flaw for a damages estimate.

## Synthetic control

Rather than picking one comparator and inheriting its idiosyncrasies, the engine lets you blend several donor countries with weights that are normalized to sum to one. This is the logic of Abadie, Diamond, and Hainmueller's synthetic control method: a weighted combination of donors often produces a better counterfactual than any single country because it averages out each donor's quirks. In the engine the blend acts on both the growth rate and the policy scores. The calibration panel confirms the policy blend is a true weighted average: a 40/35/25 Poland/Czechia/Slovakia mix yields exactly 0.4 and 0.35 and 0.25 weighted institution scores.

The important caveat is that real synthetic control chooses donor weights by optimization, fitting the pre-treatment outcome path. Here the weights are user-supplied. The engine demonstrates the structure of synthetic control without performing its estimation, so it cannot claim the method's inferential guarantees.

## Confidence bands

Counterfactuals reported as single points invite false precision. The engine widens an uncertainty band over time using a square-root rule, sigma(t) = sigma_0 * sqrt(t / T), so a 2024 projection built on 1990 assumptions carries far more spread than a 1992 projection. This captures the right qualitative intuition (uncertainty compounds), but the band is a presentational device parameterized by a single slider, not a fitted predictive interval. It should be read as "the answer is fuzzier the further out you go," not as a calibrated probability.

## Policy gap decomposition

The decision basket captures seven policy dimensions: institutions, investment, education, export complexity, macro stability, state capacity, and EU absorption. The decomposition reports, for each dimension, how much of the total positive gap between model and target it accounts for. The contributions are shares of the total positive gap and therefore sum to 100 percent whenever any gap exists; the calibration panel verifies this closure identity. This turns a vague claim ("Poland did better") into a structured one ("the largest gaps were in export complexity and institutions"), which is the decomposition's real value. The dimension scores themselves are stylized 0 to 100 ratings, not indices lifted from a published dataset.

## Reverse framing and symmetry

The framework is symmetric. The machinery that asks "what if Romania had been like Poland?" can ask "what if Poland had been like Romania?" by swapping which country supplies the baseline. The calibration panel checks this swap directly: reverse framing on the Romania-under-Poland scenario makes the baseline equal Poland's own actual 2024 GDP. The symmetry is a useful guard against availability bias, the tendency to treat the prosperous comparator's path as normative simply because we observed it succeed. Running the reverse (Germany under Romania's trajectory) produces a large negative gap, which is the point: prosperity is not inevitable, and the same model that manufactures upside also manufactures downside.

## What this is not

This is not a causal claim and not an estimate. Poland's measured outperformance reflects a bundle of decisions, institutional trajectories, EU integration, demographics, geography, and luck that no single intensity slider can disentangle. The fundamental problem of causal inference applies in full force: we never observe the same country on two paths. The engine sidesteps identification entirely by assuming the transfer, which is exactly why its output is an outcome proxy rather than a damages figure.

Stated honestly, the model reproduces its own internal logic faithfully (the calibration cases all close to within floating-point error), but it does not reproduce reality. Its growth anchors are stylized, its drag and band parameters are free knobs, and its donor weights are unoptimized. The value is pedagogical: it makes the counterfactual question sharp enough to interrogate, exposes which assumptions the answer hinges on, and demonstrates the structure of synthetic control, decomposition, and symmetric framing without pretending to deliver a true number.

## Limitations

The central limitation is that absolute levels are not data. The five-regime growth anchors and the seven policy scores are hand-set caricatures; treating any single GDP figure or cumulative-gap total as an empirical estimate would be a category error.

The second limitation is sensitivity. Because convergence drag and transfer intensity dominate the tornado chart, the cumulative gap is highly elastic to two parameters with little empirical anchoring. Small, defensible changes in those knobs swing the headline number by trillions.

The third limitation is identification. Even a perfectly parameterized version of this model would still assume rather than infer the counterfactual, so it can illustrate the convergence and synthetic-control ideas but cannot test them.

## References

- A. Abadie, A. Diamond, J. Hainmueller, "Synthetic Control Methods for Comparative Case Studies", Journal of the American Statistical Association, 2010.
- A. Abadie, "Using Synthetic Controls: Feasibility, Data Requirements, and Methodological Aspects", Journal of Economic Literature, 2021.
- D. Acemoglu, S. Johnson, J. A. Robinson, "The Colonial Origins of Comparative Development", American Economic Review, 2001.
- R. E. Hall and C. I. Jones, "Why Do Some Countries Produce So Much More Output per Worker Than Others?", Quarterly Journal of Economics, 1999.
- R. J. Barro and X. Sala-i-Martin, *Economic Growth*, MIT Press, on the conditional convergence hypothesis.
