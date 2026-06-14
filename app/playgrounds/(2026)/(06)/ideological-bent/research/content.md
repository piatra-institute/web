# Ideological Bent: A Counterfactual Wind Tunnel for Political Reasoning

## Abstract

"The other side would have done the same thing" and "my side would never do that" are two of the most common moves in political argument. Both are counterfactual claims, and both are usually made without numbers, mechanisms, or any test of consistency. This companion describes a transparent instrument that turns such claims into forecastable propositions and measures one thing: how much a person's probability estimate bends when the only variable that changes is the actor's identity. The instrument is symmetric and content-neutral. It does not adjudicate who is right; it quantifies the internal structure of a single forecast.

## The pathology

People often use counterfactuals not to understand causality but to immunise identity. Taber and Lodge's classic experiments show the mechanism: participants rated attitude-congruent arguments as stronger, actively counterargued hostile evidence, selectively sought confirming information, and polarised most when they held strong priors and were politically sophisticated. The uncomfortable implication is that expertise does not reliably reduce bias; it can supply better internal lawyers.

A good instrument does the opposite of immunisation. It makes identity pay rent by asking: what probability do you assign, which causal variable matters, would you apply the same standard to your own side, and are you predicting behaviour or protecting a team?

## Turning a claim into a proposition

The first step is decomposition. A vague claim ("they would have started a war too") collapses distinct outcomes: a diplomatic track, covert action, a limited strike, a joint campaign, and a regime-change-scale war are not the same event. The playground forces the claim into a small set of mutually exclusive outcomes and asks for a probability distribution over them, separately for each actor, under a single shared set of facts.

The shared facts are exposed as assumption sliders (threat severity, classified evidence strength, agency pressure, allied pressure, legal affordance, public pressure). They are held constant across the actor swap. This is what makes the comparison fair: the only thing that differs between the two columns is the actor label.

## The baseline model

The baseline forecast is a multinomial logit. For each actor, the score of outcome `y` is the log-prior plus a linear shift from the assumption sliders,

```
score(y) = log(prior_y) + sum_a w[y][a] * (assumption_a - default_a),
```

and the probabilities are the softmax of those scores. At the default assumptions the shift is zero and the baseline returns the stored priors exactly. The weights encode a plausible causal story (severe classified evidence pushes toward stronger restriction; allied objection pushes away from a blanket ban) and are hand-set. They are placeholders for interface design, not calibrated forecasts; a serious deployment would replace them with calibrated forecaster pools and historical analogues.

## The diagnostics

Given a user forecast `q` and the baseline `p*`, several quantities describe how the forecast bends.

**Identity likelihood ratio.** For the focus actor and outcome, `ILR = odds(q) / odds(p*)`. It is the hidden odds multiplier your deviation from baseline implies.

**Bent Score.** Define an actor effect as the log-odds gap between the two actors on the focus branch. The Bent Score is your actor effect minus the model's:

```
Bent = [logit(q_A) - logit(q_B)] - [logit(p*_A) - logit(p*_B)].
```

Positive means you separate the actors more than the facts warrant (actor exaggeration); negative means you flatten a difference the model sees (counterfactual flattening).

**Ideological brittleness.** The same idea measured with Jensen-Shannon divergence, a bounded symmetric distance between distributions:

```
IB = JS(q_A, q_B) - JS(p*_A, p*_B).
```

**Identity Dominance Ratio.** Label sensitivity is the JS distance between your two actor forecasts; fact sensitivity is how much the baseline moves between low and high assumption extremes. Their ratio asks whether the party label is doing more work than a large change in the evidence. Above one, it is.

**Counterfactual inadmissibility.** Some people do not merely assign low probability to a worldview-threatening branch; they treat it as nearly impossible. Inadmissibility is `max(0, log2(p* / q))`, in bits, the amount by which you suppress a branch the baseline keeps open. Suppressing a 0.25 baseline to 0.01 costs about 4.6 bits.

**Evidence debt.** If your forecast pushes a branch up, the required odds support is the ILR. You then select the reasons that would justify the move; each carries a rough odds multiplier. If the product of selected reasons falls short of the ILR, the remaining gap is unexplained evidence debt.

## Rational versus motivated disagreement

A crucial caution: two people updating in opposite directions are not automatically irrational. Jern, Chang, and Kemp show that belief polarisation can arise within a Bayesian model when people hold different assumptions about how to interpret evidence. That is exactly why the assumptions are sliders rather than hidden constants. The instrument is designed to separate four cases: rational disagreement (different priors or causal assumptions), motivated disagreement (same facts, same stated assumptions, identity-driven gap), under-specified disagreement (missing hidden assumptions), and bad-faith disagreement (refusal to expose assumptions). A high Bent Score that persists after the user matches assumptions and priors across the swap is the motivated residue.

## Scoring and its limits

Counterfactuals about alternate histories are not directly observable, so the tool never scores them as true or false. For claims that do resolve (real future events), proper scoring rules apply: the Brier and log scores reward honest probabilistic forecasts, and Gneiting and Raftery's characterisation of proper scoring rules guarantees that truthful reporting maximises expected reward. For the counterfactual branches, only the reasoning habits are measurable: consistency under the actor swap, sensitivity to evidence, and the admissibility of inconvenient branches.

## Limitations

The model is a transparent toy. The baseline priors and weights are hand-set placeholders; the linear logit shift cannot represent interactions or thresholds that a full structural causal model would; and fact sensitivity in the Identity Dominance Ratio is measured on the model, not the user, because the user submits only one forecast per actor. The scenarios are illustrative test cases chosen to give the diagnostics something concrete to measure; they are interchangeable, can be blinded entirely, and carry no endorsement or prediction. The instrument's value is not a verdict on any controversy but a mirror: it shows the shape of one person's counterfactual reasoning and asks whether the same standard survives a change of label.

## References

- C. Taber and M. Lodge, "Motivated Skepticism in the Evaluation of Political Beliefs", *American Journal of Political Science*, 2006.
- A. Jern, K. Chang, and C. Kemp, "Bayesian belief polarization", NeurIPS, 2009.
- T. Gneiting and A. Raftery, "Strictly Proper Scoring Rules, Prediction, and Estimation", *JASA*, 2007.
- J. Pearl, *Causality*, on counterfactuals and do-interventions.
