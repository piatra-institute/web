# The Debt Singularity: Inflation, Interest, and the Phase Boundary of a Loan

## Abstract

A fixed nominal debt is not a fixed real burden. Whether a loan grows or shrinks in felt terms depends on a contest between two rates: the nominal interest charged on the balance and the rate at which money loses value to inflation. This companion sets out the small model behind the playground, an affine annual balance map deflated by inflation, derives its closed forms, and locates the "singularity": the line in the interest-vs-inflation plane where the real value of the debt switches from growing to decaying. The model is deliberately a single-borrower, constant-rate, partial-equilibrium toy. Its value is conceptual clarity about one mechanism, not a forecast.

## The mechanism

Consider a borrower holding a nominal debt of `B_0`. Each year, interest at rate `r` compounds on the outstanding balance and a fixed payment `P` is subtracted:

```
B_{t+1} = (1 + r) B_t - P.
```

This is an affine map. Its single fixed point, the balance at which interest exactly equals the payment so the principal never moves, is

```
B* = P / r.
```

Iterating the map from `B_0` has a clean closed form,

```
B_t = (1 + r)^t (B_0 - B*) + B*.
```

If `B_0 > B*` the balance grows without bound; if `B_0 < B*` it is paid off in finite time; if `B_0 = B*` it sits flat forever. The playground's "balanced edge" calibration case is exactly this knife-edge, with `P = 4000`, `r = 0.05`, so `B* = 80000`.

## Nominal versus real

A growing nominal balance is not automatically a growing burden, because the money used to repay it is itself losing value. Deflating by cumulative inflation `i` gives the real value,

```
real_t = B_t / (1 + i)^t.
```

For a zero-payment debt this simplifies to

```
real_t = B_0 * ((1 + r) / (1 + i))^t,
```

and the entire long-run behaviour is governed by the single growth factor `(1 + r) / (1 + i)`. The corresponding rate,

```
real interest rate = (1 + r) / (1 + i) - 1,
```

is the exact (Fisher) form of the more familiar approximation `r - i`. We use the exact form throughout so that the simulator and the closed forms agree to floating-point precision.

## The phase boundary

The order parameter is the sign of the real interest rate. There are two phases, separated by the diagonal `r = i`:

- **Liability phase (`r > i`):** the real value of the debt grows. Interest outruns inflation, so the burden compounds in felt terms. This is the red region of the phase diagram.
- **Asset phase (`r < i`):** the real value decays. Inflation outruns interest, eroding the debt for the borrower at the lender's expense. This is the green region.

The diagonal itself is a *continuous* phase boundary, not a divergence: nothing in the dynamics blows up at `r = i`. The "singularity" of the title is the point at which the long-run direction of the real balance flips sign, in the sense of a phase transition borrowed from statistical physics, not a pole. In the asset phase the debt has a finite real half-life,

```
t_half = ln 2 / ln((1 + i) / (1 + r)),
```

which the playground's ZIRP-style calibration case checks against the simulator (four percent inflation against one percent interest gives a half-life of twenty-four years).

## Historical scenarios

The playground maps several real episodes onto representative `(r, i)` pairs. These are illustrations of where an economy sat in the phase plane, not fitted histories:

- **Post-WWII financial repression (US, around 1947):** rates held near 2.5% while inflation ran near 14.5%. Deep in the asset phase, this is the canonical case of a government inflating away war debt.
- **The Great Inflation and the Volcker Shock (US, around 1979):** inflation near 11.5% met by interest near 13%. Pushing the system across the boundary into the liability phase was, in part, the policy goal.
- **Japan's Lost Decade (around 1995):** near-zero rates but mild deflation, so even tiny interest left the real burden slowly rising.
- **Weimar hyperinflation (Germany, 1923):** astronomically deep in the asset phase. The model caps inflation at 50% for scale, so it captures the direction but badly understates the speed.
- **ZIRP era (US, around 2015) and the 2022 inflation spike:** low rates with, respectively, low and then high inflation, straddling the boundary.

## Limitations

The model is intentionally minimal, and several of its assumptions matter:

- **Constant rates.** A single `(r, i)` pair is one point in the phase plane, but real episodes are *paths*. The Volcker era, for instance, swept from the asset phase into the liability phase within a few years; no single point represents it.
- **No feedback.** This is a one-borrower, partial-equilibrium picture. In aggregate, inflating away debt changes expectations and pushes up future nominal rates, so the model overstates how cheaply debt can be eroded at scale. The macroeconomic literature on debt sustainability and debt-deflation adds exactly the loops omitted here.
- **One inflation index.** The felt burden depends on how a borrower's income moves relative to prices. A single economy-wide `i` is a stand-in that can mislead when wages and prices diverge.
- **Idealised schedule.** Annual compounding, a fixed payment, and a zero floor on the balance make the map exact and analytically tractable, but a real loan with mid-year compounding, amortisation, or refinancing will drift from it.

## What the calibration verifies

Because the model is deterministic and has closed forms, the calibration does something specific and honest: it confirms that the year-by-year simulator reproduces the analytic balance, fixed point, real value, and half-life. Every case matches to floating-point precision. This guards against drift bugs in the iteration; it does *not* claim the model predicts real economies. The empirical content lives in the assumptions and their falsifiability conditions, not in the calibration table.

## References

- Irving Fisher, *The Theory of Interest* (1930), on the relation between nominal rates, real rates, and expected inflation.
- Standard discrete compound-interest and annuity recurrences; fixed-point analysis of affine maps.
- Carmen Reinhart and M. Belen Sbrancia, "The Liquidation of Government Debt" (2011), on post-war financial repression.
- Literature on debt sustainability and debt-deflation (Fisher 1933; modern fiscal-sustainability models) for the feedbacks this single-borrower model omits.
