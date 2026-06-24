# Aura Space

## Abstract

This playground models *aura* not as a property of an object but as a relational field stretched over four things at once: the object, its context, an observer, and a span of historical time. The framing comes from Walter Benjamin's 1936 essay *The Work of Art in the Age of Mechanical Reproduction*, where aura is famously the "unique appearance of a distance, however near it may be," a quality that mechanical reproduction dissolves. The model takes thirteen interpretable inputs (singularity, scarcity, ritual distance, institutional authority, reproduction saturation, trauma, observer training, and so on) and produces an eight-dimensional aura vector plus a set of scalar diagnostics: aura intensity, curvature, sheaf tension, holonomy, and distances to a handful of cultural attractor basins.

The honest claim of this work is narrow. The geometric vocabulary borrowed from differential geometry and topology (fiber bundles, connections, holonomy, sheaf cohomology, optimal transport) is used as *structural metaphor*, not as a fitted empirical model. What the implementation does guarantee is internal consistency: the deterministic computation reproduces the closed-form identities it documents, and the calibration suite verifies exactly that.

## Background

### Benjamin and the decay of aura

Benjamin's central observation is relational. The aura of an original artwork is bound to its embeddedness in tradition, ritual, and a unique here-and-now. Reproduction strips that embeddedness: a photographic print of a fresco can be examined anywhere, by anyone, detached from the cult value that once required pilgrimage. Aura, in this account, is the *distance* the object holds open between itself and the beholder, even when physically close.

The model encodes this directly. The `benjaminDistance` term is a weighted sum biased toward ritual distance and historical depth, with reproduction saturation entering as a subtractive term. Increasing reproduction flattens the field; increasing ritual distance and history deepens it.

### Bourdieu and consecration

Where Benjamin gives the phenomenology, Pierre Bourdieu gives the sociology. In *Distinction* (1984) and *The Field of Cultural Production* (1993), value is not discovered in objects but produced by institutions: museums, critics, schools, and markets that consecrate. The model splits this into a `prestige` fiber (institutional authority, market pressure, scarcity) and a `market` fiber, and lets institutional authority interact multiplicatively with scarcity in the curvature term.

### The geometric analogy

The speculative move is to treat the space of object-situations as a base manifold and attach an aura "fiber" to each point. The state of an object-in-the-world is taken to live on a product of four spaces:

> M = X (object) times C (context) times U (observer) times T (time)

Aura is then not a number at a point but a fiber over each situation. Moving an object through contexts is parallel transport; the residue accumulated by a closed loop is *holonomy*. Regions where the field fails to be flat (where scarcity, institution, and history bend perception disproportionately) carry *curvature*. The failure of local aura assignments by rival communities to glue into one coherent global assignment is read as nontrivial *sheaf cohomology*.

None of these are claimed to be measured. They are organizing analogies that the toy model makes concrete enough to manipulate with sliders.

## Model description

### Inputs

Thirteen parameters, each bounded in [0, 1], grouped into object, context, observer, and history. Five presets fix them to recognizable cultural situations: a museum masterpiece, an AI image in a feed, a wartime archive object, a meme relic, and a luxury commodity.

### The aura vector

Eight fibers are computed as clamped weighted sums of the inputs, each tuned so it peaks under a recognizable condition:

- **sacred**: ritual distance, history, embodied trace, trauma, minus market.
- **prestige**: institutional authority, market, scarcity, formal density.
- **distance**: defined to equal `benjaminDistance` exactly.
- **historical**: historical depth, trauma, embodied trace.
- **embodied**: embodied trace, singularity, trauma, minus reproduction.
- **meme**: reproduction saturation, observer desire, observer alienation, minus ritual distance.
- **market**: market pressure, scarcity, institutional authority.
- **uncanny**: formal density, alienation, the complement of embodied trace, reproduction.

### Scalar diagnostics

- **Aura intensity** is a clamped sigmoid of a weighted combination of authenticity, Benjamin distance, novelty, social gravity, and trauma, offset by a bias of 3.05. The sigmoid is what gives the field its threshold character: below a certain combined charge, aura stays near zero; above it, the field lights up.
- **Curvature** is a sigmoid of an interaction polynomial. It is deliberately *not* additive: it multiplies scarcity by institutional authority, history by embodied trace, ritual distance by observer training, and subtracts reproduction times singularity. Pure additive sums cannot express the way a cheap chair and Napoleon's chair, near-identical in matter, occupy regions of cultural space with very different curvature.
- **Sheaf tension** is an L1 distance between attribute pairs that index opposed interpretive regimes (market against trauma, authority against alienation, ritual against reproduction, scarcity against desire). High tension means rival communities assign incompatible aura to one object.
- **Holonomy** is a path-accumulation term: a base offset plus history, trauma, authority, and scarcity, minus reproduction. It models the charge an object gains simply by surviving a particular trajectory.

### Attractor basins and transport

Six basins (sacred relic, institutional masterpiece, luxury, ruin, meme, synthetic novelty) are weighted readouts of the aura vector, sorted to find the dominant regime. Three fixed targets (relic, luxury, meme) anchor an optimal-transport readout: the cost of moving the current object into a regime is the root-mean-square distance between its aura vector and that target in the eight-dimensional fiber space.

## What is exact and what is interpretive

This is a humanities-flavored playground, so the distinction matters.

**Exact and verifiable.** Every formula above is a deterministic function of the inputs. The calibration suite (`calibration.ts`) independently reimplements five of these identities and checks them against what `computeMetrics` returns:

1. the `distance` fiber equals `benjaminDistance`;
2. the aura-intensity sigmoid reproduces its raw weighted form;
3. the "meme aura" basin value equals the `meme` fiber;
4. the relic transport cost equals the recomputed root-mean-square distance;
5. a null object (all inputs zero) collapses to a fixed intensity floor set only by the residual novelty term.

All five return zero error. That is the only thing this playground proves: the code does what its equations say.

**Interpretive, not validated.** The *choice* of weights, the eight named fibers, the six basins, and the entire geometric reading are stipulated. There is no dataset of measured auras to fit. The substantive intellectual claim is structural, not numerical: that aura behaves like a relational field with threshold intensity, non-flat curvature, contested local sections, and path dependence. The specific weights are one plausible parameterization of that structure, not the true one.

## Limitations

- **No empirical calibration to external data.** Aura is not operationalized into a measurable quantity, so the model cannot be falsified against reception data in its current form. The assumptions file lists, for each premise, what observation *would* falsify it, but those experiments are not performed here.
- **Stipulated topology.** Calling the contested-heritage phenomenon "nontrivial sheaf cohomology" is evocative, not derived. No actual cohomology is computed; sheaf tension is a hand-built L1 surrogate.
- **Static.** The model has no dynamics over time. Holonomy is summarized as a scalar and illustrated with a fixed five-stage path (studio, market, archive, crisis, return) rather than integrated along an arbitrary trajectory.
- **Bounded scalars hide structure.** Clamping everything to [0, 1] keeps the visualization legible but discards any sense of scale or units, which is exactly why the model stays qualitative.

## References

- Walter Benjamin, *The Work of Art in the Age of Mechanical Reproduction*, 1936.
- Pierre Bourdieu, *Distinction: A Social Critique of the Judgement of Taste*, 1984.
- Pierre Bourdieu, *The Field of Cultural Production*, 1993.
- Rosalind Krauss, *The Originality of the Avant-Garde and Other Modernist Myths*, 1985.
- Stuart Hall, *Encoding and Decoding in the Television Discourse*, 1973.
- Justin Curry, *Sheaves, Cosheaves and Applications*, 2014.
- Mikio Nakahara, *Geometry, Topology and Physics*, 2003.
- Leonid Kantorovich, on the translocation of masses (optimal transport), 1942.
