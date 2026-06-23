# Estigrade: Grading the Estimate, Not Just the Exam

## Abstract

Estigrade is an experimental grading rule: before an exam, a student predicts
their own score, and their final grade is adjusted by how accurate that
prediction was. The aim is to reward self-knowledge, not just performance. This
companion lays out the exact rule, what it does and does not guarantee, and the
honest caveats the calculator's calibration and assumptions make explicit.

## The rule

Let exam be the actual score, estimate the student's prediction, and gap the
absolute difference between them. With a reward factor r and a penalty factor p:

> final = exam + r * (100 - gap) - p * gap.

A perfect estimate (gap = 0) earns the full reward r * 100 on top of the exam
score; a wild miss earns little reward and a large penalty. The calibration panel
checks this against worked examples: a perfect estimate of an 80 with r = 0.1
gives 90, estimating 0 for an 80 gives 66, and with both factors zero the final
grade is simply the exam score.

## Why reward calibration at all

The pedagogical idea is metacognition: students who can accurately judge what
they know study more efficiently and are less prone to over- or under-confidence.
Asking for a prediction, and making it count, turns self-assessment into a graded
skill. This connects to the broader literature on calibration of confidence, of
which proper scoring rules (like the Brier score) are the formal backbone.

That said, the connection is an aspiration, not a result. The calculator
implements the rule; it does not show that the rule improves learning. That would
take a classroom study.

## Two honest problems

The assumptions panel flags two issues worth taking seriously:

1. **The final grade is unbounded.** The formula does not clamp to [0, 100]. With
   a high reward factor and a perfect estimate, a student can score above 100; a
   high penalty can push a final grade below 0. As stated, the rule needs an
   explicit cap.

2. **Truthful estimation may not be optimal.** A grading rule that rewards
   accuracy is not automatically incentive-compatible. Depending on the reward
   and penalty factors and a student's own uncertainty, the score-maximizing
   prediction can differ from their honest expectation. Proper scoring rules are
   designed precisely to make honesty optimal; estigrade's linear form is not
   guaranteed to share that property, and checking when it does is the
   interesting mechanism-design question lurking underneath.

## What the playground is

A transparent calculator for one exam and one estimate, with sliders for the
reward and penalty factors. It is a tool for reasoning about the rule's shape and
its edge cases, not evidence about its classroom effect. The robust content is
the formula and its exact outputs; everything about learning outcomes and
incentives is a hypothesis to be tested.

## References

- Literature on metacognition and the calibration of confidence in learning.
- Proper scoring rules (e.g. the Brier score) as the formal theory of rewarding
  accurate probabilistic self-assessment.
