# Tuition Resentment: Attribution Dynamics of High-Cost Education

## Abstract

This playground asks a deliberately uncomfortable question. When a student pays a very high price for an education and the experience disappoints, who gets blamed? The model proposes that the answer is not fixed. The same disappointment can be routed toward the self ("I was not good enough to make use of this") or toward the institution ("they did not deliver what they sold"). A small set of psychological levers decides the split, and the routing has consequences: institutional blame produces complaints that erode reputation, while self-blame protects the institution at the cost of student wellbeing. The simulation is a fully deterministic discrete-time loop, so its core quantities are exact and reproducible, and the calibration panel checks them against closed-form ground truth.

## Background

Two old ideas meet here. The first is cognitive dissonance: a felt tension when experience contradicts a held expectation (Festinger, 1957). The second is attribution theory: the human habit of explaining outcomes by assigning them to internal or external causes (Weiner, 1985; Rotter, 1966). High tuition sharpens both. A large, salient, often debt-financed payment raises the expectation that the experience will be worth it, and the sunk cost makes it psychologically expensive to conclude that the money was wasted. Effort-justification work (Aronson and Mills, 1959) suggests that the more painful the entry price, the more we are motivated to value what we bought, which can quietly bend blame inward.

The model does not try to prove this story. It encodes it as a transparent set of equations and lets the user watch the consequences.

## The Model

Every quantity the Viewer plots is a pure function of the parameters and the current reputation. There is no randomness anywhere, which is what makes the core calibratable.

**Expectation.** A linear cost-and-signal sum, clamped to the unit-percent range:

E = clamp(b0 + b1 tuition + b2 marketing + b3 prestige + b4 reputation, 0, 100)

Cost, marketing, prestige, and prior reputation all push expectation up. With default tuition the term saturates the clamp, which is itself a modelling statement: beyond a point, more money cannot raise expectation further, but it can still raise the price of admitting disappointment.

**Observed quality.** True quality is a function of genuine investment, Q_true = 50 + 0.5 qi. Observed quality adds grade inflation on top:

Q_obs = clamp(Q_true + gammaG leniency, 0, 100)

The gap between Q_true and Q_obs is the signal-masking effect of lenient grading: students see a number that is better than the learning behind it.

**Dissonance.** The rectified shortfall of experience against expectation:

D = max(0, E - Q_obs)

Only unmet expectation produces tension. Exceeding expectation yields zero, not negative, dissonance.

**Attribution.** A logistic mixer turns three psychological drivers into a blame fraction:

lambda = sigma(theta0 + theta1 power + theta2 identity + theta3 socialComparison)

As lambda approaches 1, dissonance is routed to the self; as it approaches 0, to the institution. Power asymmetry (grades as leverage), identity internalization (ego protection), and social comparison (peer pressure) all push lambda up.

**Resentment split.** The dissonance pool is partitioned, conserving total tension:

R_self = lambda D, R_inst = (1 - lambda) D

**Complaints and reputation.** Institutional resentment drives a logistic complaint propensity, suppressed by power asymmetry. Complaints, quality, and audit penalties then feed a damped reputation recurrence:

R_next = clamp(rho R + psi1 (Q_true - 50) - psi2 (complaints/100) - psi4 penalty + 0.1 (Q_true - 50), 0, 100)

A grade audit levies a penalty only when leniency exceeds 65, equal to (leniency - 65) / 5.

## Exact vs Interpretive

It is worth being precise about which parts of this playground are mathematics and which are reading.

The **exact** part is the arithmetic. Given the coefficients, the expectation, observed quality, dissonance, attribution mixer, complaint propensity, penalty, and reputation update are all closed-form. The calibration panel verifies four of these against hand-derived ground truth, with zero error: expectation in the unclamped regime, the observed-quality floor, a grade-inflation lift, the dissonance rectifier, and the audit penalty threshold. These are not fits; they are identities.

The **interpretive** part is everything the numbers are claimed to *mean*. That high tuition suppresses complaints through sunk cost, that lambda captures real blame routing, that self-resentment maps to mental-health harm, that grades function as institutional leverage: these are hypotheses the model dramatizes, not results it proves. The coefficients themselves are chosen for legibility, not fitted to data. A reader should treat the trajectories as an argument made vivid, not as a forecast.

## Honest Limits

The reputation recurrence is the weakest link: its coefficients are unfitted, and a serious calibration against real institutional reputation series would almost certainly demand different values or nonlinear terms. The conservation split of dissonance into exactly two channels is a simplification; real affect need not trade off so cleanly. The additive logistic attribution ignores interaction effects and threshold (non-smooth) blame. And the whole apparatus is a single deterministic run with hand-set levers, not an ensemble fit to a population of students. The playground is a sandbox for the shared logic of cost, expectation, and blame, not a validated model of any real university.

## References

- Aronson, E. and Mills, J. (1959). The effect of severity of initiation on liking for a group. *Journal of Abnormal and Social Psychology*.
- Festinger, L. (1957). *A Theory of Cognitive Dissonance*. Stanford University Press.
- Rojstaczer, S. and Healy, C. (2012). Where A is ordinary: the evolution of American college and university grading. *Teachers College Record*.
- Rotter, J. B. (1966). Generalized expectancies for internal versus external control of reinforcement. *Psychological Monographs*.
- Weiner, B. (1985). An attributional theory of achievement motivation and emotion. *Psychological Review*.
