'use client';

import React from 'react';
import SliderInput from '@/components/SliderInput';
import Button from '@/components/Button';
import Toggle from '@/components/Toggle';
import Input from '@/components/Input';

import {
    SimulationParams,
    Edge,
    NodeId,
    ViewMode,
    FlowMode,
    edgeLabel,
    BITMAP,
    AdjacencyMatrix,
} from '../../logic';

interface SettingsProps {
    params: SimulationParams;
    onParamsChange: (p: SimulationParams) => void;
    edges: Edge[];
    onToggleEdge: (id: string) => void;
    onPreset: (preset: 'greimas' | 'minimal' | 'implications') => void;
    groupNode: NodeId;
    onGroupAction: (action: 'a' | 'b' | 'ab' | 'reset') => void;
    running: boolean;
    onToggleRunning: () => void;
    onClear: () => void;
    adjacency: AdjacencyMatrix;
}

export default function Settings({
    params,
    onParamsChange,
    edges,
    onToggleEdge,
    onPreset,
    groupNode,
    onGroupAction,
    running,
    onToggleRunning,
    onClear,
    adjacency,
}: SettingsProps) {
    const set = (partial: Partial<SimulationParams>) =>
        onParamsChange({ ...params, ...partial });

    return (
        <div className="space-y-6">
            {/* Simulation controls */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">simulation</h3>
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        label={running ? 'pause' : 'run'}
                        onClick={onToggleRunning}
                        size="sm"
                        className="w-full"
                    />
                    <Button
                        label="clear"
                        onClick={onClear}
                        size="sm"
                        className="w-full"
                    />
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* View mode */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">view mode</h3>
                <div className="grid grid-cols-2 gap-2">
                    {(['logic', 'group'] as ViewMode[]).map((vm) => (
                        <button
                            key={vm}
                            onClick={() => set({ viewMode: vm })}
                            className={`py-1.5 px-3 text-sm border transition-colors cursor-pointer ${
                                params.viewMode === vm
                                    ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                    : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                            }`}
                        >
                            {vm === 'logic' ? 'logic (relations)' : 'group (V\u2084 actions)'}
                        </button>
                    ))}
                </div>
                <div className="text-xs text-lime-200/60">
                    {params.viewMode === 'logic'
                        ? 'Typed oppositions: contradiction, contrariety, sub-contrariety, implication.'
                        : 'Bit-flip actions (Z\u2082\u00d7Z\u2082) on the four corners.'}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Flow mode (logic only) */}
            {params.viewMode === 'logic' && (
                <>
                    <div className="space-y-3">
                        <h3 className="text-lime-400 font-semibold text-sm">flow mode</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {([
                                ['fromSelection', 'from selected node'] as const,
                                ['randomWalk', 'random walk'] as const,
                                ['allDirected', 'all directed edges'] as const,
                            ]).map(([fm, label]) => (
                                <button
                                    key={fm}
                                    onClick={() => set({ flowMode: fm as FlowMode })}
                                    className={`py-1.5 px-3 text-sm text-left border transition-colors cursor-pointer ${
                                        params.flowMode === fm
                                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                            : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <Toggle
                            text="flow on undirected edges"
                            value={params.showUndirectedFlow}
                            toggle={() => set({ showUndirectedFlow: !params.showUndirectedFlow })}
                        />
                    </div>

                    <div className="border-t border-lime-500/20" />
                </>
            )}

            {/* Particle settings */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">particles</h3>
                <SliderInput
                    label="spawn rate"
                    min={0}
                    max={30}
                    step={1}
                    value={params.spawnRate}
                    onChange={(v) => set({ spawnRate: v })}
                />
                <SliderInput
                    label="speed"
                    min={0.05}
                    max={1.25}
                    step={0.01}
                    value={params.particleSpeed}
                    onChange={(v) => set({ particleSpeed: v })}
                    showDecimals
                />
                <SliderInput
                    label="max particles"
                    min={20}
                    max={320}
                    step={10}
                    value={params.maxParticles}
                    onChange={(v) => set({ maxParticles: v })}
                />
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Node labels */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">node labels</h3>
                <div className="grid grid-cols-2 gap-3">
                    {([
                        ['S1', params.labelS1, 'labelS1'] as const,
                        ['S2', params.labelS2, 'labelS2'] as const,
                        ['\u00acS1', params.labelnS1, 'labelnS1'] as const,
                        ['\u00acS2', params.labelnS2, 'labelnS2'] as const,
                    ]).map(([placeholder, value, key]) => (
                        <div key={key} className="space-y-1">
                            <span className="text-xs text-lime-200/60">{placeholder}</span>
                            <Input
                                type="text"
                                value={value}
                                onChange={(v) => set({ [key]: v })}
                                compact
                                fullWidth
                            />
                        </div>
                    ))}
                </div>
                <div className="text-xs text-lime-200/60">
                    Try concrete oppositions: Legal / Illegal, Life / Death.
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Edges / Group */}
            {params.viewMode === 'logic' ? (
                <div className="space-y-3">
                    <h3 className="text-lime-400 font-semibold text-sm">edges</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <Button label="greimas" onClick={() => onPreset('greimas')} size="xs" className="w-full" />
                        <Button label="minimal" onClick={() => onPreset('minimal')} size="xs" className="w-full" />
                        <Button label="implication" onClick={() => onPreset('implications')} size="xs" className="w-full" />
                    </div>

                    <div className="space-y-2 mt-2">
                        {edges.map((e) => (
                            <Toggle
                                key={e.id}
                                text={`${edgeLabel(e.type)}: ${e.from} ${e.directed ? '\u2192' : '\u2194'} ${e.to}`}
                                value={e.enabled}
                                toggle={() => onToggleEdge(e.id)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <h3 className="text-lime-400 font-semibold text-sm">group actions (V&#x2084;)</h3>
                    <div className="border border-lime-500/20 p-3">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-sm text-lime-100">current: <span className="text-lime-400">{groupNode}</span></div>
                                <div className="text-xs text-lime-200/60">bits: ({BITMAP[groupNode][0]},{BITMAP[groupNode][1]})</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <Button label="a: flip x" onClick={() => onGroupAction('a')} size="xs" className="w-full" />
                            <Button label="b: flip y" onClick={() => onGroupAction('b')} size="xs" className="w-full" />
                            <Button label="ab: both" onClick={() => onGroupAction('ab')} size="xs" className="w-full" />
                            <Button label="(0,0)" onClick={() => onGroupAction('reset')} size="xs" className="w-full" />
                        </div>
                        <div className="mt-2 text-xs text-lime-200/60">
                            Two independent involutions compose the Klein group V&#x2084;.
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-lime-500/20" />

            {/* Node selection */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">
                    {params.viewMode === 'logic' ? 'source node' : 'current element'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {(['S1', 'S2', 'nS1', 'nS2'] as NodeId[]).map((id) => {
                        const labels: Record<NodeId, string> = {
                            S1: params.labelS1,
                            S2: params.labelS2,
                            nS1: params.labelnS1,
                            nS2: params.labelnS2,
                        };
                        const isSelected = params.viewMode === 'logic'
                            ? params.selectedNode === id
                            : groupNode === id;
                        return (
                            <button
                                key={id}
                                onClick={() => {
                                    if (params.viewMode === 'logic') {
                                        set({ selectedNode: id });
                                    } else {
                                        onGroupAction('reset');
                                    }
                                }}
                                className={`py-2 px-3 text-left border transition-colors cursor-pointer ${
                                    isSelected
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                }`}
                            >
                                <div className="text-sm font-semibold">{labels[id]}</div>
                                <div className="text-xs text-lime-200/40 font-mono">{id} ({BITMAP[id][0]},{BITMAP[id][1]})</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-lime-500/20" />

            {/* Adjacency matrix */}
            <div className="space-y-3">
                <h3 className="text-lime-400 font-semibold text-sm">adjacency</h3>
                <div className="overflow-auto border border-lime-500/20">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-lime-500/20">
                                <th className="px-2 py-1 text-left text-lime-200/60">from \ to</th>
                                {adjacency.nodes.map((n) => (
                                    <th key={n} className="px-2 py-1 text-left text-lime-200/60 font-mono">{n}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {adjacency.nodes.map((r) => (
                                <tr key={r} className="border-b border-lime-500/10">
                                    <td className="px-2 py-1 font-mono text-lime-200/60">{r}</td>
                                    {adjacency.nodes.map((c) => {
                                        const rels = adjacency.map.get(`${r}->${c}`) ?? [];
                                        return (
                                            <td key={c} className="px-2 py-1">
                                                {rels.length === 0 ? (
                                                    <span className="text-lime-200/20">&middot;</span>
                                                ) : (
                                                    <div className="flex flex-col gap-0.5">
                                                        {rels.map((e) => (
                                                            <span key={e.id} className="text-lime-400">
                                                                {e.type.slice(0, 3)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="text-xs text-lime-200/40">
                    Undirected edges appear symmetrically.
                </div>
            </div>

            {/* Legend */}
            <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60">
                <div className="font-semibold text-lime-400 mb-2">relation types</div>
                <ul className="space-y-1">
                    <li><span className="text-lime-400">contradiction</span> &mdash; mutually exclusive (S &harr; &not;S)</li>
                    <li><span className="text-lime-400">contrariety</span> &mdash; cannot both hold (S1 vs S2)</li>
                    <li><span className="text-lime-400">sub-contrariety</span> &mdash; cannot both fail (&not;S1 vs &not;S2)</li>
                    <li><span className="text-lime-400">implication</span> &mdash; deixis channel (S1 &rarr; &not;S2)</li>
                </ul>
            </div>
        </div>
    );
}
