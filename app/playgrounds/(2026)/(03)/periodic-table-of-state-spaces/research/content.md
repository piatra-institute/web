# A Periodic Table of State Spaces

## Abstract

This playground proposes a synthetic typology of the objects that the sciences actually study. Its claim is deliberately modest and deliberately general: whatever the field, the thing under study can usually be written as a *state space* together with a rule for how states succeed one another. What changes from chemistry to ecology to finance is not the kind of object but its coordinates. This document sets out the framework, the ten classification axes, the small deterministic model that backs the interactive table, and the limits of the whole exercise.

## 1. The general form

A state space is a set X of possible configurations of a system, equipped with a transition structure T that maps the present onto the future. The most useful general form is

> x(t+1) = T(x(t), theta, u(t), epsilon(t))

where theta are parameters, u(t) are control inputs, and epsilon(t) is noise. Almost every quantitative science is, at bottom, the study of some instance of this equation. Newtonian mechanics fixes T as a symplectic flow and makes theta, u, and epsilon either absent or fully known. Weather prediction keeps the same skeleton but lets X become an infinite-dimensional field, T become chaotic, and epsilon become an irreducible forcing term. Macroeconomics keeps the skeleton again, but now theta is partly chosen by the agents inside the system, and u feeds back through their expectations.

The framework does not assert that this is the only way to think about a science. It asserts that it is a productive common coordinate system, and that placing fields in it reveals structure that is otherwise easy to miss.

## 2. The ten axes

Each cell in the table is scored on ten axes, banded as integers from 0 to 4. The axes group into five themes.

**Geometry.** *Dimensionality* runs from finite and discrete (enumerable states) through finite-dimensional real vectors to infinite-dimensional function and field spaces.

**Dynamics.** *Stochasticity* runs from deterministic to irreducibly random. *Nonlinearity* runs from systems where superposition holds to systems with bifurcations and strange attractors. *Predictability* summarises how far the future can be forecast in practice, which is not the same as determinism: a deterministic chaotic system can be wholly unpredictable.

**Epistemics.** *Observability* asks whether the hidden state couples to what can be measured at all, in the Kalman sense, not merely whether enough sensors exist. *Controllability* asks whether available inputs can steer the system across its state space.

**Systems theory.** *Openness* runs from closed, conserved systems to systems exchanging matter, energy, and information with an environment. *Adaptation* asks whether the system updates its own behaviour through experience while its update rule stays fixed.

**Social structure.** *Endogeneity* asks whether the rules of the system are generated inside it, so that the structure of the state space is itself a variable. *Reflexivity* asks whether participants models of the system feed back into the system, in the sense of Soros and of second-order cybernetics.

These axes are treated as orthogonal coordinates so that distance between cells is well defined. That orthogonality is an idealisation, discussed in the limitations section below.

## 3. The six families

The thirty cells are organised into six families that loosely follow the themes above:

- **Geometry**: finite discrete, countable discrete, continuous finite-dimensional, infinite-dimensional, hybrid.
- **Dynamics**: Hamiltonian, linear, nonlinear, stochastic, chaotic.
- **Control**: observable, controllable, partially observable, optimal control.
- **Systems**: open, decentralised, feedback, adaptive, self-organising, hierarchical.
- **Social**: endogenous, reflexive, second-order, game-theoretic, performative.
- **Epistemology and geometry of dynamics**: dissipative, gradient, ergodic, manifold, network.

The families are a reading aid, not a partition: most real domains draw a profile from several families at once. Weather forecasting is infinite-dimensional (geometry), chaotic and stochastic (dynamics), and partially observable (control) all at the same time.

## 4. The classifier

The interactive table is backed by a small deterministic model. Given a profile p (ten scores) and a cell s (ten scores), the match score is the ordinary Euclidean distance

> matchScore(p, s) = sqrt( sum over axes k of (p_k - s_k)^2 )

`rankSpaces` computes this distance from a profile to every one of the thirty cells and returns them in ascending order, so rank 1 is the nearest cell. `similarityPercent` rescales a distance against the largest possible separation (a difference of 4 on every axis) into a 0 to 100 figure for display. There is no learning, no fitting, and no randomness anywhere in this core: the same profile always yields the same ranking.

## 5. Calibration

Because the classifier is deterministic, it can be checked rather than merely admired. The playground ships fifteen sample cases, each a real domain with a hand-built profile and a set of declared cells (the cells a domain expert would tag it with). The calibration panel takes five canonical cases and asks a single falsifiable question of each: when the classifier ranks all thirty cells against the case profile, does the nearest cell fall inside the declared tag set?

| Case | Nearest cell | Declared cells | Pass |
| --- | --- | --- | --- |
| Classical Mechanics | Hamiltonian (HM) | HM, CF, OB | yes |
| Quantum Mechanics | Partially Observable (PO) | HM, IF, ST, PO | yes |
| Weather Forecasting | Partially Observable (PO) | IF, CH, ST, PO | yes |
| Financial Markets | Reflexive (RF) | RF, CH, PF, EN, PO | yes |
| Psychotherapy | Second-Order (S2) | S2, AD, RF, PO | yes |

All five pass. The metric is boolean and the target is 1, so each case scores an error of zero. This does not prove the typology is correct. It proves the numeric score matrix is internally consistent with the qualitative tags: the geometry of the scores does not contradict the human classification. A case whose nearest cell fell outside its tags would be a genuine red flag, either in the scores or in the tags.

## 6. The developmental ladder

A second lens orders cells on a partial ladder: Fixed, then Adaptive, then Endogenous, then Reflexive. Fixed systems take their laws from outside and never rewrite them; chemistry near equilibrium sits here. Adaptive systems update their behaviour but not their update rule; immune systems and trained networks sit here. Endogenous systems generate their own rules, so the structure of the state space becomes a variable; markets and institutions sit here. Reflexive systems close the loop further: participants models of the system feed back into the system, so observation changes the observed. Finance, politics, and psychotherapy sit here.

The ladder is not a ranking of difficulty or legitimacy. It describes the *kind* of regularity a domain can support and the style of explanation that works there. A reflexive science is not a failed physics; it is a science of a different kind of object, one whose stable structure has to be found in spite of, and sometimes because of, the feedback from its own observers.

## 7. Why contingency does not disqualify a science

A recurring worry is that fields like economics study contingent, human-made rules and so cannot be sciences. The framework reframes the worry. The boundary conditions of chemistry are also contingent on planetary history; the rules of markets are contingent on institutions. What matters is not whether the rules are arbitrary but whether, given the constraints, disciplined and testable regularities emerge. Pure prediction is too weak a criterion: a black box can predict without explaining. Robustness under perturbation is stronger, and it is exactly what the observability and controllability axes try to capture. A system that is observable and controllable admits experiments; a system that is neither admits observation and narrative, and must work harder to earn its regularities.

## 8. Limitations

The honest caveats are large.

- **No canonical source.** There is no single accepted periodic table of state spaces in the literature. This is a synthesis of phase-space theory (Poincare, Gibbs), open systems (Bertalanffy), cybernetics (Ashby, von Foerster), control theory (Kalman), the Lucas critique, and reflexivity (Soros). The arrangement is a tool for thinking, not a discovered law.

- **Scores are judgements.** The 0 to 4 scores are hand-assigned. Reasonable experts would disagree by a band or two on many cells. If the nearest-neighbour result flips under such re-scoring, the specific assignment is not robust even if the framework survives.

- **Axes are not really orthogonal.** Reflexivity and low predictability travel together; openness and adaptation are correlated. Treating the ten axes as independent coordinates is a tractability choice. A principal-component analysis of the score matrix would almost certainly find fewer than ten effective dimensions.

- **The metric is a choice.** Unweighted Euclidean distance counts a one-band difference on reflexivity exactly as much as a one-band difference on dimensionality. There is no principled reason this weighting is right.

These limitations are the point of the assumptions panel in the playground, which marks each claim by confidence and states what observation would falsify it.

## 9. References

- H. Poincare, *Les methodes nouvelles de la mecanique celeste* (1892), on phase space and qualitative dynamics.
- L. von Bertalanffy, *General System Theory* (1968), on open systems.
- W. R. Ashby, *An Introduction to Cybernetics* (1956), on feedback and requisite variety.
- R. E. Kalman, "On the general theory of control systems" (1960), on observability and controllability.
- R. E. Lucas, "Econometric policy evaluation: A critique" (1976), on endogenous policy regimes.
- G. Soros, *The Alchemy of Finance* (1987), on reflexivity in markets.
- H. von Foerster, *Understanding Understanding* (2003), on second-order cybernetics.
