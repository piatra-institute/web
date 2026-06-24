# Moral Phase Space: Three Non-Crude Formalisms for One Political Scenario

## Abstract

You cannot put a human right under a microscope, and you cannot prove in a theorem that segregation was wrong or that killing people in a camp for a promised better tomorrow was wrong. What you can do is build formal systems in which that wrongness becomes a structural fact rather than a feeling. This playground applies three such systems to a single, shared political scenario described by thirteen indicators: a deontic logic that treats rights as side constraints, a capability lattice in the tradition of Amartya Sen and Martha Nussbaum, and a low-dimensional state space of domination and repair. A naive single-scalar utility score runs alongside them as a deliberate foil. The three structured frameworks are meant to flag what the foil misses. This companion separates what the code exactly computes from the philosophical claims the prose makes, and is candid that in a humanities-flavored model the gap between the two is wider than in a physics one.

## The shared scenario

All four frameworks read the same parameter vector. Thirteen sliders, each on a 0 to 100 scale, describe one political configuration: arbitrary detention, discrimination, due process, political participation, bodily integrity, education access, health access, mobility, speech freedom, repair capacity, domination persistence, future welfare promise, and targeted group burden. Four presets fix this vector to four archetypes: a fragile plural democracy (status quo), a segregation regime, an emergency or security state, and a reparative constitutional order. The point of holding the scenario fixed while varying the lens is to show that the disagreement between frameworks is real and informative, not an artifact of measuring different things.

## What the deontic layer computes

The deontic layer is a small rule system. A fixed list of predicates fires hard violations: arbitrary detention above 15, discrimination above 20 or targeted group burden above 25, due process below 65, bodily integrity below 70, political participation below 55, speech freedom below 55. If any predicate fires, the scenario is Forbidden. A severity scalar accumulates a base penalty per violation plus graded over-threshold excesses, then is clamped to the range 0 to 100. The status label is Forbidden if any constraint breaks, Conditionally permissible if severity exceeds 18 with no hard break, and Permissible otherwise.

The philosophically load-bearing line is the treatment of the future welfare promise. When that slider is high and violations exist, the model emits the permission statement that future welfare rhetoric does not override current prohibitions. This is the formal expression of the side-constraint thesis from von Wright and Nozick: optimization happens only inside the admissible set, so a large promised gain cannot buy back a broken right. The thresholds themselves are modeling choices, not empirical constants, a point made explicit in the playground's own assumptions. They are calibrated to produce clean regime distinctions, loosely echoing OHCHR-style rights indicator frameworks.

## What the capability layer computes

Seven of the thirteen indicators are read as capabilities: bodily integrity, mobility, speech, participation, education, health, and the ability to contest (due process). The layer reports four numbers. The floor is the minimum across the seven dimensions. The mean is their average. An anti-domination penalty averages discrimination, targeted group burden, and domination persistence. The adjusted standing is a weighted blend, seven tenths mean plus three tenths floor, minus 0.28 times the penalty, clamped to 0 to 100. A partial-order class label is assigned from the floor and penalty.

Two design decisions carry the Sen and Nussbaum reading. First, the floor is given independent weight, encoding the claim that one collapsed freedom is not redeemed by luxuries elsewhere. Second, the explicit anti-domination penalty encodes that formally equal capability levels can coexist with targeted subordination, so the lattice docks standing when domination indicators are high even if individual capability levels look adequate. The label vocabulary (robustly superior, non-dominated only in some dimensions, dominated) gestures at the genuine partial order of the capability approach, in which two states can be incomparable. The code reduces that partial order to a scalar plus a class label for display, which is a simplification the next section flags.

## What the state-space layer computes

The third layer is a small deterministic dynamical system run for eight steps. It tracks two coordinates: domination and repair. The starting domination blends domination persistence and discrimination; the starting repair blends repair capacity and due process. At each step a coercion push (from detention and targeted burden) and a legitimation push (from the future welfare promise) raise domination, while a repair pull and a rights pull lower it; repair grows from repair capacity and participation and decays under domination. A small late-stage drift term is added after step three. The final point determines a basin label: entrenched domination, repair-and-stabilization, or contested transitional. Risk is the final domination minus repair plus a fraction of targeted burden.

The substantive idea is that present snapshots can hide trajectories. A scenario with tolerable current indicators can still drift toward an entrenched domination basin if the feedback from coercion to eroded repair dominates. This is the Pettit and Young intuition about self-reinforcing domination rendered as a vector field, and the legitimation push is the place where high future welfare rhetoric actively worsens the trajectory rather than merely failing to excuse it.

## The naive utility foil

The foil compresses the same scenario into one weighted sum. Future welfare promise carries by far the largest positive weight (0.34), with smaller positive weights on health, education, mobility, participation, and speech, and negative weights on detention, discrimination, and targeted burden. The result is clamped to 0 to 100. The foil exists to fail in a specific, documented way: when future welfare rhetoric is high, it can rate a deontic-forbidden, coercive regime as tolerable, because nothing in a single sum marks a right as categorically off-limits. The emergency preset is constructed to trigger exactly this, and the calibration panel verifies that the foil's score exceeds the regime's deontic admissibility score there.

## Calibrating the central claim

The calibration panel checks the model's own thesis against its deterministic core rather than against external political facts, which a toy model has no business predicting. Five cases run the real scoring functions. Segregation must come out Forbidden with three or more violations. The emergency state must show the foil overrating a forbidden regime. The reparative order must be admissible and land in the repair basin. The reparative capability floor must equal the independently recomputed minimum over its seven capability dimensions, a pure arithmetic reproduction check. The status-quo democracy must clear admissibility with severity at or below the conditional threshold of 18. All five reproduce exactly, which confirms the frameworks separate the four archetypes as designed.

What the calibration deliberately does not claim is that any number here measures a real polity. The thresholds, weights, and step counts are stipulated. The honest status is that the panel verifies internal coherence and the headline failure mode of the foil, not empirical accuracy.

## Exact versus interpretive: being candid about a humanities model

In a physics playground the equations are the territory. Here they are closer to a diagram drawn to make a moral structure legible. Three honesty points keep the account sound.

First, the side-constraint result is genuine within the model and faithful to its philosophical source: no value of future welfare promise can flip a Forbidden verdict to Permissible, because admissibility is computed before any aggregation and the welfare slider never enters the violation predicates. This is the one place where the formalism does exactly what the prose says.

Second, the capability layer is interpretive, not exact. The real capability approach yields a partial order in which states can be incomparable; the code collapses that to a scalar adjusted standing plus a coarse class label so it can be charted. The floor weighting and the anti-domination penalty are reasonable encodings of Sen and Nussbaum, but the specific coefficients are illustrative. The lattice should be read as a visualization of capability reasoning, not a measurement of capabilities.

Third, the state space is a stylized vector field, not a validated model of any regime's dynamics. Its basins are robust within the preset ranges, but the step count, drift term, and coupling constants are chosen for legible behavior. It earns its keep by showing that snapshot and trajectory can disagree, which is a conceptual point that survives the arbitrariness of the constants.

## Why three frameworks, not one

The frameworks are not meant to agree. Each notices something the others miss. Deontic logic captures cleanly why a promised better tomorrow does not license arbitrary detention. The capability lattice reveals that formally equal opportunities can coexist with targeted subordination. The state space shows that tolerable present indicators can mask a slide into entrenched domination. The foil shows what is lost when all of this is crushed into one scalar. Holding the scenario fixed and varying the lens makes the complementarity visible: the disagreements are the content.

## Limitations

The deepest limitation is that this mathematics is not value-free in the strong sense. It needs axioms: persons count, equal standing matters, some coercion is impermissible, aggregate gain does not automatically justify the sacrifice of the few. These are closer to axioms in geometry than to empirical findings, and a reader who rejects them will reject the verdicts. The thresholds and weights are stipulated, the dynamical constants are tuned for clarity, and the capability partial order is flattened for display. None of this is hidden. The claim is modest: once the axioms are granted, the formal systems make a class of historical atrocities into demonstrably invalid moves, and that legibility is worth more than the false precision a single utility number would offer.

## References

- W. N. Hohfeld, Fundamental Legal Conceptions as Applied in Judicial Reasoning, Yale Law Journal, 1917.
- G. H. von Wright, Deontic Logic, Mind, 1951.
- R. Nozick, Anarchy, State, and Utopia, 1974.
- A. Sen, Utilitarianism and Welfarism, Journal of Philosophy, 1979.
- B. Williams, A Critique of Utilitarianism, in Utilitarianism: For and Against, 1973.
- A. Sen, Development as Freedom, 1999.
- M. Nussbaum, Frontiers of Justice, 2006; Creating Capabilities, 2011.
- P. Pettit, Republicanism: A Theory of Freedom and Government, 1997.
- I. M. Young, Justice and the Politics of Difference, 1990.
- R. Teitel, Transitional Justice, 2000.
- L. Wenar, The Nature of Rights, Philosophy and Public Affairs, 2005.
