import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'discrete-names-continuous-rock',
        statement:
            'rock identity is modelled as a discrete label produced by a decision tree over a small set of diagnostic axes (silica content, texture, modal mineralogy, grain size, protolith, grade, pressure). real rocks vary continuously along every axis, so the name is a partition imposed on a manifold, not a property the rock intrinsically carries.',
        citation:
            'Philpotts and Ague 2011, Principles of Igneous and Metamorphic Petrology: classification schemes are conventions chosen for utility, not natural kinds.',
        confidence: 'established',
        falsifiability:
            'a specimen sitting exactly on a field boundary (for example 63.0% silica) has no determinate name; the same rock can be classified differently by two valid schemes, which a true natural kind could not.',
    },
    {
        id: 'iugs-streckeisen-modes',
        statement:
            'igneous classification follows the IUGS / Streckeisen convention: silica percentage sets the ultramafic / mafic / intermediate / felsic band, and for ultramafic plutonic rocks the olivine, orthopyroxene and clinopyroxene modes are renormalised to 100% and read against fixed ternary field boundaries.',
        citation:
            'Le Maitre et al. 2002 (IUGS recommendations); Streckeisen 1976. the playground uses the 90% olivine and 40% olivine boundaries and the Opx:Cpx ratio splits.',
        confidence: 'established',
        falsifiability:
            'the IUGS scheme is itself a committee convention that has been revised; a future revision moving a boundary would change a rock name without changing the rock, which falsifies any claim that these lines are physical.',
    },
    {
        id: 'wentworth-grain-size',
        statement:
            'clastic sedimentary rocks are classified primarily by the Wentworth grain-size scale (clay < 0.004 mm, silt 0.004 to 0.063 mm, sand 0.063 to 2 mm, gravel > 2 mm), with secondary modifiers (fissility, rounding, feldspar content, sorting) applied within each size class.',
        citation:
            'Wentworth 1922, a scale of grade and class terms for clastic sediments; Folk 1974 for compositional modifiers.',
        confidence: 'established',
        falsifiability:
            'a poorly sorted rock spanning several Wentworth classes (for example tillite) has no single grain size, so the primary axis is undefined and a separate textural rule must override it.',
    },
    {
        id: 'protolith-plus-grade',
        statement:
            'metamorphic classification is treated as a function of protolith, metamorphic grade (a proxy for peak temperature) and pressure regime, with contact metamorphism handled as an override. the same protolith at different grade yields a different rock along a Barrovian-style sequence.',
        citation:
            'Barrow 1893; Bucher and Grapes 2011, Petrogenesis of Metamorphic Rocks: metamorphic facies are defined by P and T fields, not by a single grade number.',
        confidence: 'contested',
        falsifiability:
            'collapsing the P-T field to one scalar "grade" cannot distinguish two rocks at equal grade but different geothermal gradient (blueschist vs greenschist need the pressure axis), so grade alone is an incomplete coordinate.',
    },
    {
        id: 'deterministic-single-name',
        statement:
            'each parameter vector derives to exactly one rock: the decision tree is total and deterministic, with an ordered fall-through so the first matching rule wins. there is no probability, no mixture, and no "indeterminate" output.',
        confidence: 'contested',
        citation:
            'a modelling choice for legibility. real petrographic determination uses thin-section evidence, geochemistry and judgement, and frequently returns a hyphenated or qualified name.',
        falsifiability:
            'rule ordering can mask ambiguity: a specimen matching two criteria (vesicular and glassy, say) is forced into whichever rule is checked first, hiding that nature offered a genuine tie.',
    },
    {
        id: 'rock-cycle-edges-illustrative',
        statement:
            'the rock-cycle graph encodes a curated set of transformsTo edges (weathering, lithification, metamorphism, melting) between named rocks. these edges are pedagogical exemplars of the main pathways, not an exhaustive transition matrix over all 60+ rocks.',
        citation:
            'standard rock-cycle pedagogy (for example Marshak, Essentials of Geology). the cycle is a conceptual loop, and any rock can in principle become any other given time and conditions.',
        confidence: 'speculative',
        falsifiability:
            'the absence of an edge in the graph does not mean the transition is impossible; reading the graph as a complete reachability claim would be wrong, since the true cycle is fully connected over geological time.',
    },
    {
        id: 'modal-vs-chemical',
        statement:
            'the model mixes modal (mineral-proportion) criteria for ultramafic rocks with bulk-chemical (silica percentage) criteria for the rest, treating them as interchangeable diagnostic inputs the user supplies directly.',
        citation:
            'IUGS uses modal QAPF for phaneritic rocks and the TAS chemical diagram for volcanic / aphanitic rocks; the two systems do not always agree on the same specimen.',
        confidence: 'contested',
        falsifiability:
            'a glassy or very fine-grained rock has no measurable mode, so the modal branch is inapplicable and only chemistry can classify it; assuming the user always knows the mode breaks for natural aphanitic samples.',
    },
];
