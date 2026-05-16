import type { AxisValues } from './model';


export type CaseKey =
    | 'odysseus'
    | 'orpheus'
    | 'gilgamesh'
    | 'aeneas'
    | 'dante'
    | 'faust'
    | 'kafka'
    | 'balzac'
    | 'musil'
    | 'sabato';

export interface NarrativeCase {
    key: CaseKey;
    label: string;
    subtitle: string;
    formula: string;
    premise: string;
    objects: string[];
    thesis: string;
    cluster: 'return' | 'descent' | 'mortality' | 'transfer' | 'cosmic-order' | 'appetite' | 'bureaucracy' | 'society' | 'possibility' | 'collapse';
    canonical: AxisValues;
    expectedObstruction: number;
}

export const CASES: Record<CaseKey, NarrativeCase> = {
    odysseus: {
        key: 'odysseus',
        label: 'Odysseus',
        subtitle: 'return against cosmic enlargement',
        cluster: 'return',
        formula: 'F(U) = locally coherent obligations under alien jurisdiction',
        premise:
            'A war veteran moves through a stratified cosmic sea. Each alien power offers an apparently larger identity. He refuses, because the Ithaca-stalk remains the only site where obligation is binding.',
        objects: [
            'Ithaca as stalk',
            'Poseidon as monodromy',
            'Calypso as false global section',
            'Sirens as lethal total information',
            'Scylla and Charybdis as forced non-neutral restriction',
        ],
        thesis:
            'Meaning survives not by becoming universal, but by refusing extension beyond the point where obligation remains answerable.',
        canonical: { locality: 85, abstraction: 75, desire: 70, institution: 35, trauma: 75, knowledge: 60 },
        expectedObstruction: 65,
    },
    orpheus: {
        key: 'orpheus',
        label: 'Orpheus',
        subtitle: 'pullback from death, failed boundary condition',
        cluster: 'descent',
        formula: 'p^*F_living to F_underworld, with boundary condition partial-look = 0',
        premise:
            'Orpheus attempts a pullback of Eurydice across the boundary between living and dead strata. The song opens a morphism, but the backward glance breaks the compatibility condition at the interface.',
        objects: [
            'Lyre as functor between worlds',
            'Eurydice as non-transportable section',
            'Hades as closed stratum',
            'The glance as forbidden transition',
            'Song as temporary equivalence of categories',
        ],
        thesis:
            'Love can open a passage between incompatible worlds, but cannot always preserve the object it tries to transport.',
        canonical: { locality: 55, abstraction: 40, desire: 90, institution: 20, trauma: 85, knowledge: 50 },
        expectedObstruction: 78,
    },
    gilgamesh: {
        key: 'gilgamesh',
        label: 'Gilgamesh',
        subtitle: 'mortality and the city',
        cluster: 'mortality',
        formula: 'Gamma(F_immortality) = empty, residue = walls(Uruk)',
        premise:
            'The king tries to globalise himself into immortality. The journey fails. What remains is a local civic residue: walls, city, the inscription of memory in stone.',
        objects: [
            'Enkidu as paired stalk',
            'Utnapishtim as boundary witness',
            'The flood as cohomological reset',
            'Uruk walls as residual section',
            'Plant of immortality as non-transportable germ',
        ],
        thesis:
            'When the search for a global section fails, what survives is the city you must return to govern.',
        canonical: { locality: 60, abstraction: 70, desire: 75, institution: 65, trauma: 70, knowledge: 55 },
        expectedObstruction: 60,
    },
    aeneas: {
        key: 'aeneas',
        label: 'Aeneas',
        subtitle: 'pushforward of Troy',
        cluster: 'transfer',
        formula: 'f_* F_Troy to F_Rome',
        premise:
            'Aeneas does not return. He carries a destroyed civilisation forward into a new base space. The pushforward preserves shape but loses fidelity to the original ground.',
        objects: [
            'Penates as portable stalk',
            'Dido as abandoned overlap',
            'Anchises as transported memory',
            'Rome as projected base space',
            'Pietas as imperial transition function',
        ],
        thesis:
            'When return is impossible, identity survives by being pushed forward into a base space that did not yet exist.',
        canonical: { locality: 35, abstraction: 80, desire: 50, institution: 80, trauma: 60, knowledge: 60 },
        expectedObstruction: 55,
    },
    dante: {
        key: 'dante',
        label: 'Dante',
        subtitle: 'stratified salvation',
        cluster: 'cosmic-order',
        formula: 'X = Hell union Purgatory union Paradise, with stratum-wise restriction',
        premise:
            'Dante moves through a perfectly stratified moral topology. Each stratum carries its own sheaf of meaning. The cosmic gluing succeeds, but only by accepting an authoritative cosmology.',
        objects: [
            'Virgil as guide through restricted strata',
            'Beatrice as morphism across the upper boundary',
            'Hell as locally inverted moral sheaf',
            'Purgatory as transition stratum',
            'Empyrean as terminal object',
        ],
        thesis:
            'A global section is possible if the universe is willing to be stratified, and if you accept the cosmology that does the stratifying.',
        canonical: { locality: 50, abstraction: 90, desire: 50, institution: 75, trauma: 55, knowledge: 85 },
        expectedObstruction: 50,
    },
    faust: {
        key: 'faust',
        label: 'Faust',
        subtitle: 'infinite extension as damnation',
        cluster: 'appetite',
        formula: 'lim F(U_i) diverges as U_i grows without bound',
        premise:
            'Faust refuses local finitude. He keeps demanding more extension, more knowledge, more experience. The limit does not converge. The self disperses across an inflating cover.',
        objects: [
            'Mephistopheles as adversarial transport',
            'Gretchen as discarded overlap',
            'The wager as anti-localising contract',
            'The moment as forbidden fixed point',
            'Salvation as deus-ex-cohomology',
        ],
        thesis:
            'A self that refuses to be local divides into incoherent pieces and cannot be reassembled without grace.',
        canonical: { locality: 20, abstraction: 85, desire: 95, institution: 30, trauma: 65, knowledge: 90 },
        expectedObstruction: 80,
    },
    kafka: {
        key: 'kafka',
        label: 'Kafka K.',
        subtitle: 'bureaucracy as inaccessible global section',
        cluster: 'bureaucracy',
        formula: 'Gamma(F_Law) exists but cannot be evaluated at any point',
        premise:
            'The Law or Castle exists as a global order, but every local restriction is partial, contradictory, or humiliating. The total section is asserted but never realised in any open set.',
        objects: [
            'The Castle as ungrounded global section',
            'The village as restricted neighborhood',
            'Officials as incompatible local trivialisations',
            'Procedure as transition function without target',
            'Naming as failed evaluation map',
        ],
        thesis:
            'A world can claim a global order that is in principle inaccessible from any local stalk. That is enough to make life unliveable.',
        canonical: { locality: 35, abstraction: 85, desire: 40, institution: 90, trauma: 70, knowledge: 60 },
        expectedObstruction: 78,
    },
    balzac: {
        key: 'balzac',
        label: 'Balzac',
        subtitle: 'society as credit, appetite, and local masks',
        cluster: 'society',
        formula: 'F(U) = roles, debts, reputations, and convertible appearances',
        premise:
            'Paris is a sheaf of social masks. Salons, boarding houses, courts, banks, bedrooms, and newspapers each carry distinct sections. Characters survive by restricting themselves differently in each.',
        objects: [
            'Paris as base space',
            'Credit as transition function',
            'Reputation as local section',
            'Money as gluing operator',
            'Ambition as unstable extension',
        ],
        thesis:
            'The modern social self is not one person. It is a family of locally compatible performances indexed by institutions of money and desire.',
        canonical: { locality: 45, abstraction: 60, desire: 85, institution: 85, trauma: 45, knowledge: 55 },
        expectedObstruction: 55,
    },
    musil: {
        key: 'musil',
        label: 'Musil',
        subtitle: 'the man without qualities as underdetermined section',
        cluster: 'possibility',
        formula: 'R-Gamma(F) = derived global self with unresolved higher ambiguity',
        premise:
            'Ulrich is not empty. He is over-possible. His local determinations do not stabilise into a final identity. Modernity multiplies compatible local descriptions while weakening necessity.',
        objects: [
            'Qualities as local trivialisations',
            'Possibility sense as derived functor',
            'Empire as failing global base',
            'Irony as obstruction detector',
            'Essayism as controlled non-closure',
        ],
        thesis:
            'Modern freedom is not mere liberation. It is a surplus of compatible but non-binding local descriptions.',
        canonical: { locality: 40, abstraction: 80, desire: 50, institution: 60, trauma: 50, knowledge: 85 },
        expectedObstruction: 65,
    },
    sabato: {
        key: 'sabato',
        label: 'Sabato',
        subtitle: 'tunnel vision, obsession, collapsed topology',
        cluster: 'collapse',
        formula: 'supp(F) included in tunnel(x), every restriction map points to one wound',
        premise:
            'Castel does not fail because there is no meaning. He fails because meaning collapses onto a single interpretive corridor. The world becomes a tunnel, and every restriction map points to the same wound.',
        objects: [
            'Tunnel as collapsed base space',
            'Obsession as overdetermined stalk',
            'Witness as impossible global verifier',
            'Jealousy as false cohomology',
            'Confession as failed descent datum',
        ],
        thesis:
            'The self becomes monstrous when local intensity masquerades as total truth.',
        canonical: { locality: 85, abstraction: 35, desire: 90, institution: 25, trauma: 95, knowledge: 35 },
        expectedObstruction: 82,
    },
};

export const CASE_KEYS: CaseKey[] = [
    'odysseus',
    'orpheus',
    'gilgamesh',
    'aeneas',
    'dante',
    'faust',
    'kafka',
    'balzac',
    'musil',
    'sabato',
];

export const CLUSTER_LABELS: Record<NarrativeCase['cluster'], string> = {
    return: 'return',
    descent: 'descent',
    mortality: 'mortality',
    transfer: 'transfer',
    'cosmic-order': 'cosmic order',
    appetite: 'infinite appetite',
    bureaucracy: 'bureaucracy',
    society: 'social gluing',
    possibility: 'over-possibility',
    collapse: 'pathological collapse',
};
