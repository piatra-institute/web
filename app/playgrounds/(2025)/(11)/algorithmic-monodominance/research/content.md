# Algorithmic Monodominance: When One Strategy Eats the Landscape

## Abstract

In ecology, monodominance is when a single species captures a habitat that
"should" hold many. This playground asks when the same thing happens to
strategies in algorithmic competition. The answer turns on the shape of the
returns: concave returns let many strategies coexist, convex returns concentrate
everything onto one. The model makes that transition visible and gives the
concentration a number.

## Concave versus convex returns

Classical competition tends to have concave returns to scale: each extra unit of
effort or capital buys a bit less than the last. Diminishing returns, plus
geography and technological limits, leave room for many firms on a rolling
fitness landscape with many viable peaks.

Convex returns invert this. When more capital buys better models, better data,
and faster execution, which compound into still more capital, the advantage of
being ahead grows with the lead. The landscape stops being rolling hills and
becomes a sharpening spike. In the model, a single convexity parameter raises the
base fitness to a higher power; as it rises, the strongest strategies pull away
and the rest are flattened.

## The zero-temperature limit

A useful analogy comes from statistical mechanics. Picture strategies as states
in a Boltzmann distribution at some temperature. At high temperature (noise,
bounded rationality), probability mass spreads across many good-enough states. As
the temperature falls toward zero, the distribution collapses onto the single
lowest-energy state. Ultra-optimized algorithmic competition behaves like cooling
toward T -> 0: all the mass concentrates on the global maximum, and everything
else goes effectively extinct. This is an analogy, not a derivation, but it names
the limit cleanly.

## Niches can save diversity

Concentration is not automatic. The separation parameter sets how far apart the
two peaks of the landscape sit. With strong separation, several winners can
survive, each a local monopolist in its own niche, even under high convexity.
When niches collapse together, competition becomes direct and only the global
optimum survives. Monodominance needs both ingredients: convex returns and niche
collapse.

## Measuring concentration

How concentrated is the landscape? Two standard inequality measures answer this,
and the calibration panel pins them to known cases:

- The **Gini coefficient** is 0 when all strategies are equal and approaches
  (n-1)/n when one strategy takes everything. The worked example Gini([1,2,3,4])
  is exactly 0.25.
- The **top-5% share** is the fraction of total fitness held by the strongest 5%
  of strategies; under perfect equality it is just 5% (here 4%, because 5% of 50
  rounds down to 2 strategies).

As convexity rises and niches collapse, both metrics climb sharply. That climb is
the quantitative signature of monodominance.

## What it does and does not claim

The mathematics, that convex transforms concentrate distributions and that Gini
and top-share track it, is solid and checkable. The economic reading layered on
top, that algorithmic finance is shifting capitalism from an ecology of many
capitals toward a closed, machine-driven rentier regime, is an interpretive
analogy, not a validated economic model. The landscape is a two-peak toy, the
parameters are illustrative, and no real market data is fit. Treat the playground
as a way to reason about a mechanism, not as evidence about any particular market.

## References

- Wright, S. (1932). The roles of mutation, inbreeding, crossbreeding and
  selection in evolution. (The fitness-landscape metaphor.)
- Gini, C. (1912). Variability and mutability. (The Gini coefficient.)
- Standard treatments of returns to scale and of the Boltzmann distribution at
  low temperature.
