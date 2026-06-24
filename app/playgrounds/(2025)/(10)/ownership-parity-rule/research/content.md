# The Ownership Parity Rule: Matching Consumption with Equity

## Abstract

The ownership parity rule is a simple stipulation: for every dollar you spend on a technology product, buy one dollar of equity in the firm that sold it. This companion examines the rule as a financial thought experiment rather than as advice. It sets out the mechanics the playground actually computes, the deterministic price model behind every number, the two distinct ways capital enters (lump-sum purchases and dollar-cost-averaged subscriptions), and the biases that make any retrospective version of this rule look better than a prospective one would have. The defensible claim is narrow: there exists a structural asymmetry between depreciating hardware and appreciating equity, and the rule makes that asymmetry legible. The claim it does not support is that the rule is a sound investment policy, because it concentrates capital in firms a consumer already pays and selects its examples with hindsight.

## The asymmetry it dramatises

Technology hardware depreciates fast. A phone, a console, or a graphics card typically approaches negligible resale value within a handful of years, while the firm that built it may compound its equity over the same window. The rule turns that observation into an accounting question: what if the buyer had hedged each act of consumption with an equal equity stake in the seller?

The playground answers that question over a fixed set of monthly price series. It is a counterfactual calculator, not a portfolio optimiser. It reports what the matched equity would be worth today, the cash committed, and the resulting multiple. The interesting output is not any single number but the spread between firms: the same rule applied to Apple, NVIDIA, Sony, and Intel produces wildly different outcomes from comparable starting cash.

## What the model computes

Every event is one of two kinds.

A **one-off purchase** commits a lump sum on the purchase date. The model looks up the issuer's monthly close at that date and buys `amount / price` fractional shares. The terminal value is `shares * latest_price`, and the terminal multiple is therefore exactly the issuer's price appreciation over the holding period, `latest_price / purchase_price`.

A **subscription** spreads the monthly payment evenly across the contract window. Each month it buys `amount / price_that_month` shares, so the cost basis is dollar-cost averaged across the period. The terminal multiple is the share-weighted average of the path, which differs from a single-date entry whenever the price moves during the contract.

Prices are stored at monthly granularity, keyed by year and month. A trade in a month with no datum executes at the most recent earlier close (backward fill), and valuation uses the latest available close in the series. Fractional shares are allowed, and the simulation is frictionless: no fees, no taxes, no spreads, and no dividend reinvestment.

## Calibrating the counterfactual

Because the model has no random component, the honest test is internal consistency against an independently derived target, not a noisy empirical fit.

For a one-off purchase the terminal multiple **must** equal the issuer's price ratio over the period. The calibration panel sets `expected` to that ratio, computed by hand from the raw monthly price files, entirely outside the model's share-accounting code. It sets `predicted` to the full model path, which divides terminal value by cash invested. The two agree to four decimals across Apple (about 68x), NVIDIA (about 285x), Sony (about 3.8x), and Intel (about 0.98x, a small loss). For the subscription case the target is recomputed by an independent dollar-cost-averaging summation, and the Netflix example reproduces a multiple near 202x. Exact agreement confirms the parity accounting introduces no drift; it does not confirm that the rule is wise.

The Intel case is the most instructive. A $300 Pentium III bought at the dot-com peak, hedged with $300 of Intel equity, would be worth slightly less than the cash committed a quarter-century later. The rule does not guarantee gains; it inherits whatever the issuer's stock did.

## Why the retrospective rule flatters itself

Three biases inflate any backward-looking version of this exercise, and the playground is honest about all three.

**Survivorship.** The catalog is dominated by firms that survived and, in several cases, became among the most valuable companies on earth. A faithful prospective rule would also have bought equity in firms that delisted, were acquired at a loss, or stagnated. Their absence raises the average multiple.

**Hindsight.** The products and tickers are chosen after the outcomes are known. A consumer in 2007 did not know that the iPhone signalled a decade of Apple compounding or that a mid-range graphics card foreshadowed NVIDIA's rise. The rule reads as foresight but is assembled from outcomes.

**Concentration.** Even taken at face value, the rule is poor portfolio construction. It pours capital into exactly the firms a consumer already depends on, with no diversification and no rebalancing. The single-firm dispersion the playground shows, from Intel's loss to NVIDIA's hundredfold, is precisely the idiosyncratic risk a diversified investor would have damped.

## Data caveats

The bundled series are split-adjusted, illustrative approximations chosen for legibility, not vendor-grade adjusted closes. They omit dividends, so total return for payers is understated, and they resolve only to the month, so intra-month timing is invisible. The qualitative ranking of outcomes is far more trustworthy than any single multiple. Results should be read as counterfactual scenarios for thinking about the consumption-versus-ownership asymmetry, not as investment recommendations.

## References

- Consumer-equity parity principle (CEPP), the framing premise of this playground.
- Standard treatments of lump-sum versus dollar-cost-averaged entry and their effect on cost basis.
- Survivorship and hindsight bias in retrospective investment narratives.
