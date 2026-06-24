# Ontometrics

## Abstract

Ontometrics treats an ontology as a measurable structure rather than a fixed catalogue of categories. Given a small set of categories, relations, axioms, and worked cases, the playground computes a quality score that balances how well the scheme fits its cases against how much structural machinery it carries. The aim is to make visible a pair of failure modes that ontology designers know informally but rarely quantify: a scheme can be *underdeveloped* (too few distinctions to track the phenomena) or *overdetermined* (too many categories, relations, or axioms for what the cases warrant). This companion documents the exact formulas the playground implements, the empirical and conceptual traditions they borrow from, and the points where the implemented model is a deliberate simplification of the prose around it.

## Background

### Ontology as engineering, not only metaphysics

In philosophy, an ontology is an account of what kinds of things exist and how they relate. In computer science and knowledge representation, an ontology is a concrete artifact: a set of classes, properties, and logical axioms used to structure data and support inference. The two senses meet in the question this playground asks. Whether you are a metaphysician proposing that the world divides into objects, processes, agents, and boundaries, or an engineer building a class hierarchy, you face the same tension. Each new distinction you introduce should earn its place by explaining a stable difference in the cases you care about. Distinctions that do not pull their weight add description cost without adding discrimination.

### Minimum Description Length

The organizing idea behind the quality function is the Minimum Description Length (MDL) principle. MDL says the best model of a body of data minimizes the sum of two terms: the length needed to describe the model itself, written L(O), and the length needed to describe the data once the model is given, written L(D given O). A model that is too simple has a short L(O) but leaves the data poorly explained, so L(D given O) stays large. A model that is too complex shrinks L(D given O) only marginally while L(O) balloons. The minimum of the sum is the sweet spot. Mapping this onto ontology: categories and axioms are model description; cases that resist clean classification are residual surprise.

### Harman's two reductions

Graham Harman's object-oriented ontology distinguishes two ways a thing can be explained away. *Undermining* reduces a thing downward to its parts or constituents. *Overmining* reduces a thing upward to its effects, appearances, or relations. These are orthogonal to the underdeveloped versus overdetermined axis. The playground estimates a single Harman index from the mix of axiom types, reading subtype axioms as leaning toward overmining and dependence axioms as leaning toward undermining. This is an interpretive heuristic, not a theorem; it is included to give designers a felt sense of which direction their axiom choices push.

## Model description

The editor state consists of categories, relations, axioms, and cases. A case is a named phenomenon assigned to zero or more categories. An axiom is a typed constraint over two categories: disjoint, subtype, dependsOn, or identity. From this state the playground computes the following metrics. All metrics except violation counts and the Harman index are clamped to the interval from 0 to 1.

### Coverage

Coverage is the fraction of cases that have at least one category assigned:

Coverage = (cases with at least one category) / (total cases).

An ontology that leaves cases orphaned cannot organize them, so coverage falls.

### Discrimination

Discrimination is the fraction of case pairs that receive distinct category sets:

Discrimination = (distinct case pairs) / (total case pairs).

Two cases assigned exactly the same categories are indistinguishable to the ontology, so they do not count as a distinct pair. With no pairs (zero or one case) discrimination defaults to 1.

### Fit

Fit combines coverage and discrimination with fixed weights:

Fit = 0.55 times Coverage + 0.45 times Discrimination.

These weights are a modeling choice, slightly favoring coverage over discrimination, and are not derived from data.

### Redundancy

Each category induces a set of the cases it classifies. Redundancy is the mean Jaccard overlap across all category pairs:

Redundancy = mean over category pairs of (shared cases) / (union of cases).

Two categories that classify nearly the same cases have high overlap and may be collapsible.

### Inconsistency and violations

Each axiom is checked against every case. A disjoint axiom is violated by any case holding both categories. A subtype or dependsOn axiom is violated by a case holding the left category but not the right. An identity axiom is violated by a case holding exactly one of the two. The violation list collects these as readable strings, and inconsistency normalizes the count by the number of axioms times the number of cases.

### Complexity

Complexity scores the raw structural load, weighting axioms most heavily, then categories, then relations:

complexityRaw = categories + 0.8 times relations + 1.2 times axioms,

then normalized by the larger of 6 and 2.5 times the case count, and clamped. The normalization means structure is judged relative to how many cases it has to explain.

### Brittleness

Brittleness estimates how fragile the scheme is to revision, combining inconsistency with the parts of complexity and assignment density that exceed soft thresholds:

Brittleness = clamp(0.55 times Inconsistency + 0.25 times max(0, Complexity minus 0.7) + 0.2 times max(0, Density minus 0.45)).

Density is the fraction of the case-by-category matrix that is filled.

### Quality

The headline score is the MDL-inspired quality function:

Q = clamp(Fit minus lambda times Complexity minus mu times Redundancy minus nu times Inconsistency minus rho times Brittleness plus 0.28).

The penalty weights lambda, mu, nu, and rho are the four adjustable sliders. The additive 0.28 offset centers the score so that a well-balanced ontology lands in a readable mid-to-high range rather than being dragged toward zero by the penalties. It is a presentation constant, not a measured quantity.

### Phase classification

The combination of Fit and a structure-load aggregate sorts the ontology into one of five phases: Underdeveloped, Calibrated, Heavy but workable, Overdetermined, and Brittle confusion. The structure load is a weighted blend of complexity, redundancy, and inconsistency. Low fit with low structure load reads as underdeveloped; high structure load with redundancy or contradiction reads as overdetermined; low fit with high structure load reads as brittle confusion.

### MDL decomposition

For the decomposition visual, description length is approximated from complexity, redundancy, and axiom count, while residual surprise is approximated from the fit gap and inconsistency. This is an illustrative decomposition that mirrors the L(O) versus L(D given O) split rather than a literal code-length computation.

## Calibration

Because the model is fully deterministic, calibration does not fit empirical data. Instead it checks that the implemented formulas reproduce values that can be derived by hand on small, fully specified ontologies. The calibration suite verifies six identities, each with its predicted value computed by the live model:

1. Coverage of a two-case ontology where both cases are assigned is 100 percent.
2. Coverage with one of two cases left unassigned is 50 percent.
3. Discrimination of two identically assigned cases is exactly 0.
4. Fit equals 0.55 times Coverage plus 0.45 times Discrimination, reproduced to the digit.
5. A single case in two categories declared disjoint produces exactly one violation.
6. Two subtype axioms and no dependence axioms give a Harman index of plus 1.

Every predicted value matches its hand-derived target with zero error, which confirms the formulas are implemented as documented. These checks validate the deterministic core; they do not and cannot validate whether the chosen weights or the 0.28 offset reflect any external standard of good ontology.

## Limitations and honest gaps

The model is a pedagogical instrument, and several of its claims are softer than the interface suggests.

**Preset phase labels do not always match the computed phase.** The mind and consciousness preset is described in its prose as tending toward underdeveloped, on the grounds that folk-psychological categories resist clean classification of cases like deja vu or dreaming. With the default weights, the implemented model actually classifies that preset as Calibrated, because its coverage and discrimination are high enough to clear the underdeveloped threshold. The narrative the playground prints reflects the computed phase, so it stays consistent with the math, but the static preset description is aspirational rather than a prediction the model reproduces. A user who wants to see the underdeveloped regime should strip categories or orphan cases rather than expecting the preset to land there.

**The weights and offset are stipulated.** The fit weights of 0.55 and 0.45, the complexity normalization constants, the brittleness coefficients, and the 0.28 quality offset are all hand-chosen to produce legible behavior across the four presets. They are not estimated from any corpus of real ontologies, so the absolute quality numbers should be read comparatively, not as calibrated probabilities or code lengths.

**The Harman index is a heuristic.** Mapping subtype axioms to overmining and dependence axioms to undermining is an interpretive gloss on Harman's distinction, not something Harman states. It is useful for prompting reflection on the direction of one's axiom choices, but it should not be cited as a measurement of a metaphysical commitment.

**Cases are hand-curated, not sampled.** Coverage and discrimination are only as meaningful as the case set. A designer can make any ontology look well-fitted by choosing only the cases it handles cleanly. The metrics measure fit to the provided cases, not fit to the world.

## References

- Stanford Encyclopedia of Philosophy, "Logic and Ontology." https://plato.stanford.edu/entries/logic-ontology/
- Stanford Encyclopedia of Philosophy, "Mereology." https://plato.stanford.edu/entries/mereology/
- Grunwald, P. *The Minimum Description Length Principle.* MIT Press, 2007.
- Rissanen, J. "Modeling by shortest data description." *Automatica*, 1978.
- Harman, G. *Object-Oriented Ontology: A New Theory of Everything.* Pelican, 2018.
- Guarino, N., Oberle, D., Staab, S. "What is an Ontology?" in *Handbook on Ontologies*, Springer, 2009.
