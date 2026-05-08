'use client';

import React, { useMemo } from 'react';

import { NODES, EDGES, HYPEREDGES, GraphNode, LayerKey, LAYER_LABELS } from '../../logic';


interface MoralGraphProps {
    visibleLayers: Record<LayerKey, boolean>;
    onToggleLayer: (key: LayerKey) => void;
    selectedNode: string | null;
    onSelectNode: (id: string | null) => void;
    activeEdges: { from: string; to: string }[];
    showHyperedges: boolean;
    onToggleHyperedges: () => void;
}

const W = 800;
const H = 460;

function nodeXY(n: GraphNode) {
    return { x: (n.x / 100) * W, y: (n.y / 100) * H };
}

function hyperedgeCentroidAndRadius(nodes: GraphNode[]) {
    if (nodes.length === 0) return { cx: 0, cy: 0, rx: 0, ry: 0 };
    let cx = 0, cy = 0;
    for (const n of nodes) {
        const { x, y } = nodeXY(n);
        cx += x;
        cy += y;
    }
    cx /= nodes.length;
    cy /= nodes.length;
    let maxDx = 0, maxDy = 0;
    for (const n of nodes) {
        const { x, y } = nodeXY(n);
        maxDx = Math.max(maxDx, Math.abs(x - cx));
        maxDy = Math.max(maxDy, Math.abs(y - cy));
    }
    return { cx, cy, rx: maxDx + 36, ry: maxDy + 28 };
}

export default function MoralGraph({
    visibleLayers,
    onToggleLayer,
    selectedNode,
    onSelectNode,
    activeEdges,
    showHyperedges,
    onToggleHyperedges,
}: MoralGraphProps) {
    const visibleNodes = useMemo(
        () => NODES.filter((n) => visibleLayers[n.layer]),
        [visibleLayers],
    );
    const visibleSet = useMemo(() => new Set(visibleNodes.map((n) => n.id)), [visibleNodes]);
    const visibleEdges = useMemo(
        () => EDGES.filter((e) => visibleSet.has(e.from) && visibleSet.has(e.to)),
        [visibleSet],
    );
    const visibleHyperedges = useMemo(
        () => HYPEREDGES.filter((h) => h.nodes.every((id) => visibleSet.has(id))),
        [visibleSet],
    );

    const activeEdgeKey = (e: { from: string; to: string }) => `${e.from}->${e.to}`;
    const activeSet = useMemo(
        () => new Set(activeEdges.flatMap((e) => [activeEdgeKey(e), `${e.to}->${e.from}`])),
        [activeEdges],
    );

    const layerKeys: LayerKey[] = ['neural', 'interpersonal', 'institutional', 'ecological', 'historical'];

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-1 items-center">
                {layerKeys.map((k) => (
                    <button
                        key={k}
                        onClick={() => onToggleLayer(k)}
                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                            visibleLayers[k]
                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                : 'border-lime-500/20 text-lime-200/40 hover:border-lime-500/40'
                        }`}
                    >
                        {LAYER_LABELS[k]}
                    </button>
                ))}
                <div className="flex-1" />
                <button
                    onClick={onToggleHyperedges}
                    className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                        showHyperedges
                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                            : 'border-lime-500/20 text-lime-200/40 hover:border-lime-500/40'
                    }`}
                >
                    hyperedges
                </button>
            </div>

            <div className="border border-lime-500/30 bg-[#0a0a0a]">
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                    {/* Layer band backgrounds */}
                    {layerKeys.map((k, i) => {
                        if (!visibleLayers[k]) return null;
                        const yBand = (i / 5) * H;
                        return (
                            <text
                                key={k}
                                x={6}
                                y={yBand + 10}
                                fontSize="9"
                                fill="#84cc16"
                                opacity={0.25}
                                fontFamily="monospace"
                            >
                                {LAYER_LABELS[k]}
                            </text>
                        );
                    })}

                    {/* Hyperedges */}
                    {showHyperedges && visibleHyperedges.map((h) => {
                        const ns = h.nodes
                            .map((id) => NODES.find((n) => n.id === id))
                            .filter((n): n is GraphNode => !!n);
                        const { cx, cy, rx, ry } = hyperedgeCentroidAndRadius(ns);
                        return (
                            <g key={h.id}>
                                <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
                                    fill="rgba(251, 146, 60, 0.06)"
                                    stroke="#fb923c"
                                    strokeWidth={1}
                                    strokeDasharray="4 3"
                                    strokeOpacity={0.5}
                                />
                                <text x={cx} y={cy - ry + 12} textAnchor="middle" fontSize="10"
                                    fill="#fb923c" opacity={0.8} fontFamily="monospace">
                                    {h.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Edges */}
                    {visibleEdges.map((e) => {
                        const from = NODES.find((n) => n.id === e.from)!;
                        const to = NODES.find((n) => n.id === e.to)!;
                        const a = nodeXY(from);
                        const b = nodeXY(to);
                        const isActive = activeSet.has(activeEdgeKey(e));
                        return (
                            <g key={`${e.from}-${e.to}`}>
                                <line
                                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                                    stroke={isActive ? '#a3e635' : '#84cc16'}
                                    strokeWidth={isActive ? 2.4 : 1}
                                    strokeOpacity={isActive ? 0.9 : 0.32}
                                    strokeDasharray={e.style === 'dashed' ? '5 3' : undefined}
                                />
                                {e.label && (
                                    <text
                                        x={(a.x + b.x) / 2}
                                        y={(a.y + b.y) / 2 - 4}
                                        textAnchor="middle"
                                        fontSize="9"
                                        fill={isActive ? '#a3e635' : '#84cc16'}
                                        opacity={isActive ? 0.95 : 0.45}
                                        fontFamily="monospace"
                                    >
                                        {e.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Nodes */}
                    {visibleNodes.map((n) => {
                        const { x, y } = nodeXY(n);
                        const isSelected = selectedNode === n.id;
                        return (
                            <g
                                key={n.id}
                                onClick={() => onSelectNode(isSelected ? null : n.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <circle
                                    cx={x} cy={y} r={isSelected ? 22 : 18}
                                    fill={isSelected ? 'rgba(132, 204, 22, 0.25)' : 'rgba(132, 204, 22, 0.10)'}
                                    stroke={isSelected ? '#a3e635' : '#84cc16'}
                                    strokeWidth={isSelected ? 2 : 1.4}
                                />
                                <text
                                    x={x} y={y + 3} textAnchor="middle" fontSize="11"
                                    fill={isSelected ? '#a3e635' : '#bef264'}
                                    fontFamily="monospace"
                                >
                                    {n.label}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {selectedNode && (() => {
                const node = NODES.find((n) => n.id === selectedNode);
                if (!node) return null;
                return (
                    <div className="border border-lime-500/20 p-3 text-xs space-y-1">
                        <div className="text-lime-400 font-semibold">{node.label}</div>
                        <div className="text-lime-200/40 uppercase tracking-wide text-[10px]">
                            {LAYER_LABELS[node.layer]} layer
                        </div>
                        <div className="text-lime-200/70 leading-relaxed">{node.description}</div>
                    </div>
                );
            })()}
        </div>
    );
}
