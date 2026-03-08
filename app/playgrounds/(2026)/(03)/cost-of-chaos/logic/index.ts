export function mulberry32(seed: number) {
    let t = seed >>> 0;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

export type LayoutMode = 'circle' | 'tower' | 'spiral' | 'random';
export type ColoringMode = 'distance' | 'modular' | 'random' | 'adversarial';

export interface NodePoint {
    id: number;
    x: number;
    y: number;
}

export interface Edge {
    a: number;
    b: number;
    color: number;
}

export interface Clique {
    vertices: number[];
    color: number;
}

export interface ChaosStats {
    totalEdges: number;
    cliquesFound: number;
    cliques: Clique[];
    ramseyNumber: number | null;
    structureForced: boolean;
    chaosCost: number;
    structureRatio: number;
    verticesInvolved: number;
}

export interface Params {
    nodeCount: number;
    colors: number;
    cliqueSize: number;
    layoutMode: LayoutMode;
    coloringMode: ColoringMode;
    bend: number;
    symmetric: boolean;
    showLabels: boolean;
    highlightCliques: boolean;
    seed: number;
}

export const EDGE_COLORS = [
    '#ef4444',
    '#38bdf8',
    '#c084fc',
    '#fbbf24',
    '#34d399',
    '#f472b6',
];

const RAMSEY: Record<string, number> = {
    '3,3': 6,
    '3,4': 9,
    '3,5': 14,
    '3,6': 18,
    '3,7': 23,
    '3,8': 28,
    '3,9': 36,
    '4,4': 18,
    '4,5': 25,
};

export function getRamseyNumber(s: number, t: number): number | null {
    const key = `${Math.min(s, t)},${Math.max(s, t)}`;
    return RAMSEY[key] ?? null;
}

export const DEFAULT_PARAMS: Params = {
    nodeCount: 5,
    colors: 2,
    cliqueSize: 3,
    layoutMode: 'circle',
    coloringMode: 'adversarial',
    bend: 0.7,
    symmetric: true,
    showLabels: true,
    highlightCliques: true,
    seed: 7,
};


// ── Layout ──────────────────────────────────────────────────────

export function makeLayout(
    n: number, width: number, height: number, mode: LayoutMode, seed: number,
): NodePoint[] {
    const rng = mulberry32(seed + 97);
    const cx = width / 2;
    const cy = height / 2;

    switch (mode) {
        case 'circle': {
            const r = Math.min(width, height) * 0.38;
            return Array.from({ length: n }, (_, i) => {
                const t = -Math.PI / 2 + (i / n) * Math.PI * 2;
                return { id: i, x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r };
            });
        }
        case 'tower': {
            const spineCount = Math.max(3, Math.min(n - 2, Math.round(n * 0.4)));
            const remaining = n - spineCount;
            const leftCount = Math.ceil(remaining / 2);
            const rightCount = remaining - leftCount;
            const points: NodePoint[] = [];

            for (let i = 0; i < spineCount; i++) {
                const t = spineCount === 1 ? 0.5 : i / (spineCount - 1);
                points.push({
                    id: points.length,
                    x: cx + (rng() - 0.5) * 18,
                    y: height * 0.1 + t * height * 0.48,
                });
            }
            for (let i = 0; i < leftCount; i++) {
                const t = leftCount === 1 ? 0.5 : i / (leftCount - 1);
                points.push({
                    id: points.length,
                    x: width * (0.08 + 0.3 * t),
                    y: height * (0.84 - 0.2 * Math.sin(t * Math.PI)),
                });
            }
            for (let i = 0; i < rightCount; i++) {
                const t = rightCount === 1 ? 0.5 : i / (rightCount - 1);
                points.push({
                    id: points.length,
                    x: width * (0.92 - 0.3 * t),
                    y: height * (0.84 - 0.2 * Math.sin(t * Math.PI)),
                });
            }
            return points.slice(0, n).map((p, i) => ({ ...p, id: i }));
        }
        case 'spiral': {
            const maxR = Math.min(width, height) * 0.38;
            return Array.from({ length: n }, (_, i) => {
                const t = 0.9 * i;
                const r = 24 + (i / Math.max(1, n - 1)) * maxR;
                return {
                    id: i,
                    x: cx + Math.cos(t - Math.PI / 2) * r,
                    y: cy + Math.sin(t - Math.PI / 2) * r,
                };
            });
        }
        case 'random':
        default:
            return Array.from({ length: n }, (_, i) => ({
                id: i,
                x: 70 + rng() * (width - 140),
                y: 60 + rng() * (height - 120),
            }));
    }
}


// ── Edge coloring ───────────────────────────────────────────────

export function makeEdges(
    n: number, colors: number, mode: ColoringMode, seed: number,
): Edge[] {
    if (mode === 'adversarial') return adversarialColoring(n, colors, seed);

    const rng = mulberry32(seed);
    const edges: Edge[] = [];

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            let color: number;
            switch (mode) {
                case 'distance':
                    color = Math.abs(j - i) % colors;
                    break;
                case 'modular':
                    color = (i + j) % colors;
                    break;
                case 'random':
                default:
                    color = Math.floor(rng() * colors);
                    break;
            }
            edges.push({ a: i, b: j, color });
        }
    }
    return edges;
}

function adversarialColoring(n: number, colors: number, seed: number): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            edges.push({ a: i, b: j, color: 0 });
        }
    }

    const cm: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
    const rng = mulberry32(seed + 42);

    const order = edges.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }

    for (const idx of order) {
        const { a, b } = edges[idx];
        let bestColor = 0;
        let bestCount = Infinity;

        for (let c = 0; c < colors; c++) {
            let count = 0;
            for (let k = 0; k < n; k++) {
                if (k === a || k === b) continue;
                if (cm[a][k] === c && cm[b][k] === c) count++;
            }
            if (count < bestCount || (count === bestCount && rng() < 0.3)) {
                bestCount = count;
                bestColor = c;
            }
        }

        edges[idx].color = bestColor;
        cm[a][b] = bestColor;
        cm[b][a] = bestColor;
    }

    return edges;
}


// ── Clique detection ────────────────────────────────────────────

export function findMonochromaticCliques(
    n: number, edges: Edge[], cliqueSize: number,
): Clique[] {
    const colorOf = new Map<string, number>();
    for (const e of edges) {
        colorOf.set(`${e.a},${e.b}`, e.color);
        colorOf.set(`${e.b},${e.a}`, e.color);
    }

    const cliques: Clique[] = [];
    const subset: number[] = [];

    function enumerate(start: number, depth: number) {
        if (depth === cliqueSize) {
            const c0 = colorOf.get(`${subset[0]},${subset[1]}`);
            if (c0 === undefined) return;
            for (let i = 0; i < subset.length; i++) {
                for (let j = i + 1; j < subset.length; j++) {
                    if (colorOf.get(`${subset[i]},${subset[j]}`) !== c0) return;
                }
            }
            cliques.push({ vertices: [...subset], color: c0 });
            return;
        }
        for (let v = start; v < n; v++) {
            subset.push(v);
            enumerate(v + 1, depth + 1);
            subset.pop();
        }
    }

    enumerate(0, 0);
    return cliques;
}


// ── Stats ───────────────────────────────────────────────────────

export function computeChaosStats(
    n: number, edges: Edge[], colors: number, cliqueSize: number,
): ChaosStats {
    const cliques = findMonochromaticCliques(n, edges, cliqueSize);

    const involvedEdges = new Set<string>();
    const involvedVertices = new Set<number>();
    for (const clique of cliques) {
        for (const v of clique.vertices) involvedVertices.add(v);
        for (let i = 0; i < clique.vertices.length; i++) {
            for (let j = i + 1; j < clique.vertices.length; j++) {
                const a = Math.min(clique.vertices[i], clique.vertices[j]);
                const b = Math.max(clique.vertices[i], clique.vertices[j]);
                involvedEdges.add(`${a},${b}`);
            }
        }
    }

    const ramseyNumber = colors === 2 ? getRamseyNumber(cliqueSize, cliqueSize) : null;

    return {
        totalEdges: edges.length,
        cliquesFound: cliques.length,
        cliques,
        ramseyNumber,
        structureForced: ramseyNumber !== null && n >= ramseyNumber,
        chaosCost: involvedEdges.size,
        structureRatio: edges.length > 0 ? involvedEdges.size / edges.length : 0,
        verticesInvolved: involvedVertices.size,
    };
}


// ── SVG path ────────────────────────────────────────────────────

export function edgePath(
    p1: NodePoint, p2: NodePoint,
    bend: number, symmetric: boolean,
    index: number, layer: number, layers: number,
): string {
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const parity = symmetric ? (index % 2 === 0 ? 1 : -1) : 1;
    const layerShift = layers <= 1 ? 0 : layer - (layers - 1) / 2;
    const strength = bend * (0.25 + len / 320);
    const c1x = mx + nx * strength * 75 * parity + nx * layerShift * 16;
    const c1y = my + ny * strength * 75 * parity + ny * layerShift * 16;

    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}
