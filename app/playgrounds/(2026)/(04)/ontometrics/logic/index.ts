// ── Ontometrics ──────────────────────────────────────────────────
// A mathematization of ontology. Ontological schemes are treated
// as measurable, evaluable structures that can be underdeveloped
// (too few concepts) or overdetermined (too many categories for
// the phenomena). Users build ontologies and watch computed metrics
// classify the scheme's phase.
//
// Quality function (MDL-inspired):
//   Q(O;D) = Fit − λ·Complexity − μ·Redundancy − ν·Inconsistency − ρ·Brittleness
// ─────────────────────────────────────────────────────────────────

import type { SensitivityBar } from '@/components/SensitivityAnalysis';

// ── Types ────────────────────────────────────────────────────────

export interface Category {
    id: string;
    name: string;
    description: string;
}

export interface Relation {
    id: string;
    name: string;
    description: string;
}

export type AxiomType = 'disjoint' | 'subtype' | 'dependsOn' | 'identity';

export interface Axiom {
    id: string;
    type: AxiomType;
    left: string;
    right: string;
}

export interface OntologyCase {
    id: string;
    name: string;
    note: string;
    categoryIds: string[];
}

export interface Weights {
    complexity: number;
    redundancy: number;
    inconsistency: number;
    brittleness: number;
}

export interface OntologyState {
    categories: Category[];
    relations: Relation[];
    axioms: Axiom[];
    cases: OntologyCase[];
    weights: Weights;
    preset: PresetKey;
}

export const AXIOM_TYPES: { value: AxiomType; label: string }[] = [
    { value: 'disjoint', label: 'Disjoint' },
    { value: 'subtype', label: 'Subtype' },
    { value: 'dependsOn', label: 'Depends on' },
    { value: 'identity', label: 'Identity' },
];

export const DEFAULT_WEIGHTS: Weights = {
    complexity: 0.35,
    redundancy: 0.3,
    inconsistency: 0.45,
    brittleness: 0.25,
};


// ── Utility ──────────────────────────────────────────────────────

let _uidCounter = 0;
export function uid(prefix = 'id'): string {
    _uidCounter += 1;
    return `${prefix}_${_uidCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

function clamp(v: number, lo = 0, hi = 1): number {
    return Math.max(lo, Math.min(hi, v));
}

function jaccard(a: string[], b: string[]): number {
    const A = new Set(a);
    const B = new Set(b);
    const union = new Set([...A, ...B]);
    if (union.size === 0) return 0;
    let inter = 0;
    A.forEach(x => { if (B.has(x)) inter++; });
    return inter / union.size;
}


// ── Presets ───────────────────────────────────────────────────────

export type PresetKey = 'metaphysics' | 'mind' | 'rights' | 'particles';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    metaphysics: {
        label: 'Metaphysics',
        question: 'Can four basic categories (Object, Process, Agent, Boundary) carve a mixed domain?',
        expectation: 'Calibrated: moderate complexity with good discrimination. Some axiom tensions between boundary and object.',
    },
    mind: {
        label: 'Mind / Consciousness',
        question: 'How well does a folk-psychological ontology handle edge cases like d\u00E9j\u00E0 vu or dreams?',
        expectation: 'Tends toward underdeveloped: many cases resist clean categorization, revealing conceptual gaps.',
    },
    rights: {
        label: 'Rights / Law',
        question: 'Can Hohfeldian categories (Claim, Liberty, Power, Immunity) cover core legal cases?',
        expectation: 'Calibrated to heavy: well-designed categories with strong axiom constraints but risk of overdetermination.',
    },
    particles: {
        label: 'Particle Physics',
        question: 'Does a five-category particle ontology over- or under-determine its cases?',
        expectation: 'Calibrated: physics ontologies tend to be well-fitted, but the Higgs case creates interesting tensions.',
    },
};

export function buildPreset(key: PresetKey): OntologyState {
    switch (key) {
        case 'mind': {
            const cats: Category[] = [
                { id: uid('c'), name: 'Qualia', description: 'Subjective phenomenal experience.' },
                { id: uid('c'), name: 'Belief', description: 'Propositional attitude held as true.' },
                { id: uid('c'), name: 'Intention', description: 'Directed mental state toward action.' },
                { id: uid('c'), name: 'Representation', description: 'Mental content standing for something.' },
                { id: uid('c'), name: 'Unconscious', description: 'Process below the threshold of awareness.' },
            ];
            const byName: Record<string, string> = {};
            cats.forEach(c => { byName[c.name] = c.id; });
            return {
                preset: key,
                categories: cats,
                relations: [
                    { id: uid('r'), name: 'causes', description: 'One mental state gives rise to another.' },
                    { id: uid('r'), name: 'represents', description: 'One state stands for another.' },
                ],
                axioms: [
                    { id: uid('a'), type: 'disjoint', left: 'Qualia', right: 'Unconscious' },
                    { id: uid('a'), type: 'subtype', left: 'Belief', right: 'Representation' },
                    { id: uid('a'), type: 'dependsOn', left: 'Intention', right: 'Belief' },
                ],
                cases: [
                    { id: uid('x'), name: 'Pain perception', note: 'Paradigmatic quale with no propositional content.', categoryIds: [byName.Qualia] },
                    { id: uid('x'), name: 'D\u00E9j\u00E0 vu', note: 'Feeling of familiarity without clear source.', categoryIds: [byName.Qualia, byName.Unconscious] },
                    { id: uid('x'), name: 'Motor planning', note: 'Directed action prep, often unconscious.', categoryIds: [byName.Intention, byName.Unconscious] },
                    { id: uid('x'), name: 'Optical illusion', note: 'Misrepresentation of spatial layout.', categoryIds: [byName.Representation] },
                    { id: uid('x'), name: 'Dreaming', note: 'Hallucinatory experience during sleep.', categoryIds: [byName.Qualia, byName.Representation] },
                ],
                weights: DEFAULT_WEIGHTS,
            };
        }
        case 'rights': {
            const cats: Category[] = [
                { id: uid('c'), name: 'Claim', description: 'Right correlative with a duty in another.' },
                { id: uid('c'), name: 'Liberty', description: 'Freedom from duty; no-claim in others.' },
                { id: uid('c'), name: 'Power', description: 'Ability to alter legal relations.' },
                { id: uid('c'), name: 'Immunity', description: 'Protection from others\u2019 power.' },
            ];
            const byName: Record<string, string> = {};
            cats.forEach(c => { byName[c.name] = c.id; });
            return {
                preset: key,
                categories: cats,
                relations: [
                    { id: uid('r'), name: 'correlative', description: 'Each right has a correlative position.' },
                    { id: uid('r'), name: 'opposite', description: 'Logical opposite within the square.' },
                ],
                axioms: [
                    { id: uid('a'), type: 'disjoint', left: 'Claim', right: 'Liberty' },
                    { id: uid('a'), type: 'disjoint', left: 'Power', right: 'Immunity' },
                    { id: uid('a'), type: 'dependsOn', left: 'Claim', right: 'Power' },
                ],
                cases: [
                    { id: uid('x'), name: 'Free speech', note: 'Liberty to speak without state censorship.', categoryIds: [byName.Liberty] },
                    { id: uid('x'), name: 'Property right', note: 'Claim against trespass, power to transfer.', categoryIds: [byName.Claim, byName.Power] },
                    { id: uid('x'), name: 'Due process', note: 'Immunity from arbitrary state action.', categoryIds: [byName.Immunity, byName.Claim] },
                    { id: uid('x'), name: 'Right to asylum', note: 'Claim on state for protection.', categoryIds: [byName.Claim] },
                ],
                weights: DEFAULT_WEIGHTS,
            };
        }
        case 'particles': {
            const cats: Category[] = [
                { id: uid('c'), name: 'Fermion', description: 'Half-integer spin; obeys Pauli exclusion.' },
                { id: uid('c'), name: 'Boson', description: 'Integer spin; can occupy same state.' },
                { id: uid('c'), name: 'Lepton', description: 'Fundamental fermion not subject to strong force.' },
                { id: uid('c'), name: 'Quark', description: 'Fundamental fermion subject to strong force.' },
                { id: uid('c'), name: 'Gauge', description: 'Force-carrying boson.' },
            ];
            const byName: Record<string, string> = {};
            cats.forEach(c => { byName[c.name] = c.id; });
            return {
                preset: key,
                categories: cats,
                relations: [
                    { id: uid('r'), name: 'mediates', description: 'Bosons mediate forces between fermions.' },
                    { id: uid('r'), name: 'composed of', description: 'Hadrons are composed of quarks.' },
                ],
                axioms: [
                    { id: uid('a'), type: 'disjoint', left: 'Fermion', right: 'Boson' },
                    { id: uid('a'), type: 'disjoint', left: 'Lepton', right: 'Quark' },
                    { id: uid('a'), type: 'subtype', left: 'Lepton', right: 'Fermion' },
                    { id: uid('a'), type: 'subtype', left: 'Quark', right: 'Fermion' },
                    { id: uid('a'), type: 'subtype', left: 'Gauge', right: 'Boson' },
                ],
                cases: [
                    { id: uid('x'), name: 'Electron', note: 'Lightest charged lepton.', categoryIds: [byName.Fermion, byName.Lepton] },
                    { id: uid('x'), name: 'Photon', note: 'Electromagnetic force carrier.', categoryIds: [byName.Boson, byName.Gauge] },
                    { id: uid('x'), name: 'Neutrino', note: 'Neutral lepton; almost massless.', categoryIds: [byName.Fermion, byName.Lepton] },
                    { id: uid('x'), name: 'Higgs boson', note: 'Scalar boson; not a gauge boson.', categoryIds: [byName.Boson] },
                    { id: uid('x'), name: 'Gluon', note: 'Strong force carrier.', categoryIds: [byName.Boson, byName.Gauge] },
                ],
                weights: DEFAULT_WEIGHTS,
            };
        }
        default: {
            // Metaphysics
            const cats: Category[] = [
                { id: uid('c'), name: 'Object', description: 'Discrete enduring thing.' },
                { id: uid('c'), name: 'Process', description: 'Extended event or activity.' },
                { id: uid('c'), name: 'Agent', description: 'Capable of initiating action.' },
                { id: uid('c'), name: 'Boundary', description: 'Limit, edge, or interface.' },
            ];
            const byName: Record<string, string> = {};
            cats.forEach(c => { byName[c.name] = c.id; });
            return {
                preset: key,
                categories: cats,
                relations: [
                    { id: uid('r'), name: 'causes', description: 'One category can causally influence another.' },
                    { id: uid('r'), name: 'contains', description: 'One category can include or host another.' },
                ],
                axioms: [
                    { id: uid('a'), type: 'disjoint', left: 'Object', right: 'Process' },
                    { id: uid('a'), type: 'subtype', left: 'Agent', right: 'Object' },
                    { id: uid('a'), type: 'dependsOn', left: 'Boundary', right: 'Object' },
                ],
                cases: [
                    { id: uid('x'), name: 'Cell membrane', note: 'Boundary-like structure enabling regulation.', categoryIds: [byName.Boundary, byName.Object] },
                    { id: uid('x'), name: 'Embryogenesis', note: 'Developmental process over time.', categoryIds: [byName.Process] },
                    { id: uid('x'), name: 'Robot arm', note: 'Artifact object capable of directed action.', categoryIds: [byName.Object, byName.Agent] },
                    { id: uid('x'), name: 'Organism', note: 'Enduring thing with agency and processes.', categoryIds: [byName.Object, byName.Agent] },
                ],
                weights: DEFAULT_WEIGHTS,
            };
        }
    }
}


// ── Metrics ──────────────────────────────────────────────────────

export type Phase = 'Underdeveloped' | 'Calibrated' | 'Heavy but workable' | 'Overdetermined' | 'Brittle confusion';

export interface MdlDecomposition {
    descriptionLength: number;
    residualSurprise: number;
    total: number;
}

export interface Metrics {
    coverage: number;
    discrimination: number;
    redundancy: number;
    inconsistency: number;
    complexity: number;
    brittleness: number;
    fit: number;
    quality: number;
    structureLoad: number;
    meanAssigned: number;
    density: number;
    phase: Phase;
    phaseText: string;
    violations: string[];
    harmanIndex: number;
    mdl: MdlDecomposition;
}

export function computeMetrics(state: OntologyState): Metrics {
    const { categories, relations, axioms, cases, weights } = state;
    const totalCases = Math.max(cases.length, 1);
    const totalCats = Math.max(categories.length, 1);
    const nameToId: Record<string, string> = {};
    categories.forEach(c => { nameToId[c.name] = c.id; });

    // Coverage
    const assignedCounts = cases.map(c => c.categoryIds.length);
    const coverage = cases.length === 0 ? 0 : cases.filter(c => c.categoryIds.length > 0).length / cases.length;

    // Discrimination
    let pairCount = 0;
    let distinctPairs = 0;
    for (let i = 0; i < cases.length; i++) {
        for (let j = i + 1; j < cases.length; j++) {
            pairCount++;
            const a = new Set(cases[i].categoryIds);
            const b = new Set(cases[j].categoryIds);
            const equal = a.size === b.size && [...a].every(x => b.has(x));
            if (!equal) distinctPairs++;
        }
    }
    const discrimination = pairCount === 0 ? 1 : distinctPairs / pairCount;

    // Redundancy
    const categoryVectors = categories.map(cat => ({
        id: cat.id,
        cases: cases.filter(c => c.categoryIds.includes(cat.id)).map(c => c.id),
    }));
    let redundancyPairs = 0;
    let redundancySum = 0;
    for (let i = 0; i < categoryVectors.length; i++) {
        for (let j = i + 1; j < categoryVectors.length; j++) {
            redundancyPairs++;
            redundancySum += jaccard(categoryVectors[i].cases, categoryVectors[j].cases);
        }
    }
    const redundancy = redundancyPairs === 0 ? 0 : redundancySum / redundancyPairs;

    // Inconsistency (axiom violations)
    const violations: string[] = [];
    axioms.forEach(ax => {
        const leftId = nameToId[ax.left];
        const rightId = nameToId[ax.right];
        if (!leftId || !rightId) return;
        cases.forEach(c => {
            const hasLeft = c.categoryIds.includes(leftId);
            const hasRight = c.categoryIds.includes(rightId);
            if (ax.type === 'disjoint' && hasLeft && hasRight) {
                violations.push(`${c.name} violates disjointness: ${ax.left} / ${ax.right}`);
            }
            if (ax.type === 'subtype' && hasLeft && !hasRight) {
                violations.push(`${c.name} violates subtype: ${ax.left} should imply ${ax.right}`);
            }
            if (ax.type === 'dependsOn' && hasLeft && !hasRight) {
                violations.push(`${c.name} violates dependence: ${ax.left} depends on ${ax.right}`);
            }
            if (ax.type === 'identity' && hasLeft !== hasRight) {
                violations.push(`${c.name} violates identity: ${ax.left} should match ${ax.right}`);
            }
        });
    });
    const inconsistency = axioms.length === 0 ? 0 : clamp(violations.length / Math.max(1, axioms.length * totalCases));

    // Complexity
    const complexityRaw = categories.length * 1 + relations.length * 0.8 + axioms.length * 1.2;
    const complexity = clamp(complexityRaw / Math.max(6, cases.length * 2.5));

    // Density & mean assigned
    const totalAssigned = assignedCounts.reduce((a, b) => a + b, 0);
    const meanAssigned = assignedCounts.length === 0 ? 0 : totalAssigned / assignedCounts.length;
    const density = totalCases * totalCats === 0 ? 0 : totalAssigned / (totalCases * totalCats);

    // Brittleness
    const brittleness = clamp(0.55 * inconsistency + 0.25 * Math.max(0, complexity - 0.7) + 0.2 * Math.max(0, density - 0.45));

    // Fit
    const fit = clamp(0.55 * coverage + 0.45 * discrimination);

    // Quality
    const quality = clamp(
        fit -
        weights.complexity * complexity -
        weights.redundancy * redundancy -
        weights.inconsistency * inconsistency -
        weights.brittleness * brittleness +
        0.28,
    );

    // Structure load
    const structureLoad = clamp(0.45 * complexity + 0.25 * redundancy + 0.3 * inconsistency);

    // Phase
    let phase: Phase = 'Calibrated';
    let phaseText = 'The ontology is earning most of its structure: reasonable coverage, usable distinctions, and limited contradiction.';

    if (fit < 0.48 && structureLoad < 0.55) {
        phase = 'Underdeveloped';
        phaseText = 'Too few distinctions or too little case coverage. The ontology is underconstrained relative to the phenomena.';
    } else if (structureLoad > 0.72 && (redundancy > 0.28 || inconsistency > 0.14 || complexity > 0.82)) {
        phase = 'Overdetermined';
        phaseText = 'The ontology is carrying more structure than the current cases justify: redundancy, contradiction, or brittle over-constraint.';
    } else if (fit < 0.48 && structureLoad >= 0.55) {
        phase = 'Brittle confusion';
        phaseText = 'Constraints have been accumulated without achieving explanatory clarity. High structural cost, low discrimination.';
    } else if (fit >= 0.48 && structureLoad > 0.62) {
        phase = 'Heavy but workable';
        phaseText = 'The ontology is functioning, but it is starting to grow expensive. New categories or axioms should pay for themselves.';
    }

    // Harman index: -1 = pure undermining, +1 = pure overmining
    const subtypeCount = axioms.filter(a => a.type === 'subtype').length;
    const dependsOnCount = axioms.filter(a => a.type === 'dependsOn').length;
    const harmanTotal = subtypeCount + dependsOnCount;
    const harmanIndex = harmanTotal === 0 ? 0 : (subtypeCount - dependsOnCount) / harmanTotal;

    // MDL decomposition
    const descriptionLength = clamp(complexity * 0.6 + redundancy * 0.25 + axioms.length * 0.02);
    const residualSurprise = clamp((1 - fit) * 0.8 + inconsistency * 0.2);
    const mdl: MdlDecomposition = { descriptionLength, residualSurprise, total: descriptionLength + residualSurprise };

    return {
        coverage, discrimination, redundancy, inconsistency, complexity,
        brittleness, fit, quality, structureLoad, meanAssigned, density,
        phase, phaseText, violations, harmanIndex, mdl,
    };
}


// ── Sensitivity ──────────────────────────────────────────────────

export function computeSensitivity(state: OntologyState): SensitivityBar[] {
    const weightKeys: (keyof Weights)[] = ['complexity', 'redundancy', 'inconsistency', 'brittleness'];
    const labels: Record<string, string> = {
        complexity: '\u03BB complexity',
        redundancy: '\u03BC redundancy',
        inconsistency: '\u03BD inconsistency',
        brittleness: '\u03C1 brittleness',
    };
    const bars: SensitivityBar[] = [];
    for (const key of weightKeys) {
        const lowState = { ...state, weights: { ...state.weights, [key]: 0 } };
        const highState = { ...state, weights: { ...state.weights, [key]: 1 } };
        const lowQ = computeMetrics(lowState).quality;
        const highQ = computeMetrics(highState).quality;
        bars.push({ label: labels[key], low: lowQ * 100, high: highQ * 100 });
    }
    bars.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
    return bars;
}


// ── Narrative ────────────────────────────────────────────────────

export function computeNarrative(metrics: Metrics, state: OntologyState): string {
    const parts: string[] = [];
    parts.push(`The ontology is classified as "${metrics.phase}" with quality Q = ${(metrics.quality * 100).toFixed(0)}%.`);

    if (metrics.phase === 'Underdeveloped') {
        const unassigned = state.cases.filter(c => c.categoryIds.length === 0).length;
        if (unassigned > 0) {
            parts.push(`${unassigned} of ${state.cases.length} case${state.cases.length > 1 ? 's are' : ' is'} unassigned \u2014 the ontology cannot yet organize them.`);
        }
        if (state.categories.length < 3) {
            parts.push('Very few categories are defined. Consider whether the domain has stable differences that need new types.');
        }
    }

    if (metrics.phase === 'Overdetermined') {
        parts.push('Structure exceeds what the cases justify. Consider removing redundant categories or relaxing axioms.');
    }

    if (metrics.redundancy > 0.3) {
        parts.push(`High redundancy (${(metrics.redundancy * 100).toFixed(0)}%): some categories classify nearly the same cases. They may be collapsible.`);
    }

    if (metrics.violations.length > 0) {
        parts.push(`${metrics.violations.length} axiom violation${metrics.violations.length > 1 ? 's' : ''} detected \u2014 the extensional assignments clash with intensional constraints.`);
    }

    if (metrics.harmanIndex > 0.5) {
        parts.push('The axiom structure leans toward overmining (subtype-heavy) \u2014 entities risk being reduced to their effects and relations.');
    } else if (metrics.harmanIndex < -0.5) {
        parts.push('The axiom structure leans toward undermining (dependsOn-heavy) \u2014 entities risk being reduced to their constituent parts.');
    }

    return parts.join(' ');
}
