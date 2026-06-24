# Lithic Grammar: Rock Classification as a Formal Grammar

## Abstract

Petrology names rocks. A field geologist looks at a hand specimen, measures or estimates a handful of diagnostic properties, and emits a single word: granite, basalt, schist. This playground treats that act of naming as a formal grammar. A small set of diagnostic axes (the silica content, the cooling texture, the modal mineralogy, the grain size, the protolith, the metamorphic grade, the pressure regime) are the input symbols. A set of ordered production rules rewrites those symbols into a terminal: the name of exactly one rock. Because the grammar is deterministic and total, every input string derives to a unique name, which makes the model fully verifiable against the canonical specimens of standard petrology. The deeper point is epistemic: the names are discrete labels imposed on a continuous geological manifold, and the grammar makes visible which of its boundaries are physical, which are committee conventions, and which are fuzzy ratios that nature never sharply draws.

## Background: classification as language

The phrase "lithic grammar" is a deliberate pun. In archaeology, lithic technology studies stone tools, and a reduction sequence (the chaine operatoire) can indeed be written as a rewrite system over flake-removal operations. This playground borrows the linguistic framing but applies it to petrology proper: the grammar here is the grammar of rock *names*, the rules by which geologists partition the space of all possible rocks into a finite vocabulary.

The analogy to formal language theory is exact in structure. A context-free grammar has nonterminals, terminals, and production rules. Here:

- the **nonterminals** are the intermediate categories a classifier passes through (ultramafic, mafic, intermediate, felsic; clastic, chemical, organic; pelitic, mafic, calcareous protoliths);
- the **terminals** are the roughly sixty named rocks (the leaves of the decision tree);
- the **production rules** are the ordered conditions that route an input from the start symbol to a leaf.

Like a real grammar, the order of rules matters. The classifier checks special textures (glassy, vesicular, very coarse) before the silica bands, so a glassy felsic rock derives to obsidian rather than rhyolite. This ordered fall-through is the formal-language equivalent of rule priority in a production system, and it is also where the model hides genuine natural ambiguity.

## The three classification grammars

Petrology does not have one grammar; it has three, one per genetic domain, each with its own axes and boundaries.

### Igneous: a chemical-textural lattice

The igneous grammar is a two-dimensional lattice. The primary axis is bulk silica content, which partitions the space into four compositional bands:

- ultramafic (SiO2 < 45%)
- mafic (45 to 52%)
- intermediate (52 to 63%)
- felsic (> 63%)

The secondary axis is cooling texture, a proxy for cooling rate and therefore crystal size: plutonic (coarse, slow cooling at depth) versus volcanic (fine, rapid cooling at the surface), with hypabyssal and glassy as intermediate and quench endmembers. The product lattice gives the familiar pairs: gabbro/basalt (mafic), diorite/andesite (intermediate), granite/rhyolite (felsic).

For ultramafic plutonic rocks, silica is too coarse a discriminator, so the grammar switches to a modal ternary following the IUGS / Streckeisen convention. The olivine, orthopyroxene and clinopyroxene proportions are renormalised to sum to 100% and read against fixed field boundaries: olivine above 90% is dunite; olivine between 40 and 90% is a peridotite (harzburgite, wehrlite or lherzolite depending on the Opx:Cpx ratio); below 40% olivine the rock is a pyroxenite. This is a clean example of a sub-grammar invoked only inside one nonterminal.

### Sedimentary: grain size plus origin

The sedimentary grammar splits first on origin (clastic, chemical, organic), because these have nothing in common as processes. Clastic rocks are classified primarily by the Wentworth grain-size scale (clay, silt, sand, gravel), with secondary modifiers applied within each size class: fissility separates shale from mudstone, rounding separates conglomerate from breccia, feldspar content yields arkose, poor sorting yields graywacke, and a glacial origin yields tillite. Chemical rocks key on composition (carbonate, siliceous, evaporite) and then on diagenetic or biogenic modifiers (Mg-rich gives dolostone, biogenic gives chalk, hot-spring gives travertine). Organic rocks key on the source biology (plant gives coal, shell gives coquina, diatom gives diatomite).

### Metamorphic: protolith crossed with conditions

The metamorphic grammar is the most genuinely multidimensional. The output depends on three things at once: what the rock was before (protolith), how hot it got (grade), and under what pressure. The same pelitic protolith runs the Barrovian sequence slate, phyllite, schist, gneiss, migmatite as grade rises. The same mafic protolith runs greenschist, amphibolite, granulite at normal pressure, but blueschist, eclogite under high pressure. Contact metamorphism (baking next to an intrusion, with no regional foliation) is handled as an override that produces hornfels or, for carbonate protoliths, skarn.

## Which boundaries are real?

The most important thing the grammar exposes is that its boundaries are not all the same kind of thing.

1. **Physical boundaries.** The 90% olivine line for dunite tracks a real modal threshold; cross it and the rock is genuinely olivine-dominated. Phase transitions (the appearance of garnet, the onset of partial melting in migmatite) mark real changes in the rock.
2. **Conventional boundaries.** The 63% silica line dividing intermediate from felsic is a committee decision, codified by the IUGS, that could be (and historically has been) moved. There is no physical discontinuity in a magma as it passes 63% silica; the boundary exists so geologists can communicate.
3. **Fuzzy boundaries.** The granite / granodiorite split depends on the continuous ratio of alkali feldspar to plagioclase. Real specimens straddle it, and two competent petrologists can disagree.

A formal grammar forces every boundary to be a sharp inequality, which is precisely why running real rocks through it is instructive: the cases where the sharp rule feels arbitrary are exactly the cases where nature is continuous and the nomenclature is discrete.

## Model description

The playground implements the three grammars as pure functions (`classifyIgneous`, `classifySedimentary`, `classifyMetamorphic`) that take a parameter vector and return a single rock plus a human-readable derivation ("why"). The functions are deterministic and side-effect-free, so the same input always yields the same name. An atlas view exposes the full terminal vocabulary (the rock database with descriptions, mineralogy and neighbours), and a rock-cycle view draws curated transformation edges (weathering, lithification, metamorphism, melting) between named rocks.

## Results and calibration

Because the grammar is deterministic, calibration is exact rather than statistical. Seven canonical specimens are fixed by their textbook diagnostic properties and run through the live classifier:

- granite from 72% silica + plutonic texture;
- basalt from 49% silica + volcanic texture;
- dunite from 40% silica + 95% olivine mode;
- sandstone from clastic + sand-sized + well-sorted;
- limestone from chemical + carbonate + no modifiers;
- schist from pelitic protolith at medium grade;
- eclogite from mafic protolith at high pressure and high grade.

Each case checks that the classifier derives the accepted name (a boolean: 1 if correct, 0 if not), with the expected value of 1. All seven pass with zero error. This is a regression test on the grammar: if a production rule were edited so that a known specimen no longer derived to its name, the corresponding case would drop to 0 and the calibration panel would flag it. The calibration therefore certifies that the grammar reproduces standard petrology, nothing more, which is the honest scope of a deterministic classifier.

## Limitations

The model deliberately simplifies in ways the assumptions panel makes explicit. It collapses the metamorphic pressure-temperature field to a single scalar grade plus a coarse pressure regime, which cannot fully separate facies that differ by geothermal gradient. It mixes modal and bulk-chemical criteria as if the user always has both, when in fact glassy or aphanitic rocks have no measurable mode. It forces a single name where real determination often returns a qualified or hyphenated one, and its ordered fall-through can mask genuine ties. The rock-cycle graph encodes pedagogical exemplar edges, not a complete reachability matrix; the absence of an edge does not mean a transition is impossible, since over geological time the cycle is fully connected.

## References

- Philpotts, A. R. and Ague, J. J. (2011). *Principles of Igneous and Metamorphic Petrology*, 2nd ed. Cambridge University Press.
- Le Maitre, R. W. et al. (2002). *Igneous Rocks: A Classification and Glossary of Terms* (IUGS recommendations). Cambridge University Press.
- Streckeisen, A. (1976). To each plutonic rock its proper name. *Earth-Science Reviews* 12, 1 to 33.
- Wentworth, C. K. (1922). A scale of grade and class terms for clastic sediments. *Journal of Geology* 30, 377 to 392.
- Folk, R. L. (1974). *Petrology of Sedimentary Rocks*. Hemphill.
- Barrow, G. (1893). On an intrusion of muscovite-biotite gneiss and its accompanying metamorphism. *Quarterly Journal of the Geological Society* 49, 330 to 358.
- Bucher, K. and Grapes, R. (2011). *Petrogenesis of Metamorphic Rocks*, 8th ed. Springer.
