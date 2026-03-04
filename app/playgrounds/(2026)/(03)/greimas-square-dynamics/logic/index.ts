// ---------- Types ----------

export type NodeId = 'S1' | 'S2' | 'nS1' | 'nS2';

export type RelType =
    | 'contradiction'
    | 'contrariety'
    | 'subcontrariety'
    | 'implication';

export type Edge = {
    id: string;
    from: NodeId;
    to: NodeId;
    type: RelType;
    directed: boolean;
    enabled: boolean;
};

export type FlowMode = 'fromSelection' | 'randomWalk' | 'allDirected';
export type ViewMode = 'logic' | 'group';

export type Point = { x: number; y: number };

export type Particle = {
    id: string;
    edgeId: string;
    t: number;
    speed: number;
};

export interface SimulationParams {
    viewMode: ViewMode;
    flowMode: FlowMode;
    showUndirectedFlow: boolean;
    spawnRate: number;
    particleSpeed: number;
    maxParticles: number;
    selectedNode: NodeId;
    labelS1: string;
    labelS2: string;
    labelnS1: string;
    labelnS2: string;
    preset: 'greimas' | 'minimal' | 'implications';
}

export const DEFAULT_PARAMS: SimulationParams = {
    viewMode: 'logic',
    flowMode: 'fromSelection',
    showUndirectedFlow: false,
    spawnRate: 6,
    particleSpeed: 0.35,
    maxParticles: 160,
    selectedNode: 'S1',
    labelS1: 'S1',
    labelS2: 'S2',
    labelnS1: '\u00acS1',
    labelnS2: '\u00acS2',
    preset: 'greimas',
};

// ---------- Helpers ----------

export function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
}

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function lerpPoint(p: Point, q: Point, t: number): Point {
    return { x: lerp(p.x, q.x, t), y: lerp(p.y, q.y, t) };
}

export function randChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ---------- Edge colors for canvas ----------

export function edgeHexColor(type: RelType): string {
    switch (type) {
        case 'contradiction': return '#84cc16';
        case 'contrariety': return '#a3e635';
        case 'subcontrariety': return '#65a30d';
        case 'implication': return '#4d7c0f';
    }
}

export function edgeDash(type: RelType): number[] {
    switch (type) {
        case 'contradiction': return [];
        case 'contrariety': return [6, 4];
        case 'subcontrariety': return [3, 4];
        case 'implication': return [];
    }
}

export function edgeLabel(type: RelType): string {
    switch (type) {
        case 'contradiction': return 'contradiction';
        case 'contrariety': return 'contrariety';
        case 'subcontrariety': return 'sub-contrariety';
        case 'implication': return 'implication';
    }
}

// ---------- Group encoding: V4 = Z2 x Z2 ----------
// S1 = (1,0), S2 = (0,1), nS1 = (0,0), nS2 = (1,1)

export const BITMAP: Record<NodeId, [0 | 1, 0 | 1]> = {
    S1: [1, 0],
    S2: [0, 1],
    nS1: [0, 0],
    nS2: [1, 1],
};

export function bitsToNode(a: 0 | 1, b: 0 | 1): NodeId {
    const entries = Object.entries(BITMAP) as [NodeId, [0 | 1, 0 | 1]][];
    const found = entries.find(([, bits]) => bits[0] === a && bits[1] === b);
    return found?.[0] ?? 'nS1';
}

export function flipA([a, b]: [0 | 1, 0 | 1]): [0 | 1, 0 | 1] {
    return [(a ^ 1) as 0 | 1, b];
}

export function flipB([a, b]: [0 | 1, 0 | 1]): [0 | 1, 0 | 1] {
    return [a, (b ^ 1) as 0 | 1];
}

export function flipAB([a, b]: [0 | 1, 0 | 1]): [0 | 1, 0 | 1] {
    return [(a ^ 1) as 0 | 1, (b ^ 1) as 0 | 1];
}

// ---------- Default edges ----------

export function defaultEdges(): Edge[] {
    return [
        { id: 'c1', from: 'S1', to: 'nS1', type: 'contradiction', directed: false, enabled: true },
        { id: 'c2', from: 'S2', to: 'nS2', type: 'contradiction', directed: false, enabled: true },
        { id: 'k1', from: 'S1', to: 'S2', type: 'contrariety', directed: false, enabled: true },
        { id: 'k2', from: 'nS1', to: 'nS2', type: 'subcontrariety', directed: false, enabled: true },
        { id: 'd1', from: 'S1', to: 'nS2', type: 'implication', directed: true, enabled: true },
        { id: 'd2', from: 'S2', to: 'nS1', type: 'implication', directed: true, enabled: true },
    ];
}

export function minimalEdges(): Edge[] {
    return [
        { id: 'c1', from: 'S1', to: 'nS1', type: 'contradiction', directed: false, enabled: true },
        { id: 'c2', from: 'S2', to: 'nS2', type: 'contradiction', directed: false, enabled: true },
        { id: 'k1', from: 'S1', to: 'S2', type: 'contrariety', directed: false, enabled: true },
        { id: 'k2', from: 'nS1', to: 'nS2', type: 'subcontrariety', directed: false, enabled: true },
    ];
}

export function implicationEdges(): Edge[] {
    return [
        { id: 'd1', from: 'S1', to: 'nS2', type: 'implication', directed: true, enabled: true },
        { id: 'd2', from: 'S2', to: 'nS1', type: 'implication', directed: true, enabled: true },
    ];
}

// ---------- Group-mode edges ----------

const ALL_NODES: NodeId[] = ['S1', 'S2', 'nS1', 'nS2'];

export function buildGroupEdges(): Edge[] {
    const out: Edge[] = [];
    for (const n of ALL_NODES) {
        const bits = BITMAP[n];
        const a = bitsToNode(...flipA(bits));
        const b = bitsToNode(...flipB(bits));
        const ab = bitsToNode(...flipAB(bits));
        out.push({ id: `ga-${n}`, from: n, to: a, type: 'contradiction', directed: true, enabled: true });
        out.push({ id: `gb-${n}`, from: n, to: b, type: 'contrariety', directed: true, enabled: true });
        out.push({ id: `gab-${n}`, from: n, to: ab, type: 'subcontrariety', directed: true, enabled: true });
    }
    return out;
}

// ---------- Node positions ----------

export function computeNodePositions(w: number, h: number): Record<NodeId, Point> {
    const padX = Math.max(60, w * 0.12);
    const padY = Math.max(60, h * 0.14);
    return {
        S1: { x: padX, y: padY },
        S2: { x: w - padX, y: padY },
        nS1: { x: padX, y: h - padY },
        nS2: { x: w - padX, y: h - padY },
    };
}

// ---------- Adjacency matrix ----------

export interface AdjacencyMatrix {
    nodes: NodeId[];
    map: Map<string, Edge[]>;
}

export function buildAdjacencyMatrix(edges: Edge[]): AdjacencyMatrix {
    const nodes: NodeId[] = ['S1', 'S2', 'nS1', 'nS2'];
    const map = new Map<string, Edge[]>();
    for (const e of edges) {
        if (!e.enabled) continue;
        const key = `${e.from}->${e.to}`;
        map.set(key, [...(map.get(key) ?? []), e]);
        if (!e.directed) {
            const key2 = `${e.to}->${e.from}`;
            map.set(key2, [...(map.get(key2) ?? []), e]);
        }
    }
    return { nodes, map };
}

// ---------- Flow edge filtering ----------

export function getFlowEdges(
    enabledEdges: Edge[],
    flowMode: FlowMode,
    selectedNode: NodeId,
    showUndirectedFlow: boolean,
): Edge[] {
    const base = enabledEdges.filter((e) => {
        if (e.directed) return true;
        return showUndirectedFlow;
    });

    if (flowMode === 'allDirected') {
        return base.filter((e) => e.directed);
    }

    if (flowMode === 'fromSelection') {
        return base.filter((e) => {
            if (e.directed) return e.from === selectedNode;
            return e.from === selectedNode || e.to === selectedNode;
        });
    }

    // randomWalk uses all
    return base;
}
