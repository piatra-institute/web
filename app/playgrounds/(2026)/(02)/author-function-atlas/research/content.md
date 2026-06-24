# The Author-Function Atlas

## Abstract

This playground turns Michel Foucault's concept of the **author-function** into a small, transparent dynamical model. Instead of representing writers as people, it represents authorship as a circulating attribute of phrases: a name-token that does legitimation work in discourse. A population of quote-variants evolves by a replicator-mutator rule, each variant scored by a logistic **cliche index** and an **entanglement surplus** that measures how far a name has drifted from its source. The result is an atlas in which one can watch quotes converge toward context-collapsed slogans carrying a prestigious name. This companion documents the model, its formulas, and the boundary between what it demonstrates and what it merely illustrates.

## Background

In his 1969 lecture "What Is an Author?", Foucault argued that the author is not the private origin of a text but a **function of discourse**. The author-function classifies texts, groups them, confers a particular status, and restricts the free circulation of meaning. To say "Nietzsche wrote..." is to invoke a name that performs social work: it grants authority, signals a reading protocol, and bundles otherwise loose statements into a coherent body. Crucially, this work is partly independent of whether Nietzsche actually wrote the line in question.

That independence is the seam the model exploits. The internet is full of misattributed quotes. Lines drift toward famous names because a famous name circulates better than an accurate citation. Einstein, Mark Twain, and Nelson Mandela accrete aphorisms they never produced. The phenomenon is sometimes called context collapse: as a phrase travels across audiences and channels, the situational detail that anchored it to a source erodes, while the brand-value of the name remains or even grows.

The atlas asks a narrow question. If we treat circulation, generality, brevity, and name-prestige as selectable traits, and let a population of phrases evolve under selection and mutation, where does the cloud of quotes go?

## The model

### State

The unit is a **variant**: a phrase fragment carrying a vector of normalised traits in the interval [0, 1] (with surprisal on a wider [0, 10] scale). The traits are circulation frequency `f`, channel dispersion `disp`, surprisal `surp` (low means predictable), context retention `ret`, mutability `mut`, specificity, word length, name-prestige `a_name`, and source-verifiability `a_src`. A population is seeded with ninety variants per author, each grown from a short canonical phrase fragment padded with filler tokens. The seed phrases are illustrative stubs, not a real corpus.

### Cliche index

Each variant is scored by a logistic composite:

```
C = sigmoid( 1.1 * ln(f + 1) + 0.8 * disp - 0.55 * surp - 1.0 * ret + 0.7 * mut )
```

A phrase scores high when it is widely circulated, spread across channels, unsurprising, context-free (low retention), and easily mutated. The logistic squashes the weighted sum into [0, 1]. Two closed-form anchors make the score legible: at the all-zero input every term vanishes and C equals sigmoid(0) = 0.5, the midpoint; a saturated slogan with `ln(f+1) = 1`, full dispersion and mutability, and zero surprisal and retention has exponent 1.1 + 0.8 + 0.7 = 2.6, so C = sigmoid(2.6) is approximately 0.931. Both are checked in the calibration panel.

### Entanglement surplus

The signature of attribution drift is a single difference:

```
E = clamp( a_name - a_src , -1, 1 )
```

`a_name` is how much the name legitimises the phrase; `a_src` is how much the actual source context supports it. Positive E means the name is doing more work than the citation justifies: a brand-token coming loose from its origin. The buckets low, mid, and high split the population by this surplus.

### Replicator-mutator dynamics

Selection acts through a **fitness** that rewards portability (generality, dispersion, low retention), generality on its own, brevity, and name-prestige, with a penalty for length. Each step, a variant's frequency is multiplied by `exp(0.22 * (fitness - mean fitness))` plus a small noise term, then the whole population is renormalised so mean frequency stays constant. This is the replicator part: above-average variants grow, below-average variants shrink.

The mutator part spawns paraphrase-children with probability proportional to mutability and frequency. A child inherits perturbed traits: typically lower retention, lower source-verifiability, slightly higher name-prestige, and an edited text (a token dropped, a filler appended). Children therefore tend to be more cliche and more entangled than their parents. A frequency-capped culling keeps the population bounded, preferentially keeping high-frequency variants.

## Results

Run the atlas and the qualitative story is consistent. The cloud drifts toward the lower-left of the specificity-versus-log-circulation plane: low specificity (general), high circulation, with point size (context-loss pressure) growing as retention falls. Name-prestige climbs with frequency, so the most circulated variants also carry the strongest brand-token, and the entanglement surplus skews positive. This is the model's picture of a quote becoming a cliche: general, ubiquitous, context-free, and increasingly bound to a name rather than a source.

### What the calibration verifies

Because the live run is stochastic, only the deterministic core is calibrated, and every predicted value is computed by calling the model functions, not hardcoded:

1. **Cliche midpoint.** A neutral variant returns C = 0.5 exactly.
2. **Saturated slogan.** The high-circulation variant returns sigmoid(2.6) approximately 0.931, matching the closed form.
3. **Entanglement gap.** A variant with `a_name = 0.8`, `a_src = 0.3` returns E = 0.5.
4. **Generality monotonicity.** Holding all else fixed, the more general variant is fitter.
5. **Prestige monotonicity.** Holding all else fixed, the higher-prestige variant is fitter.

All five reproduce their targets with zero error, which confirms the formulas are wired as documented. They do not, and cannot, confirm anything about real quotes.

## Limitations

The corpus is synthetic. The seed phrases are stubs and the filler padding is arbitrary, so no claim about any real author or quote survives. The five cliche weights and the fitness coefficients are hand-set, not fitted to data; a corpus where surprisal and retention failed to predict perceived cliche-ness would falsify this particular weighting even if the direction held. The replicator equation is mean-field: it ignores network structure, conformity bias, and audience segmentation, all of which shape real cultural transmission. The cliche-attractor drift is an observed tendency of the toy under default parameters, not a proven fixed point; pushing context-collapse low and the brevity-penalty high can keep the cloud from converging.

Finally, the author-function framing is itself a lens, not a measurement. Foucault offered a way of reading discourse, not a quantitative law. The atlas borrows the vocabulary to give the dynamics a shape; it does not test Foucault, and Foucault does not validate the atlas.

## References

- Michel Foucault, "What Is an Author?" (1969), in *Language, Counter-Memory, Practice*.
- Claude Shannon, "A Mathematical Theory of Communication" (1948), on surprisal and information.
- Martin Nowak, *Evolutionary Dynamics* (2006), on replicator and replicator-mutator equations.
- Manfred Eigen and Peter Schuster, *The Hypercycle* (1979), on quasispecies and mutation-selection balance.
- danah boyd and Alice Marwick, on context collapse in networked publics (2011).
