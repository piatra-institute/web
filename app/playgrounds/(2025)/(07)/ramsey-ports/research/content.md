# Ramsey Ports: optimal pricing in two-sided airport markets

## Abstract

This playground visualizes the welfare economics of airport pricing. The name is a deliberate double meaning that needs clearing up first: "Ramsey" refers to **Frank Ramsey optimal-pricing theory**, the 1927 result on how a budget-constrained regulator should set prices, and **not** to Ramsey-number combinatorics (the party problem, monochromatic triangles in two-colorings of the complete graph). The "ports" are airports. The sandbox compares an observed, regulated benchmark against a simulated, unregulated profit-maximizing benchmark across nine large US hub airports, using parameter estimates from Ivaldi, Sokullu and Toru (2015).

## Background: Ramsey pricing

A regulated utility or platform often cannot price every service at marginal cost, because marginal-cost pricing under fixed costs or scale economies would fail to break even. Ramsey pricing is the second-best answer: mark prices up above marginal cost in **inverse proportion to the elasticity of demand**, so that the unavoidable distortion falls where it does the least damage to total surplus. Formally the regulator maximizes a weighted welfare functional

> W = CS + lambda * PS

subject to a break-even constraint, where CS is consumer surplus, PS is producer surplus (profit), and lambda is the weight placed on profit relative to consumer surplus. When lambda is small the regulator behaves like a pure consumer advocate; as lambda rises, the operator is allowed to recover more through markups.

## Background: airports as two-sided markets

Modern platform economics treats an airport as a **two-sided market** (Rochet and Tirole, 2006). The airport sells access to two interdependent groups: airlines, who pay aeronautical charges, and passengers, who generate both aeronautical and commercial (retail, parking, concession) revenue. The two sides exhibit cross-side network effects: more flights make the airport more valuable to passengers, and more passengers make slots more valuable to airlines. A pricing rule that ignores this feedback misprices both sides.

Ivaldi, Sokullu and Toru (2015) estimate such a structural model for major US airports and then run counterfactuals, including what an unregulated, profit-maximizing operator would do. This playground takes those estimated outcomes as its anchor points.

## The model in the playground

Two branches are compared for each selected airport.

- **Current model (observed).** The regulated benchmark as estimated in the study. Welfare, profit, and consumer surplus are reported and satisfy the Marshallian accounting identity exactly:

  > welfare = consumer surplus + profit

  This identity holds to machine precision in the underlying data table, which is one of the things the calibration panel checks.

- **Privatized model (simulated).** A counterfactual profit-maximizing benchmark. Here welfare is reported as the plain sum of consumer surplus and profit, with no welfare weighting, because the operator no longer optimizes for social welfare.

Two sliders drive the comparison:

1. **Ramsey welfare weight (lambda).** In this toy lambda both discounts the current operator profit focus and reweights profit inside the welfare term. Raising lambda shifts emphasis toward welfare over pure profit.

2. **Passenger network effect.** A single linear multiplier (1 + e/100) applied to consumer surplus, with a separate multiplier on privatized profit. It stands in for the estimated cross-side elasticities of the structural model. Because it is linear, a plus ten percent network effect raises consumer surplus by exactly ten percent over baseline, which the calibration panel verifies.

## What the calibration checks, and what it does not

The calibration panel does **not** claim that the model reproduces the empirical magnitudes of the 2015 paper. Instead it checks the internal accounting and pricing identities that the model is built on, each computed from the model functions rather than hardcoded:

1. **Welfare identity on observed data.** For every airport, welfare equals consumer surplus plus profit.
2. **Welfare identity on the privatized branch.** The same plain sum holds in the profit-maximizing branch.
3. **Identity at neutral parameters.** With the network effect at zero, every multiplier collapses to one, so the model reproduces the observed consumer surplus exactly.
4. **Network-effect linearity.** A plus ten percent network effect raises consumer surplus by exactly ten percent.
5. **Full welfare weight.** At lambda equal to one, the welfare term gives profit a coefficient of one, so welfare reduces to the plain sum.

These are exact statements, which is why their measured error is zero. They certify that the implementation is faithful to its own equations, not that the equations are the last word on airport pricing.

## Limitations

The sandbox is a teaching instrument, not a regulatory tool. Several simplifications are deliberate and are flagged in the assumptions panel:

- The lambda coupling scales fixed surpluses rather than re-solving a constrained optimization for each lambda, so the lambda response is illustrative rather than optimized.
- The network effect is strictly linear; real cross-side effects are nonlinear and saturate.
- The privatized branch is a model-generated counterfactual, not a measurement; an actual privatization could land far from these figures.
- Externalities such as noise, congestion, and emissions are outside the surplus accounting entirely.
- The nine hub airports are a fixed sample and do not generalize to smaller or non-hub airports.

## References

- Ramsey, F. P. (1927). A contribution to the theory of taxation. *The Economic Journal*, 37(145), 47 to 61.
- Rochet, J.-C., and Tirole, J. (2006). Two-sided markets: a progress report. *RAND Journal of Economics*, 37(3), 645 to 667.
- Ivaldi, M., Sokullu, S., and Toru, T. (2015). Airport prices in a two-sided market setting: major US airports. Toulouse School of Economics working paper.
