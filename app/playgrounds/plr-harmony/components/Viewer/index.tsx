'use client';

import { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from 'react';
import { ViewerRef } from '../../playground';

// Types
type Quality = "M" | "m";

interface Triad {
    root: number;
    q: Quality;
}

type OpName = "P" | "L" | "R";

interface PathResult {
    distance: number;
    onePath: OpName[];
    allPaths: OpName[][];
}

// Constants
const NOTE_SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Helper functions
function mod12(n: number) {
    return ((n % 12) + 12) % 12;
}

function triadKey(t: Triad) {
    return `${t.root}${t.q}`;
}

function triadEquals(a: Triad, b: Triad) {
    return a.root === b.root && a.q === b.q;
}

function triadPcs(t: Triad): number[] {
    const r = t.root;
    if (t.q === "M") return [r, mod12(r + 4), mod12(r + 7)];
    return [r, mod12(r + 3), mod12(r + 7)];
}

function triadLabel(t: Triad, useFlats = false) {
    const names = useFlats ? NOTE_FLATS : NOTE_SHARPS;
    return `${names[t.root]} ${t.q === "M" ? "maj" : "min"}`;
}

// PLR operations
function P(t: Triad): Triad {
    return { root: t.root, q: t.q === "M" ? "m" : "M" };
}

function L(t: Triad): Triad {
    return t.q === "M"
        ? { root: mod12(t.root + 4), q: "m" }
        : { root: mod12(t.root - 4), q: "M" };
}

function R(t: Triad): Triad {
    return t.q === "M"
        ? { root: mod12(t.root - 3), q: "m" }
        : { root: mod12(t.root + 3), q: "M" };
}

const OPS = { P, L, R };

function applyOp(t: Triad, op: OpName): Triad {
    return OPS[op](t);
}

const ALL_TRIADS: Triad[] = Array.from({ length: 24 }, (_, i) => ({
    root: i % 12,
    q: i < 12 ? ("M" as Quality) : ("m" as Quality),
}));

// BFS for shortest paths
function bfsAllShortestPaths(start: Triad, goal: Triad, maxPaths = 32): PathResult {
    if (triadEquals(start, goal)) return { distance: 0, onePath: [], allPaths: [[]] };

    const startKey = triadKey(start);
    const goalKey = triadKey(goal);
    const preds: Record<string, { prev: string; op: OpName }[]> = {};
    const q: string[] = [];
    const seen = new Set<string>();
    q.push(startKey);
    seen.add(startKey);

    const keyToTriad = new Map<string, Triad>();
    ALL_TRIADS.forEach((t) => keyToTriad.set(triadKey(t), t));
    keyToTriad.set(startKey, start);
    keyToTriad.set(goalKey, goal);

    let foundDistance = -1;
    let found = false;

    while (q.length > 0 && !found) {
        const layerSize = q.length;
        const layerNodes = q.splice(0, layerSize);

        for (const key of layerNodes) {
            const t = keyToTriad.get(key)!;
            (Object.keys(OPS) as OpName[]).forEach((op) => {
                const u = applyOp(t, op);
                const uKey = triadKey(u);
                if (!preds[uKey]) preds[uKey] = [];
                preds[uKey].push({ prev: key, op });
                if (!seen.has(uKey)) {
                    seen.add(uKey);
                    q.push(uKey);
                }
            });
        }

        if (seen.has(goalKey)) {
            found = true;
            if (foundDistance < 0) {
                const one = backtrackOne(preds, startKey, goalKey);
                foundDistance = one.length;
            }
        }
    }

    if (!found) return { distance: -1, onePath: [], allPaths: [] };

    const all = backtrackAll(preds, startKey, goalKey, maxPaths);
    const one = all[0] ?? [];
    return { distance: one.length, onePath: one, allPaths: all };
}

function backtrackOne(
    preds: Record<string, { prev: string; op: OpName }[]>,
    startKey: string,
    goalKey: string
): OpName[] {
    const path: OpName[] = [];
    let current = goalKey;
    const visited = new Set<string>();
    while (current !== startKey) {
        const options = preds[current];
        if (!options || options.length === 0) break;
        let moved = false;
        for (const { prev, op } of options) {
            if (visited.has(prev)) continue;
            path.push(op);
            current = prev;
            moved = true;
            break;
        }
        if (!moved) break;
    }
    return path.reverse();
}

function backtrackAll(
    preds: Record<string, { prev: string; op: OpName }[]>,
    startKey: string,
    goalKey: string,
    maxPaths: number
): OpName[][] {
    const results: OpName[][] = [];

    function dfs(node: string, acc: OpName[]) {
        if (results.length >= maxPaths) return;
        if (node === startKey) {
            results.push([...acc].reverse());
            return;
        }
        const options = preds[node] || [];
        for (const { prev, op } of options) {
            acc.push(op);
            dfs(prev, acc);
            acc.pop();
            if (results.length >= maxPaths) return;
        }
    }
    dfs(goalKey, []);
    const dedup = Array.from(new Set(results.map((r) => r.join("")))).map((s) =>
        s.split("") as OpName[]
    );
    return dedup;
}

// Weighted Dijkstra
function dijkstraWeighted(
    start: Triad,
    goal: Triad,
    weights: Record<OpName, number>
): { cost: number; path: OpName[] } {
    const startKey = triadKey(start);
    const goalKey = triadKey(goal);
    const keyToTriad = new Map<string, Triad>();
    ALL_TRIADS.forEach((t) => keyToTriad.set(triadKey(t), t));
    keyToTriad.set(startKey, start);
    keyToTriad.set(goalKey, goal);

    const dist = new Map<string, number>();
    const prev = new Map<string, { key: string; op: OpName } | null>();
    const Q = new Set<string>();

    for (const t of ALL_TRIADS) {
        const k = triadKey(t);
        dist.set(k, Infinity);
        prev.set(k, null);
        Q.add(k);
    }
    dist.set(startKey, 0);
    Q.add(startKey);

    function extractMin(): string | null {
        let best: string | null = null;
        let bestD = Infinity;
        for (const k of Q) {
            const d = dist.get(k)!;
            if (d < bestD) {
                bestD = d;
                best = k;
            }
        }
        if (best) Q.delete(best);
        return best;
    }

    while (Q.size > 0) {
        const uKey = extractMin();
        if (!uKey) break;
        if (uKey === goalKey) break;
        const u = keyToTriad.get(uKey) || ALL_TRIADS.find((x) => triadKey(x) === uKey)!;

        (Object.keys(OPS) as OpName[]).forEach((op) => {
            const v = applyOp(u, op);
            const vKey = triadKey(v);
            const alt = dist.get(uKey)! + (weights[op] ?? 1);
            if (alt < dist.get(vKey)!) {
                dist.set(vKey, alt);
                prev.set(vKey, { key: uKey, op });
                Q.add(vKey);
            }
        });
    }

    const path: OpName[] = [];
    let cur = goalKey;
    if (dist.get(cur)! === Infinity) return { cost: Infinity, path };
    while (cur !== startKey) {
        const p = prev.get(cur);
        if (!p) break;
        path.push(p.op);
        cur = p.key;
    }
    return { cost: dist.get(goalKey)!, path: path.reverse() };
}

function realizePath(start: Triad, ops: OpName[]): Triad[] {
    const seq: Triad[] = [start];
    let cur = start;
    for (const op of ops) {
        cur = applyOp(cur, op);
        seq.push(cur);
    }
    return seq;
}

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState({
        srcRoot: 0,
        srcMaj: true,
        dstRoot: 4,
        dstMaj: true,
        maxPaths: 16,
        rWeight: 2,
        useFlats: false
    });

    useImperativeHandle(ref, () => ({
        updateVisualization: (newParams) => {
            setParams(newParams);
        }
    }));

    const src: Triad = useMemo(() => ({ 
        root: params.srcRoot, 
        q: params.srcMaj ? "M" : "m" 
    }), [params.srcRoot, params.srcMaj]);
    
    const dst: Triad = useMemo(() => ({ 
        root: params.dstRoot, 
        q: params.dstMaj ? "M" : "m" 
    }), [params.dstRoot, params.dstMaj]);

    const unweighted = useMemo(() => 
        bfsAllShortestPaths(src, dst, params.maxPaths), 
        [src, dst, params.maxPaths]
    );
    
    const weighted = useMemo(() => 
        dijkstraWeighted(src, dst, { P: 1, L: 1, R: Math.max(1, params.rWeight) }),
        [src, dst, params.rWeight]
    );

    const realized = useMemo(() => 
        realizePath(src, unweighted.onePath), 
        [src, unweighted.onePath]
    );

    const names = params.useFlats ? NOTE_FLATS : NOTE_SHARPS;

    return (
        <div className="w-full h-full bg-black border border-lime-500/20 p-6 overflow-auto">
            <div className="space-y-6">
                {/* Source and Target Display */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black border border-lime-500/20 p-4">
                        <h3 className="text-lime-400 font-semibold mb-2">Source</h3>
                        <div className="text-2xl text-white font-mono">
                            {triadLabel(src, params.useFlats)}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            {triadPcs(src).map(p => names[p]).join(" · ")}
                        </div>
                    </div>
                    <div className="bg-black border border-lime-500/20 p-4">
                        <h3 className="text-lime-400 font-semibold mb-2">Target</h3>
                        <div className="text-2xl text-white font-mono">
                            {triadLabel(dst, params.useFlats)}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            {triadPcs(dst).map(p => names[p]).join(" · ")}
                        </div>
                    </div>
                </div>

                {/* Unweighted Shortest Path */}
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">Unweighted Shortest Path</h3>
                    <div className="space-y-2">
                        <div className="flex gap-4">
                            <span className="text-gray-400">Distance:</span>
                            <span className="text-white font-mono">
                                {unweighted.distance >= 0 ? unweighted.distance : "∞"}
                            </span>
                        </div>
                        {unweighted.onePath.length > 0 && (
                            <div>
                                <div className="text-gray-400 mb-2">Path:</div>
                                <div className="flex flex-wrap gap-2">
                                    {unweighted.onePath.map((op, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-lime-500/10 border border-lime-500/30 text-lime-400 font-mono"
                                        >
                                            {op}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Weighted Path */}
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">
                        Weighted Path (P=1, L=1, R={params.rWeight})
                    </h3>
                    <div className="space-y-2">
                        <div className="flex gap-4">
                            <span className="text-gray-400">Cost:</span>
                            <span className="text-white font-mono">
                                {Number.isFinite(weighted.cost) ? weighted.cost : "∞"}
                            </span>
                        </div>
                        {weighted.path.length > 0 && (
                            <div>
                                <div className="text-gray-400 mb-2">Path:</div>
                                <div className="flex flex-wrap gap-2">
                                    {weighted.path.map((op, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-lime-500/10 border border-lime-500/30 text-lime-400 font-mono"
                                        >
                                            {op}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Path Realization */}
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">Path Realization</h3>
                    <div className="space-y-2">
                        {realized.map((t, i) => (
                            <div key={i} className="flex items-center gap-4">
                                {i > 0 && (
                                    <span className="text-lime-400/60 font-mono w-8 text-center">
                                        {unweighted.onePath[i - 1]}
                                    </span>
                                )}
                                {i === 0 && (
                                    <span className="w-8"></span>
                                )}
                                <div className="flex-1 bg-black border border-lime-500/10 px-3 py-2">
                                    <span className="text-white font-mono">
                                        {triadLabel(t, params.useFlats)}
                                    </span>
                                    <span className="text-gray-500 ml-3 text-sm">
                                        {triadPcs(t).map(p => names[p]).join(" · ")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Minimal Paths */}
                <div className="bg-black border border-lime-500/20 p-4">
                    <h3 className="text-lime-400 font-semibold mb-3">
                        All Minimal Paths (showing {unweighted.allPaths.length} of max {params.maxPaths})
                    </h3>
                    {unweighted.allPaths.length === 0 ? (
                        <div className="text-gray-400">No paths found</div>
                    ) : (
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            {unweighted.allPaths.map((ops, idx) => (
                                <div key={idx} className="font-mono text-sm">
                                    <span className="text-gray-500 mr-3">{idx + 1}.</span>
                                    <span className="text-lime-400">
                                        {ops.length === 0 ? "∅ (same triad)" : ops.join(" ")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;