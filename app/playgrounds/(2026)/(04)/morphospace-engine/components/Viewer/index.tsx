'use client';

import { useMemo, useRef, useEffect, useCallback, useState } from 'react';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    GraphNode, Edge, FieldResult, NodeType,
    TYPE_META, NODE_COLORS, FIELD_RESOLUTION,
    cellColor, uid,
} from '../../logic';


interface ViewerProps {
    graph: { nodes: GraphNode[]; edges: Edge[] };
    onGraphChange: (g: { nodes: GraphNode[]; edges: Edge[] }) => void;
    field: FieldResult;
    selectedNodeId: string | null;
    onSelectNode: (id: string | null) => void;
    connectFromId: string | null;
    onConnectFrom: (id: string | null) => void;
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    playing: boolean;
}

const CANVAS_W = 980;
const CANVAS_H = 560;


function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="border border-lime-500/20 p-3">
            <div className="text-xs text-lime-200/50 uppercase tracking-wider">{label}</div>
            <div className="mt-1 font-mono text-lg text-lime-400">{value}</div>
            {sub && <div className="text-xs text-lime-200/40 mt-0.5">{sub}</div>}
        </div>
    );
}


export default function Viewer({
    graph, onGraphChange, field, selectedNodeId, onSelectNode,
    connectFromId, onConnectFrom, sensitivityBars, assumptions, versions,
    playing,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'graph' | 'field' | 'analysis'>('graph');
    const canvasRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

    // Drag handling
    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            if (!dragRef.current || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const scaleX = CANVAS_W / rect.width;
            const scaleY = CANVAS_H / rect.height;
            const x = Math.max(40, Math.min(CANVAS_W - 40, (e.clientX - rect.left) * scaleX - dragRef.current.dx));
            const y = Math.max(40, Math.min(CANVAS_H - 40, (e.clientY - rect.top) * scaleY - dragRef.current.dy));
            onGraphChange({
                ...graph,
                nodes: graph.nodes.map(n =>
                    n.id === dragRef.current!.id ? { ...n, x, y } : n,
                ),
            });
        };
        const onUp = () => { dragRef.current = null; };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [graph, onGraphChange]);

    const startDrag = useCallback((e: React.PointerEvent, node: GraphNode) => {
        e.stopPropagation();
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = CANVAS_W / rect.width;
        const scaleY = CANVAS_H / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        dragRef.current = {
            id: node.id,
            dx: mouseX - node.x,
            dy: mouseY - node.y,
        };
        onSelectNode(node.id);
    }, [onSelectNode]);

    const beginConnect = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        onSelectNode(nodeId);
        onConnectFrom(connectFromId === nodeId ? null : nodeId);
    }, [connectFromId, onSelectNode, onConnectFrom]);

    const completeConnect = useCallback((e: React.MouseEvent, nodeId: string) => {
        e.stopPropagation();
        if (!connectFromId || connectFromId === nodeId) return;
        const exists = graph.edges.some(edge => edge.from === connectFromId && edge.to === nodeId);
        if (!exists) {
            onGraphChange({
                ...graph,
                edges: [...graph.edges, { id: uid('edge'), from: connectFromId, to: nodeId, weight: 0.72 }],
            });
        }
        onConnectFrom(null);
    }, [connectFromId, graph, onGraphChange, onConnectFrom]);

    const observationMap = useMemo(() => {
        const map: Record<string, number> = {};
        field.observationReadings.forEach(r => { map[r.id] = r.value; });
        return map;
    }, [field.observationReadings]);

    const tabs: { key: typeof activeTab; label: string }[] = [
        { key: 'graph', label: 'graph' },
        { key: 'field', label: 'morphology field' },
        { key: 'analysis', label: 'analysis' },
    ];

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Summary */}
            <div className="border border-lime-500/20 p-4 mb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs text-lime-200/40 uppercase tracking-wider">current phenotype</div>
                        <div className="text-lg text-lime-400 font-semibold mt-1">{field.morphologyLabel}</div>
                        <div className="text-xs text-lime-200/50 mt-1">
                            {graph.nodes.length} nodes {'\u00B7'} {graph.edges.length} edges {'\u00B7'} {playing ? 'evolving' : 'paused'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryCard label="energy" value={field.metrics.energy.toFixed(2)} sub="mean field magnitude" />
                <SummaryCard label="coherence" value={field.metrics.coherence.toFixed(2)} sub="spatial organization" />
                <SummaryCard label="e mitigation" value={(1 - field.metrics.eLeakage).toFixed(2)} sub="constant containment" />
                <SummaryCard label="platonic depth" value={field.metrics.platonicDepth.toFixed(2)} sub="invisible-realm influence" />
            </div>

            <div className="mb-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-1.5 text-xs border transition-colors ${
                            activeTab === t.key
                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Graph tab */}
            {activeTab === 'graph' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Drag nodes to reposition. Click output port (right) to start a connection, then click input port (left) of target.
                    </div>

                    <div
                        ref={canvasRef}
                        className="relative border border-lime-500/20 overflow-hidden"
                        style={{ width: '100%', paddingBottom: `${(CANVAS_H / CANVAS_W) * 100}%` }}
                        onPointerDown={() => {
                            onSelectNode(null);
                            onConnectFrom(null);
                        }}
                    >
                        {/* SVG edges */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient id="edgeGlow" x1="0" x2="1">
                                    <stop offset="0%" stopColor="rgba(163,230,53,0.2)" />
                                    <stop offset="50%" stopColor="rgba(132,204,22,0.5)" />
                                    <stop offset="100%" stopColor="rgba(163,230,53,0.2)" />
                                </linearGradient>
                            </defs>
                            {graph.edges.map(edge => {
                                const from = graph.nodes.find(n => n.id === edge.from);
                                const to = graph.nodes.find(n => n.id === edge.to);
                                if (!from || !to) return null;
                                const x1 = from.x + 70;
                                const y1 = from.y;
                                const x2 = to.x - 70;
                                const y2 = to.y;
                                const dx = Math.max(60, Math.abs(x2 - x1) * 0.42);
                                const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                                return (
                                    <g key={edge.id}>
                                        <path d={d} fill="none" stroke="rgba(163,230,53,0.08)" strokeWidth={3 + edge.weight * 2} />
                                        <path d={d} fill="none" stroke="url(#edgeGlow)" strokeWidth={1 + edge.weight * 1.2} />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Node cards */}
                        <div className="absolute inset-0">
                            {graph.nodes.map(node => {
                                const isSelected = selectedNodeId === node.id;
                                const isConnectSource = connectFromId === node.id;
                                const obs = observationMap[node.id];
                                return (
                                    <div
                                        key={node.id}
                                        className="absolute"
                                        style={{
                                            left: `${(node.x / CANVAS_W) * 100}%`,
                                            top: `${(node.y / CANVAS_H) * 100}%`,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        <button
                                            onPointerDown={e => startDrag(e, node)}
                                            onClick={e => { e.stopPropagation(); onSelectNode(node.id); }}
                                            className={`relative w-[140px] border p-2 text-left shadow-lg transition-colors ${
                                                isSelected
                                                    ? 'border-lime-500/60 bg-lime-500/10'
                                                    : 'border-lime-500/20 bg-black/80 hover:bg-lime-500/5'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-1">
                                                <div>
                                                    <div className="text-[9px] uppercase tracking-wider text-lime-200/40">
                                                        {TYPE_META[node.type].label}
                                                    </div>
                                                    <div className="mt-0.5 text-xs font-medium text-lime-200 leading-tight truncate max-w-[100px]">
                                                        {node.label}
                                                    </div>
                                                </div>
                                                <div className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" style={{ background: NODE_COLORS[node.type] }} />
                                            </div>
                                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-lime-200/40">
                                                <span>drag</span>
                                                <span className="font-mono text-lime-200/60">
                                                    {(field.effective[node.id] ?? 0).toFixed(2)}
                                                </span>
                                            </div>
                                            {obs !== undefined && (
                                                <div className="mt-1 border border-rose-500/20 bg-rose-500/5 px-1.5 py-0.5 text-[10px] text-rose-300/70">
                                                    sensed: {obs.toFixed(3)}
                                                </div>
                                            )}
                                        </button>

                                        {/* Input port */}
                                        <button
                                            onClick={e => completeConnect(e, node.id)}
                                            className="absolute left-[-7px] top-1/2 w-3.5 h-3.5 -translate-y-1/2 border border-lime-500/30 bg-black shadow-sm hover:bg-lime-500/20"
                                            title="Input"
                                        />
                                        {/* Output port */}
                                        <button
                                            onClick={e => beginConnect(e, node.id)}
                                            className={`absolute right-[-7px] top-1/2 w-3.5 h-3.5 -translate-y-1/2 border shadow-sm ${
                                                isConnectSource
                                                    ? 'border-lime-400 bg-lime-500/60'
                                                    : 'border-lime-500/30 bg-black hover:bg-lime-500/20'
                                            }`}
                                            title="Output"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {connectFromId && (
                        <div className="border border-lime-500/30 bg-lime-500/5 p-2 text-xs text-lime-400">
                            Connecting from &ldquo;{graph.nodes.find(n => n.id === connectFromId)?.label}&rdquo; {'\u2014'} click a target node&apos;s input port
                        </div>
                    )}
                </div>
            )}

            {/* Morphology field tab */}
            {activeTab === 'field' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Real-time morphology field computed from the node graph. Each cell is colored by value: lime for positive, magenta for negative.
                    </div>

                    <div className="border border-lime-500/20 p-1 max-w-[500px] mx-auto">
                        <div
                            className="grid"
                            style={{ gridTemplateColumns: `repeat(${FIELD_RESOLUTION}, minmax(0, 1fr))` }}
                        >
                            {field.cells.map((cell, i) => (
                                <div
                                    key={i}
                                    className="aspect-square"
                                    style={{ backgroundColor: cellColor(cell) }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <SummaryCard label="center bias" value={field.metrics.centerBias.toFixed(2)} sub="core-forming tendency" />
                        <SummaryCard label="edge bias" value={field.metrics.edgeBias.toFixed(2)} sub="shell-forming tendency" />
                        <SummaryCard label="swirl" value={field.metrics.swirl.toFixed(2)} sub="rotational organization" />
                        <SummaryCard label="anisotropy" value={field.metrics.anisotropy.toFixed(2)} sub="directional asymmetry" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <SummaryCard label={'\u03B4 mitigation'} value={(1 - field.metrics.dLeakage).toFixed(2)} sub="Feigenbaum containment" />
                        <SummaryCard label="constraint index" value={field.metrics.constraintIndex.toFixed(2)} sub="channeling intensity" />
                    </div>
                </div>
            )}

            {/* Analysis tab */}
            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    <SensitivityAnalysis bars={sensitivityBars} baseline={field.metrics.energy} outputLabel="energy" />
                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
