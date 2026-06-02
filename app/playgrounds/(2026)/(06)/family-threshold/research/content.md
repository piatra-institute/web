# Family Threshold

## Abstract

This playground models a child-protection institution as a constrained partially-observable Markov decision process. The family state is hidden across seven dimensions: actual harm risk, caregiver capacity, attachment, family integrity, trust, cultural distance, and poverty. The institution receives eight noisy observation channels, updates a belief about harm risk, and chooses one of six actions at each step by minimising expected loss across five terms: child safety failure, separation harm, rights cost, instability, and cultural misclassification. The simulation is path-dependent: removal reduces attachment, trust, and family integrity; the reduced attachment then becomes evidence for further separation. Five named scenarios sit on the calibration table: ambiguous distressed family, hidden abuse with cooperative surface, cultural mismatch with low actual harm, poverty stress with repairable care, severe danger. The same ten institutional weights have to handle all five.

## Background

The model is built around a structural disagreement inside child-welfare law. Norway is the canonical case. Barnevernet, the Norwegian child-welfare service, is internationally recognised as both effective and contentious. The European Court of Human Rights, between 2019 and 2023, found Norway in violation of the right to family life in several child-protection cases, mostly for what happened *after* the initial care order: restricted parental contact, weak reunification work, premature movement toward permanent placement. Norway&apos;s own National Human Rights Institution flagged this as a central human-rights problem. The pattern is not a conspiracy and not a sadism. It is what happens when a high-trust welfare state with strong bureaucratic capacity sets its child-safety weight very high and underprices the cost of family rupture.

Two intuitions ground the model.

**Error allocation.** When evidence is ambiguous, every institution decides which error it will tolerate. A child-protection system that prioritises avoiding false negatives (children left with abusers) is structurally interventionist. A system that prioritises avoiding false positives (families broken by mistake) is structurally cautious. There is no neutral position. The playground exposes this trade-off through the `childSafety` and `separationHarm` weights and the two threshold dials.

**Observation channels.** Child-welfare systems do not observe abuse directly. They observe school reports, medical concerns, home disorder, noncooperation, child distress. Each of these channels can be triggered by something other than abuse: cultural distance, poverty, family stress, fear of the system. The bias dials (`culturalBias`, `povertyBias`) parameterise how strongly those proxy signals inflate the institution&apos;s belief. The cultural-mismatch scenario is the canary for whether the model has set them too high.

## Model description

Hidden state at step *t*: a vector

    s_t = (H, C, A, F, T, K, P)

where H is actual harm risk, C is caregiver capacity, A is attachment, F is family integrity, T is trust in the state, K is cultural distance, and P is poverty stress. All on [0, 1].

Observations at step *t*: each of eight channels fires with probability

    p_i = baseline_i + linear weights over s_t + observation noise

If the channel fires, its severity is the noisy probability plus a small jitter. Eight channels: school concern, medical concern, home disorder, noncooperation, child distress, cultural mismatch, positive attachment, family cooperation.

Belief update: a logit accumulator over the observed evidence, including a small penalty when positive-attachment or family-cooperation observations are *absent* (their absence is itself a signal). Sigmoid back to a belief in [0.01, 0.99].

Action space: `no action`, `support`, `monitor`, `temporary removal`, `reunify`, `permanent separation`. Each step the institution chooses the action with lowest expected loss

    L(a) = λ_safety · safetyFailure(a, s, b) + λ_separation · separation(a, s) + λ_rights · rights(a, b) + 2 · instability + 2 · cultural + repairLost

where safetyFailure scales with the belief that harm is present, separation scales with current attachment and family integrity, and rights becomes large when the action is forced above the institution&apos;s removal or adoption threshold.

Transition: each action perturbs the state (support raises C, T, A, F and lowers H; removal raises a `removed` flag and lowers A, T, F by amounts that depend on `contactGuarantee`). A small natural drift is added each step.

The simulation runs for a fixed horizon of 30 steps. The seed is deterministic, so a given `(scenario, params)` always produces the same trajectory.

## The signature visualisation

The 2D phase plot of belief vs actual harm makes the four-error matrix visible.

- Lower-left quadrant: low belief, low harm. Correct safe.
- Lower-right quadrant: low belief, high harm. Missed abuse.
- Upper-left quadrant: high belief, low harm. Over-intervention.
- Upper-right quadrant: high belief, high harm. Correct alarm.

The diagonal is perfect knowledge. The two horizontal lines are the removal and permanent-separation thresholds. The trajectory is a polyline through these regions, coloured by the final regime.

## Results

**Hidden abuse is the case the system was built for.** Under the canonical weights the institution&apos;s belief climbs from 0.32 toward 0.6 over the run as positive-attachment observations fail to fire. By the end the system has removed and the regime is `separated`.

**Cultural mismatch is the case where the same weights fail.** With the canonical `culturalBias = 1.2`, the cultural-mismatch scenario settles in `monitored`: the institution&apos;s belief stays inflated by cultural-mismatch observations, attachment and family integrity erode under monitoring pressure, but no removal happens. Drop `culturalBias` to 0.4 and the same scenario lands in `preserved`.

**Poverty stress is the test of `supportEffect`.** With the canonical `supportEffect = 0.55`, the trajectory bends down: caregiver capacity rises, harm falls, the regime ends `preserved`. Drop `supportEffect` to 0.1 and the system instead monitors or removes a fixable family.

**Severe danger justifies the system.** Under the canonical weights, belief climbs fast, the removal threshold is crossed early, the regime ends `ruptured`. This is the case where the institution should act, and does.

**The institution&apos;s posture is the sweep, not any single run.** The sensitivity tornado over final family integrity shows the dials that matter most. Under the canonical weights, `interventionThreshold` and `childSafety` dominate; `noise` and `povertyBias` do less than people expect.

## Limitations

The seven-dim hidden state is a deliberate compression. Real families are richer and real caseworkers use heuristics that are not loss-minimisation. The single-seed determinism makes each scenario a single path through the noise distribution rather than the distribution. Rights are modelled as a soft weight (`rightsCost`) rather than a hard constraint, which is not how real child-welfare law works: real systems require statutory thresholds, judicial review, and reunification effort as constraints, not preferences. The model treats every step as equally weighted; real institutional time is discounted unevenly. The simulation does not model multi-agent dynamics: caseworker turnover, supervisor escalation, court intervention, foster-care system feedback. The four-regime classification is a legibility choice, not a claim that real outcomes cleanly bin into four bins.

The model is comparative, not predictive. The calibration table compares each scenario&apos;s predicted regime against a reader-assigned expected regime; close agreement means the model&apos;s shape is consistent with that reading, not that it has been fitted to any specific case file.

## References

- Munro, E. *The Munro Review of Child Protection*. Department for Education (2008–2011).
- European Court of Human Rights. *Decision on Admissibility Concerning Norway* (2023).
- Norwegian National Human Rights Institution (NHRI). *Status report: why does the ECtHR find human rights violations in cases concerning the Norwegian child welfare services?* (2021).
- Statistics Norway (SSB). *Barnevern 2024*.
- Bufdir. *Stages in a Child Welfare Case*.
- OsloMet research on cultural assumptions in Norwegian child welfare.
- Saxena, D. et al. *A human-centered review of algorithms used within the U.S. child welfare system* (2020).
- Friston, K. *The free-energy principle: a unified brain theory?* (2010) - for the active-inference framing.
