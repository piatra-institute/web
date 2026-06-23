# The Space Between Algorithms: Grading Degrees of Freedom

## Abstract

A sorting routine has no freedom; it does exactly one thing. A human has a great
deal. In between lies a vast space: fixed neural networks, learning agents, a
living cell. This playground proposes a way to place any algorithmic system on
that spectrum, a composite "freedom score" built from five indicators. The score
is an exact weighted blend, which the calibration pins, while being honest that
"freedom" here is a constructed measure, not a claim about free will.

## Freedom as an index

There is no agreed scalar for how free a system is. So the playground does what
fields from development economics to well-being research do with similarly fuzzy
concepts: it builds a composite indicator. Five normalized quantities, each in
[0, 1], are blended into a single 0-to-100 score:

- **Intra-choice entropy** (weight 0.25): how much genuine variety is in the
  system's choices.
- **Empowerment** (0.25): an information-theoretic measure of how much the
  system's actions shape its own future.
- **Policy-manifold volume** (0.2): the size of the space of behaviours it can
  adopt.
- **Causal emergence** (0.2): how much higher-level causal structure arises above
  the micro-dynamics.
- **Descriptive regularity** (0.1): how compressible, hence law-like, its
  behaviour is.

## The exact part

The blending is a convex combination: the five weights sum to exactly one, so the
score is a true weighted average, then scaled by 100. That makes a few things
exactly checkable, and the calibration verifies each: all indicators at zero give
0, all at one give 100, the weights sum to 1, and turning on only the two
0.25-weighted components yields exactly 50. The arithmetic is the solid floor
under the interpretation.

## Where the concepts come from

The indicators are inspired by real theory: empowerment is a genuine
information-theoretic notion of agency (Klyubin and colleagues), causal emergence
draws on Hoel's work on when macro-scales carry more causal weight than micro.
But the specific normalizations, the choice of five indicators, and the weights
are modelling decisions, not consequences of those theories. A different analyst
could pick different components or weights and rank the same systems differently.
The assumptions panel is explicit about this.

## What the presets claim

The presets place example systems, a sorting algorithm near zero, a fixed neural
net low, a learning agent higher, a cell higher still, a human near the top, at
illustrative points on the indicators. These are hand-chosen intuitions to give
the score surface some anchors, not measurements. Estimating these indicators for
a real running system is a hard, separate problem the playground does not attempt;
it lets you set the indicators directly and explore the resulting score.

## What it is

A conceptual instrument for thinking about gradations of autonomy, the space
between rigid and free, with an exact, transparent scoring rule underneath. It is
not a benchmark, and a high score is not a claim that a system is conscious or
genuinely free. The math is exact; the meaning is a lens.

## References

- Klyubin, A. S., Polani, D., and Nehaniv, C. L. (2005). Empowerment: a universal
  agent-centric measure of control.
- Hoel, E. P. (2017). When the map is better than the territory. (Causal
  emergence.)
- Standard references on composite-indicator construction.
