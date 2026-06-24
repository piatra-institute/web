# Frontier Governance: When Controlling Profits Helps and When It Harms

## Abstract

The standard public debate about regulating frontier technology collapses into a single axis, "more state" versus "more market". This companion argues, and the playground operationalizes, that the axis is the wrong one. What matters is not how much the state intervenes but which instrument it uses, against which kind of sector structure, under which informational and energetic conditions. The model is a deterministic, reduced-form simulation of six frontier sectors (AI, robotics, private space, private nuclear, advanced materials or room-temperature superconductors, and biotech) evolving over a configurable horizon under thirteen continuous policy levers and five optional shock events. It produces a welfare index and a family of diagnostic indices, plus a per-sector recommendation of the best-fit governance instrument. The point of the model is not numerical prediction. It is to make the structure of the rent-versus-return distinction visible, and to show why a single blunt control that helps in one sector wrecks another.

## The core distinction the model encodes

Three governance instruments are treated as genuinely different objects, not as points on one dial:

1. **Direct profit or margin control.** Administrative capping of returns or prices. In the model this is the `profitControl` lever. It is gated by sector volatility, so it does the most damage exactly where prices carry the most information.

2. **Excess-profits taxation.** A levy on profit above a normal return, intended to fall on economic rent (windfalls from war, scarcity, monopoly position, or luck) rather than on ordinary entrepreneurial margin. This is `excessProfitTax`, and in the model it is scaled by structural rent so that it bites hardest where profit is least earned.

3. **Utility-style or rate-of-return regulation.** Governance appropriate to structural monopolies where duplicative competition is wasteful. This is `monopolyRegulation`, gated by each sector's `monopolyLike` coefficient so it only helps where the sector actually resembles essential infrastructure.

Alongside these sit developmental levers (subsidies, public R&D, procurement, antitrust, open science, talent mobility) and environmental conditions (cost of capital, safety and licensing intensity, energy abundance, labor bargaining power). The thesis is that the first three instruments interact with sector structure in opposite directions, so no single setting is globally right.

## What the simulation actually computes

For each year from 2026 forward, and for each of the six sectors, the model maintains a small state vector: knowledge, deployment, concentration, profitability, shortage, resilience, strategic value, and breakthrough progress. Each year it forms a `scienceImpulse` for the sector by summing positive terms (subsidies weighted by capital intensity, public R&D weighted by spillover, procurement weighted by mission character, open science, talent mobility weighted by frontier intensity, energy abundance weighted by energy demand, plus cross-sector externalities and event boosts) and subtracting penalty terms (the volatility-gated control penalty, a windfall-tax penalty, a capital-cost penalty weighted by capex, a safety penalty, and a drag from existing concentration). Knowledge then updates toward saturation:

`K_s(t+1) = K_s(t) + impulse_s * (1 - K_s) * 0.18`

Deployment advances through a sigmoid gate on a `scaleReadiness` term built from innovation, procurement, subsidy, and energy, minus capital and safety drag:

`D_s(t+1) = D_s(t) + sigma(readiness_s - 0.34) * 0.10 + monopolyBenefit * 0.03`

Concentration drifts up with network effects and profit, and down with antitrust and monopoly regulation:

`C_s(t+1) = C_s(t) + network_s * 0.035 + profit * 0.024 - antitrust - monopolyReg`

Shortage is the load-bearing failure channel. It rises with direct profit control gated by volatility and by energy scarcity, plus a capital-cost term, and falls with subsidies and procurement. This is the mechanism by which broad controls "work on paper" yet collapse welfare: the captured profit reappears as missing supply.

The per-sector welfare contribution combines consumer benefit (driven by deployment and innovation, penalized by shortage) with strategic value and resilience, penalized by inequality:

`W_s = consumer + strategic * 0.14 + resilience * 0.12 - inequality * 0.24`

The reported indices (frontier, deployment, rent, concentration, shortage, resilience, state capacity, inequality, energy stress, welfare) are sector averages of these quantities, scaled to roughly 0 to 100. Cross-sector coupling is explicit but deliberately narrow: AI knowledge spills into robotics and, more weakly, elsewhere; nuclear deployment relieves energy stress; materials knowledge feeds AI and robotics.

## The per-sector instrument recommendation

Independently of the time simulation, the model scores four candidate instruments against each sector's fixed structural coefficients and reports the winner. Direct control fit rises with monopoly-likeness and falls sharply with volatility. Excess-profits fit rises with network effects and monopoly-likeness. Public R&D and procurement fit rises with frontier intensity, spillover, and capex. Utility regulation fit is driven almost entirely by monopoly-likeness. The result is that nuclear, with the highest `monopolyLike` value, tends toward utility-style regulation; AI, with the highest network coefficient, tends toward antitrust and rent taxation; and speculative materials science, at maximum frontier intensity, tends toward public R&D and open science. This panel is a structural classifier, not a forecast.

## What is exact, what is interpretive, and what is stipulated

It is worth being precise about the epistemic status of each layer, because the model mixes registers.

**Exact.** Given a parameter and event configuration, the simulation is fully deterministic and reproducible. The sweep, the sensitivity tornado, and the snapshot comparison are exact functions of the same update rules; there is no randomness anywhere in the dynamics. The calibration panel reruns the model on four fixed scenarios and reports the welfare index against a stipulated target.

**Interpretive.** The functional forms are reduced-form analogues in the spirit of endogenous-growth and industrial-policy modeling, not estimated equations. The coefficients (the 0.18 knowledge step, the 0.34 deployment threshold, the various weights) were chosen so that the qualitative regime rankings match the historical record, not fitted to data. Two configurations that differ only slightly should be read as "similar", not as carrying meaningful decimal-place differences.

**Stipulated.** The sector coefficients (volatility, network effect, monopoly-likeness, mission character, spillover, frontier intensity) are hand-assigned judgments about real sectors. They are defensible orderings, for example nuclear being more monopoly-like than AI, and AI having stronger network effects than biotech, but they are not measured quantities. The calibration targets (a balanced regime near 35, a controls breakdown near minus 10, wartime mobilization near 30, venture hypergrowth near 25) are stylized expectations drawn from the historical cases, not observed welfare measurements.

## Calibrating against the historical record

The model is anchored to four broad patterns that the public-finance and regulation literatures treat as reasonably settled. Wartime excess-profits regimes (the World War I and World War II era) generally did well when temporary and targeted, capturing windfalls while procurement expanded capacity. Utility rate-of-return regulation generally did well in natural monopolies such as electricity and water, despite the Averch and Johnson overinvestment distortion. Broad administrative profit or price controls in fragile economies, with the 2014 Venezuelan Fair Prices Law as the canonical case, generally produced shortages, evasion, and underinvestment. Late-twentieth-century deregulation was mixed, raising efficiency in some sectors while entrenching concentration in networked ones. The calibration scenarios encode these four verdicts as target welfare values, and the model is considered usable to the extent it reproduces their ordering rather than any exact number.

## Honest limitations

The model is a conceptual instrument, and several of its simplifications are load-bearing enough to state plainly.

It is reduced-form, not general-equilibrium and not agent-based. There are no firms, no prices that clear, no expectations, and no strategic behavior. A genuine agent-based model of the same interactions could in principle reorder the regime rankings under identical sweeps, which is exactly the falsification condition the assumptions panel names.

Sector coupling is sparse and one-directional in places. The model captures knowledge, energy, and materials spillovers but does not model capital or talent competition between sectors beyond the shared cost-of-capital and mobility levers. If AI investment crowds out biotech through capital markets in ways the shared parameters miss, the model understates that tension.

The coefficients are not estimated. Because weights were chosen to match qualitative history, the model cannot adjudicate close cases and should never be read as forecasting a specific welfare number for a real economy. Its outputs are directional and comparative.

The welfare index is an aggregate with fixed distributional weights. Choosing different penalties for inequality or shortage would shift the regime rankings, and reasonable analysts disagree about those weights. The model exposes the levers but does not resolve the value judgment.

Finally, the shock events (an AI capability jump, cheap nuclear, cis-lunar industry, a room-temperature superconductor, an automation wave) are stipulated step functions at fixed years. They are useful for scenario contrast but should not be read as probability-weighted forecasts of those events.

## How to read the playground

Use the presets to anchor intuition, then move one lever at a time and watch the shortage and concentration indices, not just welfare. The sweep view isolates a single instrument across its full range so that non-monotonic responses become visible, for example the way rising direct profit control can lift measured welfare slightly before shortages overwhelm it. The sensitivity tornado ranks which levers move welfare most from the current operating point, which is often more informative than the headline number. The snapshot lets you freeze a regime and compare a counterfactual against it directly. The right takeaway is structural: the same intervention is a remedy in one sector and a pathology in another, and good governance is the art of matching instrument to structure.

## References

- International Monetary Fund, 2022, Excess Profit Taxes: Historical Perspective and Contemporary Relevance (IMF Working Paper).
- P. Joskow, 2006, Regulation of Natural Monopolies, Handbook of Law and Economics.
- H. Averch and L. Johnson, 1962, Behavior of the Firm under Regulatory Constraint, American Economic Review.
- P. Romer, 1990, Endogenous Technological Change, Journal of Political Economy.
- P. Aghion and P. Howitt, 1992, A Model of Growth through Creative Destruction, Econometrica.
- Norton Rose Fulbright, 2014, briefing on the Venezuelan Fair Prices Law and price-control regimes.
- Standard optimal-taxation theory on rent versus return (Ramsey, 1927; Mirrlees, 1971), as background for the excess-profits assumption.
