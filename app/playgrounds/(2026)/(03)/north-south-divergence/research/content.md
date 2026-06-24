# North-South Divergence: Accelerants, Aggregation, and Attribution

## Abstract

This playground is a sandbox for reasoning about the Great Divergence, the opening of a large per-capita income gap between an industrialising "North" and the rest of the world over the long nineteenth and twentieth centuries. It does not reconstruct GDP. Instead it asks a methodological question: once you decide which factors mattered, how do you combine them into a single regional "development score", and how do you fairly attribute the resulting gap among those factors? The model exposes three aggregation rules and a cooperative-game attribution method, and it is deliberate about the fact that the attribution depends on the aggregation rule you pick. There is no model-free credit split.

## Background: the Great Divergence

Long-run reconstructions of per-capita output, most prominently the Maddison Project, support a now-standard stylised picture. Before roughly 1750 the richest and poorest large regions of the world differed in income by a modest factor, perhaps two to three. By the mid-twentieth century that factor had grown to something like ten or more. The gap is therefore mostly a modern construction, coincident with industrialisation, fossil-energy throughput, imperial integration of global markets, and the institutional and human-capital transformations that accompanied them. This is the sense in which Kenneth Pomeranz titled his 2000 book *The Great Divergence*: the interesting fact is not that some regions were always ahead, but that a wide gap opened in a specific historical window.

The literature offers competing emphases rather than a single cause:

- **Coal and ghost acres.** Pomeranz stresses cheap accessible coal and the ecological relief of New World land and resources as what let northwestern Europe escape a land constraint that otherwise looked similar to advanced regions of Asia.
- **Institutions.** Acemoglu, Johnson, and Robinson emphasise property rights, constraints on the executive, and inclusive versus extractive institutions as the fundamental cause, with geography and culture as background.
- **Culture of growth and useful knowledge.** Joel Mokyr emphasises a self-reinforcing scientific and technical culture, an "Industrial Enlightenment", that turned propositional knowledge into prescriptive technique.
- **War capitalism and extraction.** Sven Beckert and others stress coerced labour, slavery, and colonial extraction as constitutive of, not incidental to, early industrial accumulation.
- **Unified growth theory.** Oded Galor models the transition from a Malthusian regime to modern growth as endogenous, driven by the interaction of population, human capital, and technology.

These accounts are not mutually exclusive. They disagree about weights and about which factors are proximate versus fundamental. The playground takes no side. It lets the user encode a weighting and then shows the consequences.

## The model

### Accelerants

The model carries nine accelerants: energy throughput, institutions and property rights, state capacity, human capital, knowledge and innovation, finance and capital markets, trade and value-chain power, coercion and empire, and geography and disease. Each accelerant is reduced to a single value in the unit interval per region per time bin. This is a severe reduction, and the playground says so. The whole point of the exercise is to make the reduction explicit and then reason carefully inside it.

The default timeline has ten bins, from early agrarian states (before year 1) through industrial takeoff (1750 to 1850) to the post-2008 multipolar period. The default North and South values are illustrative, not measured. They are set to tell the stylised story: near-parity in antiquity, a widening gap from industrial takeoff onward, and partial catch-up after 1950. Users are expected to override them with their own estimates.

### Aggregation

A region's composite score is computed from its accelerant values and a vector of weights. The weights are renormalised to sum to one, so the composite is a proper weighted mean. Three aggregators are available:

- **Additive**, the weighted arithmetic mean, treats accelerants as perfect substitutes. A high energy score can fully compensate for weak institutions.

  `f = sum_i w_i x_i`

- **Multiplicative** (Cobb-Douglas), the weighted geometric mean, gives unit elasticity of substitution. A factor near zero drags the whole product down: you cannot industrialise on energy alone if institutions are absent.

  `f = product_i x_i^(w_i)`

- **CES**, the constant-elasticity-of-substitution form, has a tunable parameter rho that nests the other two. At rho = 1 it is exactly the additive form; as rho approaches 0 it approaches the geometric mean; negative rho makes accelerants complements, so the weakest factor dominates (a weakest-link regime).

  `f = (sum_i w_i x_i^rho)^(1/rho)`

The choice of aggregator is a hypothesis about how development factors combine, and it is the single most consequential modelling decision in the playground. The calibration panel verifies that these limit identities hold exactly: the CES at rho = 1 matches the additive form, and the multiplicative branch matches an independently computed geometric mean.

### The gap

The North-South gap is reported in one of two modes. Difference mode returns North score minus South score; ratio mode returns North score over South score. In the default timeline the difference is essentially zero in antiquity (the two regions share the same illustrative values) and grows positive through the industrial era. This is the toy's encoding of the Great Divergence stylised fact.

### Shapley attribution

Given a fixed aggregator and a fixed bin, the model attributes the gap among the nine accelerants using the Shapley value from cooperative game theory. The Shapley value is the unique fair allocation satisfying efficiency, symmetry, the null-player axiom, and additivity: each accelerant gets its average marginal contribution to the gap over all possible orderings in which factors are switched on.

`phi_i = average over orderings of [ v(S before i, with i) minus v(S before i) ]`

Here the characteristic function v is the gap under the chosen aggregator when only a subset of accelerants is "active". Because enumerating all nine-factorial orderings is expensive, the model estimates the Shapley values by Monte Carlo sampling of permutations (200 by default), with a deterministic seed per bin so the result is reproducible.

The crucial honest point: the attribution is conditional on the aggregator. Under the additive form, factor interactions vanish and the Shapley split reduces to the weighted contribution of each factor's North-South difference. Under CES or Cobb-Douglas, interactions are real, and the same data can reorder the credit. There is no model-free decomposition of cause. The Shapley value is a fair split of a chosen game, not a discovery about history.

## What the model does and does not show

The model reproduces, by construction, the stylised divergence trajectory baked into its default values. It does not derive that trajectory from data, and it should not be read as evidence for any particular causal story. Its genuine content is methodological:

1. It makes the substitutes-versus-complements question concrete. Switching aggregators visibly changes both the gap series and the attribution.
2. It separates a verifiable deterministic core (the aggregation identities, pinned to zero error in calibration) from an approximate stochastic layer (the sampled Shapley values).
3. It is explicit that weights and values are user inputs, so the output is a consequence of assumptions, not an independent finding.

## Limitations

- The accelerant values are illustrative placeholders. Quantitative claims that depend on the exact defaults are not robust; the defaults exist to be replaced.
- Reducing each factor to one number per region per bin discards enormous heterogeneity. A real account would disaggregate regions and allow factors to interact spatially.
- The "North" and "South" labels are coarse aggregates that hide divergence within each group and convergence across the boundary (for instance East Asian catch-up after 1950).
- Attribution is model-conditioned. The playground treats this as a feature to be displayed, not a bug to be hidden.

## References

- Pomeranz, K. (2000). *The Great Divergence: China, Europe, and the Making of the Modern World Economy.*
- Acemoglu, D., Johnson, S., and Robinson, J. (2002). Reversal of Fortune. *Quarterly Journal of Economics.*
- Mokyr, J. (2016). *A Culture of Growth: The Origins of the Modern Economy.*
- Beckert, S. (2014). *Empire of Cotton: A Global History.*
- Galor, O. (2011). *Unified Growth Theory.*
- Arrow, K., Chenery, H., Minhas, B., and Solow, R. (1961). Capital-Labor Substitution and Economic Efficiency. *Review of Economics and Statistics.*
- Shapley, L. (1953). A Value for n-Person Games. In *Contributions to the Theory of Games.*
- Castro, J., Gomez, D., and Tejada, J. (2009). Polynomial calculation of the Shapley value based on sampling. *Computers and Operations Research.*
- Bolt, J., and van Zanden, J. L. (2020). Maddison Project Database, version 2020.
