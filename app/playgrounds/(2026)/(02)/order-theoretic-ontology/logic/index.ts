export type Id = string;

export interface OntologyNode {
    id: Id;
    label: string;
    notes?: string;
}

export type RelationType =
    | 'envelops'
    | 'grounds'
    | 'depends_on'
    | 'causes'
    | 'contrasts'
    | 'is_about';

export interface Relation {
    id: Id;
    from: Id;
    to: Id;
    type: RelationType;
    strength: number;
    notes?: string;
}

export type MetaRelationType = 'supports' | 'refines' | 'contradicts' | 'explains';

export interface MetaRelation {
    id: Id;
    fromEdgeId: Id;
    toEdgeId: Id;
    type: MetaRelationType;
    strength: number;
    notes?: string;
}

export interface OntologyDataset {
    nodes: OntologyNode[];
    edges: Relation[];
    metaEdges: MetaRelation[];
}

export interface OntologyPreset {
    key: string;
    name: string;
    description: string;
    data: OntologyDataset;
}

export type SelectionKind = 'node' | 'edge' | 'meta';

export interface ViewFilters {
    showOnlyEnvelops: boolean;
    minStrength: number;
}

export interface EditorDraft {
    nodeLabel: string;
    nodeNotes: string;
    edgeFrom: Id | '';
    edgeTo: Id | '';
    edgeType: RelationType;
    edgeStrength: number;
    edgeNotes: string;
    metaFrom: Id | '';
    metaTo: Id | '';
    metaType: MetaRelationType;
    metaStrength: number;
    metaNotes: string;
    jsonDraft: string;
    jsonError: string | null;
}

export interface EnvelopeTightness {
    envId: Id;
    parentId: Id;
    childId: Id;
    parentLabel: string;
    childLabel: string;
    internal: number;
    boundary: number;
    tightness: number;
}

export interface PosetDiagnostics {
    envCount: number;
    multiParentCount: number;
    hasCycle: boolean;
    antisymViolations: Array<{
        aId: Id;
        bId: Id;
        aLabel: string;
        bLabel: string;
    }>;
}

export interface GraphNodePosition {
    x: number;
    y: number;
    layer: number;
    index: number;
}

export interface GraphLayout {
    positions: Map<Id, GraphNodePosition>;
    layers: Id[][];
    width: number;
    height: number;
    nodeWidth: number;
    nodeHeight: number;
}

export const EDGE_TYPES: RelationType[] = [
    'envelops',
    'grounds',
    'depends_on',
    'causes',
    'contrasts',
    'is_about',
];

export const META_EDGE_TYPES: MetaRelationType[] = [
    'supports',
    'refines',
    'contradicts',
    'explains',
];

export const DEFAULT_VIEW_FILTERS: ViewFilters = {
    showOnlyEnvelops: false,
    minStrength: 0,
};

export const DEFAULT_EDITOR_DRAFT: EditorDraft = {
    nodeLabel: '',
    nodeNotes: '',
    edgeFrom: '',
    edgeTo: '',
    edgeType: 'envelops',
    edgeStrength: 0.7,
    edgeNotes: '',
    metaFrom: '',
    metaTo: '',
    metaType: 'supports',
    metaStrength: 0.5,
    metaNotes: '',
    jsonDraft: '',
    jsonError: null,
};

export const RELATION_COLORS: Record<RelationType, string> = {
    envelops: '#84cc16',
    grounds: '#22d3ee',
    depends_on: '#a78bfa',
    causes: '#f59e0b',
    contrasts: '#f472b6',
    is_about: '#cbd5e1',
};

export const PRESETS: OntologyPreset[] = [
    {
        key: 'science-stack',
        name: 'Science stack',
        description: 'Mathematics -> Physics -> Chemistry -> Biology with cross-links.',
        data: {
            nodes: [
                { id: 'n_math', label: 'Mathematics' },
                { id: 'n_phys', label: 'Physics' },
                { id: 'n_chem', label: 'Chemistry' },
                { id: 'n_bio', label: 'Biology' },
                { id: 'n_mind', label: 'Mind' },
                { id: 'n_world', label: 'World' },
            ],
            edges: [
                { id: 'e_math_phys', from: 'n_math', to: 'n_phys', type: 'envelops', strength: 0.9 },
                { id: 'e_phys_chem', from: 'n_phys', to: 'n_chem', type: 'envelops', strength: 0.9 },
                { id: 'e_chem_bio', from: 'n_chem', to: 'n_bio', type: 'envelops', strength: 0.9 },
                { id: 'e_mind_about_world', from: 'n_mind', to: 'n_world', type: 'is_about', strength: 0.6 },
                { id: 'e_world_causes_bio', from: 'n_world', to: 'n_bio', type: 'causes', strength: 0.5 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_math_phys',
                    toEdgeId: 'e_phys_chem',
                    type: 'supports',
                    strength: 0.6,
                    notes: 'Math support for physics tends to support chemistry-as-physics.',
                },
            ],
        },
    },
    {
        key: 'mind-world-life',
        name: 'Mind -> World -> Life',
        description: 'Provocative nesting to stress-test closure claims.',
        data: {
            nodes: [
                { id: 'n_mind', label: 'Mind' },
                { id: 'n_world', label: 'World' },
                { id: 'n_life', label: 'Life' },
                { id: 'n_language', label: 'Language' },
                { id: 'n_attention', label: 'Attention' },
            ],
            edges: [
                { id: 'e_mind_world', from: 'n_mind', to: 'n_world', type: 'envelops', strength: 0.7 },
                { id: 'e_world_life', from: 'n_world', to: 'n_life', type: 'envelops', strength: 0.7 },
                { id: 'e_language_mind', from: 'n_language', to: 'n_mind', type: 'grounds', strength: 0.5 },
                { id: 'e_attention_mind', from: 'n_attention', to: 'n_mind', type: 'depends_on', strength: 0.4 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_language_mind',
                    toEdgeId: 'e_mind_world',
                    type: 'explains',
                    strength: 0.5,
                },
            ],
        },
    },
    {
        key: 'compute-society',
        name: 'Computation -> Institutions -> Society',
        description: 'Socio-technical nesting with explicit internal tension.',
        data: {
            nodes: [
                { id: 'n_math', label: 'Mathematics' },
                { id: 'n_comp', label: 'Computation' },
                { id: 'n_proto', label: 'Protocols' },
                { id: 'n_inst', label: 'Institutions' },
                { id: 'n_soc', label: 'Society' },
                { id: 'n_leg', label: 'Legitimacy' },
            ],
            edges: [
                { id: 'e_math_comp', from: 'n_math', to: 'n_comp', type: 'envelops', strength: 0.6 },
                { id: 'e_comp_proto', from: 'n_comp', to: 'n_proto', type: 'envelops', strength: 0.7 },
                { id: 'e_proto_inst', from: 'n_proto', to: 'n_inst', type: 'grounds', strength: 0.5 },
                { id: 'e_inst_soc', from: 'n_inst', to: 'n_soc', type: 'envelops', strength: 0.6 },
                { id: 'e_leg_inst', from: 'n_leg', to: 'n_inst', type: 'grounds', strength: 0.6 },
                { id: 'e_soc_leg', from: 'n_soc', to: 'n_leg', type: 'depends_on', strength: 0.4 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_leg_inst',
                    toEdgeId: 'e_inst_soc',
                    type: 'supports',
                    strength: 0.4,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_soc_leg',
                    toEdgeId: 'e_leg_inst',
                    type: 'contradicts',
                    strength: 0.3,
                    notes: 'Tension between top-down and bottom-up legitimacy.',
                },
            ],
        },
    },
    {
        key: 'aristotle-categories',
        name: 'Aristotle: categories',
        description: 'Substance, form, matter, and act/potency as a layered ontology.',
        data: {
            nodes: [
                { id: 'n_substance', label: 'Substance' },
                { id: 'n_quantity', label: 'Quantity' },
                { id: 'n_quality', label: 'Quality' },
                { id: 'n_relation', label: 'Relation' },
                { id: 'n_place', label: 'Place' },
                { id: 'n_time', label: 'Time' },
                { id: 'n_form', label: 'Form' },
                { id: 'n_matter', label: 'Matter' },
                { id: 'n_potentiality', label: 'Potentiality' },
                { id: 'n_actuality', label: 'Actuality' },
            ],
            edges: [
                { id: 'e_substance_quantity', from: 'n_substance', to: 'n_quantity', type: 'envelops', strength: 0.8 },
                { id: 'e_substance_quality', from: 'n_substance', to: 'n_quality', type: 'envelops', strength: 0.8 },
                { id: 'e_substance_relation', from: 'n_substance', to: 'n_relation', type: 'envelops', strength: 0.72 },
                { id: 'e_substance_place', from: 'n_substance', to: 'n_place', type: 'envelops', strength: 0.68 },
                { id: 'e_substance_time', from: 'n_substance', to: 'n_time', type: 'envelops', strength: 0.66 },
                { id: 'e_form_substance', from: 'n_form', to: 'n_substance', type: 'grounds', strength: 0.76 },
                { id: 'e_matter_substance', from: 'n_matter', to: 'n_substance', type: 'grounds', strength: 0.74 },
                { id: 'e_potentiality_matter', from: 'n_potentiality', to: 'n_matter', type: 'depends_on', strength: 0.63 },
                { id: 'e_actuality_form', from: 'n_actuality', to: 'n_form', type: 'depends_on', strength: 0.78 },
                { id: 'e_actuality_potentiality', from: 'n_actuality', to: 'n_potentiality', type: 'contrasts', strength: 0.58 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_form_substance',
                    toEdgeId: 'e_actuality_form',
                    type: 'supports',
                    strength: 0.7,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_matter_substance',
                    toEdgeId: 'e_potentiality_matter',
                    type: 'explains',
                    strength: 0.66,
                },
            ],
        },
    },
    {
        key: 'plato-divided-line',
        name: 'Plato: divided line',
        description: 'Good, forms, mathematics, and sensible appearances.',
        data: {
            nodes: [
                { id: 'n_good', label: 'Form of the Good' },
                { id: 'n_forms', label: 'Forms' },
                { id: 'n_math_objs', label: 'Mathematical objects' },
                { id: 'n_sensible', label: 'Sensible particulars' },
                { id: 'n_soul', label: 'Soul' },
                { id: 'n_dialectic', label: 'Dialectic' },
                { id: 'n_opinion', label: 'Opinion' },
                { id: 'n_knowledge', label: 'Knowledge' },
            ],
            edges: [
                { id: 'e_good_forms', from: 'n_good', to: 'n_forms', type: 'envelops', strength: 0.88 },
                { id: 'e_forms_math', from: 'n_forms', to: 'n_math_objs', type: 'envelops', strength: 0.76 },
                { id: 'e_forms_sensible', from: 'n_forms', to: 'n_sensible', type: 'grounds', strength: 0.63 },
                { id: 'e_soul_forms', from: 'n_soul', to: 'n_forms', type: 'is_about', strength: 0.69 },
                { id: 'e_dialectic_knowledge', from: 'n_dialectic', to: 'n_knowledge', type: 'causes', strength: 0.72 },
                { id: 'e_opinion_knowledge', from: 'n_opinion', to: 'n_knowledge', type: 'contrasts', strength: 0.74 },
                { id: 'e_sensible_opinion', from: 'n_sensible', to: 'n_opinion', type: 'grounds', strength: 0.62 },
                { id: 'e_math_knowledge', from: 'n_math_objs', to: 'n_knowledge', type: 'grounds', strength: 0.66 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_good_forms',
                    toEdgeId: 'e_forms_math',
                    type: 'supports',
                    strength: 0.64,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_sensible_opinion',
                    toEdgeId: 'e_math_knowledge',
                    type: 'contradicts',
                    strength: 0.43,
                },
            ],
        },
    },
    {
        key: 'kant-transcendental',
        name: 'Kant: transcendental',
        description: 'Sensibility, understanding, and the noumenon/phenomenon split.',
        data: {
            nodes: [
                { id: 'n_noumenon', label: 'Noumenon' },
                { id: 'n_phenomenon', label: 'Phenomenon' },
                { id: 'n_sensibility', label: 'Sensibility' },
                { id: 'n_understanding', label: 'Understanding' },
                { id: 'n_categories', label: 'Categories' },
                { id: 'n_intuition', label: 'Intuition' },
                { id: 'n_space_time', label: 'Space and time' },
                { id: 'n_experience', label: 'Experience' },
                { id: 'n_reason', label: 'Reason' },
            ],
            edges: [
                { id: 'e_understanding_categories', from: 'n_understanding', to: 'n_categories', type: 'envelops', strength: 0.84 },
                { id: 'e_sensibility_intuition', from: 'n_sensibility', to: 'n_intuition', type: 'envelops', strength: 0.82 },
                { id: 'e_space_time_intuition', from: 'n_space_time', to: 'n_intuition', type: 'grounds', strength: 0.86 },
                { id: 'e_categories_experience', from: 'n_categories', to: 'n_experience', type: 'grounds', strength: 0.76 },
                { id: 'e_intuition_experience', from: 'n_intuition', to: 'n_experience', type: 'grounds', strength: 0.78 },
                { id: 'e_phenomenon_experience', from: 'n_phenomenon', to: 'n_experience', type: 'envelops', strength: 0.7 },
                { id: 'e_noumenon_phenomenon', from: 'n_noumenon', to: 'n_phenomenon', type: 'contrasts', strength: 0.85 },
                { id: 'e_reason_noumenon', from: 'n_reason', to: 'n_noumenon', type: 'is_about', strength: 0.68 },
                { id: 'e_reason_understanding', from: 'n_reason', to: 'n_understanding', type: 'depends_on', strength: 0.57 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_space_time_intuition',
                    toEdgeId: 'e_intuition_experience',
                    type: 'supports',
                    strength: 0.73,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_noumenon_phenomenon',
                    toEdgeId: 'e_reason_noumenon',
                    type: 'explains',
                    strength: 0.58,
                },
            ],
        },
    },
    {
        key: 'spinoza-monism',
        name: 'Spinoza: monism',
        description: 'Single substance with attributes, modes, and parallelism.',
        data: {
            nodes: [
                { id: 'n_substance', label: 'Substance (God/Nature)' },
                { id: 'n_attributes', label: 'Attributes' },
                { id: 'n_thought', label: 'Thought' },
                { id: 'n_extension', label: 'Extension' },
                { id: 'n_modes', label: 'Modes' },
                { id: 'n_mind', label: 'Mind' },
                { id: 'n_body', label: 'Body' },
                { id: 'n_parallelism', label: 'Parallelism' },
            ],
            edges: [
                { id: 'e_substance_attributes', from: 'n_substance', to: 'n_attributes', type: 'envelops', strength: 0.9 },
                { id: 'e_attributes_thought', from: 'n_attributes', to: 'n_thought', type: 'envelops', strength: 0.78 },
                { id: 'e_attributes_extension', from: 'n_attributes', to: 'n_extension', type: 'envelops', strength: 0.78 },
                { id: 'e_substance_modes', from: 'n_substance', to: 'n_modes', type: 'causes', strength: 0.84 },
                { id: 'e_modes_mind', from: 'n_modes', to: 'n_mind', type: 'envelops', strength: 0.62 },
                { id: 'e_modes_body', from: 'n_modes', to: 'n_body', type: 'envelops', strength: 0.62 },
                { id: 'e_thought_mind', from: 'n_thought', to: 'n_mind', type: 'grounds', strength: 0.75 },
                { id: 'e_extension_body', from: 'n_extension', to: 'n_body', type: 'grounds', strength: 0.75 },
                { id: 'e_mind_body_parallel', from: 'n_mind', to: 'n_body', type: 'contrasts', strength: 0.41 },
                { id: 'e_parallelism_mind_body', from: 'n_parallelism', to: 'n_mind', type: 'is_about', strength: 0.58 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_thought_mind',
                    toEdgeId: 'e_extension_body',
                    type: 'refines',
                    strength: 0.55,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_substance_modes',
                    toEdgeId: 'e_modes_mind',
                    type: 'supports',
                    strength: 0.67,
                },
            ],
        },
    },
    {
        key: 'heidegger-dasein',
        name: 'Heidegger: Dasein',
        description: 'Being-in-the-world, care, temporality, and existential structure.',
        data: {
            nodes: [
                { id: 'n_being', label: 'Being' },
                { id: 'n_dasein', label: 'Dasein' },
                { id: 'n_worldhood', label: 'Worldhood' },
                { id: 'n_ready', label: 'Ready-to-hand' },
                { id: 'n_present', label: 'Present-at-hand' },
                { id: 'n_temporality', label: 'Temporality' },
                { id: 'n_care', label: 'Care' },
                { id: 'n_mood', label: 'Mood' },
                { id: 'n_understanding', label: 'Understanding' },
            ],
            edges: [
                { id: 'e_being_dasein', from: 'n_being', to: 'n_dasein', type: 'envelops', strength: 0.73 },
                { id: 'e_dasein_worldhood', from: 'n_dasein', to: 'n_worldhood', type: 'envelops', strength: 0.82 },
                { id: 'e_worldhood_ready', from: 'n_worldhood', to: 'n_ready', type: 'envelops', strength: 0.71 },
                { id: 'e_worldhood_present', from: 'n_worldhood', to: 'n_present', type: 'envelops', strength: 0.67 },
                { id: 'e_ready_present', from: 'n_ready', to: 'n_present', type: 'contrasts', strength: 0.76 },
                { id: 'e_dasein_care', from: 'n_dasein', to: 'n_care', type: 'grounds', strength: 0.81 },
                { id: 'e_temporality_care', from: 'n_temporality', to: 'n_care', type: 'grounds', strength: 0.79 },
                { id: 'e_mood_care', from: 'n_mood', to: 'n_care', type: 'depends_on', strength: 0.57 },
                { id: 'e_understanding_care', from: 'n_understanding', to: 'n_care', type: 'depends_on', strength: 0.57 },
                { id: 'e_dasein_being', from: 'n_dasein', to: 'n_being', type: 'is_about', strength: 0.61 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_temporality_care',
                    toEdgeId: 'e_dasein_care',
                    type: 'supports',
                    strength: 0.74,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_ready_present',
                    toEdgeId: 'e_worldhood_ready',
                    type: 'refines',
                    strength: 0.48,
                },
            ],
        },
    },
];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }
    const cleaned = value.trim();
    return cleaned.length > 0 ? cleaned : undefined;
}

function includesRelationType(value: string): value is RelationType {
    return EDGE_TYPES.includes(value as RelationType);
}

function includesMetaType(value: string): value is MetaRelationType {
    return META_EDGE_TYPES.includes(value as MetaRelationType);
}

export function clamp01(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export function uid(prefix = 'id'): Id {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function nextNodeId(nodes: OntologyNode[]): Id {
    let maxSeen = 0;

    for (const node of nodes) {
        const match = /^n(\d+)$/.exec(node.id);
        if (!match) {
            continue;
        }

        const numeric = Number.parseInt(match[1], 10);
        if (!Number.isNaN(numeric)) {
            maxSeen = Math.max(maxSeen, numeric);
        }
    }

    return `n${maxSeen + 1}`;
}

export function edgeLabel(type: RelationType): string {
    if (type === 'depends_on') {
        return 'depends on';
    }
    if (type === 'is_about') {
        return 'is about';
    }
    return type;
}

export function metaEdgeLabel(type: MetaRelationType): string {
    return type;
}

export function formatPercent(value: number): string {
    const pct = Math.round(clamp01(value) * 1000) / 10;
    return `${pct}%`;
}

export function cloneDataset(dataset: OntologyDataset): OntologyDataset {
    return {
        nodes: dataset.nodes.map((node) => ({ ...node })),
        edges: dataset.edges.map((edge) => ({ ...edge })),
        metaEdges: dataset.metaEdges.map((meta) => ({ ...meta })),
    };
}

export function indexNodes(nodes: OntologyNode[]): Map<Id, OntologyNode> {
    const map = new Map<Id, OntologyNode>();
    for (const node of nodes) {
        map.set(node.id, node);
    }
    return map;
}

export function indexEdges(edges: Relation[]): Map<Id, Relation> {
    const map = new Map<Id, Relation>();
    for (const edge of edges) {
        map.set(edge.id, edge);
    }
    return map;
}

export function parseDatasetFromJson(jsonText: string): OntologyDataset {
    let parsedUnknown: unknown;
    try {
        parsedUnknown = JSON.parse(jsonText);
    } catch {
        throw new Error('Invalid JSON.');
    }

    if (!isRecord(parsedUnknown)) {
        throw new Error('JSON root must be an object.');
    }

    const rawNodes = parsedUnknown.nodes;
    const rawEdges = parsedUnknown.edges;
    const rawMeta = parsedUnknown.metaEdges;

    if (!Array.isArray(rawNodes) || !Array.isArray(rawEdges) || !Array.isArray(rawMeta)) {
        throw new Error('JSON must include arrays: nodes, edges, and metaEdges.');
    }

    const nodes: OntologyNode[] = rawNodes.map((entry, index) => {
        if (!isRecord(entry)) {
            throw new Error(`Node at index ${index} must be an object.`);
        }
        if (typeof entry.id !== 'string' || entry.id.trim().length === 0) {
            throw new Error(`Node at index ${index} has an invalid id.`);
        }
        if (typeof entry.label !== 'string' || entry.label.trim().length === 0) {
            throw new Error(`Node at index ${index} has an invalid label.`);
        }

        return {
            id: entry.id,
            label: entry.label.trim(),
            notes: optionalString(entry.notes),
        };
    });

    const nodeIds = new Set<Id>();
    for (const node of nodes) {
        if (nodeIds.has(node.id)) {
            throw new Error(`Duplicate node id: ${node.id}`);
        }
        nodeIds.add(node.id);
    }

    const edges: Relation[] = rawEdges.map((entry, index) => {
        if (!isRecord(entry)) {
            throw new Error(`Edge at index ${index} must be an object.`);
        }
        if (typeof entry.id !== 'string' || entry.id.trim().length === 0) {
            throw new Error(`Edge at index ${index} has an invalid id.`);
        }
        if (typeof entry.from !== 'string' || typeof entry.to !== 'string') {
            throw new Error(`Edge at index ${index} must have string endpoints.`);
        }
        if (typeof entry.type !== 'string' || !includesRelationType(entry.type)) {
            throw new Error(`Edge at index ${index} has an invalid type.`);
        }
        if (typeof entry.strength !== 'number' || Number.isNaN(entry.strength)) {
            throw new Error(`Edge at index ${index} has an invalid strength.`);
        }

        return {
            id: entry.id,
            from: entry.from,
            to: entry.to,
            type: entry.type,
            strength: clamp01(entry.strength),
            notes: optionalString(entry.notes),
        };
    });

    const edgeIds = new Set<Id>();
    for (const edge of edges) {
        if (edgeIds.has(edge.id)) {
            throw new Error(`Duplicate edge id: ${edge.id}`);
        }
        edgeIds.add(edge.id);

        if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
            throw new Error(`Edge ${edge.id} references missing node ids.`);
        }
    }

    const metaEdges: MetaRelation[] = rawMeta.map((entry, index) => {
        if (!isRecord(entry)) {
            throw new Error(`Meta-edge at index ${index} must be an object.`);
        }
        if (typeof entry.id !== 'string' || entry.id.trim().length === 0) {
            throw new Error(`Meta-edge at index ${index} has an invalid id.`);
        }
        if (typeof entry.fromEdgeId !== 'string' || typeof entry.toEdgeId !== 'string') {
            throw new Error(`Meta-edge at index ${index} must have string edge references.`);
        }
        if (typeof entry.type !== 'string' || !includesMetaType(entry.type)) {
            throw new Error(`Meta-edge at index ${index} has an invalid type.`);
        }
        if (typeof entry.strength !== 'number' || Number.isNaN(entry.strength)) {
            throw new Error(`Meta-edge at index ${index} has an invalid strength.`);
        }

        return {
            id: entry.id,
            fromEdgeId: entry.fromEdgeId,
            toEdgeId: entry.toEdgeId,
            type: entry.type,
            strength: clamp01(entry.strength),
            notes: optionalString(entry.notes),
        };
    });

    const metaIds = new Set<Id>();
    for (const meta of metaEdges) {
        if (metaIds.has(meta.id)) {
            throw new Error(`Duplicate meta-edge id: ${meta.id}`);
        }
        metaIds.add(meta.id);

        if (!edgeIds.has(meta.fromEdgeId) || !edgeIds.has(meta.toEdgeId)) {
            throw new Error(`Meta-edge ${meta.id} references missing edge ids.`);
        }
    }

    return { nodes, edges, metaEdges };
}

export function computeEnvelopMaps(nodes: OntologyNode[], edges: Relation[]) {
    const parents = new Map<Id, Id[]>();
    const children = new Map<Id, Id[]>();

    for (const node of nodes) {
        parents.set(node.id, []);
        children.set(node.id, []);
    }

    for (const edge of edges) {
        if (edge.type !== 'envelops') {
            continue;
        }

        if (!parents.has(edge.to) || !children.has(edge.from)) {
            continue;
        }

        parents.get(edge.to)?.push(edge.from);
        children.get(edge.from)?.push(edge.to);
    }

    const multiParentIds = nodes
        .filter((node) => (parents.get(node.id)?.length ?? 0) > 1)
        .map((node) => node.id);

    return { parents, children, multiParentIds };
}

export function detectEnvelopCycle(nodes: OntologyNode[], edges: Relation[]): boolean {
    const adjacency = new Map<Id, Id[]>();

    for (const node of nodes) {
        adjacency.set(node.id, []);
    }

    for (const edge of edges) {
        if (edge.type !== 'envelops') {
            continue;
        }
        adjacency.get(edge.from)?.push(edge.to);
    }

    const visited = new Set<Id>();
    const inStack = new Set<Id>();

    const visit = (nodeId: Id): boolean => {
        visited.add(nodeId);
        inStack.add(nodeId);

        const next = adjacency.get(nodeId) ?? [];
        for (const targetId of next) {
            if (!visited.has(targetId) && visit(targetId)) {
                return true;
            }
            if (inStack.has(targetId)) {
                return true;
            }
        }

        inStack.delete(nodeId);
        return false;
    };

    for (const node of nodes) {
        if (!visited.has(node.id) && visit(node.id)) {
            return true;
        }
    }

    return false;
}

export function computeDepths(nodes: OntologyNode[], edges: Relation[]) {
    const { parents, children, multiParentIds } = computeEnvelopMaps(nodes, edges);
    const depth = new Map<Id, number>();

    for (const node of nodes) {
        depth.set(node.id, 0);
    }

    const envEdges = edges.filter((edge) => edge.type === 'envelops');
    for (let i = 0; i < nodes.length; i += 1) {
        let changed = false;
        for (const edge of envEdges) {
            const dFrom = depth.get(edge.from) ?? 0;
            const dTo = depth.get(edge.to) ?? 0;
            const nextDepth = dFrom + 1;

            if (nextDepth > dTo) {
                depth.set(edge.to, nextDepth);
                changed = true;
            }
        }

        if (!changed) {
            break;
        }
    }

    let maxDepth = 0;
    for (const value of depth.values()) {
        maxDepth = Math.max(maxDepth, value);
    }

    return { depth, maxDepth, parents, children, multiParentIds };
}

export function transitiveClosure(nodes: OntologyNode[], edges: Relation[]) {
    const ids = nodes.map((node) => node.id);
    const idToIndex = new Map<Id, number>();

    ids.forEach((id, index) => {
        idToIndex.set(id, index);
    });

    const size = nodes.length;
    const reach: boolean[][] = Array.from(
        { length: size },
        () => Array.from({ length: size }, () => false),
    );

    for (const edge of edges) {
        if (edge.type !== 'envelops') {
            continue;
        }

        const fromIndex = idToIndex.get(edge.from);
        const toIndex = idToIndex.get(edge.to);

        if (fromIndex === undefined || toIndex === undefined) {
            continue;
        }

        reach[fromIndex][toIndex] = true;
    }

    for (let k = 0; k < size; k += 1) {
        for (let i = 0; i < size; i += 1) {
            if (!reach[i][k]) {
                continue;
            }
            for (let j = 0; j < size; j += 1) {
                reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]);
            }
        }
    }

    return { ids, idToIndex, reach };
}

export function descendantsOf(startId: Id, children: Map<Id, Id[]>): Set<Id> {
    const out = new Set<Id>();
    const stack: Id[] = [startId];

    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
            continue;
        }

        for (const next of children.get(current) ?? []) {
            if (out.has(next)) {
                continue;
            }
            out.add(next);
            stack.push(next);
        }
    }

    return out;
}

export function computeEnvelopeTightness(dataset: OntologyDataset): EnvelopeTightness[] {
    const nodeIndex = indexNodes(dataset.nodes);
    const { children } = computeEnvelopMaps(dataset.nodes, dataset.edges);
    const envEdges = dataset.edges.filter((edge) => edge.type === 'envelops');

    const result: EnvelopeTightness[] = envEdges.map((edge) => {
        const inside = new Set<Id>([edge.to]);
        const descendants = descendantsOf(edge.to, children);

        for (const id of descendants) {
            inside.add(id);
        }

        let internal = 0;
        let boundary = 0;

        for (const relation of dataset.edges) {
            const sourceInside = inside.has(relation.from);
            const targetInside = inside.has(relation.to);

            if (sourceInside && targetInside) {
                internal += 1;
            } else if (sourceInside !== targetInside) {
                boundary += 1;
            }
        }

        const total = internal + boundary;
        const tightness = total === 0 ? 1 : internal / total;

        return {
            envId: edge.id,
            parentId: edge.from,
            childId: edge.to,
            parentLabel: nodeIndex.get(edge.from)?.label ?? edge.from,
            childLabel: nodeIndex.get(edge.to)?.label ?? edge.to,
            internal,
            boundary,
            tightness,
        };
    });

    result.sort((a, b) => a.tightness - b.tightness);
    return result;
}

export function computePosetDiagnostics(dataset: OntologyDataset): PosetDiagnostics {
    const nodeIndex = indexNodes(dataset.nodes);
    const envEdges = dataset.edges.filter((edge) => edge.type === 'envelops');
    const { multiParentIds } = computeEnvelopMaps(dataset.nodes, dataset.edges);
    const { reach } = transitiveClosure(dataset.nodes, dataset.edges);

    const antisymViolations: PosetDiagnostics['antisymViolations'] = [];

    for (let i = 0; i < dataset.nodes.length; i += 1) {
        for (let j = i + 1; j < dataset.nodes.length; j += 1) {
            if (reach[i][j] && reach[j][i]) {
                const a = dataset.nodes[i];
                const b = dataset.nodes[j];

                antisymViolations.push({
                    aId: a.id,
                    bId: b.id,
                    aLabel: nodeIndex.get(a.id)?.label ?? a.id,
                    bLabel: nodeIndex.get(b.id)?.label ?? b.id,
                });
            }
        }
    }

    return {
        envCount: envEdges.length,
        multiParentCount: multiParentIds.length,
        hasCycle: detectEnvelopCycle(dataset.nodes, dataset.edges),
        antisymViolations,
    };
}

export function filterVisibleEdges(edges: Relation[], filters: ViewFilters): Relation[] {
    return edges
        .filter((edge) => (filters.showOnlyEnvelops ? edge.type === 'envelops' : true))
        .filter((edge) => edge.strength >= filters.minStrength);
}

export function buildGraphLayout(dataset: OntologyDataset): GraphLayout {
    const { depth, maxDepth } = computeDepths(dataset.nodes, dataset.edges);
    const nodeWidth = 180;
    const nodeHeight = 50;
    const padX = 44;
    const padY = 34;
    const colGap = 290;
    const rowGap = 102;

    const layerCount = Math.max(1, maxDepth + 1);
    const layers: Id[][] = Array.from({ length: layerCount }, () => []);

    for (const node of dataset.nodes) {
        const rawLayer = depth.get(node.id) ?? 0;
        const layer = Math.max(0, Math.min(layerCount - 1, rawLayer));
        layers[layer].push(node.id);
    }

    const nodeIndex = indexNodes(dataset.nodes);
    for (const layer of layers) {
        layer.sort((a, b) => {
            const aLabel = nodeIndex.get(a)?.label ?? a;
            const bLabel = nodeIndex.get(b)?.label ?? b;
            return aLabel.localeCompare(bLabel);
        });
    }

    const positions = new Map<Id, GraphNodePosition>();
    layers.forEach((layer, layerIndex) => {
        layer.forEach((id, rowIndex) => {
            positions.set(id, {
                x: padX + layerIndex * colGap,
                y: padY + rowIndex * rowGap,
                layer: layerIndex,
                index: rowIndex,
            });
        });
    });

    let maxRows = 1;
    for (const layer of layers) {
        maxRows = Math.max(maxRows, layer.length);
    }

    const width = padX * 2 + (layerCount - 1) * colGap + nodeWidth;
    const height = Math.max(320, padY * 2 + (maxRows - 1) * rowGap + nodeHeight);

    return {
        positions,
        layers,
        width,
        height,
        nodeWidth,
        nodeHeight,
    };
}

export function relationDash(type: RelationType): string | undefined {
    if (type === 'contrasts') {
        return '7 5';
    }
    if (type === 'is_about') {
        return '3 5';
    }
    return undefined;
}
