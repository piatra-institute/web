# The Berkshire Engine: Insurance Float as Compounding Capital

## Abstract

This companion explains the financial model behind the Berkshire Engine playground. The engine is a transparent, deterministic sandbox for one of the most consequential ideas in twentieth-century investing: that an insurance company is, at bottom, a machine for borrowing money from policyholders at a negative interest rate and compounding it inside an investment portfolio. We set out the three quantities the model tracks (float, underwriting result, and investment gains), write down the exact recurrences, and then say plainly where the toy departs from reality.

## Background: what is float?

When an insurer writes a policy, it collects the premium up front and pays claims later, sometimes years later. In the interval between collecting premium and paying claims, the insurer holds money it does not own. Warren Buffett named this pool "float" and built Berkshire Hathaway around it. In his words, float is money "we hold but do not own."

The crucial observation is that, for a growing insurer that writes new business each year, float is not a single sum that is collected and then paid out. It is a revolving balance. As old claims are paid, new premiums arrive. If the book of business grows, the float balance tends to grow with it. A large, stable float behaves much like a permanent, interest-free loan, and sometimes better than interest-free.

## The cost of float

Float is not automatically free. Its cost is set by the insurer's underwriting result. If an insurer pays out more in claims and expenses than it collects in premium, it runs an underwriting loss, and that loss is the interest it pays on its float. If instead the insurer collects more than it pays out, it runs an underwriting profit, and the cost of float becomes negative: the insurer is paid to hold other people's money.

In the language of the model:

- underwriting result for a year is `annualPremiums x underwritingMargin`,
- a positive margin is an underwriting profit (a negative cost of float),
- a negative margin is an underwriting loss (a positive cost of float).

Berkshire has, across most of its history, written at an underwriting profit, which is why Buffett describes its float as costing less than nothing. That is the single most important fact about the engine: cheap or negative-cost leverage, applied to a portfolio compounding at a high rate, over a very long horizon.

## The model

The playground tracks four cumulative quantities over a horizon of up to thirty years. Amounts are in millions of dollars.

**Float.** Each year adds the new premium to the float balance, and in this simplified model nothing is ever released:

```
float(n) = n x annualPremiums
```

Float therefore grows linearly with time.

**Underwriting.** Each year contributes a fixed result equal to premium times margin, and these accumulate:

```
cumulativeUnderwriting(n) = n x annualPremiums x underwritingMargin
```

**Investment gains.** The entire float balance earns the investment return every year, and the gains accumulate:

```
annualGain(n)        = float(n) x investmentReturn
cumulativeGains(n)   = sum over years of annualGain
```

Because float itself grows linearly, the cumulative investment gain grows roughly with the square of time, which is the source of the dramatic upward curve in the visualization.

**Portfolio.** Portfolio value is simply the sum of the two cumulative streams:

```
portfolio(n) = cumulativeUnderwriting(n) + cumulativeGains(n)
```

## Compounding is the engine

The deepest mathematical fact in the playground is the compound-interest identity that gives the engine its shape. The future value of a sum compounded annually is:

```
FV = PV x (1 + r)^n
```

and the implied compound annual growth rate between a starting and ending value is:

```
CAGR = (end / start)^(1/n) - 1
```

These two formulas are exact, and the calibration panel checks them directly. A portfolio that doubles over seven years is growing at `2^(1/7) - 1`, about 10.4 percent per year. One hundred dollars compounded at twenty percent for ten years becomes `1.2^10 x 100`, about 619 dollars. There is nothing approximate about these numbers, which is why the calibration cases reproduce with zero error.

The reason a small underwriting margin matters so much is leverage. The margin barely moves the headline portfolio number on its own. Its real job is to make the float cheap, so that the much larger compounding term operates on borrowed money that costs nothing. Over a long horizon, the compounding term dominates everything else.

## Calibration

The calibration panel verifies five identities, each computed by the same logic functions the live model uses:

1. the compound-value identity, `compoundValue(100, 0.2, 10)` against `1.2^10 x 100`,
2. the doubling CAGR, `cagr(100, 200, 7)` against `2^(1/7) - 1`,
3. cumulative underwriting at a one percent margin over thirty years against `30 x 100 x 0.01`,
4. a single year of investment gain, `floatContribution(500, 8)` against `500 x 0.08`,
5. the negative cost of float in the Buffett preset, `floatCostPercent` against `-30 / 3000`.

Every case is deterministic, so each reproduces exactly. There is no stochastic component to calibrate around.

## Limitations

The engine is honest about being a caricature. Three idealisations matter most.

First, float is treated as permanent and ever-growing. Real float turns over: claims are paid from it continuously, and a single catastrophe year, a reserve strengthening, or a run of non-renewals can shrink it sharply. The linear `n x annualPremiums` growth is the most aggressive simplification in the model.

Second, the investment return is a single fixed percent with no volatility and no drawdowns. Real returns vary year to year, and compounding is path dependent: a sequence with the same average but realistic variance produces a distribution of outcomes, not the single smooth curve shown here.

Third, the model is frictionless. There are no taxes on realised gains, no statutory capital requirements, no reinsurance costs, and no acquisition-expense drag. Adding realistic frictions lowers the effective compounding rate and flattens the curve.

None of this undermines the qualitative lesson. Cheap, durable leverage compounded at a good rate over a long horizon produces extraordinary growth. That lesson is exactly what the engine is built to make visible, and it is the structural reason Berkshire Hathaway grew the way it did.

## References

- Warren E. Buffett, Berkshire Hathaway shareholder letters, on float as "money we hold but do not own" and the cost of float.
- Standard compound-interest mathematics: future value `FV = PV(1+r)^n` and compound annual growth rate `(end/start)^(1/n) - 1`.
- Combined-ratio and underwriting-margin accounting in property and casualty insurance.
