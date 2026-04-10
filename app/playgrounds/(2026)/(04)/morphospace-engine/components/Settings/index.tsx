'use client';

import PlaygroundSettings from '@/components/PlaygroundSettings';
import SliderInput from '@/components/SliderInput';
import Dropdown from '@/components/Dropdown';
import Button from '@/components/Button';

import {
    GraphNode, Edge, NodeType, Metrics, FieldResult,
    PresetKey, PRESET_DESCRIPTIONS, TYPE_META, NODE_COLORS,
    SeedParams, FieldParams, ConstraintParams, ConstantParams,
    AttractorParams, ObservationParams, ObservationReading,
    CONSTANT_LABELS,
} from '../../logic';


interface SettingsProps {
    graph: { nodes: GraphNode[]; edges: Edge[] };
    onGraphChange: (g: { nodes: GraphNode[]; edges: Edge[] }) => void;
    selectedNodeId: string | null;
    onSelectNode: (id: string | null) => void;
    connectFromId: string | null;
    onConnectFrom: (id: string | null) => void;
    field: FieldResult;
    narrative: string;
    onLoadPreset: (key: PresetKey) => void;
    onAddNode: (type: NodeType) => void;
    onDeleteNode: (id: string) => void;
}


function MetricRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-lime-200/50">{label}</span>
            <span className="font-mono text-lime-400">{value}</span>
        </div>
    );
}


export default function Settings({
    graph, onGraphChange, selectedNodeId, onSelectNode,
    connectFromId, onConnectFrom, field, narrative,
    onLoadPreset, onAddNode, onDeleteNode,
}: SettingsProps) {
    const selectedNode = graph.nodes.find(n => n.id === selectedNodeId) ?? null;
    const observationMap: Record<string, ObservationReading> = {};
    field.observationReadings.forEach(r => { observationMap[r.id] = r; });

    const updateParam = (key: string, value: number | string) => {
        if (!selectedNode) return;
        onGraphChange({
            ...graph,
            nodes: graph.nodes.map(n =>
                n.id === selectedNode.id
                    ? { ...n, params: { ...n.params, [key]: value } }
                    : n,
            ),
        });
    };

    const updateLabel = (label: string) => {
        if (!selectedNode) return;
        onGraphChange({
            ...graph,
            nodes: graph.nodes.map(n =>
                n.id === selectedNode.id ? { ...n, label } : n,
            ),
        });
    };

    const updateEdgeWeight = (edgeId: string, weight: number) => {
        onGraphChange({
            ...graph,
            edges: graph.edges.map(e => e.id === edgeId ? { ...e, weight } : e),
        });
    };

    const removeEdge = (edgeId: string) => {
        onGraphChange({
            ...graph,
            edges: graph.edges.filter(e => e.id !== edgeId),
        });
    };

    const outgoing = selectedNode
        ? graph.edges.filter(e => e.from === selectedNode.id)
        : [];
    const incoming = selectedNode
        ? graph.edges.filter(e => e.to === selectedNode.id)
        : [];

    const presetKeys: PresetKey[] = ['e-mitigation', 'feigenbaum-ladder', 'outside-ingressed', 'golden-spiral', 'constraint-garden', 'dual-basin', 'resonance-cascade'];
    const nodeTypes: NodeType[] = ['seed', 'field', 'constraint', 'constant', 'attractor', 'observation'];

    const sections = [
        {
            title: 'Presets',
            content: (
                <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                        {presetKeys.map(key => (
                            <button
                                key={key}
                                onClick={() => onLoadPreset(key)}
                                className="border border-lime-500/20 px-3 py-2 text-left text-xs text-lime-200/60 hover:border-lime-500/40 hover:text-lime-400 transition-colors"
                            >
                                {PRESET_DESCRIPTIONS[key].label}
                            </button>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            title: 'Add Node',
            content: (
                <div className="grid grid-cols-2 gap-2">
                    {nodeTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => onAddNode(type)}
                            className="border border-lime-500/20 px-2 py-2 text-left transition-colors hover:border-lime-500/40"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2" style={{ background: NODE_COLORS[type] }} />
                                <span className="text-xs text-lime-200/80">{TYPE_META[type].label}</span>
                            </div>
                            <div className="text-[10px] text-lime-200/40 mt-1 leading-tight">{TYPE_META[type].description}</div>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: selectedNode ? `Inspector: ${selectedNode.label}` : 'Inspector',
            content: selectedNode ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2" style={{ background: NODE_COLORS[selectedNode.type] }} />
                            <span className="text-xs text-lime-200/50">{TYPE_META[selectedNode.type].label}</span>
                        </div>
                        <Button label="delete" onClick={() => onDeleteNode(selectedNode.id)} size="xs" />
                    </div>

                    <div>
                        <label className="text-xs text-lime-200/50">Label</label>
                        <input
                            value={selectedNode.label}
                            onChange={e => updateLabel(e.target.value)}
                            className="w-full border border-lime-500/20 bg-black px-2 py-1 text-xs text-lime-200 mt-1 [&::placeholder]:!bg-transparent [&::placeholder]:!text-lime-200/40"
                            style={{ backgroundColor: '#000' }}
                        />
                    </div>

                    <SliderInput
                        label="strength"
                        value={(selectedNode.params as { strength: number }).strength}
                        onChange={v => updateParam('strength', v)}
                        min={0.05} max={1.8} step={0.01} showDecimals
                    />

                    <div className="text-xs text-lime-200/40 font-mono">
                        effective: {(field.effective[selectedNode.id] ?? 0).toFixed(2)}
                    </div>

                    {selectedNode.type === 'seed' && (() => {
                        const p = selectedNode.params as SeedParams;
                        return (
                            <>
                                <SliderInput label="radius" value={p.radius} onChange={v => updateParam('radius', v)} min={0.05} max={0.7} step={0.01} showDecimals />
                                <SliderInput label="frequency" value={p.frequency} onChange={v => updateParam('frequency', v)} min={0.5} max={10} step={0.1} showDecimals />
                                <SliderInput label="phase" value={p.phase} onChange={v => updateParam('phase', v)} min={-3.14} max={3.14} step={0.01} showDecimals />
                                <SliderInput label="polarity" value={p.polarity} onChange={v => updateParam('polarity', v)} min={-1} max={1} step={0.01} showDecimals />
                            </>
                        );
                    })()}

                    {selectedNode.type === 'field' && (() => {
                        const p = selectedNode.params as FieldParams;
                        return (
                            <>
                                <Dropdown
                                    name="axis"
                                    selected={p.axis}
                                    selectables={['radial', 'horizontal', 'vertical', 'spiral']}
                                    atSelect={v => updateParam('axis', v)}
                                />
                                <SliderInput label="frequency" value={p.frequency} onChange={v => updateParam('frequency', v)} min={0.5} max={10} step={0.1} showDecimals />
                                <SliderInput label="turbulence" value={p.turbulence} onChange={v => updateParam('turbulence', v)} min={0} max={1} step={0.01} showDecimals />
                                <SliderInput label="curvature" value={p.curvature} onChange={v => updateParam('curvature', v)} min={0} max={1} step={0.01} showDecimals />
                            </>
                        );
                    })()}

                    {selectedNode.type === 'constraint' && (() => {
                        const p = selectedNode.params as ConstraintParams;
                        return (
                            <>
                                <Dropdown
                                    name="mode"
                                    selected={p.mode}
                                    selectables={['ring', 'stripe', 'spiral']}
                                    atSelect={v => updateParam('mode', v)}
                                />
                                <SliderInput label="width" value={p.width} onChange={v => updateParam('width', v)} min={0.03} max={0.4} step={0.01} showDecimals />
                                <SliderInput label="sharpness" value={p.sharpness} onChange={v => updateParam('sharpness', v)} min={0} max={1} step={0.01} showDecimals />
                                <SliderInput label="offset" value={p.offset} onChange={v => updateParam('offset', v)} min={0} max={0.9} step={0.01} showDecimals />
                            </>
                        );
                    })()}

                    {selectedNode.type === 'constant' && (() => {
                        const p = selectedNode.params as ConstantParams;
                        return (
                            <>
                                <Dropdown
                                    name="constant"
                                    selected={p.constant}
                                    selectables={Object.keys(CONSTANT_LABELS)}
                                    atSelect={v => updateParam('constant', v)}
                                />
                                <SliderInput label="mitigation" value={p.mitigation} onChange={v => updateParam('mitigation', v)} min={0} max={1} step={0.01} showDecimals />
                                <SliderInput label="ingress" value={p.ingress} onChange={v => updateParam('ingress', v)} min={0} max={1} step={0.01} showDecimals />
                                <SliderInput label="phase" value={p.phase} onChange={v => updateParam('phase', v)} min={-3.14} max={3.14} step={0.01} showDecimals />
                            </>
                        );
                    })()}

                    {selectedNode.type === 'attractor' && (() => {
                        const p = selectedNode.params as AttractorParams;
                        return (
                            <>
                                <SliderInput label="memory" value={p.memory} onChange={v => updateParam('memory', v)} min={0} max={1} step={0.01} showDecimals />
                                <SliderInput label="gain" value={p.gain} onChange={v => updateParam('gain', v)} min={0.2} max={2} step={0.01} showDecimals />
                                <SliderInput label="asymmetry" value={p.asymmetry} onChange={v => updateParam('asymmetry', v)} min={-1} max={1} step={0.01} showDecimals />
                            </>
                        );
                    })()}

                    {selectedNode.type === 'observation' && (() => {
                        const p = selectedNode.params as ObservationParams;
                        const reading = observationMap[selectedNode.id];
                        return (
                            <>
                                <SliderInput label="sensitivity" value={p.sensitivity} onChange={v => updateParam('sensitivity', v)} min={0} max={1} step={0.01} showDecimals />
                                <SliderInput label="aperture" value={p.aperture} onChange={v => updateParam('aperture', v)} min={0.05} max={0.5} step={0.01} showDecimals />
                                {reading && (
                                    <div className="border border-lime-500/20 p-2 text-xs text-lime-200/60">
                                        sensed: <span className="text-lime-400 font-mono">{reading.value.toFixed(3)}</span>
                                    </div>
                                )}
                            </>
                        );
                    })()}

                    {/* Connections */}
                    {(outgoing.length > 0 || incoming.length > 0) && (
                        <div className="border-t border-lime-500/10 pt-3 space-y-2">
                            <div className="text-xs text-lime-200/50">Connections</div>
                            {outgoing.map(e => {
                                const target = graph.nodes.find(n => n.id === e.to);
                                return (
                                    <div key={e.id} className="border border-lime-500/10 p-2 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-lime-200/60">{'\u2192'} {target?.label ?? 'unknown'}</span>
                                            <button onClick={() => removeEdge(e.id)} className="text-lime-200/30 hover:text-lime-400 text-[10px]">remove</button>
                                        </div>
                                        <SliderInput label="weight" value={e.weight} onChange={v => updateEdgeWeight(e.id, v)} min={0.05} max={1.3} step={0.01} showDecimals />
                                    </div>
                                );
                            })}
                            {incoming.map(e => {
                                const source = graph.nodes.find(n => n.id === e.from);
                                return (
                                    <div key={e.id} className="border border-lime-500/10 p-2 space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-lime-200/60">{'\u2190'} {source?.label ?? 'unknown'}</span>
                                            <button onClick={() => removeEdge(e.id)} className="text-lime-200/30 hover:text-lime-400 text-[10px]">remove</button>
                                        </div>
                                        <SliderInput label="weight" value={e.weight} onChange={v => updateEdgeWeight(e.id, v)} min={0.05} max={1.3} step={0.01} showDecimals />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-xs text-lime-200/40 leading-relaxed">
                    Click a node on the canvas to inspect and tune its parameters.
                </div>
            ),
        },
        {
            title: 'Connection Mode',
            content: (
                <div className="space-y-2">
                    <div className="text-xs text-lime-200/50 leading-relaxed">
                        {connectFromId
                            ? `Select a target node to connect from "${graph.nodes.find(n => n.id === connectFromId)?.label ?? 'node'}".`
                            : 'Click the output port (right side) of a node on the canvas to start a connection.'}
                    </div>
                    {connectFromId && (
                        <Button label="cancel" onClick={() => onConnectFrom(null)} size="xs" />
                    )}
                </div>
            ),
        },
        {
            title: 'Metrics',
            content: (
                <div className="space-y-1">
                    <MetricRow label="morphology" value={field.morphologyLabel} />
                    <MetricRow label="energy" value={field.metrics.energy.toFixed(2)} />
                    <MetricRow label="coherence" value={field.metrics.coherence.toFixed(2)} />
                    <MetricRow label="e mitigation" value={(1 - field.metrics.eLeakage).toFixed(2)} />
                    <MetricRow label={'\u03B4 mitigation'} value={(1 - field.metrics.dLeakage).toFixed(2)} />
                    <MetricRow label="center bias" value={field.metrics.centerBias.toFixed(2)} />
                    <MetricRow label="edge bias" value={field.metrics.edgeBias.toFixed(2)} />
                    <MetricRow label="swirl" value={field.metrics.swirl.toFixed(2)} />
                    <MetricRow label="anisotropy" value={field.metrics.anisotropy.toFixed(2)} />
                    <MetricRow label="platonic depth" value={field.metrics.platonicDepth.toFixed(2)} />
                    <MetricRow label="constraint index" value={field.metrics.constraintIndex.toFixed(2)} />
                </div>
            ),
        },
        {
            title: 'Narrative',
            content: (
                <div className="border border-lime-500/20 p-3 text-xs text-lime-200/70 leading-relaxed">
                    {narrative}
                </div>
            ),
        },
    ];

    return (
        <PlaygroundSettings
            title="Settings"
            sections={sections}
        />
    );
}
