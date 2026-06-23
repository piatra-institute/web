// Geometry becoming topology: the same set of points carries metric structure
// (exact distances) and topological structure (what is connected, how many
// independent loops). The topological invariants are the Betti numbers of the
// graph: b0 is the number of connected components, and b1 is the cycle rank,
// b1 = edges - vertices + components, which counts independent loops and is the
// graph analogue of genus. These are computed from the adjacency alone, so they
// are unchanged by any continuous deformation that preserves the connections.
// Pure functions used by the calibration.

// Euclidean distance: the metric (geometric) quantity, sensitive to coordinates.
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// number of connected components (b0) via breadth-first search over adjacency
export function connectedComponents(adjacency: number[][]): number {
    const n = adjacency.length;
    const visited = new Array(n).fill(false);
    let components = 0;
    for (let i = 0; i < n; i++) {
        if (visited[i]) continue;
        components++;
        const queue = [i];
        visited[i] = true;
        while (queue.length > 0) {
            const u = queue.shift() as number;
            for (const v of adjacency[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    queue.push(v);
                }
            }
        }
    }
    return components;
}

export function edgeCount(adjacency: number[][]): number {
    let half = 0;
    for (const row of adjacency) half += row.length;
    return half / 2; // each undirected edge is listed at both endpoints
}

// first Betti number (cycle rank): independent loops in the graph
export function betti1(adjacency: number[][]): number {
    const v = adjacency.length;
    const e = edgeCount(adjacency);
    const c = connectedComponents(adjacency);
    return Math.max(0, e - v + c);
}

// Euler characteristic of the 1-complex (graph): V - E = b0 - b1
export function eulerCharacteristic(adjacency: number[][]): number {
    return adjacency.length - edgeCount(adjacency);
}
