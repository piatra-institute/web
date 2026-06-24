# No Global Section

## Abstract

This playground borrows a single idea from sheaf theory and uses it as a reading instrument for myths and novels. A sheaf assigns local data to overlapping regions of a space and asks whether those local pieces agree where the regions overlap. When they do, the local data glues into one global object, called a global section. When they cannot be reconciled, the failure is not noise. It is an invariant, classified by a first cohomology class. The model here treats ten literary and mythic figures as configurations on six numerical axes, computes a small family of derived metrics from those axes, and reads the resulting numbers as an informal obstruction to gluing a single coherent self or world out of incompatible local commitments. The model is comparative, not predictive. It is an analogy made explicit and made tunable, not a formal theorem about texts.

## The mathematical picture being borrowed

In the standard setting, a sheaf F on a topological space X assigns to each open set U an object F(U) of local sections, together with restriction maps from larger sets to smaller ones that are compatible with one another. The sheaf condition says that if you have local sections on a cover that agree on every overlap, they glue uniquely to one section on the union. The obstruction to gluing, when local agreement is not enough to produce a global object, lives in the first sheaf cohomology group. For a sheaf of automorphisms this is written H^1(X, Aut(F)), and it classifies how the local trivializations fail to patch into a single global trivialization.

The playground keeps five interpretive lenses on this same structure, and the lens you choose frames the prose without changing any number.

1. The sheaf lens foregrounds compatibility of local sections across overlaps.
2. The stalk lens foregrounds the single local point where meaning becomes binding, the colimit of a section over shrinking neighborhoods of a point.
3. The monodromy lens foregrounds how traversing a loop in the base space returns the subject altered, a representation of the fundamental group into the automorphisms of a stalk.
4. The obstruction lens foregrounds the size of the cohomology class itself, the precise gap between local truths.
5. The derived lens foregrounds the residue, what almost glued and left a failure term behind.

These five lenses are interpretive overlays. They condition the generated reading text but are explicitly decoupled from the scoring.

## What the model actually computes

Each figure is reduced to six axes, each scored from 0 to 100.

1. Locality, how strongly the situation is anchored to a particular place, body, or bond.
2. Abstraction, how much the situation reaches toward a universal frame or system.
3. Desire, how much unsatisfied wanting drives the action.
4. Institution, how much shared order, law, or convention holds the situation together.
5. Trauma, how much unresolved wound, grief, or violence the situation carries.
6. Knowledge, how much articulated understanding the situation contains or demands.

From these six numbers the scoring function derives seven metrics. The core quantity is a local-global tension term, defined as the absolute difference between locality and abstraction. Writing that tension as t, the scoring is exactly the following.

A containment term combines institution and knowledge as `0.42 * institution + 0.21 * knowledge`. A pressure term combines desire, trauma, the tension t, and abstraction as `0.23 * desire + 0.31 * trauma + 0.27 * t + 0.14 * abstraction`. The headline obstruction metric is `pressure - 0.36 * containment + 18`, clamped to the range 0 to 100 and rounded. The gluing capacity is `100 - obstruction + 0.12 * institution + 0.08 * knowledge`, also clamped.

The remaining metrics are descriptive averages and weighted sums. Mythic charge is the mean of desire, trauma, and locality. Modernity is the mean of abstraction, institution, and knowledge. Germ persistence is `0.55 * locality + 0.2 * trauma + 0.1 * desire + 0.2 * (100 - abstraction)`, so that a strongly local, weakly abstract figure resists extension. Monodromy twist is `0.4 * trauma + 0.3 * t + 0.2 * desire`. Local-global tension is reported directly as t.

Two important consequences follow from these formulas. First, institution and knowledge are containment factors that lower the obstruction, while desire, trauma, and the local-global tension raise it. Second, because tension enters as an absolute difference, both a strongly local figure facing a strongly abstract demand and a strongly abstract figure cut off from any local anchor can score high tension for opposite reasons.

The playground also computes three things on top of the score. A parameter sweep evaluates the metrics across the full range of any single axis while holding the others fixed, drawn as a set of response curves. A sensitivity analysis sets each axis in turn to its minimum and maximum, holding the rest at their current values, and sorts the axes by how much the obstruction swings. A narrative generator and a reading generator turn the numbers into prose conditioned on thresholds, for example flagging obstruction at or above 75 as structurally unreconcilable, and germ persistence at or below 35 as a local germ being dissolved by abstraction.

## The four presets and the ten figures

Four presets seed the axes to illustrate distinct regimes. The tragic preset makes locality, abstraction, and trauma all loud at once and produces high obstruction. The technocratic preset suppresses locality and desire while raising institution and knowledge, producing apparently low obstruction at the cost of germ persistence. The mythic preset raises locality, desire, and trauma with institution nearly absent, producing high mythic charge and low gluing. The modernist preset keeps knowledge and abstraction high with moderate locality, producing the derived flavor of many possible sections, none binding.

Ten canonical figures carry fixed axis profiles. Odysseus refuses cosmic enlargement to keep the Ithaca stalk binding. Orpheus attempts a pullback across the boundary of death and breaks the boundary condition with a glance. Gilgamesh fails to globalize himself into immortality and is left with the residual walls of Uruk. Aeneas performs a pushforward of a destroyed Troy into a base space that did not yet exist. Dante alone approaches a clean global section, but only by accepting an authoritative stratified cosmology. Faust refuses local finitude and disperses across an inflating cover. Kafka's K. inhabits a world that asserts a global order inaccessible from any local stalk. Balzac's Paris is a sheaf of convertible social masks glued by money and credit. Musil's Ulrich is an underdetermined section, over-possible rather than empty. Sabato's Castel collapses the whole base space onto a single obsessive corridor pointing at one wound.

## Exact versus interpretive

It is worth being precise about which parts of this playground are exact and which are interpretive.

The exact parts are the arithmetic. Given any six axis values, the seven metrics are fully determined by the formulas above. The sweep, the sensitivity tornado, the preset seeds, and the threshold-based prose are all deterministic functions of those inputs. If you reproduce the coefficients you reproduce every number on screen. The lens choice provably does not enter the scoring, which can be checked by inspecting the score function signature, since it takes only axis values and no lens.

The interpretive parts are everything that gives the numbers meaning. The choice of six axes is a compression decision. The coefficients in the pressure and containment terms are authored weights, not measured quantities. The canonical axis profile assigned to each figure is a reading, informed by named scholarly sources in the calibration table but ultimately a judgment. The identification of the obstruction metric with a genuine cohomology class is an analogy, not a construction. There is no actual topological space, no actual sheaf, and no actual cohomology computation anywhere in the code. The word obstruction is a label on a clamped weighted sum.

## Calibration and what agreement means

The calibration table compares the model's emergent obstruction on each figure's canonical profile against a reader-provided expected obstruction drawn from a named critical source, for example Auerbach on the Homeric and the figural, Blanchot on the gaze of Orpheus, Adorno on Kafka, and Lukacs on Balzac. Close agreement means the shape of the model matches a careful reading of that figure. It does not mean the model has read the text. A good fit is evidence that the six axes and the chosen weights capture something a critic would recognize, nothing more. The expected values are themselves contestable, and a scholar who places a figure far from its canonical profile here would be giving a reason to revise the profile rather than catching a bug.

## Limitations

The model has no time and no narrative arc. A configuration is a still photograph, so it cannot represent the fact that Odysseus is a different obstruction at Troy, on Calypso's island, and at the threshold of Ithaca. The score collapses a whole life into one row.

The six axes are a contested basis. Figures dominated by ritual, ecology, or play would likely be unrecoverable in this coordinate system, which would force the basis to expand.

The cohomological language is strictly metaphorical. None of the categorical machinery is instantiated. Readers fluent in sheaf theory should treat the formulas as inspired by the structure of gluing failure rather than derived from it in any rigorous sense.

The weights are authored and uncalibrated against data, because there is no dataset of measured literary obstruction to fit against. The calibration table substitutes expert expectation for measurement, which keeps the instrument honest as a comparison but blocks any claim of objectivity.

Finally, the instrument is comparative. The obstruction number is meaningful only against other obstruction numbers produced by the same formulas. Treating it as a literal property of a text, and then finding it useless for criticism, would correctly refute the predictive reading while leaving the comparative reading untouched.

## References

1. S. Mac Lane and I. Moerdijk, Sheaves in Geometry and Logic, 1992. Cited as the structural source of the gluing and cohomology language.
2. E. Auerbach, Mimesis, 1946, and Figura, 1953. The Homeric and figural readings behind the Odysseus and Dante profiles.
3. M. Blanchot, Le regard d'Orphee, in L'espace litteraire, 1955. The reading of the forbidden glance.
4. T. W. Adorno, Notes on Kafka, 1953. The inaccessible global order behind the Kafka profile.
5. G. Lukacs, Studies in European Realism, 1937. The social gluing reading behind Balzac.
6. A. MacIntyre, After Virtue, 1981, and C. Taylor, Sources of the Self, 1989. Background for the six-axis selection.
7. C. Caruth, Unclaimed Experience, 1996, and D. LaCapra, Writing History, Writing Trauma, 2001. Background for the trauma and monodromy terms.
8. M. Walzer, Spheres of Justice, 1983, and I. Berlin, Two Concepts of Liberty, 1958. Orientation for the local-global tension term.
