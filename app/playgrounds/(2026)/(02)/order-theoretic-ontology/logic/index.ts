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
        name: 'Mind-World-Life: inferential ecology',
        description: 'Embodiment, perception, inference, and action as a layered epistemic ontology.',
        data: {
            nodes: [
                { id: 'n_life', label: 'Life' },
                { id: 'n_world', label: 'World' },
                { id: 'n_agent', label: 'Embodied agent' },
                { id: 'n_mind', label: 'Mind' },
                { id: 'n_perception', label: 'Perception' },
                { id: 'n_attention', label: 'Attention' },
                { id: 'n_inference', label: 'Inference' },
                { id: 'n_language', label: 'Language' },
                { id: 'n_model', label: 'World-model' },
                { id: 'n_action', label: 'Action' },
            ],
            edges: [
                { id: 'e_world_life', from: 'n_world', to: 'n_life', type: 'envelops', strength: 0.86 },
                { id: 'e_life_agent', from: 'n_life', to: 'n_agent', type: 'envelops', strength: 0.82 },
                { id: 'e_agent_mind', from: 'n_agent', to: 'n_mind', type: 'envelops', strength: 0.78 },
                { id: 'e_mind_model', from: 'n_mind', to: 'n_model', type: 'envelops', strength: 0.74 },
                { id: 'e_mind_inference', from: 'n_mind', to: 'n_inference', type: 'envelops', strength: 0.72 },
                { id: 'e_world_perception', from: 'n_world', to: 'n_perception', type: 'causes', strength: 0.83 },
                { id: 'e_perception_model', from: 'n_perception', to: 'n_model', type: 'grounds', strength: 0.85 },
                { id: 'e_attention_perception', from: 'n_attention', to: 'n_perception', type: 'depends_on', strength: 0.78 },
                { id: 'e_language_inference', from: 'n_language', to: 'n_inference', type: 'grounds', strength: 0.71 },
                { id: 'e_model_world', from: 'n_model', to: 'n_world', type: 'is_about', strength: 0.79 },
                { id: 'e_inference_action', from: 'n_inference', to: 'n_action', type: 'causes', strength: 0.69 },
                { id: 'e_action_world', from: 'n_action', to: 'n_world', type: 'causes', strength: 0.57 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_world_perception',
                    toEdgeId: 'e_perception_model',
                    type: 'supports',
                    strength: 0.75,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_attention_perception',
                    toEdgeId: 'e_perception_model',
                    type: 'refines',
                    strength: 0.64,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_language_inference',
                    toEdgeId: 'e_mind_inference',
                    type: 'explains',
                    strength: 0.61,
                },
                {
                    id: 'm4',
                    fromEdgeId: 'e_inference_action',
                    toEdgeId: 'e_action_world',
                    type: 'supports',
                    strength: 0.58,
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
    {
        key: 'meinong-object-theory',
        name: 'Meinong: object theory',
        description: 'Sosein/Sein decomposition with intentional and impossible objects.',
        data: {
            nodes: [
                { id: 'n_object_domain', label: 'Object domain' },
                { id: 'n_sosein', label: 'Sosein' },
                { id: 'n_sein', label: 'Sein' },
                { id: 'n_existence', label: 'Existence' },
                { id: 'n_subsistence', label: 'Subsistence' },
                { id: 'n_absistence', label: 'Absistence' },
                { id: 'n_nuclear', label: 'Nuclear properties' },
                { id: 'n_extranuclear', label: 'Extranuclear properties' },
                { id: 'n_impossible', label: 'Impossible objects' },
                { id: 'n_intentional', label: 'Intentional object' },
            ],
            edges: [
                { id: 'e_domain_sosein', from: 'n_object_domain', to: 'n_sosein', type: 'envelops', strength: 0.89 },
                { id: 'e_domain_sein', from: 'n_object_domain', to: 'n_sein', type: 'envelops', strength: 0.82 },
                { id: 'e_sein_existence', from: 'n_sein', to: 'n_existence', type: 'envelops', strength: 0.74 },
                { id: 'e_sein_subsistence', from: 'n_sein', to: 'n_subsistence', type: 'envelops', strength: 0.71 },
                { id: 'e_existence_absistence', from: 'n_existence', to: 'n_absistence', type: 'contrasts', strength: 0.81 },
                { id: 'e_nuclear_sosein', from: 'n_nuclear', to: 'n_sosein', type: 'grounds', strength: 0.86 },
                { id: 'e_extranuclear_sein', from: 'n_extranuclear', to: 'n_sein', type: 'grounds', strength: 0.79 },
                { id: 'e_impossible_sosein', from: 'n_impossible', to: 'n_sosein', type: 'depends_on', strength: 0.77 },
                { id: 'e_intentional_impossible', from: 'n_intentional', to: 'n_impossible', type: 'is_about', strength: 0.73 },
                { id: 'e_intentional_domain', from: 'n_intentional', to: 'n_object_domain', type: 'depends_on', strength: 0.59 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_nuclear_sosein',
                    toEdgeId: 'e_impossible_sosein',
                    type: 'supports',
                    strength: 0.74,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_extranuclear_sein',
                    toEdgeId: 'e_sein_existence',
                    type: 'explains',
                    strength: 0.68,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_intentional_impossible',
                    toEdgeId: 'e_existence_absistence',
                    type: 'contradicts',
                    strength: 0.61,
                },
            ],
        },
    },
    {
        key: 'deleuze-difference-repetition',
        name: 'Deleuze: difference and repetition',
        description: 'Virtual/actual ontology with multiplicity, event, and assemblage dynamics.',
        data: {
            nodes: [
                { id: 'n_virtual', label: 'Virtual' },
                { id: 'n_actual', label: 'Actual' },
                { id: 'n_multiplicity', label: 'Multiplicity' },
                { id: 'n_difference', label: 'Difference' },
                { id: 'n_repetition', label: 'Repetition' },
                { id: 'n_intensity', label: 'Intensity' },
                { id: 'n_assemblage', label: 'Assemblage' },
                { id: 'n_strata', label: 'Strata' },
                { id: 'n_becoming', label: 'Becoming' },
                { id: 'n_event', label: 'Event' },
            ],
            edges: [
                { id: 'e_virtual_multiplicity', from: 'n_virtual', to: 'n_multiplicity', type: 'envelops', strength: 0.87 },
                { id: 'e_virtual_intensity', from: 'n_virtual', to: 'n_intensity', type: 'envelops', strength: 0.84 },
                { id: 'e_virtual_actual', from: 'n_virtual', to: 'n_actual', type: 'causes', strength: 0.75 },
                { id: 'e_difference_repetition', from: 'n_difference', to: 'n_repetition', type: 'grounds', strength: 0.82 },
                { id: 'e_multiplicity_event', from: 'n_multiplicity', to: 'n_event', type: 'grounds', strength: 0.78 },
                { id: 'e_actual_assemblage', from: 'n_actual', to: 'n_assemblage', type: 'envelops', strength: 0.66 },
                { id: 'e_assemblage_strata', from: 'n_assemblage', to: 'n_strata', type: 'envelops', strength: 0.62 },
                { id: 'e_assemblage_becoming', from: 'n_assemblage', to: 'n_becoming', type: 'causes', strength: 0.73 },
                { id: 'e_becoming_strata', from: 'n_becoming', to: 'n_strata', type: 'contrasts', strength: 0.77 },
                { id: 'e_event_becoming', from: 'n_event', to: 'n_becoming', type: 'depends_on', strength: 0.65 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_virtual_actual',
                    toEdgeId: 'e_multiplicity_event',
                    type: 'supports',
                    strength: 0.66,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_becoming_strata',
                    toEdgeId: 'e_assemblage_becoming',
                    type: 'refines',
                    strength: 0.56,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_difference_repetition',
                    toEdgeId: 'e_virtual_actual',
                    type: 'supports',
                    strength: 0.58,
                },
            ],
        },
    },
    {
        key: 'nagarjuna-emptiness',
        name: 'Nagarjuna: emptiness and two truths',
        description: 'Dependent origination, emptiness, and anti-essentialist inference structure.',
        data: {
            nodes: [
                { id: 'n_dep_orig', label: 'Dependent origination' },
                { id: 'n_emptiness', label: 'Emptiness (sunyata)' },
                { id: 'n_conventional', label: 'Conventional truth' },
                { id: 'n_ultimate', label: 'Ultimate truth' },
                { id: 'n_two_truths', label: 'Two-truths schema' },
                { id: 'n_svabhava', label: 'Svabhava (self-nature)' },
                { id: 'n_middle_way', label: 'Middle way' },
                { id: 'n_tetralemma', label: 'Tetralemma' },
                { id: 'n_prapanca', label: 'Conceptual proliferation' },
                { id: 'n_compassion', label: 'Compassionate practice' },
            ],
            edges: [
                { id: 'e_two_conventional', from: 'n_two_truths', to: 'n_conventional', type: 'envelops', strength: 0.83 },
                { id: 'e_two_ultimate', from: 'n_two_truths', to: 'n_ultimate', type: 'envelops', strength: 0.83 },
                { id: 'e_middle_two', from: 'n_middle_way', to: 'n_two_truths', type: 'envelops', strength: 0.8 },
                { id: 'e_dep_emptiness', from: 'n_dep_orig', to: 'n_emptiness', type: 'grounds', strength: 0.9 },
                { id: 'e_emptiness_middle', from: 'n_emptiness', to: 'n_middle_way', type: 'grounds', strength: 0.77 },
                { id: 'e_svabhava_emptiness', from: 'n_svabhava', to: 'n_emptiness', type: 'contrasts', strength: 0.88 },
                { id: 'e_tetralemma_svabhava', from: 'n_tetralemma', to: 'n_svabhava', type: 'is_about', strength: 0.74 },
                { id: 'e_prapanca_svabhava', from: 'n_prapanca', to: 'n_svabhava', type: 'causes', strength: 0.63 },
                { id: 'e_ultimate_prapanca', from: 'n_ultimate', to: 'n_prapanca', type: 'contrasts', strength: 0.71 },
                { id: 'e_compassion_conventional', from: 'n_compassion', to: 'n_conventional', type: 'depends_on', strength: 0.66 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_dep_emptiness',
                    toEdgeId: 'e_svabhava_emptiness',
                    type: 'supports',
                    strength: 0.79,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_middle_two',
                    toEdgeId: 'e_two_conventional',
                    type: 'refines',
                    strength: 0.62,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_tetralemma_svabhava',
                    toEdgeId: 'e_svabhava_emptiness',
                    type: 'explains',
                    strength: 0.58,
                },
            ],
        },
    },
    {
        key: 'zhuangzi-equality-things',
        name: 'Zhuangzi: equality of things',
        description: 'Dao, transformation, and anti-rigid distinction dynamics.',
        data: {
            nodes: [
                { id: 'n_dao', label: 'Dao' },
                { id: 'n_transformation', label: 'Transformation' },
                { id: 'n_ten_thousand', label: 'Ten thousand things' },
                { id: 'n_distinctions', label: 'Distinction-making' },
                { id: 'n_equalization', label: 'Equalization of things' },
                { id: 'n_wandering', label: 'Free wandering' },
                { id: 'n_useful', label: 'Usefulness' },
                { id: 'n_useless', label: 'Uselessness' },
                { id: 'n_skill', label: 'Skillful action' },
                { id: 'n_spontaneity', label: 'Spontaneity (ziran)' },
            ],
            edges: [
                { id: 'e_dao_transformation', from: 'n_dao', to: 'n_transformation', type: 'envelops', strength: 0.86 },
                { id: 'e_transformation_ten', from: 'n_transformation', to: 'n_ten_thousand', type: 'envelops', strength: 0.82 },
                { id: 'e_distinction_equalization', from: 'n_distinctions', to: 'n_equalization', type: 'contrasts', strength: 0.84 },
                { id: 'e_equalization_wandering', from: 'n_equalization', to: 'n_wandering', type: 'grounds', strength: 0.73 },
                { id: 'e_useless_useful', from: 'n_useless', to: 'n_useful', type: 'contrasts', strength: 0.71 },
                { id: 'e_useless_wandering', from: 'n_useless', to: 'n_wandering', type: 'causes', strength: 0.67 },
                { id: 'e_skill_spontaneity', from: 'n_skill', to: 'n_spontaneity', type: 'depends_on', strength: 0.7 },
                { id: 'e_spontaneity_wandering', from: 'n_spontaneity', to: 'n_wandering', type: 'grounds', strength: 0.75 },
                { id: 'e_dao_equalization', from: 'n_dao', to: 'n_equalization', type: 'is_about', strength: 0.64 },
                { id: 'e_ten_distinctions', from: 'n_ten_thousand', to: 'n_distinctions', type: 'causes', strength: 0.59 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_dao_transformation',
                    toEdgeId: 'e_equalization_wandering',
                    type: 'supports',
                    strength: 0.64,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_ten_distinctions',
                    toEdgeId: 'e_distinction_equalization',
                    type: 'contradicts',
                    strength: 0.57,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_spontaneity_wandering',
                    toEdgeId: 'e_skill_spontaneity',
                    type: 'explains',
                    strength: 0.54,
                },
            ],
        },
    },
    {
        key: 'borges-library-of-babel',
        name: 'Literature: Borges library',
        description: 'Combinatorics, interpretation, and search in a total text-space.',
        data: {
            nodes: [
                { id: 'n_library', label: 'Library universe' },
                { id: 'n_hexagons', label: 'Hexagons' },
                { id: 'n_books', label: 'Books' },
                { id: 'n_alphabet', label: 'Alphabet' },
                { id: 'n_combinatorics', label: 'Combinatorics' },
                { id: 'n_catalog', label: 'Catalog' },
                { id: 'n_meaning', label: 'Meaning' },
                { id: 'n_interpretation', label: 'Interpretation' },
                { id: 'n_librarians', label: 'Librarians' },
                { id: 'n_search', label: 'Infinite search' },
            ],
            edges: [
                { id: 'e_library_hexagons', from: 'n_library', to: 'n_hexagons', type: 'envelops', strength: 0.88 },
                { id: 'e_hexagons_books', from: 'n_hexagons', to: 'n_books', type: 'envelops', strength: 0.85 },
                { id: 'e_alphabet_books', from: 'n_alphabet', to: 'n_books', type: 'grounds', strength: 0.9 },
                { id: 'e_combinatorics_catalog', from: 'n_combinatorics', to: 'n_catalog', type: 'grounds', strength: 0.77 },
                { id: 'e_catalog_books', from: 'n_catalog', to: 'n_books', type: 'is_about', strength: 0.74 },
                { id: 'e_librarians_interpretation', from: 'n_librarians', to: 'n_interpretation', type: 'causes', strength: 0.72 },
                { id: 'e_interpretation_books', from: 'n_interpretation', to: 'n_books', type: 'depends_on', strength: 0.81 },
                { id: 'e_meaning_combinatorics', from: 'n_meaning', to: 'n_combinatorics', type: 'contrasts', strength: 0.69 },
                { id: 'e_search_catalog', from: 'n_search', to: 'n_catalog', type: 'depends_on', strength: 0.76 },
                { id: 'e_search_interpretation', from: 'n_search', to: 'n_interpretation', type: 'causes', strength: 0.61 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_alphabet_books',
                    toEdgeId: 'e_combinatorics_catalog',
                    type: 'supports',
                    strength: 0.68,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_meaning_combinatorics',
                    toEdgeId: 'e_catalog_books',
                    type: 'contradicts',
                    strength: 0.55,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_search_interpretation',
                    toEdgeId: 'e_librarians_interpretation',
                    type: 'explains',
                    strength: 0.52,
                },
            ],
        },
    },
    {
        key: 'bauhaus-composition-grammar',
        name: 'Art: Bauhaus composition grammar',
        description: 'Formal composition as a constraint graph over color, form, and perception.',
        data: {
            nodes: [
                { id: 'n_visual_field', label: 'Visual field' },
                { id: 'n_composition', label: 'Composition' },
                { id: 'n_form', label: 'Form' },
                { id: 'n_color', label: 'Color' },
                { id: 'n_line', label: 'Line' },
                { id: 'n_plane', label: 'Plane' },
                { id: 'n_contrast', label: 'Contrast' },
                { id: 'n_rhythm', label: 'Rhythm' },
                { id: 'n_balance', label: 'Balance' },
                { id: 'n_viewer', label: 'Viewer perception' },
            ],
            edges: [
                { id: 'e_visual_composition', from: 'n_visual_field', to: 'n_composition', type: 'envelops', strength: 0.87 },
                { id: 'e_composition_form', from: 'n_composition', to: 'n_form', type: 'envelops', strength: 0.76 },
                { id: 'e_composition_color', from: 'n_composition', to: 'n_color', type: 'envelops', strength: 0.76 },
                { id: 'e_line_form', from: 'n_line', to: 'n_form', type: 'grounds', strength: 0.82 },
                { id: 'e_plane_composition', from: 'n_plane', to: 'n_composition', type: 'grounds', strength: 0.78 },
                { id: 'e_contrast_rhythm', from: 'n_contrast', to: 'n_rhythm', type: 'causes', strength: 0.74 },
                { id: 'e_rhythm_balance', from: 'n_rhythm', to: 'n_balance', type: 'grounds', strength: 0.71 },
                { id: 'e_balance_viewer', from: 'n_balance', to: 'n_viewer', type: 'causes', strength: 0.67 },
                { id: 'e_color_form', from: 'n_color', to: 'n_form', type: 'contrasts', strength: 0.58 },
                { id: 'e_viewer_composition', from: 'n_viewer', to: 'n_composition', type: 'depends_on', strength: 0.53 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_contrast_rhythm',
                    toEdgeId: 'e_rhythm_balance',
                    type: 'supports',
                    strength: 0.67,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_line_form',
                    toEdgeId: 'e_composition_form',
                    type: 'supports',
                    strength: 0.63,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_viewer_composition',
                    toEdgeId: 'e_balance_viewer',
                    type: 'explains',
                    strength: 0.51,
                },
            ],
        },
    },
    {
        key: 'molecular-biology-central-dogma',
        name: 'Science: central dogma and regulation',
        description: 'Gene expression as a constrained causal graph from genome to phenotype.',
        data: {
            nodes: [
                { id: 'n_cell_state', label: 'Cell state' },
                { id: 'n_genome', label: 'Genome' },
                { id: 'n_chromatin', label: 'Chromatin state' },
                { id: 'n_transcription', label: 'Transcription' },
                { id: 'n_rna', label: 'RNA pool' },
                { id: 'n_translation', label: 'Translation' },
                { id: 'n_protein', label: 'Protein network' },
                { id: 'n_reg_network', label: 'Regulatory network' },
                { id: 'n_environment', label: 'Environment' },
                { id: 'n_phenotype', label: 'Phenotype' },
            ],
            edges: [
                { id: 'e_cell_genome', from: 'n_cell_state', to: 'n_genome', type: 'envelops', strength: 0.82 },
                { id: 'e_cell_reg', from: 'n_cell_state', to: 'n_reg_network', type: 'envelops', strength: 0.77 },
                { id: 'e_genome_transcription', from: 'n_genome', to: 'n_transcription', type: 'grounds', strength: 0.9 },
                { id: 'e_chromatin_transcription', from: 'n_chromatin', to: 'n_transcription', type: 'grounds', strength: 0.86 },
                { id: 'e_transcription_rna', from: 'n_transcription', to: 'n_rna', type: 'causes', strength: 0.9 },
                { id: 'e_rna_translation', from: 'n_rna', to: 'n_translation', type: 'causes', strength: 0.88 },
                { id: 'e_translation_protein', from: 'n_translation', to: 'n_protein', type: 'causes', strength: 0.9 },
                { id: 'e_protein_phenotype', from: 'n_protein', to: 'n_phenotype', type: 'causes', strength: 0.84 },
                { id: 'e_environment_reg', from: 'n_environment', to: 'n_reg_network', type: 'causes', strength: 0.69 },
                { id: 'e_reg_transcription', from: 'n_reg_network', to: 'n_transcription', type: 'depends_on', strength: 0.72 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_chromatin_transcription',
                    toEdgeId: 'e_genome_transcription',
                    type: 'refines',
                    strength: 0.67,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_translation_protein',
                    toEdgeId: 'e_protein_phenotype',
                    type: 'supports',
                    strength: 0.72,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_environment_reg',
                    toEdgeId: 'e_reg_transcription',
                    type: 'explains',
                    strength: 0.64,
                },
            ],
        },
    },
    {
        key: 'category-theoretic-semantics',
        name: 'Mathematics: categorical semantics',
        description: 'Objects, morphisms, functors, and proofs as compositional invariants.',
        data: {
            nodes: [
                { id: 'n_category', label: 'Category' },
                { id: 'n_objects', label: 'Objects' },
                { id: 'n_morphisms', label: 'Morphisms' },
                { id: 'n_functors', label: 'Functors' },
                { id: 'n_nat_trans', label: 'Natural transformations' },
                { id: 'n_theory', label: 'Formal theory' },
                { id: 'n_model', label: 'Model' },
                { id: 'n_proof', label: 'Proof' },
                { id: 'n_equivalence', label: 'Equivalence' },
                { id: 'n_comm_diag', label: 'Commutative diagrams' },
            ],
            edges: [
                { id: 'e_category_objects', from: 'n_category', to: 'n_objects', type: 'envelops', strength: 0.9 },
                { id: 'e_category_morphisms', from: 'n_category', to: 'n_morphisms', type: 'envelops', strength: 0.9 },
                { id: 'e_functors_model', from: 'n_functors', to: 'n_model', type: 'grounds', strength: 0.78 },
                { id: 'e_nat_functors', from: 'n_nat_trans', to: 'n_functors', type: 'depends_on', strength: 0.79 },
                { id: 'e_theory_model', from: 'n_theory', to: 'n_model', type: 'grounds', strength: 0.73 },
                { id: 'e_theory_proof', from: 'n_theory', to: 'n_proof', type: 'grounds', strength: 0.76 },
                { id: 'e_proof_equivalence', from: 'n_proof', to: 'n_equivalence', type: 'causes', strength: 0.62 },
                { id: 'e_equivalence_category', from: 'n_equivalence', to: 'n_category', type: 'is_about', strength: 0.67 },
                { id: 'e_morphisms_diag', from: 'n_morphisms', to: 'n_comm_diag', type: 'causes', strength: 0.75 },
                { id: 'e_diag_proof', from: 'n_comm_diag', to: 'n_proof', type: 'grounds', strength: 0.81 },
            ],
            metaEdges: [
                {
                    id: 'm1',
                    fromEdgeId: 'e_diag_proof',
                    toEdgeId: 'e_proof_equivalence',
                    type: 'supports',
                    strength: 0.64,
                },
                {
                    id: 'm2',
                    fromEdgeId: 'e_functors_model',
                    toEdgeId: 'e_nat_functors',
                    type: 'supports',
                    strength: 0.61,
                },
                {
                    id: 'm3',
                    fromEdgeId: 'e_category_morphisms',
                    toEdgeId: 'e_equivalence_category',
                    type: 'explains',
                    strength: 0.54,
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

export type OntologyMode = 'strict_poset' | 'soft_poset' | 'free_graph';

export type LayoutMode = 'layered' | 'force';

export interface ModeOption {
    id: OntologyMode;
    label: string;
    description: string;
}

export interface LayoutOption {
    id: LayoutMode;
    label: string;
    description: string;
}

export interface RuleCheck {
    id: 'no_self_loop' | 'acyclic' | 'antisymmetry' | 'single_parent';
    label: string;
    ok: boolean;
    detail: string;
}

export interface RuleCheckResult {
    checks: RuleCheck[];
    blockingIssues: string[];
    isValid: boolean;
}

export interface ModeValidationResult {
    allowed: boolean;
    ruleCheck: RuleCheckResult;
}

export interface ImpliedClosureEdge {
    id: string;
    from: Id;
    to: Id;
    type: 'envelops';
}

export type RepairAction =
    | {
        type: 'remove_edge';
        edgeId: Id;
    }
    | {
        type: 'downgrade_edge_type';
        edgeId: Id;
        newType: Exclude<RelationType, 'envelops'>;
    }
    | {
        type: 'reduce_strength';
        edgeId: Id;
        newStrength: number;
    };

export interface RepairSuggestion {
    id: string;
    title: string;
    reason: string;
    estimatedImpact: string;
    actions: RepairAction[];
}

export interface SnapshotRecord {
    id: string;
    name: string;
    createdAtISO: string;
    dataset: OntologyDataset;
}

export interface ChangedEntity<T> {
    id: Id;
    before: T;
    after: T;
}

export interface SnapshotDiff {
    addedNodes: OntologyNode[];
    removedNodes: OntologyNode[];
    changedNodes: ChangedEntity<OntologyNode>[];
    addedEdges: Relation[];
    removedEdges: Relation[];
    changedEdges: ChangedEntity<Relation>[];
    addedMetaEdges: MetaRelation[];
    removedMetaEdges: MetaRelation[];
    changedMetaEdges: ChangedEntity<MetaRelation>[];
    leftDiagnostics: PosetDiagnostics;
    rightDiagnostics: PosetDiagnostics;
    diagnosticsDelta: {
        envCount: number;
        multiParentCount: number;
        antisymCount: number;
        cycleChanged: boolean;
    };
}

export const ONTOLOGY_MODE_OPTIONS: ModeOption[] = [
    {
        id: 'strict_poset',
        label: 'Strict poset',
        description: 'Blocks edits that violate acyclicity, antisymmetry, single-parent, or self-loop rules.',
    },
    {
        id: 'soft_poset',
        label: 'Soft poset',
        description: 'Allows all edits while surfacing order-theoretic rule violations.',
    },
    {
        id: 'free_graph',
        label: 'Free graph',
        description: 'Uses ontology as a graph with checks shown as informational only.',
    },
];

export const LAYOUT_MODE_OPTIONS: LayoutOption[] = [
    {
        id: 'layered',
        label: 'Layered',
        description: 'Depth-based layered view from envelop relations.',
    },
    {
        id: 'force',
        label: 'Force-directed',
        description: 'Clustered graph view for non-hierarchical structures.',
    },
];

function pathKey(from: Id, to: Id): string {
    return `${from}::${to}`;
}

function edgeActionKey(action: RepairAction): string {
    if (action.type === 'remove_edge') {
        return `${action.type}:${action.edgeId}`;
    }
    if (action.type === 'downgrade_edge_type') {
        return `${action.type}:${action.edgeId}:${action.newType}`;
    }
    return `${action.type}:${action.edgeId}:${action.newStrength.toFixed(4)}`;
}

function suggestionKey(suggestion: RepairSuggestion): string {
    return suggestion.actions.map(edgeActionKey).sort().join('|');
}

function hashString(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

function hasAlternatePath(
    startId: Id,
    targetId: Id,
    edges: Relation[],
    excludedEdgeId: Id,
): boolean {
    const adjacency = new Map<Id, Id[]>();
    for (const edge of edges) {
        if (edge.id === excludedEdgeId) {
            continue;
        }
        const arr = adjacency.get(edge.from) ?? [];
        arr.push(edge.to);
        adjacency.set(edge.from, arr);
    }

    const queue: Id[] = [startId];
    const seen = new Set<Id>([startId]);

    while (queue.length > 0) {
        const current = queue.shift();
        if (!current) {
            continue;
        }

        const next = adjacency.get(current) ?? [];
        for (const id of next) {
            if (id === targetId) {
                return true;
            }
            if (seen.has(id)) {
                continue;
            }
            seen.add(id);
            queue.push(id);
        }
    }

    return false;
}

function stronglyConnectedComponents(
    nodes: OntologyNode[],
    envEdges: Relation[],
): Id[][] {
    const adjacency = new Map<Id, Id[]>();
    for (const node of nodes) {
        adjacency.set(node.id, []);
    }
    for (const edge of envEdges) {
        adjacency.get(edge.from)?.push(edge.to);
    }

    const indexMap = new Map<Id, number>();
    const lowLink = new Map<Id, number>();
    const stack: Id[] = [];
    const inStack = new Set<Id>();
    const result: Id[][] = [];
    let index = 0;

    const visit = (nodeId: Id) => {
        indexMap.set(nodeId, index);
        lowLink.set(nodeId, index);
        index += 1;
        stack.push(nodeId);
        inStack.add(nodeId);

        for (const nextId of adjacency.get(nodeId) ?? []) {
            if (!indexMap.has(nextId)) {
                visit(nextId);
                const low = lowLink.get(nodeId) ?? 0;
                const candidate = lowLink.get(nextId) ?? 0;
                lowLink.set(nodeId, Math.min(low, candidate));
            } else if (inStack.has(nextId)) {
                const low = lowLink.get(nodeId) ?? 0;
                const candidate = indexMap.get(nextId) ?? 0;
                lowLink.set(nodeId, Math.min(low, candidate));
            }
        }

        if ((lowLink.get(nodeId) ?? -1) === (indexMap.get(nodeId) ?? -2)) {
            const component: Id[] = [];
            while (stack.length > 0) {
                const popped = stack.pop();
                if (!popped) {
                    continue;
                }
                inStack.delete(popped);
                component.push(popped);
                if (popped === nodeId) {
                    break;
                }
            }
            result.push(component);
        }
    };

    for (const node of nodes) {
        if (!indexMap.has(node.id)) {
            visit(node.id);
        }
    }

    return result;
}

export function computeRuleChecks(dataset: OntologyDataset): RuleCheckResult {
    const diagnostics = computePosetDiagnostics(dataset);
    const selfLoops = dataset.edges.filter(
        (edge) => edge.type === 'envelops' && edge.from === edge.to,
    );

    const checks: RuleCheck[] = [
        {
            id: 'no_self_loop',
            label: 'No envelop self-loops',
            ok: selfLoops.length === 0,
            detail: selfLoops.length === 0
                ? 'No self-loop envelop edges.'
                : `${selfLoops.length} self-loop envelop edge(s).`,
        },
        {
            id: 'acyclic',
            label: 'Acyclic envelop graph',
            ok: !diagnostics.hasCycle,
            detail: diagnostics.hasCycle
                ? 'Cycle detected in envelop relation graph.'
                : 'No envelop cycle detected.',
        },
        {
            id: 'antisymmetry',
            label: 'Antisymmetry',
            ok: diagnostics.antisymViolations.length === 0,
            detail: diagnostics.antisymViolations.length === 0
                ? 'No antisymmetry violations.'
                : `${diagnostics.antisymViolations.length} violating pair(s).`,
        },
        {
            id: 'single_parent',
            label: 'Single-parent nesting',
            ok: diagnostics.multiParentCount === 0,
            detail: diagnostics.multiParentCount === 0
                ? 'No multi-parent nodes.'
                : `${diagnostics.multiParentCount} node(s) with multiple envelop parents.`,
        },
    ];

    const blockingIssues = checks
        .filter((check) => !check.ok)
        .map((check) => check.detail);

    return {
        checks,
        blockingIssues,
        isValid: blockingIssues.length === 0,
    };
}

export function validateDatasetForMode(
    dataset: OntologyDataset,
    mode: OntologyMode,
): ModeValidationResult {
    const ruleCheck = computeRuleChecks(dataset);
    if (mode !== 'strict_poset') {
        return { allowed: true, ruleCheck };
    }
    return { allowed: ruleCheck.isValid, ruleCheck };
}

export function computeTransitiveClosurePairs(dataset: OntologyDataset): ImpliedClosureEdge[] {
    const envEdges = dataset.edges.filter((edge) => edge.type === 'envelops');
    const direct = new Set<string>(envEdges.map((edge) => pathKey(edge.from, edge.to)));
    const { ids, reach } = transitiveClosure(dataset.nodes, dataset.edges);

    const implied: ImpliedClosureEdge[] = [];
    for (let i = 0; i < ids.length; i += 1) {
        for (let j = 0; j < ids.length; j += 1) {
            if (i === j || !reach[i][j]) {
                continue;
            }
            const from = ids[i];
            const to = ids[j];
            if (direct.has(pathKey(from, to))) {
                continue;
            }
            implied.push({
                id: `implied_${from}_${to}`,
                from,
                to,
                type: 'envelops',
            });
        }
    }

    return implied;
}

export function computeTransitiveReductionEdges(dataset: OntologyDataset): Relation[] {
    const envEdges = dataset.edges.filter((edge) => edge.type === 'envelops');
    const essential: Relation[] = [];

    for (const edge of envEdges) {
        if (edge.from === edge.to) {
            essential.push(edge);
            continue;
        }

        const impliedByOtherPath = hasAlternatePath(edge.from, edge.to, envEdges, edge.id);
        if (!impliedByOtherPath) {
            essential.push(edge);
        }
    }

    return essential;
}

export function suggestRepairs(
    dataset: OntologyDataset,
    maxSuggestions = 8,
): RepairSuggestion[] {
    const suggestions: RepairSuggestion[] = [];
    const nodeMap = indexNodes(dataset.nodes);
    const envEdges = dataset.edges.filter((edge) => edge.type === 'envelops');
    const edgeMap = indexEdges(dataset.edges);
    let index = 1;

    const components = stronglyConnectedComponents(dataset.nodes, envEdges);
    for (const comp of components) {
        const compSet = new Set(comp);
        const isSelfLoopComponent = comp.length === 1
            && envEdges.some((edge) => edge.from === comp[0] && edge.to === comp[0]);
        if (comp.length <= 1 && !isSelfLoopComponent) {
            continue;
        }

        const internal = envEdges
            .filter((edge) => compSet.has(edge.from) && compSet.has(edge.to))
            .sort((a, b) => a.strength - b.strength);
        const candidate = internal[0];
        if (!candidate) {
            continue;
        }

        const fromLabel = nodeMap.get(candidate.from)?.label ?? candidate.from;
        const toLabel = nodeMap.get(candidate.to)?.label ?? candidate.to;

        suggestions.push({
            id: `repair_${index}`,
            title: `Break cycle by removing ${fromLabel} -> ${toLabel}`,
            reason: 'Cycle in envelop graph.',
            estimatedImpact: 'Removes one low-strength envelop edge in a strongly connected component.',
            actions: [
                {
                    type: 'remove_edge',
                    edgeId: candidate.id,
                },
            ],
        });
        index += 1;

        suggestions.push({
            id: `repair_${index}`,
            title: `Break cycle by downgrading ${fromLabel} -> ${toLabel}`,
            reason: 'Cycle in envelop graph.',
            estimatedImpact: 'Converts one envelop edge to grounds to keep semantic link without order claim.',
            actions: [
                {
                    type: 'downgrade_edge_type',
                    edgeId: candidate.id,
                    newType: 'grounds',
                },
            ],
        });
        index += 1;
    }

    const diagnostics = computePosetDiagnostics(dataset);
    for (const violation of diagnostics.antisymViolations) {
        const candidates = envEdges
            .filter((edge) =>
                (edge.from === violation.aId && edge.to === violation.bId)
                || (edge.from === violation.bId && edge.to === violation.aId))
            .sort((a, b) => a.strength - b.strength);
        const candidate = candidates[0];
        if (!candidate) {
            continue;
        }

        const fromLabel = nodeMap.get(candidate.from)?.label ?? candidate.from;
        const toLabel = nodeMap.get(candidate.to)?.label ?? candidate.to;

        suggestions.push({
            id: `repair_${index}`,
            title: `Resolve antisymmetry: remove ${fromLabel} -> ${toLabel}`,
            reason: `${violation.aLabel} and ${violation.bLabel} mutually reach each other.`,
            estimatedImpact: 'Removes one direction in a bidirectional entailment.',
            actions: [
                {
                    type: 'remove_edge',
                    edgeId: candidate.id,
                },
            ],
        });
        index += 1;
    }

    const { parents } = computeEnvelopMaps(dataset.nodes, dataset.edges);
    for (const node of dataset.nodes) {
        const parentIds = parents.get(node.id) ?? [];
        if (parentIds.length <= 1) {
            continue;
        }

        const candidates = envEdges
            .filter((edge) => edge.to === node.id)
            .sort((a, b) => a.strength - b.strength);
        const candidate = candidates[0];
        if (!candidate) {
            continue;
        }

        const fromLabel = nodeMap.get(candidate.from)?.label ?? candidate.from;
        const toLabel = nodeMap.get(candidate.to)?.label ?? candidate.to;

        suggestions.push({
            id: `repair_${index}`,
            title: `Reduce multi-parent: remove ${fromLabel} -> ${toLabel}`,
            reason: `${toLabel} has ${parentIds.length} envelop parents.`,
            estimatedImpact: 'Keeps strongest parent assignments and removes weakest one.',
            actions: [
                {
                    type: 'remove_edge',
                    edgeId: candidate.id,
                },
            ],
        });
        index += 1;
    }

    for (const edge of envEdges) {
        if (edge.from !== edge.to) {
            continue;
        }
        suggestions.push({
            id: `repair_${index}`,
            title: `Remove self-loop on ${nodeMap.get(edge.from)?.label ?? edge.from}`,
            reason: 'Self-loop on envelop relation is invalid in strict poset mode.',
            estimatedImpact: 'Eliminates one self-loop violation.',
            actions: [
                {
                    type: 'remove_edge',
                    edgeId: edge.id,
                },
            ],
        });
        index += 1;
    }

    const unique = new Map<string, RepairSuggestion>();
    for (const suggestion of suggestions) {
        const key = suggestionKey(suggestion);
        if (!unique.has(key)) {
            unique.set(key, suggestion);
        }
    }

    const sorted = Array.from(unique.values()).sort((left, right) => {
        const leftScore = left.actions.reduce((acc, action) => {
            if (action.type === 'remove_edge' || action.type === 'downgrade_edge_type') {
                return acc + (edgeMap.get(action.edgeId)?.strength ?? 1);
            }
            return acc + action.newStrength;
        }, 0);
        const rightScore = right.actions.reduce((acc, action) => {
            if (action.type === 'remove_edge' || action.type === 'downgrade_edge_type') {
                return acc + (edgeMap.get(action.edgeId)?.strength ?? 1);
            }
            return acc + action.newStrength;
        }, 0);
        return leftScore - rightScore;
    });

    return sorted.slice(0, maxSuggestions);
}

export function applyRepairSuggestion(
    dataset: OntologyDataset,
    suggestion: RepairSuggestion,
): OntologyDataset {
    let next = cloneDataset(dataset);

    for (const action of suggestion.actions) {
        if (action.type === 'remove_edge') {
            next = {
                ...next,
                edges: next.edges.filter((edge) => edge.id !== action.edgeId),
                metaEdges: next.metaEdges.filter((meta) =>
                    meta.fromEdgeId !== action.edgeId && meta.toEdgeId !== action.edgeId),
            };
            continue;
        }

        if (action.type === 'downgrade_edge_type') {
            next = {
                ...next,
                edges: next.edges.map((edge) => (
                    edge.id === action.edgeId
                        ? { ...edge, type: action.newType }
                        : edge
                )),
            };
            continue;
        }

        next = {
            ...next,
            edges: next.edges.map((edge) => (
                edge.id === action.edgeId
                    ? { ...edge, strength: clamp01(action.newStrength) }
                    : edge
            )),
        };
    }

    return next;
}

function nodeChanged(before: OntologyNode, after: OntologyNode): boolean {
    return before.label !== after.label
        || (before.notes ?? '') !== (after.notes ?? '');
}

function relationChanged(before: Relation, after: Relation): boolean {
    return before.from !== after.from
        || before.to !== after.to
        || before.type !== after.type
        || Math.abs(before.strength - after.strength) > 1e-9
        || (before.notes ?? '') !== (after.notes ?? '');
}

function metaRelationChanged(before: MetaRelation, after: MetaRelation): boolean {
    return before.fromEdgeId !== after.fromEdgeId
        || before.toEdgeId !== after.toEdgeId
        || before.type !== after.type
        || Math.abs(before.strength - after.strength) > 1e-9
        || (before.notes ?? '') !== (after.notes ?? '');
}

export function computeSnapshotDiff(
    left: OntologyDataset,
    right: OntologyDataset,
): SnapshotDiff {
    const leftNodes = indexNodes(left.nodes);
    const rightNodes = indexNodes(right.nodes);
    const leftEdges = indexEdges(left.edges);
    const rightEdges = indexEdges(right.edges);

    const leftMeta = new Map<Id, MetaRelation>(left.metaEdges.map((entry) => [entry.id, entry]));
    const rightMeta = new Map<Id, MetaRelation>(right.metaEdges.map((entry) => [entry.id, entry]));

    const addedNodes = right.nodes.filter((node) => !leftNodes.has(node.id));
    const removedNodes = left.nodes.filter((node) => !rightNodes.has(node.id));
    const changedNodes: ChangedEntity<OntologyNode>[] = left.nodes
        .filter((node) => rightNodes.has(node.id))
        .map((node) => ({ before: node, after: rightNodes.get(node.id) as OntologyNode, id: node.id }))
        .filter((entry) => nodeChanged(entry.before, entry.after));

    const addedEdges = right.edges.filter((edge) => !leftEdges.has(edge.id));
    const removedEdges = left.edges.filter((edge) => !rightEdges.has(edge.id));
    const changedEdges: ChangedEntity<Relation>[] = left.edges
        .filter((edge) => rightEdges.has(edge.id))
        .map((edge) => ({ before: edge, after: rightEdges.get(edge.id) as Relation, id: edge.id }))
        .filter((entry) => relationChanged(entry.before, entry.after));

    const addedMetaEdges = right.metaEdges.filter((meta) => !leftMeta.has(meta.id));
    const removedMetaEdges = left.metaEdges.filter((meta) => !rightMeta.has(meta.id));
    const changedMetaEdges: ChangedEntity<MetaRelation>[] = left.metaEdges
        .filter((meta) => rightMeta.has(meta.id))
        .map((meta) => ({ before: meta, after: rightMeta.get(meta.id) as MetaRelation, id: meta.id }))
        .filter((entry) => metaRelationChanged(entry.before, entry.after));

    const leftDiagnostics = computePosetDiagnostics(left);
    const rightDiagnostics = computePosetDiagnostics(right);

    return {
        addedNodes,
        removedNodes,
        changedNodes,
        addedEdges,
        removedEdges,
        changedEdges,
        addedMetaEdges,
        removedMetaEdges,
        changedMetaEdges,
        leftDiagnostics,
        rightDiagnostics,
        diagnosticsDelta: {
            envCount: rightDiagnostics.envCount - leftDiagnostics.envCount,
            multiParentCount: rightDiagnostics.multiParentCount - leftDiagnostics.multiParentCount,
            antisymCount: rightDiagnostics.antisymViolations.length - leftDiagnostics.antisymViolations.length,
            cycleChanged: rightDiagnostics.hasCycle !== leftDiagnostics.hasCycle,
        },
    };
}

export function buildForceLayout(
    dataset: OntologyDataset,
    edgesForLayout?: Relation[],
): GraphLayout {
    const nodeWidth = 180;
    const nodeHeight = 50;
    const padX = 44;
    const padY = 34;
    const nodes = [...dataset.nodes].sort((a, b) => a.label.localeCompare(b.label));
    const nodeIds = nodes.map((node) => node.id);
    const edges = edgesForLayout ?? dataset.edges;

    const count = Math.max(1, nodeIds.length);
    const width = Math.max(900, Math.round(Math.sqrt(count) * 340) + padX * 2);
    const height = Math.max(560, Math.round(Math.sqrt(count) * 250) + padY * 2);
    const spanX = Math.max(60, width - padX * 2 - nodeWidth);
    const spanY = Math.max(60, height - padY * 2 - nodeHeight);

    const xById = new Map<Id, number>();
    const yById = new Map<Id, number>();
    const dxById = new Map<Id, number>();
    const dyById = new Map<Id, number>();

    for (const id of nodeIds) {
        const hx = hashString(id);
        const hy = hashString(`${id}_y`);
        xById.set(id, padX + (hx % 10000) / 10000 * spanX);
        yById.set(id, padY + (hy % 10000) / 10000 * spanY);
    }

    const area = spanX * spanY;
    const k = Math.sqrt(area / count);
    const iterations = Math.min(220, 80 + count * 6);
    let temperature = Math.min(spanX, spanY) * 0.22;

    for (let step = 0; step < iterations; step += 1) {
        for (const id of nodeIds) {
            dxById.set(id, 0);
            dyById.set(id, 0);
        }

        for (let i = 0; i < nodeIds.length; i += 1) {
            const idA = nodeIds[i];
            for (let j = i + 1; j < nodeIds.length; j += 1) {
                const idB = nodeIds[j];
                const xA = xById.get(idA) ?? 0;
                const yA = yById.get(idA) ?? 0;
                const xB = xById.get(idB) ?? 0;
                const yB = yById.get(idB) ?? 0;
                const vx = xA - xB;
                const vy = yA - yB;
                const dist = Math.max(1, Math.hypot(vx, vy));
                const force = (k * k) / dist;
                const fx = (vx / dist) * force;
                const fy = (vy / dist) * force;
                dxById.set(idA, (dxById.get(idA) ?? 0) + fx);
                dyById.set(idA, (dyById.get(idA) ?? 0) + fy);
                dxById.set(idB, (dxById.get(idB) ?? 0) - fx);
                dyById.set(idB, (dyById.get(idB) ?? 0) - fy);
            }
        }

        for (const edge of edges) {
            const xFrom = xById.get(edge.from);
            const yFrom = yById.get(edge.from);
            const xTo = xById.get(edge.to);
            const yTo = yById.get(edge.to);
            if (xFrom === undefined || yFrom === undefined || xTo === undefined || yTo === undefined) {
                continue;
            }

            const vx = xFrom - xTo;
            const vy = yFrom - yTo;
            const dist = Math.max(1, Math.hypot(vx, vy));
            const force = (dist * dist) / k;
            const fx = (vx / dist) * force * 0.9;
            const fy = (vy / dist) * force * 0.9;

            dxById.set(edge.from, (dxById.get(edge.from) ?? 0) - fx);
            dyById.set(edge.from, (dyById.get(edge.from) ?? 0) - fy);
            dxById.set(edge.to, (dxById.get(edge.to) ?? 0) + fx);
            dyById.set(edge.to, (dyById.get(edge.to) ?? 0) + fy);
        }

        for (const id of nodeIds) {
            const dx = dxById.get(id) ?? 0;
            const dy = dyById.get(id) ?? 0;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const x = xById.get(id) ?? 0;
            const y = yById.get(id) ?? 0;
            const limited = Math.min(temperature, dist);
            const nx = x + (dx / dist) * limited;
            const ny = y + (dy / dist) * limited;

            xById.set(id, Math.max(padX, Math.min(padX + spanX, nx)));
            yById.set(id, Math.max(padY, Math.min(padY + spanY, ny)));
        }

        temperature *= 0.965;
    }

    const positions = new Map<Id, GraphNodePosition>();
    nodeIds.forEach((id, i) => {
        positions.set(id, {
            x: xById.get(id) ?? padX,
            y: yById.get(id) ?? padY,
            layer: 0,
            index: i,
        });
    });

    return {
        positions,
        layers: [nodeIds],
        width,
        height,
        nodeWidth,
        nodeHeight,
    };
}
