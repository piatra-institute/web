// ── Morphospace Engine ───────────────────────────────────────────
// A node-graph morphogenesis lab inspired by Michael Levin's
// "Platonic space" and Alicia Juarrero's constraint theory.
// Nodes (seeds, fields, constraints, constants, attractors,
// observations) compose into a directed graph whose combined
// effect generates a 2D morphology field. Metrics quantify
// emergent structure: coherence, center/edge bias, swirl,
// mathematical-constant leakage, and morphological class.
// ─────────────────────────────────────────────────────────────────

import type { SensitivityBar } from '@/components/SensitivityAnalysis';

// ── Constants ────────────────────────────────────────────────────

export const FIELD_RESOLUTION = 28;

export const MATH_CONSTANTS: Record<string, number> = {
    e: Math.E,
    phi: (1 + Math.sqrt(5)) / 2,
    pi: Math.PI,
    delta: 4.669201609,
    silver: 1 + Math.sqrt(2),
};

export const CONSTANT_LABELS: Record<string, string> = {
    e: 'e',
    phi: '\u03C6',
    pi: '\u03C0',
    delta: '\u03B4 (Feigenbaum)',
    silver: 'silver ratio',
};

export const ANIMATION_TOTAL_FRAMES = 70;

// ── Types ────────────────────────────────────────────────────────

export type NodeType = 'seed' | 'field' | 'constraint' | 'constant' | 'attractor' | 'observation';

export interface SeedParams {
    strength: number;
    radius: number;
    phase: number;
    frequency: number;
    polarity: number;
}

export interface FieldParams {
    strength: number;
    axis: 'radial' | 'horizontal' | 'vertical' | 'spiral';
    frequency: number;
    turbulence: number;
    curvature: number;
}

export interface ConstraintParams {
    strength: number;
    mode: 'ring' | 'stripe' | 'spiral';
    width: number;
    sharpness: number;
    offset: number;
}

export interface ConstantParams {
    strength: number;
    constant: string;
    mitigation: number;
    phase: number;
    ingress: number;
}

export interface AttractorParams {
    strength: number;
    memory: number;
    gain: number;
    asymmetry: number;
}

export interface ObservationParams {
    strength: number;
    sensitivity: number;
    aperture: number;
}

export type NodeParams = SeedParams | FieldParams | ConstraintParams | ConstantParams | AttractorParams | ObservationParams;

export interface GraphNode {
    id: string;
    type: NodeType;
    label: string;
    x: number;
    y: number;
    params: NodeParams;
}

export interface Edge {
    id: string;
    from: string;
    to: string;
    weight: number;
}

export interface Graph {
    nodes: GraphNode[];
    edges: Edge[];
}

export type PresetKey = 'e-mitigation' | 'feigenbaum-ladder' | 'outside-ingressed' | 'golden-spiral' | 'constraint-garden' | 'dual-basin' | 'resonance-cascade';

export const PRESET_DESCRIPTIONS: Record<PresetKey, { label: string; question: string; expectation: string }> = {
    'e-mitigation': {
        label: 'e-mitigating moat',
        question: 'Can a constraint ring absorb or redirect the influence of e as a forcing term?',
        expectation: 'The ring constraint channels seed energy around the constant node, raising e-mitigation while preserving core morphology.',
    },
    'feigenbaum-ladder': {
        label: 'Feigenbaum ladder',
        question: 'What happens when the Feigenbaum constant drives period-doubling cascades in a constrained field?',
        expectation: 'Striped corridors emerge as the period-locking gate constrains the cascade basin, producing striped or lattice morphologies.',
    },
    'outside-ingressed': {
        label: 'outside / ingressed',
        question: 'How do two mathematical constants interact when mediated by a spiral boundary membrane?',
        expectation: 'The spiral constraint creates a boundary between inner and outer forcing terms, producing spiral membrane or amoeboid patterns depending on ingress balance.',
    },
    'golden-spiral': {
        label: 'golden spiral',
        question: 'Can the golden ratio organize a morphology into spiral coherence through a single field-attractor loop?',
        expectation: 'A spiral field driven by \u03C6 with high ingress and low mitigation produces a spiral membrane phenotype with elevated swirl and coherence.',
    },
    'constraint-garden': {
        label: 'constraint garden',
        question: 'How do multiple constraints of different modes interact to sculpt a single seed impulse?',
        expectation: 'Three constraints (ring, stripe, spiral) create a complex channeling landscape that fragments and reorganizes the seed, demonstrating Juarrero\u2019s constraint causation.',
    },
    'dual-basin': {
        label: 'dual basin',
        question: 'What pattern emerges when two attractor basins compete for dominance over a shared field?',
        expectation: 'The morphology splits into competing domains; the balance between attractor memory and gain determines whether a core organoid or ring shell wins.',
    },
    'resonance-cascade': {
        label: 'resonance cascade',
        question: 'What interference patterns form when \u03C0, e, and \u03B4 are simultaneously projected into the same field?',
        expectation: 'The three constants create rich interference, producing amoeboid turbulence or metastable lattice depending on relative mitigation levels.',
    },
};

export interface TypeMeta {
    label: string;
    accent: string;
    description: string;
}

export const TYPE_META: Record<NodeType, TypeMeta> = {
    seed: {
        label: 'Seed',
        accent: 'border-cyan-500/40 bg-cyan-500/8',
        description: 'A local generative impulse \u2014 a morphogenetic invitation.',
    },
    field: {
        label: 'Field',
        accent: 'border-blue-500/40 bg-blue-500/8',
        description: 'A medium that distributes tendencies across the whole space.',
    },
    constraint: {
        label: 'Constraint',
        accent: 'border-amber-500/40 bg-amber-500/8',
        description: 'A Juarrero-style enabling/limiting condition that channels form.',
    },
    constant: {
        label: 'Constant',
        accent: 'border-fuchsia-500/40 bg-fuchsia-500/8',
        description: 'A trans-real mathematical forcing term: e, \u03C0, \u03C6, \u03B4, silver ratio.',
    },
    attractor: {
        label: 'Attractor',
        accent: 'border-emerald-500/40 bg-emerald-500/8',
        description: 'A recursive memory sink that thickens a nascent morphology.',
    },
    observation: {
        label: 'Observation',
        accent: 'border-rose-500/40 bg-rose-500/8',
        description: 'A probe that reads the current state without directly shaping it.',
    },
};

export const NODE_COLORS: Record<NodeType, string> = {
    seed: '#22d3ee',
    field: '#3b82f6',
    constraint: '#f59e0b',
    constant: '#d946ef',
    attractor: '#10b981',
    observation: '#f43f5e',
};


// ── Node defaults ────────────────────────────────────────────────

export function defaultParams(type: NodeType): NodeParams {
    switch (type) {
        case 'seed': return { strength: 0.9, radius: 0.28, phase: 0, frequency: 3.2, polarity: 0.2 };
        case 'field': return { strength: 0.75, axis: 'radial', frequency: 4.4, turbulence: 0.3, curvature: 0.45 };
        case 'constraint': return { strength: 0.68, mode: 'ring', width: 0.18, sharpness: 0.65, offset: 0.48 };
        case 'constant': return { strength: 0.76, constant: 'e', mitigation: 0.42, phase: 0, ingress: 0.5 };
        case 'attractor': return { strength: 0.58, memory: 0.72, gain: 1.25, asymmetry: 0.12 };
        case 'observation': return { strength: 0.6, sensitivity: 0.85, aperture: 0.22 };
    }
}


// ── Utility ──────────────────────────────────────────────────────

let _uidCounter = 0;
export function uid(prefix = 'id'): string {
    _uidCounter += 1;
    return `${prefix}_${_uidCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function resetUid() { _uidCounter = 0; }

function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
    return t * t * (3 - 2 * t);
}

function gaussian(distance: number, radius: number): number {
    const r = Math.max(radius, 0.001);
    return Math.exp(-(distance * distance) / (2 * r * r));
}


// ── Node factory ─────────────────────────────────────────────────

export function createNode(type: NodeType, x: number, y: number, label?: string): GraphNode {
    return {
        id: uid(type),
        type,
        label: label || TYPE_META[type].label,
        x,
        y,
        params: defaultParams(type),
    };
}


// ── Presets ───────────────────────────────────────────────────────

const CANVAS_W = 980;
const CANVAS_H = 560;

export function buildPreset(name: PresetKey): Graph {
    if (name === 'feigenbaum-ladder') {
        const seed = createNode('seed', 170, 180, 'Initial disturbance');
        (seed.params as SeedParams).frequency = 2.8;
        (seed.params as SeedParams).radius = 0.23;

        const field = createNode('field', 360, 160, 'Recursive field');
        (field.params as FieldParams).axis = 'horizontal';
        (field.params as FieldParams).frequency = 7.4;
        (field.params as FieldParams).turbulence = 0.16;

        const constant = createNode('constant', 570, 180, '\u03B4 forcing');
        (constant.params as ConstantParams).constant = 'delta';
        (constant.params as ConstantParams).mitigation = 0.22;
        (constant.params as ConstantParams).ingress = 0.7;

        const constraint = createNode('constraint', 520, 370, 'Period-locking gate');
        (constraint.params as ConstraintParams).mode = 'stripe';
        (constraint.params as ConstraintParams).width = 0.12;
        (constraint.params as ConstraintParams).offset = 0.22;
        (constraint.params as ConstraintParams).sharpness = 0.78;

        const attractor = createNode('attractor', 740, 320, 'Cascade basin');
        (attractor.params as AttractorParams).memory = 0.88;
        (attractor.params as AttractorParams).gain = 1.46;

        const observation = createNode('observation', 880, 180, 'Readout');

        return {
            nodes: [seed, field, constant, constraint, attractor, observation],
            edges: [
                { id: uid('edge'), from: seed.id, to: field.id, weight: 0.82 },
                { id: uid('edge'), from: field.id, to: constant.id, weight: 0.76 },
                { id: uid('edge'), from: constraint.id, to: constant.id, weight: 0.92 },
                { id: uid('edge'), from: constant.id, to: attractor.id, weight: 0.78 },
                { id: uid('edge'), from: attractor.id, to: observation.id, weight: 0.7 },
            ],
        };
    }

    if (name === 'outside-ingressed') {
        const seedA = createNode('seed', 220, 160, 'Inner invitation');
        (seedA.params as SeedParams).frequency = 4.8;
        (seedA.params as SeedParams).phase = 0.8;

        const seedB = createNode('seed', 250, 410, 'Outer remainder');
        (seedB.params as SeedParams).frequency = 2.2;
        (seedB.params as SeedParams).polarity = -0.35;

        const field = createNode('field', 430, 290, 'Immersion field');
        (field.params as FieldParams).axis = 'spiral';
        (field.params as FieldParams).frequency = 3.6;
        (field.params as FieldParams).turbulence = 0.44;

        const constantE = createNode('constant', 640, 150, 'e leakage');
        (constantE.params as ConstantParams).constant = 'e';
        (constantE.params as ConstantParams).mitigation = 0.58;
        (constantE.params as ConstantParams).ingress = 0.8;

        const constantPhi = createNode('constant', 660, 420, '\u03C6 echo');
        (constantPhi.params as ConstantParams).constant = 'phi';
        (constantPhi.params as ConstantParams).mitigation = 0.18;

        const constraint = createNode('constraint', 560, 290, 'Boundary membrane');
        (constraint.params as ConstraintParams).mode = 'spiral';
        (constraint.params as ConstraintParams).width = 0.19;
        (constraint.params as ConstraintParams).sharpness = 0.61;

        const observation = createNode('observation', 880, 290, 'Boundary probe');

        return {
            nodes: [seedA, seedB, field, constantE, constantPhi, constraint, observation],
            edges: [
                { id: uid('edge'), from: seedA.id, to: field.id, weight: 0.75 },
                { id: uid('edge'), from: seedB.id, to: field.id, weight: 0.55 },
                { id: uid('edge'), from: field.id, to: constantE.id, weight: 0.8 },
                { id: uid('edge'), from: field.id, to: constantPhi.id, weight: 0.68 },
                { id: uid('edge'), from: constraint.id, to: constantE.id, weight: 0.92 },
                { id: uid('edge'), from: constantE.id, to: observation.id, weight: 0.72 },
                { id: uid('edge'), from: constantPhi.id, to: observation.id, weight: 0.58 },
            ],
        };
    }

    if (name === 'golden-spiral') {
        const seed = createNode('seed', 160, 280, 'Spiral seed');
        (seed.params as SeedParams).frequency = 5.2;
        (seed.params as SeedParams).radius = 0.35;
        (seed.params as SeedParams).polarity = 0.45;

        const field = createNode('field', 380, 260, 'Spiral medium');
        (field.params as FieldParams).axis = 'spiral';
        (field.params as FieldParams).frequency = 3.8;
        (field.params as FieldParams).turbulence = 0.12;
        (field.params as FieldParams).curvature = 0.85;

        const constant = createNode('constant', 590, 200, '\u03C6 pressure');
        (constant.params as ConstantParams).constant = 'phi';
        (constant.params as ConstantParams).mitigation = 0.15;
        (constant.params as ConstantParams).ingress = 0.9;
        (constant.params as ConstantParams).phase = 1.2;

        const attractor = createNode('attractor', 620, 400, 'Spiral basin');
        (attractor.params as AttractorParams).memory = 0.82;
        (attractor.params as AttractorParams).gain = 1.35;
        (attractor.params as AttractorParams).asymmetry = 0.55;

        const observation = createNode('observation', 850, 290, 'Spiral probe');

        return {
            nodes: [seed, field, constant, attractor, observation],
            edges: [
                { id: uid('edge'), from: seed.id, to: field.id, weight: 0.9 },
                { id: uid('edge'), from: field.id, to: constant.id, weight: 0.85 },
                { id: uid('edge'), from: constant.id, to: attractor.id, weight: 0.78 },
                { id: uid('edge'), from: attractor.id, to: field.id, weight: 0.6 },
                { id: uid('edge'), from: attractor.id, to: observation.id, weight: 0.65 },
            ],
        };
    }

    if (name === 'constraint-garden') {
        const seed = createNode('seed', 140, 280, 'Generative impulse');
        (seed.params as SeedParams).frequency = 4.0;
        (seed.params as SeedParams).radius = 0.4;
        (seed.params as SeedParams).strength = 1.2;

        const ringC = createNode('constraint', 350, 160, 'Ring channel');
        (ringC.params as ConstraintParams).mode = 'ring';
        (ringC.params as ConstraintParams).width = 0.14;
        (ringC.params as ConstraintParams).sharpness = 0.9;
        (ringC.params as ConstraintParams).offset = 0.35;

        const stripeC = createNode('constraint', 370, 400, 'Stripe gate');
        (stripeC.params as ConstraintParams).mode = 'stripe';
        (stripeC.params as ConstraintParams).width = 0.1;
        (stripeC.params as ConstraintParams).sharpness = 0.72;
        (stripeC.params as ConstraintParams).offset = 0.4;

        const spiralC = createNode('constraint', 560, 280, 'Spiral weave');
        (spiralC.params as ConstraintParams).mode = 'spiral';
        (spiralC.params as ConstraintParams).width = 0.2;
        (spiralC.params as ConstraintParams).sharpness = 0.55;

        const field = createNode('field', 720, 200, 'Residual field');
        (field.params as FieldParams).axis = 'radial';
        (field.params as FieldParams).frequency = 3.0;
        (field.params as FieldParams).turbulence = 0.2;

        const observation = createNode('observation', 870, 360, 'Garden probe');

        return {
            nodes: [seed, ringC, stripeC, spiralC, field, observation],
            edges: [
                { id: uid('edge'), from: seed.id, to: ringC.id, weight: 0.88 },
                { id: uid('edge'), from: seed.id, to: stripeC.id, weight: 0.75 },
                { id: uid('edge'), from: ringC.id, to: spiralC.id, weight: 0.82 },
                { id: uid('edge'), from: stripeC.id, to: spiralC.id, weight: 0.7 },
                { id: uid('edge'), from: spiralC.id, to: field.id, weight: 0.65 },
                { id: uid('edge'), from: field.id, to: observation.id, weight: 0.6 },
            ],
        };
    }

    if (name === 'dual-basin') {
        const seed = createNode('seed', 140, 280, 'Shared source');
        (seed.params as SeedParams).frequency = 3.6;
        (seed.params as SeedParams).radius = 0.32;

        const field = createNode('field', 340, 280, 'Competition field');
        (field.params as FieldParams).axis = 'horizontal';
        (field.params as FieldParams).frequency = 2.8;
        (field.params as FieldParams).turbulence = 0.25;

        const attractorA = createNode('attractor', 560, 140, 'Basin A');
        (attractorA.params as AttractorParams).memory = 0.92;
        (attractorA.params as AttractorParams).gain = 1.6;
        (attractorA.params as AttractorParams).asymmetry = -0.4;

        const attractorB = createNode('attractor', 580, 420, 'Basin B');
        (attractorB.params as AttractorParams).memory = 0.65;
        (attractorB.params as AttractorParams).gain = 1.1;
        (attractorB.params as AttractorParams).asymmetry = 0.5;

        const constraint = createNode('constraint', 740, 280, 'Selection boundary');
        (constraint.params as ConstraintParams).mode = 'stripe';
        (constraint.params as ConstraintParams).width = 0.15;
        (constraint.params as ConstraintParams).sharpness = 0.6;
        (constraint.params as ConstraintParams).offset = 0.5;

        const observation = createNode('observation', 890, 280, 'Outcome probe');

        return {
            nodes: [seed, field, attractorA, attractorB, constraint, observation],
            edges: [
                { id: uid('edge'), from: seed.id, to: field.id, weight: 0.85 },
                { id: uid('edge'), from: field.id, to: attractorA.id, weight: 0.8 },
                { id: uid('edge'), from: field.id, to: attractorB.id, weight: 0.72 },
                { id: uid('edge'), from: attractorA.id, to: constraint.id, weight: 0.65 },
                { id: uid('edge'), from: attractorB.id, to: constraint.id, weight: 0.58 },
                { id: uid('edge'), from: constraint.id, to: observation.id, weight: 0.7 },
            ],
        };
    }

    if (name === 'resonance-cascade') {
        const seed = createNode('seed', 130, 280, 'Excitation');
        (seed.params as SeedParams).frequency = 2.5;
        (seed.params as SeedParams).radius = 0.3;

        const field = createNode('field', 320, 200, 'Interference medium');
        (field.params as FieldParams).axis = 'radial';
        (field.params as FieldParams).frequency = 5.5;
        (field.params as FieldParams).turbulence = 0.35;
        (field.params as FieldParams).curvature = 0.6;

        const constPi = createNode('constant', 530, 130, '\u03C0 resonance');
        (constPi.params as ConstantParams).constant = 'pi';
        (constPi.params as ConstantParams).mitigation = 0.3;
        (constPi.params as ConstantParams).ingress = 0.65;

        const constE = createNode('constant', 550, 290, 'e resonance');
        (constE.params as ConstantParams).constant = 'e';
        (constE.params as ConstantParams).mitigation = 0.25;
        (constE.params as ConstantParams).ingress = 0.7;
        (constE.params as ConstantParams).phase = 1.5;

        const constDelta = createNode('constant', 540, 440, '\u03B4 resonance');
        (constDelta.params as ConstantParams).constant = 'delta';
        (constDelta.params as ConstantParams).mitigation = 0.35;
        (constDelta.params as ConstantParams).ingress = 0.55;
        (constDelta.params as ConstantParams).phase = -0.8;

        const attractor = createNode('attractor', 760, 280, 'Interference sink');
        (attractor.params as AttractorParams).memory = 0.5;
        (attractor.params as AttractorParams).gain = 1.0;

        const observation = createNode('observation', 900, 280, 'Readout');

        return {
            nodes: [seed, field, constPi, constE, constDelta, attractor, observation],
            edges: [
                { id: uid('edge'), from: seed.id, to: field.id, weight: 0.88 },
                { id: uid('edge'), from: field.id, to: constPi.id, weight: 0.72 },
                { id: uid('edge'), from: field.id, to: constE.id, weight: 0.78 },
                { id: uid('edge'), from: field.id, to: constDelta.id, weight: 0.68 },
                { id: uid('edge'), from: constPi.id, to: attractor.id, weight: 0.6 },
                { id: uid('edge'), from: constE.id, to: attractor.id, weight: 0.65 },
                { id: uid('edge'), from: constDelta.id, to: attractor.id, weight: 0.55 },
                { id: uid('edge'), from: attractor.id, to: observation.id, weight: 0.7 },
            ],
        };
    }

    // Default: e-mitigation
    const seed = createNode('seed', 190, 260, 'Morphogen spark');
    (seed.params as SeedParams).frequency = 3.3;

    const field = createNode('field', 390, 230, 'Platonic medium');
    (field.params as FieldParams).axis = 'radial';
    (field.params as FieldParams).curvature = 0.7;

    const constant = createNode('constant', 620, 215, 'e pressure');
    (constant.params as ConstantParams).constant = 'e';
    (constant.params as ConstantParams).mitigation = 0.5;

    const constraint = createNode('constraint', 540, 390, 'Mitigating moat');
    (constraint.params as ConstraintParams).mode = 'ring';
    (constraint.params as ConstraintParams).width = 0.16;
    (constraint.params as ConstraintParams).sharpness = 0.82;

    const attractor = createNode('attractor', 760, 355, 'Stabilizing basin');
    (attractor.params as AttractorParams).memory = 0.76;

    const observation = createNode('observation', 885, 215, 'Phenotype probe');

    return {
        nodes: [seed, field, constant, constraint, attractor, observation],
        edges: [
            { id: uid('edge'), from: seed.id, to: field.id, weight: 0.84 },
            { id: uid('edge'), from: field.id, to: constant.id, weight: 0.76 },
            { id: uid('edge'), from: constraint.id, to: constant.id, weight: 0.95 },
            { id: uid('edge'), from: constant.id, to: attractor.id, weight: 0.72 },
            { id: uid('edge'), from: attractor.id, to: observation.id, weight: 0.68 },
        ],
    };
}


// ── Metrics ──────────────────────────────────────────────────────

export interface Metrics {
    energy: number;
    coherence: number;
    eLeakage: number;
    dLeakage: number;
    centerBias: number;
    edgeBias: number;
    anisotropy: number;
    swirl: number;
    platonicDepth: number;
    constraintIndex: number;
}

export interface ObservationReading {
    id: string;
    value: number;
    gx: number;
    gy: number;
}

export interface FieldResult {
    cells: number[];
    effective: Record<string, number>;
    metrics: Metrics;
    morphologyLabel: string;
    observationReadings: ObservationReading[];
}

export type MorphologyClass =
    | 'spiral membrane'
    | 'core-focused organoid'
    | 'ring shell'
    | 'striped corridor'
    | 'amoeboid turbulence'
    | 'metastable lattice';

function describeMorphology(m: Metrics): MorphologyClass {
    if (m.swirl > 0.56 && m.coherence > 0.52) return 'spiral membrane';
    if (m.centerBias > m.edgeBias + 0.11) return 'core-focused organoid';
    if (m.edgeBias > m.centerBias + 0.1) return 'ring shell';
    if (m.anisotropy > 0.17) return 'striped corridor';
    if (m.coherence < 0.33) return 'amoeboid turbulence';
    return 'metastable lattice';
}


// ── Field computation ────────────────────────────────────────────

export function computeField(graph: Graph, time: number): FieldResult {
    const { nodes, edges } = graph;
    const nodeLookup: Record<string, GraphNode> = {};
    nodes.forEach(n => { nodeLookup[n.id] = n; });

    // Build incoming weight tallies
    const incomingByNode: Record<string, Record<string, number>> = {};
    nodes.forEach(n => {
        incomingByNode[n.id] = { total: 0, seed: 0, field: 0, constraint: 0, constant: 0, attractor: 0, observation: 0 };
    });
    edges.forEach(e => {
        const src = nodeLookup[e.from];
        if (!src || !incomingByNode[e.to]) return;
        incomingByNode[e.to].total += e.weight;
        incomingByNode[e.to][src.type] += e.weight;
    });

    // Effective strengths (boosted by incoming)
    const effective: Record<string, number> = {};
    nodes.forEach(n => {
        const inc = incomingByNode[n.id];
        const resonance =
            inc.seed * 0.38 +
            inc.field * 0.42 +
            inc.constant * 0.31 +
            inc.attractor * 0.26 -
            inc.observation * 0.08;
        let boost = 1 + resonance;
        if (n.type === 'constraint') boost += inc.seed * 0.22 + inc.field * 0.16;
        if (n.type === 'constant') boost += inc.constraint * 0.28 + inc.field * 0.2;
        if (n.type === 'attractor') boost += inc.constant * 0.24;
        effective[n.id] = clamp((n.params as { strength: number }).strength * boost, 0.04, 1.95);
    });

    // Compute field
    const cells: number[] = [];
    let absSum = 0;
    let diffSum = 0;
    let eProjection = 0;
    let dProjection = 0;
    let centerEnergy = 0;
    let edgeEnergy = 0;
    let swirlScore = 0;
    let xStripe = 0;
    let yStripe = 0;

    const RES = FIELD_RESOLUTION;

    for (let gy = 0; gy < RES; gy++) {
        for (let gx = 0; gx < RES; gx++) {
            const x = (gx / (RES - 1)) * 2 - 1;
            const y = (gy / (RES - 1)) * 2 - 1;
            const r = Math.hypot(x, y);
            const angle = Math.atan2(y, x);

            let value = 0;
            let damping = 1;
            let membrane = 0;

            nodes.forEach(n => {
                const p = n.params;
                const eff = effective[n.id] ?? 0;
                const inc = incomingByNode[n.id];
                const pos = { x: (n.x / CANVAS_W) * 2 - 1, y: (n.y / CANVAS_H) * 2 - 1 };
                const dx = x - pos.x;
                const dy = y - pos.y;
                const d = Math.hypot(dx, dy);
                const theta = Math.atan2(dy, dx);

                if (n.type === 'seed') {
                    const sp = p as SeedParams;
                    const envelope = gaussian(d, sp.radius * 1.25);
                    const wave = Math.sin(sp.frequency * d * 5 - time + sp.phase);
                    const bias = sp.polarity * Math.cos(theta * 2 - time * 0.35);
                    value += eff * envelope * (wave + bias * 0.6);
                }

                if (n.type === 'field') {
                    const fp = p as FieldParams;
                    const radial = Math.sin(fp.frequency * d * 5 + time * 0.28);
                    const horizontal = Math.sin(fp.frequency * (x + 1) * 2.4 - time * 0.32);
                    const vertical = Math.sin(fp.frequency * (y + 1) * 2.4 + time * 0.24);
                    const spiral = Math.sin(fp.frequency * (d * 4 + theta * 0.9 + fp.curvature) - time * 0.22);
                    const axisMix = fp.axis === 'horizontal' ? horizontal
                        : fp.axis === 'vertical' ? vertical
                        : fp.axis === 'spiral' ? spiral
                        : radial;
                    const turb = fp.turbulence * Math.sin((x * y + d + theta) * 9 + time * 0.4);
                    value += eff * 0.72 * (axisMix + turb * 0.6);
                }

                if (n.type === 'constraint') {
                    const cp = p as ConstraintParams;
                    let profile = 0;
                    if (cp.mode === 'ring') {
                        profile = 1 - smoothstep(cp.width * 0.55, cp.width * 1.7, Math.abs(d - cp.offset));
                    } else if (cp.mode === 'stripe') {
                        profile = 1 - smoothstep(cp.width * 0.6, cp.width * 2.1, Math.abs(dx) - cp.offset * 0.2);
                    } else {
                        const spiralBand = Math.abs(theta - d * 7.5);
                        const wrapped = Math.min(spiralBand % (Math.PI * 2), Math.PI * 2 - (spiralBand % (Math.PI * 2)));
                        profile = 1 - smoothstep(cp.width * 2.2, cp.width * 5, wrapped);
                    }
                    const sharp = lerp(0.25, 1.4, cp.sharpness);
                    const localDamp = 1 - clamp(profile * eff * 0.32 * sharp, 0, 0.88);
                    damping *= localDamp;
                    membrane += profile * eff;
                }

                if (n.type === 'constant') {
                    const kp = p as ConstantParams;
                    const constantValue = MATH_CONSTANTS[kp.constant] ?? Math.E;
                    const localMit = clamp(kp.mitigation + inc.constraint * 0.22, 0, 0.98);
                    const localIng = clamp(kp.ingress + inc.field * 0.18 + inc.seed * 0.11, 0, 1.25);
                    const latentWave = Math.sin(constantValue * (d * 1.65 + theta * 0.35) - time * 0.25 + kp.phase);
                    const halo = gaussian(d, 0.65 + localIng * 0.12);
                    const rawPush = eff * (1 - localMit) * latentWave * halo;
                    const submergedEcho = eff * localIng * 0.24 * Math.cos(constantValue * (x * y + d) + time * 0.18);
                    value += rawPush + submergedEcho;
                    damping *= 1 - localMit * membrane * 0.06;
                }

                if (n.type === 'attractor') {
                    const ap = p as AttractorParams;
                    const basin = gaussian(d, 0.34 + ap.memory * 0.18);
                    const recur = Math.sin((x * y + ap.asymmetry) * 10 * ap.gain + time * (0.1 + ap.memory * 0.2));
                    value += eff * basin * recur * 0.7;
                    damping *= 1 - basin * ap.memory * 0.05;
                }
            });

            value *= damping;
            value = Math.tanh(value * 1.45);
            cells.push(value);

            const abs = Math.abs(value);
            absSum += abs;
            const eBasis = Math.sin(MATH_CONSTANTS.e * (r * 1.4 + angle * 0.18));
            const dBasis = Math.sin(MATH_CONSTANTS.delta * (r * 1.2 + angle * 0.32));
            eProjection += Math.abs(value * eBasis);
            dProjection += Math.abs(value * dBasis);
            if (r < 0.45) centerEnergy += abs;
            if (r > 0.68) edgeEnergy += abs;
            swirlScore += Math.abs(value * Math.sin(angle + r * 5));
            xStripe += Math.abs(value * Math.sin(x * 8));
            yStripe += Math.abs(value * Math.sin(y * 8));
        }
    }

    // Gradient coherence
    for (let gy = 0; gy < RES; gy++) {
        for (let gx = 0; gx < RES; gx++) {
            const i = gy * RES + gx;
            if (gx < RES - 1) diffSum += Math.abs(cells[i] - cells[i + 1]);
            if (gy < RES - 1) diffSum += Math.abs(cells[i] - cells[i + RES]);
        }
    }

    const totalCells = RES * RES;
    const metrics: Metrics = {
        energy: absSum / totalCells,
        coherence: clamp(1 - diffSum / (totalCells * 1.25), 0, 1),
        eLeakage: clamp(eProjection / (absSum + 1e-6), 0, 1),
        dLeakage: clamp(dProjection / (absSum + 1e-6), 0, 1),
        centerBias: clamp(centerEnergy / (absSum + 1e-6), 0, 1),
        edgeBias: clamp(edgeEnergy / (absSum + 1e-6), 0, 1),
        anisotropy: clamp(Math.abs(xStripe - yStripe) / (absSum + 1e-6), 0, 1),
        swirl: clamp(swirlScore / (absSum + 1e-6), 0, 1),
        platonicDepth: clamp(
            nodes.filter(n => n.type === 'constant' || n.type === 'field')
                .reduce((acc, n) => acc + (effective[n.id] || 0), 0) / Math.max(nodes.length, 1),
            0, 1.6,
        ),
        constraintIndex: clamp(
            nodes.filter(n => n.type === 'constraint')
                .reduce((acc, n) => acc + (effective[n.id] || 0), 0) / Math.max(nodes.length, 1),
            0, 1.6,
        ),
    };

    // Observation readings
    const observationReadings: ObservationReading[] = nodes
        .filter(n => n.type === 'observation')
        .map(n => {
            const gx = clamp(Math.round((n.x / CANVAS_W) * (RES - 1)), 0, RES - 1);
            const gy = clamp(Math.round((n.y / CANVAS_H) * (RES - 1)), 0, RES - 1);
            return { id: n.id, value: cells[gy * RES + gx] ?? 0, gx, gy };
        });

    return {
        cells,
        effective,
        metrics,
        morphologyLabel: describeMorphology(metrics),
        observationReadings,
    };
}


// ── Color mapping ────────────────────────────────────────────────

export function cellColor(value: number): string {
    const n = clamp(value, -1, 1);
    const positive = n >= 0;
    const hue = positive ? lerp(142, 84, n) : lerp(312, 266, -n);
    const sat = lerp(24, 78, Math.abs(n));
    const light = lerp(7, 48, Math.abs(n));
    return `hsl(${hue} ${sat}% ${light}%)`;
}


// ── Sensitivity ──────────────────────────────────────────────────

interface SensitivityTarget {
    label: string;
    nodeType: NodeType;
    paramKey: string;
    min: number;
    max: number;
}

const SENSITIVITY_TARGETS: SensitivityTarget[] = [
    { label: 'seed strength', nodeType: 'seed', paramKey: 'strength', min: 0.1, max: 1.8 },
    { label: 'seed frequency', nodeType: 'seed', paramKey: 'frequency', min: 0.5, max: 10 },
    { label: 'field strength', nodeType: 'field', paramKey: 'strength', min: 0.1, max: 1.8 },
    { label: 'field turbulence', nodeType: 'field', paramKey: 'turbulence', min: 0, max: 1 },
    { label: 'constraint strength', nodeType: 'constraint', paramKey: 'strength', min: 0.1, max: 1.8 },
    { label: 'constraint sharpness', nodeType: 'constraint', paramKey: 'sharpness', min: 0, max: 1 },
    { label: 'constant mitigation', nodeType: 'constant', paramKey: 'mitigation', min: 0, max: 1 },
    { label: 'constant ingress', nodeType: 'constant', paramKey: 'ingress', min: 0, max: 1 },
    { label: 'attractor memory', nodeType: 'attractor', paramKey: 'memory', min: 0, max: 1 },
    { label: 'attractor gain', nodeType: 'attractor', paramKey: 'gain', min: 0.2, max: 2 },
];

export function computeSensitivity(graph: Graph, time: number): SensitivityBar[] {
    const bars: SensitivityBar[] = [];
    for (const target of SENSITIVITY_TARGETS) {
        const targetNodes = graph.nodes.filter(n => n.type === target.nodeType);
        if (targetNodes.length === 0) continue;

        const makeVariant = (val: number): Graph => ({
            ...graph,
            nodes: graph.nodes.map(n => {
                if (n.type !== target.nodeType) return n;
                return { ...n, params: { ...n.params, [target.paramKey]: val } };
            }),
        });

        const lowResult = computeField(makeVariant(target.min), time);
        const highResult = computeField(makeVariant(target.max), time);
        bars.push({
            label: target.label,
            low: lowResult.metrics.energy,
            high: highResult.metrics.energy,
        });
    }
    bars.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
    return bars;
}


// ── Narrative ────────────────────────────────────────────────────

export function computeNarrative(field: FieldResult, graph: Graph): string {
    const m = field.metrics;
    const parts: string[] = [];

    parts.push(`The current morphology is classified as "${field.morphologyLabel}".`);

    if (m.energy < 0.15) {
        parts.push('The field is near quiescent \u2014 few nodes are actively shaping the space.');
    } else if (m.energy > 0.45) {
        parts.push('The field is energetically dense, with multiple nodes competing for dominance.');
    }

    if (m.coherence > 0.65) {
        parts.push('High coherence indicates organized, smooth spatial gradients.');
    } else if (m.coherence < 0.35) {
        parts.push('Low coherence suggests turbulent or fragmented patterning.');
    }

    const eMit = 1 - m.eLeakage;
    const dMit = 1 - m.dLeakage;
    if (eMit > 0.7) {
        parts.push(`e-mitigation is strong (${(eMit * 100).toFixed(0)}%) \u2014 constraint nodes are successfully channeling the constant's influence.`);
    } else if (eMit < 0.4) {
        parts.push(`e-mitigation is weak (${(eMit * 100).toFixed(0)}%) \u2014 the mathematical constant is leaking broadly into the morphology.`);
    }

    if (dMit > 0.7) {
        parts.push(`Feigenbaum \u03B4 is well-contained (${(dMit * 100).toFixed(0)}% mitigation).`);
    }

    if (m.swirl > 0.5) {
        parts.push('Significant rotational organization is present, likely driven by spiral field or constraint modes.');
    }

    const nConstants = graph.nodes.filter(n => n.type === 'constant').length;
    const nConstraints = graph.nodes.filter(n => n.type === 'constraint').length;
    if (nConstants > 0 && nConstraints === 0) {
        parts.push('No constraints are present to channel the mathematical forcing terms \u2014 consider adding a constraint node.');
    }

    return parts.join(' ');
}


// ── Easing ───────────────────────────────────────────────────────

export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
