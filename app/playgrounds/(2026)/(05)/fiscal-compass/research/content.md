# The Fiscal Compass: Four Rationales for Higher Taxes and Their Distinct Failure Modes

## Abstract

The claim "higher taxes are good" is not a single proposition. It is at least four propositions, each with a different target, a different supporting literature, and a different way of going wrong. This companion separates those four arguments (redistribution, state capacity, consolidation, and corrective taxation), traces each to its standing place in public finance, and explains exactly what the playground's scoring model does and does not do. The model is a teaching device built for legibility, not a forecast. Its job is to make the shape of the four arguments comparable on one screen, scoring a tax package against five outcomes (welfare, growth, equality, fiscal repair, and political legitimacy) and showing, via a compass, whether the rationale you selected matches the rationale the world-state you described actually supports. The taxonomy and the author placements are a fair summary of the literature. The numbers are stipulated indices, not measurements of any country.

## The four rationales

Public finance does not contain one case for higher taxes. It contains several, and they answer different questions.

**Redistribution** says higher taxes are good because concentration itself is harmful. The relevant levers are top marginal income tax, inheritance tax, net wealth taxes, capital gains reform, and taxes on land and rent. The standing theoretical case is Diamond and Saez (2011), who argue that high top marginal rates are optimal when top incomes are relatively inelastic, when part of top income is economic rent rather than productive reward, and when social welfare weights on the very top are low. The failure modes are capital flight, avoidance and evasion, weak administrative capacity, and badly designed thresholds.

**State capacity** says higher taxes are good because public investment has high returns. Here the levers are broad-based income tax, property tax, value-added tax with compensation, land value taxes, and corporate rent taxation, all financing infrastructure, education, health, science, courts, cadasters, and digital state capacity. Lindert (2004) documents that large tax-financed welfare states historically did not automatically reduce growth once the financing side is accounted for. Besley and Persson (2011) supply the crucial conditional: the realized return on public investment depends on the state's capacity to collect taxes and to spend competently. The failure modes are wasteful spending, low implementation capacity, clientelism, and under-maintenance after construction.

**Consolidation** says higher taxes are good because debt or deficits must fall. The levers are base-broadening, VAT, excise taxes, property taxes, and closing exemptions, deployed when debt-service risk, inflation pressure, market confidence, or fiscal space become binding. This is the most conditional case, and it is where the pro-tax position is most easily confused with austerity. Alesina, Favero, and Giavazzi (2019) argue that spending-based consolidations tend to be less contractionary than tax-based consolidations of the same size, a claim that is itself contested. The failure modes are recessionary timing, regressive burden, pro-cyclical consolidation, and depressed private demand.

**Corrective** (Pigouvian) taxation says taxes are good because they discourage harmful behavior. The levers are carbon taxes, congestion charges, pollution taxes, tobacco excises, and fuel taxes. Pigou (1920) established that a tax set near the marginal social cost of a negative externality raises welfare by correcting a market failure, before any revenue is spent at all. Nordhaus (2013) applies this to carbon. This is, in a narrow technical sense, the cleanest case for a tax, and it is also the one whose distributional backlash is most visible. The failure modes are distributional backlash, measurement error, industry lobbying, and border leakage.

## Why "pro-tax" is not "austerity"

A recurring confusion is worth naming. Calling tax-increase advocates "austerity advocates" is imprecise. Austerity means reducing deficits, whether by spending cuts, tax increases, or both. The expansionary-austerity economists associated with Alesina generally argue that spending-based consolidations are less contractionary than tax-based ones, which makes them austerity advocates but not straightforwardly "raise taxes" advocates. The redistribution and state-capacity camps are the reverse: they want higher taxes, but explicitly not in order to shrink the state. Keeping these apart is the point of separating consolidation from the other three rationales rather than folding everything into a single pro-tax or anti-tax axis.

## What the playground computes

The playground takes a tax package described by six dimensionless inputs, each on a 0 to 100 scale: tax intensity (how aggressive the package is), inequality (how damaging concentration is assumed to be), debt pressure (how binding deficits and market pressure are), investment return (the expected social return on public spending), externality damage (the scale of pollution, congestion, or health harms), and administrative capacity (the state's ability to collect and spend competently). You also select one of the four rationales.

The scoring function first derives two intermediate quantities. Revenue actually collected scales with both the package and capacity, as `revenue = t * (0.55 + 0.45 * cap)`, so the same statutory package raises less in a low-capacity state. Deadweight loss rises superlinearly with the package and is eased by capacity, as `distortion = t^1.6 * (1 - 0.4 * cap)`, encoding the standard intuition that the efficiency cost of taxation grows faster than the rate and that capable administration mitigates it.

Four benefit channels then route the inputs through their matching rationale. The redistribution channel is `inequality * t`, the state-capacity channel is `revenue * investmentReturn`, the consolidation channel is `debtPressure * t`, and the corrective channel is `externalityDamage * t`. Each channel is multiplied by a school weight: 1.0 when the selected rationale matches that channel, and 0.4 otherwise. This is the model's central stylized choice. The same lever still does something under a non-matching rationale (a carbon tax raises revenue even if you justified it on redistribution grounds), but the matched argument is amplified.

The five outputs are then assembled as weighted combinations. Welfare is a baseline plus the summed benefit minus distortion. Growth leans on the investment and corrective channels and is penalized by distortion and by an excess-tax term that activates only above roughly 55 percent intensity. Equality rises with the product of inequality and tax intensity. Fiscal repair rises with the consolidation channel and with revenue, lightly penalized by distortion. Legitimacy falls with tax intensity and inequality, rises with administrative capacity, and takes a small extra penalty under the corrective rationale to reflect the visible distributional backlash that carbon and fuel taxes attract. All outputs are clamped to the 0 to 100 range.

## The compass and the verdict

Two diagnostics sit on top of the scorecard. The compass measures how strongly the world-state you described supports each rationale, independent of the rationale you selected: redistribution strength is inequality, state-capacity strength is investment return scaled by capacity, consolidation strength is debt pressure, and corrective strength is externality damage. The needle points to the dominant rationale. When the needle and your selected rationale disagree, that gap is the informative part: the scorecard asks "given the argument you are making, does this package score well?" while the compass asks "given the world as you described it, which argument should you be making?"

The verdict is a small rule-based summary. A high welfare score with adequate legitimacy reads as a strong case; a high welfare score with weak legitimacy reads as economically plausible but politically fragile; low growth combined with weak fiscal repair reads as a weak case where the burden outruns the modeled returns. A consolidation rationale selected when debt pressure is low is flagged as a mismatch. The narrative generator compares the current package against a token (10 percent) tax increase in the same world, reports the welfare difference, and adds conditional clauses when distortion is high, legitimacy is weak, consolidation is dragging growth, or the state-capacity case rests on capacity the state does not yet have.

## Calibration: argument shape, not econometrics

The calibration cases encode historical episodes as parameter configurations with an expected welfare score that reflects the rough center of scholarly judgment on whether the tax move worked. The Nordic welfare states (high tax, high capacity, high investment return) are read as the state-capacity case that broadly works, citing Lindert and Esping-Andersen, with an expected welfare near 76. US top marginal rates in the 1950s are read as a redistribution case (Piketty, Saez, and Zucman) near 64. The Swedish carbon tax of 1991 onward is the standing corrective case (Andersson, 2019) near 71. Greek tax-based austerity from 2010 to 2014 (House, Proebsting, and Tesar, 2020) is the pro-cyclical timing failure, with an expected welfare near 30. A weak-capacity development tax push (Besley and Persson) sits near 44, illustrating that revenue does not reliably convert into returns when capacity is absent.

Agreement between the model's predicted welfare and these expected values should be read as a sanity check on the argument shape, not as a measurement. The expected values are themselves stipulated summaries of contested historical judgments.

## What is solid and what is a toy

The four-way taxonomy and the author placements are a fair and defensible summary of the public-finance literature: Diamond and Saez on progressive taxation, Lindert on welfare states and growth, Alesina and coauthors on consolidation composition, and Pigou and Nordhaus on corrective taxes. The qualitative ordering the model produces (that the corrective case is cleanest in efficiency terms but politically draggy, that consolidation into a weak economy is the classic failure, that the state-capacity case collapses without administrative capacity) tracks that literature.

The scoring model itself is a toy, and it is built to be one. It treats the four rationales as separable additive channels with a single fixed cross-rationale weight of 0.4, a stipulated structure rather than an estimated one. It is fully static: there is no business cycle, no expectations channel, no debt accumulation over time, and no behavioral response beyond the single distortion term. A dynamic version would change the timing verdicts, especially for consolidation, where the entire empirical debate is about timing. All inputs and outputs are dimensionless indices calibrated to the demo, not to any currency, country, or year, so the numbers carry no absolute meaning. There is also no robust universal debt threshold built in, consistent with the Herndon, Ash, and Pollin critique of Reinhart and Rogoff and with Blanchard's point that debt sustainability depends on the interest-growth differential and the currency regime.

## Limitations

The model should not be used to argue that any specific real tax package is good or bad. Its coefficients are chosen for interpretability, not fitted. The 0.4 cross-rationale weight, the 55 percent excess-tax threshold, the superlinear distortion exponent of 1.6, and the legitimacy penalty for corrective taxes are all stylized choices that make the qualitative story legible; none is estimated. Because the channels are additive and separable, genuine interactions (for example, that high capacity simultaneously raises the investment return and lowers distortion and raises collected revenue) are only partially captured. The legitimacy term is a crude proxy for political durability and ignores the design features (compensation, gradualism, earmarking) that, in practice, often decide whether a package survives. Treat the playground as a structured way to compare the shapes of four arguments, and treat any apparent precision in the output numbers as an artifact of the indexing, not as information about the world.

## References

- Diamond, P. and Saez, E. (2011). The Case for a Progressive Tax: From Basic Research to Policy Recommendations. Journal of Economic Perspectives 25(4).
- Lindert, P. (2004). Growing Public: Social Spending and Economic Growth Since the Eighteenth Century.
- Esping-Andersen, G. (1990). The Three Worlds of Welfare Capitalism.
- Besley, T. and Persson, T. (2011). Pillars of Prosperity: The Political Economics of Development Clusters.
- Alesina, A., Favero, C. and Giavazzi, F. (2019). Austerity: When It Works and When It Doesn't.
- Pigou, A. C. (1920). The Economics of Welfare.
- Nordhaus, W. (2013). The Climate Casino: Risk, Uncertainty, and Economics for a Warming World.
- Andersson, J. (2019). Carbon Taxes and CO2 Emissions: Sweden as a Case Study. American Economic Journal: Economic Policy.
- Piketty, T., Saez, E. and Zucman, G. (2018). Distributional National Accounts: Methods and Estimates for the United States. Quarterly Journal of Economics.
- House, C., Proebsting, C. and Tesar, L. (2020). Austerity in the Aftermath of the Great Recession. Journal of Monetary Economics.
- Herndon, T., Ash, M. and Pollin, R. (2014). Does High Public Debt Consistently Stifle Economic Growth? A Critique of Reinhart and Rogoff. Cambridge Journal of Economics.
- Blanchard, O. (2019). Public Debt and Low Interest Rates. American Economic Review 109(4).
- Musgrave, R. (1959). The Theory of Public Finance.
- Mirrlees, J. et al. (2011). Tax by Design: The Mirrlees Review.
