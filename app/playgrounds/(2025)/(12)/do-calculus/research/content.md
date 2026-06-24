# Do-Calculus, Backdoor Adjustment, and Confounding

## Abstract

This playground is built around one distinction that organises all of causal inference: the difference between **seeing** a variable take a value and **making** it take that value. Observing that people who take a drug recover more often does not, by itself, tell us that the drug causes recovery; the people who take it may differ from those who do not in ways that also affect recovery. Judea Pearl's *do-calculus* gives a formal language for this difference. The interventional quantity `P(Y | do(X = x))` describes the distribution of `Y` we would see if we reached into the system and set `X` to `x`, severing whatever ordinarily determines `X`. The observational conditional `P(Y | X = x)` describes the distribution among those who happened to have `X = x`. When a common cause influences both `X` and `Y`, these two quantities disagree, and the disagreement is exactly **confounding bias**.

This companion explains the small structural causal model the playground computes in closed form, derives the backdoor adjustment formula, and is honest about where the model stops.

## Background: structural causal models

A **structural causal model** (SCM) is a directed acyclic graph (DAG) together with a structural equation for each node. Each variable `V` is written as a deterministic function of its parents in the graph and an independent noise term:

```
V := f_V(PA_V, U_V)
```

The graph encodes which variables directly cause which. Because the noise terms are independent, the joint distribution factorises along the graph (the causal Markov condition):

```
P(V_1, ..., V_n) = prod_i P(V_i | PA_i)
```

An **intervention** `do(X = x)` is modelled as *graph surgery*: the equation for `X` is deleted and replaced by the constant `x`, removing every arrow into `X`, while all other equations stay exactly as they were. This is the modularity (or autonomy) assumption: setting one variable does not alter the mechanisms that generate the others. The post-intervention distribution is the **truncated factorization**:

```
P(V_1, ..., V_n | do(X = x)) = prod_{i : V_i != X} P(V_i | PA_i)   with X fixed to x
```

## The model in this playground

The deterministic, calibrated part of the playground uses a three-node binary model, the canonical confounding triangle:

```
        U
       / \
      v   v
      X-->Y
```

with `U` a common cause of `X` and `Y`. The model is fully specified by three tables:

- `P(U = 1) = pU`
- `P(X = 1 | U = u) = pX[u]`
- `P(Y = 1 | X = x, U = u) = pY[x][u]`

Everything else is computed from these numbers; there is no sampling.

### Backdoor adjustment

A **backdoor path** from `X` to `Y` is any path that starts with an arrow *into* `X`. Here the only backdoor path is `X <- U -> Y`. The **backdoor criterion** says: a set `Z` is a valid adjustment set if it blocks every backdoor path and contains no descendant of `X`. The single variable `U` satisfies this, so it is a sufficient adjustment set, and the interventional distribution is identified by the **adjustment formula**:

```
P(Y = 1 | do(X = x)) = sum_u P(Y = 1 | X = x, U = u) P(U = u)
```

The crucial feature: the confounder is reweighted by its **prior** `P(U = u)`, because in the surgically altered graph `X` no longer carries any information about `U`.

### The naive conditional, and why it differs

The observational conditional reweights `U` by its `X`-conditioned **posterior** instead:

```
P(Y = 1 | X = x) = sum_u P(Y = 1 | X = x, U = u) P(U = u | X = x)
```

with `P(U = u | X = x)` obtained from Bayes' rule. When `U` influences `X`, observing `X = x` shifts our belief about `U`, so the posterior differs from the prior and the two formulas give different answers. The **confounding bias** is their difference:

```
bias = [P(Y|X=1) - P(Y|X=0)] - [P(Y|do(X=1)) - P(Y|do(X=0))]
```

## Worked results (the calibration cases)

These are the numbers the calibration panel reproduces exactly from the tables.

**Pure confounder, no real effect.** Take `pU = 0.5`, `pX = [0.2, 0.8]`, and a `Y` table that ignores `x`: `pY[0] = pY[1] = [0.2, 0.8]`. Then `P(Y|do(X=1)) = 0.2(0.5) + 0.8(0.5) = 0.5`, identical to `P(Y|do(X=0))`, so the true average causal effect is **0**. Yet the naive association is `P(Y|X=1) - P(Y|X=0) = 0.68 - 0.32 = 0.36`. An analyst who only conditioned would announce a sizeable effect for a variable that does nothing.

**Confounder plus a real effect.** Keep the same confounding but let `pY = [[0.2, 0.5], [0.5, 0.8]]`. Now `P(Y|do(X=1)) = 0.65` and `P(Y|do(X=0)) = 0.35`, a true effect of **0.30**. The naive association is **0.48**: a real effect, but inflated by the confounder.

**No confounder.** Set `pX = [0.5, 0.5]` so `U` no longer influences `X`. The backdoor path `X <- U -> Y` is now closed at its source, the posterior equals the prior, and the naive association equals the average causal effect exactly. Observation and intervention agree precisely when there is nothing to adjust for.

## Observational measures: transfer entropy and Granger causality

The live spiking sandbox also reports two **predictive** measures. **Transfer entropy** quantifies how much the past of one series reduces uncertainty about the future of another beyond the target's own past; **Granger causality** asks whether adding the source's history improves a regression of the target on its own history. Both are genuinely useful, and both are *not* interventional. A common cause makes `X` predict `Y` without `X` causing `Y`, so transfer entropy and Granger causality can fire on a purely confounded pair. The playground deliberately places these next to the do-effect so the gap between prediction and causation is visible.

## Limitations

- **The no-unmeasured-confounders assumption is the crux.** Backdoor adjustment recovers the true effect only if the adjustment set blocks every backdoor path. Hide the confounder and the effect is no longer identified from observation, no matter how much data is collected. This is a property of the causal structure, not of sample size.
- **The model is discrete and acyclic.** Binary variables with small tables make the arithmetic exact and hand-checkable, but real systems can be continuous, high-dimensional, and full of feedback. The spiking simulation only avoids cycles by spreading causation across time delays.
- **The spiking simulation is illustrative, not calibrated.** Its do-effects, transfer entropy, and Granger numbers are sampled from a stochastic Poisson process and vary from run to run. Only the closed-form backdoor model carries the verifiable claims; the simulation is there for intuition about timing, synergy, and noise.

## References

- Judea Pearl, *Causality: Models, Reasoning, and Inference*, 2nd ed., Cambridge University Press, 2009.
- Judea Pearl, Madelyn Glymour, Nicholas P. Jewell, *Causal Inference in Statistics: A Primer*, Wiley, 2016.
- Peter Spirtes, Clark Glymour, Richard Scheines, *Causation, Prediction, and Search*, 2nd ed., MIT Press, 2000.
- Thomas Schreiber, "Measuring Information Transfer", *Physical Review Letters* 85 (2000): 461.
- Clive W. J. Granger, "Investigating Causal Relations by Econometric Models and Cross-spectral Methods", *Econometrica* 37 (1969): 424.
