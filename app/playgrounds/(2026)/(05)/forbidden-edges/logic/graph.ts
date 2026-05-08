export type LayerKey = 'neural' | 'interpersonal' | 'institutional' | 'ecological' | 'historical';

export interface GraphNode {
    id: string;
    label: string;
    layer: LayerKey;
    x: number;  // 0..100
    y: number;  // 0..100
    description: string;
}

export interface GraphEdge {
    from: string;
    to: string;
    label: string;
    style: 'solid' | 'dashed';
}

export interface HyperEdge {
    id: string;
    label: string;
    nodes: string[];
}

export const LAYER_LABELS: Record<LayerKey, string> = {
    neural: 'neural',
    interpersonal: 'interpersonal',
    institutional: 'institutional',
    ecological: 'ecological',
    historical: 'historical',
};

export const NODES: GraphNode[] = [
    // neural layer (top)
    { id: 'valuation', label: 'valuation', layer: 'neural', x: 18, y: 14, description: 'reward prediction error · dopamine · local-gain learning' },
    { id: 'empathy', label: 'empathy', layer: 'neural', x: 38, y: 12, description: 'salience of others\' suffering · serotonergic / harm-aversion' },
    { id: 'threat', label: 'threat', layer: 'neural', x: 58, y: 14, description: 'amygdala / threat detection · responds to top-down sanction signals' },
    // interpersonal layer
    { id: 'agentA', label: 'agent A', layer: 'interpersonal', x: 22, y: 38, description: 'the actor, chooses edges' },
    { id: 'agentB', label: 'agent B', layer: 'interpersonal', x: 56, y: 38, description: 'the patient, affected by chosen edges' },
    { id: 'trust', label: 'trust', layer: 'interpersonal', x: 39, y: 50, description: 'the relational edge between A and B · damaged by betrayal · repaired only over time' },
    // institutional layer (left-center)
    { id: 'court', label: 'court', layer: 'institutional', x: 78, y: 36, description: 'rule-following body · imposes sanction & due process' },
    { id: 'norm', label: 'norm', layer: 'institutional', x: 80, y: 56, description: 'shared expectation · constrains choice from above' },
    { id: 'sanction', label: 'sanction', layer: 'institutional', x: 84, y: 76, description: 'consequence · the threat or imposition that backs the norm' },
    // ecological layer (bottom)
    { id: 'resource', label: 'resource', layer: 'ecological', x: 14, y: 78, description: 'extractable substance · subject to depletion' },
    { id: 'commons', label: 'commons', layer: 'ecological', x: 36, y: 86, description: 'shared substrate · suffers from over-use' },
    { id: 'externality', label: 'externality', layer: 'ecological', x: 58, y: 84, description: 'unaccounted spillover · accumulates beyond market price' },
    // historical layer
    { id: 'memory', label: 'memory', layer: 'historical', x: 8, y: 56, description: 'collective record · slows forgetting · enables repair' },
    { id: 'precedent', label: 'precedent', layer: 'historical', x: 8, y: 26, description: 'prior cases · set institutional response patterns' },
];

export const EDGES: GraphEdge[] = [
    // neural → interpersonal
    { from: 'valuation', to: 'agentA', label: 'reward bias', style: 'solid' },
    { from: 'empathy', to: 'agentA', label: 'harm salience', style: 'solid' },
    { from: 'empathy', to: 'agentB', label: 'other\'s pain', style: 'solid' },
    { from: 'threat', to: 'agentA', label: 'fear weight', style: 'solid' },
    // interpersonal
    { from: 'agentA', to: 'trust', label: '', style: 'solid' },
    { from: 'agentB', to: 'trust', label: '', style: 'solid' },
    // institutional
    { from: 'court', to: 'norm', label: 'codifies', style: 'solid' },
    { from: 'norm', to: 'sanction', label: 'enforces', style: 'solid' },
    { from: 'court', to: 'agentA', label: 'jurisdiction', style: 'solid' },
    { from: 'norm', to: 'agentA', label: 'constrains', style: 'dashed' },
    { from: 'sanction', to: 'threat', label: 'top-down', style: 'dashed' },
    // ecological
    { from: 'agentA', to: 'resource', label: 'extracts', style: 'solid' },
    { from: 'resource', to: 'commons', label: 'belongs to', style: 'solid' },
    { from: 'commons', to: 'externality', label: 'leaks', style: 'solid' },
    { from: 'externality', to: 'agentB', label: 'absorbed by', style: 'dashed' },
    // historical
    { from: 'memory', to: 'trust', label: 'sustains', style: 'dashed' },
    { from: 'memory', to: 'norm', label: 'feeds', style: 'dashed' },
    { from: 'precedent', to: 'court', label: 'guides', style: 'dashed' },
];

export const HYPEREDGES: HyperEdge[] = [
    {
        id: 'bribe',
        label: 'bribe',
        nodes: ['agentA', 'court', 'commons'],
    },
    {
        id: 'commons-use',
        label: 'commons use',
        nodes: ['agentA', 'agentB', 'commons', 'externality'],
    },
    {
        id: 'truth-telling',
        label: 'truth telling',
        nodes: ['agentA', 'memory', 'norm', 'precedent'],
    },
];
