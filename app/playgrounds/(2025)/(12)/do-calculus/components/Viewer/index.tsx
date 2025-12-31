'use client';

import { forwardRef, useImperativeHandle, useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { ViewerRef, SimulationParams, AnalysisResults } from '../../playground';
import {
    Node, Edge, Synergy, SimResult, EffectRow,
    buildTemplate, simulate, computeEffects, computeGrangerAndTE, fmt,
} from '../../logic';

const DEFAULT_PARAMS: SimulationParams = {
    template: 'maier3',
    dtMs: 1,
    durationMs: 12000,
    seed: 42,
    delayMs: 8,
    clampNodeId: 'N0',
    clampValue: 1,
    running: false,
    showRaster: true,
    showEffects: true,
    showTE: true,
    showGranger: true,
};

interface GraphViewProps {
    nodes: Node[];
    edges: Edge[];
    synergies: Synergy[];
    onMoveNode: (id: string, x: number, y: number) => void;
    selected: { kind: 'node' | 'edge' | 'syn'; id: string } | null;
    setSelected: (s: { kind: 'node' | 'edge' | 'syn'; id: string } | null) => void;
}

function GraphView({ nodes, edges, synergies, onMoveNode, selected, setSelected }: GraphViewProps) {
    const ref = useRef<SVGSVGElement | null>(null);
    const dragging = useRef<{ id: string; dx: number; dy: number } | null>(null);

    const idToNode = useMemo(() => {
        const m = new Map<string, Node>();
        for (const nd of nodes) m.set(nd.id, nd);
        return m;
    }, [nodes]);

    const onPointerDownNode = (e: React.PointerEvent, id: string) => {
        e.preventDefault();
        const svg = ref.current;
        if (!svg) return;
        const nd = idToNode.get(id);
        if (!nd) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const loc = pt.matrixTransform(ctm.inverse());
        dragging.current = { id, dx: loc.x - nd.x, dy: loc.y - nd.y };
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setSelected({ kind: 'node', id });
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const svg = ref.current;
        if (!svg) return;
        if (!dragging.current) return;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const loc = pt.matrixTransform(ctm.inverse());
        onMoveNode(dragging.current.id, loc.x - dragging.current.dx, loc.y - dragging.current.dy);
    };

    const onPointerUp = () => {
        dragging.current = null;
    };

    const arrowId = 'arrow';

    return (
        <div className="border border-lime-500/20 bg-black">
            <div className="flex items-center justify-between px-3 py-2 border-b border-lime-500/20">
                <div className="text-sm font-medium text-lime-400">Causal Graph (SCM)</div>
                <div className="text-xs text-gray-500">Drag nodes to reposition</div>
            </div>
            <svg
                ref={ref}
                viewBox="0 0 700 280"
                className="w-full h-[280px]"
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <defs>
                    <marker
                        id={arrowId}
                        viewBox="0 0 10 10"
                        refX="10"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#84cc16" />
                    </marker>
                </defs>

                {/* Edges */}
                {edges.map((e) => {
                    const a = idToNode.get(e.from);
                    const b = idToNode.get(e.to);
                    if (!a || !b) return null;
                    const isSel = selected?.kind === 'edge' && selected.id === e.id;
                    const isSelf = e.from === e.to;

                    if (isSelf) {
                        // Self-loop
                        return (
                            <g key={e.id} onClick={() => setSelected({ kind: 'edge', id: e.id })} style={{ cursor: 'pointer' }}>
                                <path
                                    d={`M ${a.x + 20} ${a.y - 5} A 25 25 0 1 1 ${a.x + 5} ${a.y - 20}`}
                                    fill="none"
                                    stroke={isSel ? '#84cc16' : '#65a30d'}
                                    strokeWidth={isSel ? 3 : 2}
                                    markerEnd={`url(#${arrowId})`}
                                />
                                <text x={a.x + 35} y={a.y - 30} fontSize="10" fill="#84cc16">
                                    w={e.weight.toFixed(2)}
                                </text>
                            </g>
                        );
                    }

                    return (
                        <g key={e.id} onClick={() => setSelected({ kind: 'edge', id: e.id })} style={{ cursor: 'pointer' }}>
                            <line
                                x1={a.x}
                                y1={a.y}
                                x2={b.x}
                                y2={b.y}
                                stroke={isSel ? '#84cc16' : '#65a30d'}
                                strokeWidth={isSel ? 3 : 2}
                                markerEnd={`url(#${arrowId})`}
                            />
                            <text
                                x={(a.x + b.x) / 2}
                                y={(a.y + b.y) / 2 - 8}
                                fontSize="10"
                                fill="#84cc16"
                            >
                                w={e.weight.toFixed(2)} d={e.delayMs}ms
                            </text>
                        </g>
                    );
                })}

                {/* Synergies */}
                {synergies.map((s) => {
                    const a = idToNode.get(s.a);
                    const b = idToNode.get(s.b);
                    const t = idToNode.get(s.to);
                    if (!a || !b || !t) return null;
                    const cx = (a.x + b.x) / 2;
                    const cy = (a.y + b.y) / 2;
                    const isSel = selected?.kind === 'syn' && selected.id === s.id;
                    return (
                        <g key={s.id} onClick={() => setSelected({ kind: 'syn', id: s.id })} style={{ cursor: 'pointer' }}>
                            <path
                                d={`M ${a.x} ${a.y} Q ${cx} ${cy - 40} ${b.x} ${b.y}`}
                                fill="none"
                                stroke={isSel ? '#f43f5e' : '#fb7185'}
                                strokeWidth={isSel ? 3 : 2}
                            />
                            <line
                                x1={cx}
                                y1={cy - 40}
                                x2={t.x}
                                y2={t.y}
                                stroke={isSel ? '#f43f5e' : '#fb7185'}
                                strokeWidth={isSel ? 3 : 2}
                                markerEnd={`url(#${arrowId})`}
                            />
                            <text x={cx + 6} y={cy - 44} fontSize="10" fill="#f43f5e">
                                AND p={s.prob.toFixed(2)}
                            </text>
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes.map((nd) => {
                    const isSel = selected?.kind === 'node' && selected.id === nd.id;
                    return (
                        <g key={nd.id}>
                            <circle
                                cx={nd.x}
                                cy={nd.y}
                                r={22}
                                fill={nd.hidden ? '#1f2937' : '#000'}
                                stroke={isSel ? '#84cc16' : '#4d7c0f'}
                                strokeWidth={isSel ? 3 : 2}
                                onPointerDown={(e) => onPointerDownNode(e, nd.id)}
                                style={{ cursor: 'grab' }}
                            />
                            <text x={nd.x} y={nd.y + 4} textAnchor="middle" fontSize="12" fill="#84cc16" fontWeight={700}>
                                {nd.label}
                            </text>
                            <text x={nd.x} y={nd.y + 34} textAnchor="middle" fontSize="9" fill="#6b7280">
                                {nd.hidden ? 'hidden' : `λ=${nd.baseRateHz}Hz`}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

interface RasterViewProps {
    sim: SimResult | null;
    simClamp: SimResult | null;
    nodes: Node[];
    windowMs?: number;
}

function RasterView({ sim, simClamp, nodes, windowMs = 2000 }: RasterViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !sim) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        const visibleNodes = nodes.filter(n => !n.hidden);
        const n = visibleNodes.length;
        if (n === 0) return;

        const rowH = height / n;
        const T = Math.min(sim.spikes[0].length, windowMs);
        const scaleX = width / T;

        // Draw natural spikes
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 1;
        for (let i = 0; i < n; i++) {
            const nodeIdx = nodes.indexOf(visibleNodes[i]);
            const spikes = sim.spikes[nodeIdx];
            const y0 = i * rowH;
            for (let t = 0; t < T; t++) {
                if (spikes[t] === 1) {
                    const x = t * scaleX;
                    ctx.beginPath();
                    ctx.moveTo(x, y0 + 4);
                    ctx.lineTo(x, y0 + rowH - 4);
                    ctx.stroke();
                }
            }
            // Label
            ctx.fillStyle = '#84cc16';
            ctx.font = '10px monospace';
            ctx.fillText(visibleNodes[i].label, 4, y0 + rowH / 2 + 3);
        }

        // Draw clamped spikes (if present) in different color
        if (simClamp) {
            ctx.strokeStyle = '#f43f5e';
            for (let i = 0; i < n; i++) {
                const nodeIdx = nodes.indexOf(visibleNodes[i]);
                const spikes = simClamp.spikes[nodeIdx];
                const y0 = i * rowH;
                for (let t = 0; t < T; t++) {
                    if (spikes[t] === 1) {
                        const x = t * scaleX + 1;
                        ctx.beginPath();
                        ctx.moveTo(x, y0 + 4);
                        ctx.lineTo(x, y0 + rowH - 4);
                        ctx.stroke();
                    }
                }
            }
        }
    }, [sim, simClamp, nodes, windowMs]);

    if (!sim) {
        return (
            <div className="border border-lime-500/20 bg-black p-4">
                <div className="text-gray-500 text-sm text-center">Run simulation to see spike raster</div>
            </div>
        );
    }

    return (
        <div className="border border-lime-500/20 bg-black">
            <div className="flex items-center justify-between px-3 py-2 border-b border-lime-500/20">
                <div className="text-sm font-medium text-lime-400">Spike Raster (first {windowMs}ms)</div>
                <div className="flex gap-3 text-xs">
                    <span className="text-lime-400">■ natural</span>
                    {simClamp && <span className="text-rose-400">■ do()</span>}
                </div>
            </div>
            <canvas ref={canvasRef} width={600} height={120} className="w-full" />
        </div>
    );
}

interface EffectsTableProps {
    effects: EffectRow[];
    title: string;
}

function EffectsTable({ effects, title }: EffectsTableProps) {
    if (effects.length === 0) return null;

    return (
        <div className="border border-lime-500/20 bg-black">
            <div className="px-3 py-2 border-b border-lime-500/20">
                <div className="text-sm font-medium text-lime-400">{title}</div>
            </div>
            <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                    <thead className="bg-lime-500/5 sticky top-0">
                        <tr className="text-gray-400">
                            <th className="px-2 py-1 text-left">Type</th>
                            <th className="px-2 py-1 text-left">Source</th>
                            <th className="px-2 py-1 text-left">Target</th>
                            <th className="px-2 py-1 text-left">Metric</th>
                            <th className="px-2 py-1 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {effects.map((row, i) => (
                            <tr key={i} className="border-t border-lime-500/10 hover:bg-lime-500/5">
                                <td className="px-2 py-1 text-gray-500">{row.kind}</td>
                                <td className="px-2 py-1 text-lime-400">{row.src}</td>
                                <td className="px-2 py-1 text-gray-300">{row.tgt}</td>
                                <td className="px-2 py-1 text-gray-400">{row.metric}</td>
                                <td className={`px-2 py-1 text-right font-mono ${
                                    row.value > 0.05 ? 'text-lime-400' : row.value < -0.05 ? 'text-rose-400' : 'text-gray-500'
                                }`}>
                                    {fmt(row.value, 4)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const Viewer = forwardRef<ViewerRef>((_, ref) => {
    const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
    const [nodes, setNodes] = useState<Node[]>(() => buildTemplate('maier3').nodes);
    const [edges, setEdges] = useState<Edge[]>(() => buildTemplate('maier3').edges);
    const [synergies, setSynergies] = useState<Synergy[]>(() => buildTemplate('maier3').synergies);
    const [selected, setSelected] = useState<{ kind: 'node' | 'edge' | 'syn'; id: string } | null>(null);

    const [sim, setSim] = useState<SimResult | null>(null);
    const [simClamp, setSimClamp] = useState<SimResult | null>(null);
    const [effects, setEffects] = useState<EffectRow[]>([]);
    const [grangerRows, setGrangerRows] = useState<EffectRow[]>([]);
    const [teRows, setTeRows] = useState<EffectRow[]>([]);

    const handleMoveNode = useCallback((id: string, x: number, y: number) => {
        setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
    }, []);

    const runNatural = useCallback(() => {
        const cfg = { dtMs: params.dtMs, durationMs: params.durationMs, seed: params.seed };
        const result = simulate(nodes, edges, synergies, cfg);
        setSim(result);
        setSimClamp(null);
        setEffects([]);
        setGrangerRows([]);
        setTeRows([]);
    }, [nodes, edges, synergies, params]);

    const runDo = useCallback(() => {
        if (!sim) return;
        const cfg = { dtMs: params.dtMs, durationMs: params.durationMs, seed: params.seed + 1337 };
        const clamp: Record<string, 0 | 1 | null> = { [params.clampNodeId]: params.clampValue };
        const result = simulate(nodes, edges, synergies, cfg, clamp);
        setSimClamp(result);
    }, [sim, nodes, edges, synergies, params]);

    const runComputeEffects = useCallback(() => {
        if (!sim) return;
        const delaySteps = Math.max(1, Math.floor(params.delayMs / params.dtMs));
        const cfg = { dtMs: params.dtMs, durationMs: params.durationMs, seed: params.seed };
        const rows = computeEffects(sim, nodes, edges, synergies, delaySteps, cfg);
        setEffects(rows);
    }, [sim, nodes, edges, synergies, params]);

    const runComputeGrangerTE = useCallback(() => {
        if (!sim) return;
        const delaySteps = Math.max(1, Math.floor(params.delayMs / params.dtMs));
        const { granger, te } = computeGrangerAndTE(sim, nodes, delaySteps, params.seed);
        setGrangerRows(granger);
        setTeRows(te);
    }, [sim, nodes, params]);

    useImperativeHandle(ref, () => ({
        updateParams: (newParams: SimulationParams) => {
            setParams(newParams);
            // Update model if template changed
            if (newParams.template !== params.template) {
                const t = buildTemplate(newParams.template);
                setNodes(t.nodes);
                setEdges(t.edges);
                setSynergies(t.synergies);
                setSim(null);
                setSimClamp(null);
                setEffects([]);
                setGrangerRows([]);
                setTeRows([]);
            }
        },
        runNatural,
        runDo,
        computeEffects: runComputeEffects,
        computeGrangerTE: runComputeGrangerTE,
        getNodes: () => nodes.filter(n => !n.hidden).map(n => n.id),
        getResults: () => ({ effects, granger: grangerRows, te: teRows }),
    }));

    // Update model when template changes
    useEffect(() => {
        const t = buildTemplate(params.template);
        setNodes(t.nodes);
        setEdges(t.edges);
        setSynergies(t.synergies);
        setSim(null);
        setSimClamp(null);
        setEffects([]);
        setGrangerRows([]);
        setTeRows([]);
        setSelected(null);
    }, [params.template]);

    return (
        <div className="w-full space-y-4">
            <GraphView
                nodes={nodes}
                edges={edges}
                synergies={synergies}
                onMoveNode={handleMoveNode}
                selected={selected}
                setSelected={setSelected}
            />

            {params.showRaster && (
                <RasterView sim={sim} simClamp={simClamp} nodes={nodes} />
            )}

            {params.showEffects && effects.length > 0 && (
                <EffectsTable effects={effects} title="Causal Effects (ΔP)" />
            )}

            {params.showTE && teRows.length > 0 && (
                <EffectsTable effects={teRows} title="Transfer Entropy" />
            )}

            {params.showGranger && grangerRows.length > 0 && (
                <EffectsTable effects={grangerRows} title="Granger Causality" />
            )}

            {!sim && (
                <div className="text-center text-gray-500 text-sm py-8">
                    Click &quot;Run Natural&quot; to simulate the network
                </div>
            )}
        </div>
    );
});

Viewer.displayName = 'Viewer';

export default Viewer;
