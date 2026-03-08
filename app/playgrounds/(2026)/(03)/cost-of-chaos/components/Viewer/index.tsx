'use client';

import { useRef, useState, useMemo } from 'react';

import {
    NodePoint,
    Edge,
    ChaosStats,
    Params,
    EDGE_COLORS,
    edgePath,
} from '../../logic';

const SVG_W = 800;
const SVG_H = 600;

interface ViewerProps {
    positions: NodePoint[];
    edges: Edge[];
    stats: ChaosStats;
    params: Params;
    onPositionsChange: (positions: NodePoint[]) => void;
}

export default function Viewer({
    positions,
    edges,
    stats,
    params,
    onPositionsChange,
}: ViewerProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [dragging, setDragging] = useState<number | null>(null);
    const [hoverLayer, setHoverLayer] = useState<number | null>(null);

    const cliqueEdgeSet = useMemo(() => {
        const set = new Set<string>();
        for (const clique of stats.cliques) {
            for (let i = 0; i < clique.vertices.length; i++) {
                for (let j = i + 1; j < clique.vertices.length; j++) {
                    const a = Math.min(clique.vertices[i], clique.vertices[j]);
                    const b = Math.max(clique.vertices[i], clique.vertices[j]);
                    set.add(`${a},${b}`);
                }
            }
        }
        return set;
    }, [stats.cliques]);

    const cliqueVertexSet = useMemo(() => {
        const set = new Set<number>();
        for (const clique of stats.cliques) {
            for (const v of clique.vertices) set.add(v);
        }
        return set;
    }, [stats.cliques]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (dragging === null || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = Math.max(24, Math.min(SVG_W - 24, ((e.clientX - rect.left) / rect.width) * SVG_W));
        const y = Math.max(24, Math.min(SVG_H - 24, ((e.clientY - rect.top) / rect.height) * SVG_H));
        onPositionsChange(
            positions.map(p => p.id === dragging ? { ...p, x, y } : p),
        );
    };

    const hasCliques = params.highlightCliques && stats.cliquesFound > 0;

    return (
        <div className="w-[90vw] h-[90vh] flex flex-col items-center justify-center outline-none [&_*]:outline-none">
            <div className="flex flex-wrap gap-4 mb-4 text-xs font-mono">
                <div>
                    <span className="text-lime-200/60">vertices</span>{' '}
                    <span className="text-lime-400">{params.nodeCount}</span>
                </div>
                <div>
                    <span className="text-lime-200/60">edges</span>{' '}
                    <span className="text-lime-400">{stats.totalEdges}</span>
                </div>
                <div>
                    <span className="text-lime-200/60">{'mono K'}</span>
                    <sub className="text-lime-200/60">{params.cliqueSize}</sub>{' '}
                    <span className={stats.cliquesFound > 0 ? 'text-red-400' : 'text-lime-400'}>
                        {stats.cliquesFound}
                    </span>
                </div>
                <div>
                    <span className="text-lime-200/60">chaos cost</span>{' '}
                    <span className={stats.structureRatio > 0 ? 'text-red-400' : 'text-lime-400'}>
                        {(stats.structureRatio * 100).toFixed(0)}%
                    </span>
                </div>
                {stats.ramseyNumber && (
                    <div>
                        <span className="text-lime-200/60">
                            R({params.cliqueSize},{params.cliqueSize})
                        </span>{' '}
                        <span className="text-lime-400">= {stats.ramseyNumber}</span>
                        {stats.structureForced && (
                            <span className="text-red-400 ml-1">forced</span>
                        )}
                    </div>
                )}
            </div>

            <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                className="w-full max-w-[800px] aspect-[4/3] touch-none select-none"
                onPointerMove={handlePointerMove}
                onPointerUp={() => setDragging(null)}
                onPointerLeave={() => setDragging(null)}
            >
                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="#0a0a0a" />

                <defs>
                    <filter id="edge-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {edges.map((edge, index) => {
                    const p1 = positions[edge.a];
                    const p2 = positions[edge.b];
                    if (!p1 || !p2) return null;

                    const color = EDGE_COLORS[edge.color % EDGE_COLORS.length];
                    const key = `${Math.min(edge.a, edge.b)},${Math.max(edge.a, edge.b)}`;
                    const inClique = cliqueEdgeSet.has(key);
                    const layerIsolated = hoverLayer !== null && hoverLayer !== edge.color;

                    let opacity = 0.5;
                    let strokeWidth = 1.8;

                    if (hasCliques) {
                        if (inClique) {
                            opacity = 0.85;
                            strokeWidth = 2.8;
                        } else {
                            opacity = 0.12;
                        }
                    }

                    if (layerIsolated) {
                        opacity = 0.08;
                        strokeWidth = 1;
                    }

                    return (
                        <path
                            key={`${edge.a}-${edge.b}`}
                            d={edgePath(p1, p2, params.bend, params.symmetric, index, edge.color, params.colors)}
                            fill="none"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            opacity={opacity}
                            strokeLinecap="round"
                            filter={inClique && params.highlightCliques ? 'url(#edge-glow)' : undefined}
                        />
                    );
                })}

                {positions.map((point) => {
                    const inClique = cliqueVertexSet.has(point.id);
                    return (
                        <g
                            key={point.id}
                            transform={`translate(${point.x}, ${point.y})`}
                            onPointerDown={(e) => {
                                e.preventDefault();
                                setDragging(point.id);
                            }}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            {inClique && params.highlightCliques && (
                                <circle r="13" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
                            )}
                            <circle r="7" fill="#84cc16" />
                            <circle r="15" fill="transparent" />
                            {params.showLabels && (
                                <text
                                    x="11"
                                    y="-11"
                                    fontSize="12"
                                    fill="#84cc16"
                                    opacity="0.7"
                                    style={{ userSelect: 'none' }}
                                >
                                    {point.id}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            <div className="flex flex-wrap gap-3 mt-4">
                {Array.from({ length: params.colors }, (_, layer) => {
                    const edgeCount = edges.filter(e => e.color === layer).length;
                    const active = hoverLayer === layer;
                    return (
                        <button
                            key={layer}
                            onMouseEnter={() => setHoverLayer(layer)}
                            onMouseLeave={() => setHoverLayer(null)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs border transition ${
                                active
                                    ? 'border-lime-500 bg-lime-500/10'
                                    : 'border-lime-500/20 hover:border-lime-500/40'
                            }`}
                        >
                            <span
                                className="w-3 h-3"
                                style={{ backgroundColor: EDGE_COLORS[layer % EDGE_COLORS.length] }}
                            />
                            <span className="text-lime-200/70">{edgeCount} edges</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
