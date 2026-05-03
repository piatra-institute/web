import { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'aura-relational',
        statement:
            'Aura is not a property of the artwork alone but a relational field over object, context, observer, and historical time.',
        citation:
            'Benjamin, 1936 — The Work of Art in the Age of Mechanical Reproduction',
        confidence: 'established',
        falsifiability:
            'Demonstrating that the perceived charge of an object is invariant under arbitrary changes of context, observer training, and provenance.',
    },
    {
        id: 'reproduction-decay',
        statement:
            'Mechanical and digital reproduction reduces aura by detaching the object from unique time, place, and tradition.',
        citation: 'Benjamin, 1936; Krauss, 1985 — The Originality of the Avant-Garde',
        confidence: 'established',
        falsifiability:
            'A rigorously controlled study showing perceived charge increases under reproduction holding all other variables constant.',
    },
    {
        id: 'cultural-capital',
        statement:
            'Institutions (museums, critics, schools, markets) actively produce symbolic value rather than merely recognizing pre-existing value.',
        citation:
            'Bourdieu, 1984 — Distinction; Bourdieu, 1993 — The Field of Cultural Production',
        confidence: 'established',
        falsifiability:
            'Demonstrating that aura attribution is stable across populations with no exposure to consecrating institutions.',
    },
    {
        id: 'fiber-bundle',
        statement:
            'Aura admits a fiber-bundle structure: each (object, context, observer, time) point in the base manifold has its own aura-state fiber.',
        citation:
            'Geometric model adapted from gauge theory; cf. Nakahara, 2003 — Geometry, Topology and Physics',
        confidence: 'speculative',
        falsifiability:
            'Empirical evidence that aura attributions cannot be coherently localized over (object, context, observer, time) tuples — requiring a non-bundled formulation.',
    },
    {
        id: 'path-dependence',
        statement:
            'Aura accumulates along the trajectory an object takes through institutions and crises, not only its present location — modeled here as holonomy.',
        citation:
            'Provenance studies in art history; cf. Yeide, Akinsha & Walsh, 2001 — AAM Guide to Provenance Research',
        confidence: 'contested',
        falsifiability:
            'Two objects with identical present states but radically different histories perceived as having identical aura by trained observers.',
    },
    {
        id: 'sheaf-incompatibility',
        statement:
            'Local aura assignments by different communities (collectors, locals, critics, the state, internet, the artist) often fail to glue into a coherent global assignment — the sheaf has nontrivial cohomology.',
        citation:
            'Inspired by Curry, 2014 — Sheaves, Cosheaves and Applications; standard observation about contested heritage objects',
        confidence: 'contested',
        falsifiability:
            'A representative survey of contested objects (colonial artifacts, religious images, etc.) showing community-level aura assignments are mutually consistent.',
    },
    {
        id: 'attractor-basins',
        statement:
            'Aura states cluster into a small number of stable regimes (sacred relic, institutional masterpiece, luxury aura, ruin aura, meme aura, synthetic novelty) that act as cultural attractors.',
        citation:
            'Heuristic clustering inspired by Bourdieu field analysis; not empirically validated as discrete basins',
        confidence: 'speculative',
        falsifiability:
            'Topological data analysis of large reception corpora finding that aura attributions form a continuous unimodal distribution rather than discrete clusters.',
    },
    {
        id: 'optimal-transport',
        statement:
            'Moving an object between aura regimes incurs cost proportional to the geometric distance between its current and target aura vector.',
        citation:
            'Analogy to Kantorovich, 1942 — Wasserstein optimal transport; cost in this model is unitless and conceptual',
        confidence: 'speculative',
        falsifiability:
            'Empirical case studies where regime transition (e.g., mass-produced object → relic) succeeds independently of accumulated provenance, ritual, or scarcity work.',
    },
    {
        id: 'observer-relativity',
        statement:
            'Different observers — by training, class position, desire, alienation — inhabit different aura fields for the same object.',
        citation:
            'Bourdieu, 1984; cf. Hall, 1973 — Encoding/Decoding for the related point about reception',
        confidence: 'established',
        falsifiability:
            'Cross-cultural studies showing aura attribution is invariant to observer position when controlling for object features.',
    },
    {
        id: 'normalized-scalars',
        statement:
            'All thirteen input parameters and all output metrics are bounded in [0, 1]. The model is qualitative, not calibrated to any empirical scale.',
        citation: 'Modeling choice for interpretability and visualization',
        confidence: 'established',
        falsifiability:
            'Not empirically falsifiable — this is a stipulated normalization. The substantive content is in the relational structure, not the absolute values.',
    },
];
