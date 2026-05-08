'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ReferenceArea,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Params,
    Metrics,
    Snapshot,
    SweepableParam,
    SweepDatum,
    PRESSURE_SPECS,
    ActionRatingRow,
    ActionKey,
    LayerKey,
    computeViability,
    regimeOf,
    averageObstruction,
} from '../../logic';
import MoralGraph from '../MoralGraph';
import ObstructionGrid from '../ObstructionGrid';
import ForbiddenHeatmap, { ForbiddenCell } from '../ForbiddenHeatmap';


type Tab = 'graph' | 'trajectory' | 'sheaf' | 'forbidden' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'graph', label: 'graph' },
    { key: 'trajectory', label: 'trajectory' },
    { key: 'sheaf', label: 'sheaf' },
    { key: 'forbidden', label: 'forbidden' },
    { key: 'analysis', label: 'analysis' },
];

export interface TrajectoryPoint extends Metrics {
    tick: number;
    viability: number;
    action: ActionKey | null;
}

interface ViewerProps {
    params: Params;
    metrics: Metrics;
    trajectory: TrajectoryPoint[];
    obstruction: ActionRatingRow[];
    forbiddenCells: ForbiddenCell[];
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    lastAction: ActionKey | null;
    activeEdges: { from: string; to: string }[];
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#0a0a0a', border: '1px solid #84cc16', padding: 10, color: '#ecfccb', fontSize: 11 }}>
            <div style={{ marginBottom: 4, color: '#a3e635' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(2)}
                </div>
            ))}
        </div>
    );
}

const INITIAL_LAYERS: Record<LayerKey, boolean> = {
    neural: true,
    interpersonal: true,
    institutional: true,
    ecological: true,
    historical: true,
};

export default function Viewer({
    params,
    metrics,
    trajectory,
    obstruction,
    forbiddenCells,
    snapshot,
    sweepParam,
    onSweepParamChange,
    sweep,
    sensitivityBars,
    calibration,
    assumptions,
    versions,
    lastAction,
    activeEdges,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('graph');
    const [visibleLayers, setVisibleLayers] = useState(INITIAL_LAYERS);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [showHyperedges, setShowHyperedges] = useState(true);

    const viability = computeViability(metrics);
    const regime = regimeOf(viability);

    const sweepLabel = PRESSURE_SPECS.find((s) => s.key === sweepParam)?.label ?? sweepParam;

    const meanObstruction = useMemo(() => averageObstruction(obstruction), [obstruction]);

    const toggleLayer = (k: LayerKey) =>
        setVisibleLayers((prev) => ({ ...prev, [k]: !prev[k] }));

    const regimeColor =
        regime.regime === 'stable' ? 'text-lime-400' :
        regime.regime === 'contested' ? 'text-yellow-400' :
        'text-orange-400';

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className={`font-semibold text-sm ${regimeColor}`}>{regime.label}</div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            scenario: <span className="text-lime-200/80">{params.preset}</span>
                            {lastAction && (
                                <span className="ml-3">last action: <span className="text-lime-300">{lastAction}</span></span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>viability: <span className="text-lime-400">{viability.toFixed(0)}</span></div>
                        <div>obstruction: <span className="text-lime-400">{meanObstruction.toFixed(2)}</span></div>
                        <div>tick: <span className="text-lime-400">{trajectory.length}</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
                {[
                    { label: 'trust', value: metrics.trust },
                    { label: 'agency', value: metrics.agency },
                    { label: 'harm', value: metrics.harm },
                    { label: 'repair', value: metrics.repair },
                    { label: 'domination', value: metrics.domination },
                    { label: 'ecology', value: metrics.ecology },
                ].map((m) => (
                    <div key={m.label} className="border border-lime-500/20 p-2">
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">{m.label}</div>
                        <div className="text-base font-mono text-lime-400 mt-1">{m.value.toFixed(0)}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-1 flex-wrap border-b border-lime-500/20">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-3 py-1.5 text-xs font-mono border-b-2 -mb-px transition-colors cursor-pointer ${
                            tab === t.key
                                ? 'border-lime-500 text-lime-400'
                                : 'border-transparent text-lime-200/50 hover:text-lime-200/80'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'graph' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        14 nodes across 5 layers · binary edges (solid for direct, dashed for
                        top-down) · 3 hyperedges (orange ovals) for non-pairwise actions · click
                        a node to inspect
                    </div>
                    <MoralGraph
                        visibleLayers={visibleLayers}
                        onToggleLayer={toggleLayer}
                        selectedNode={selectedNode}
                        onSelectNode={setSelectedNode}
                        activeEdges={activeEdges}
                        showHyperedges={showHyperedges}
                        onToggleHyperedges={() => setShowHyperedges((v) => !v)}
                    />
                </div>
            )}

            {tab === 'trajectory' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        last {trajectory.length} ticks of the action history · viability bands
                        show stable / contested / fragile thresholds
                    </div>
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer width="100%" height={360} minWidth={0}>
                            <LineChart data={trajectory} margin={{ top: 16, right: 24, bottom: 24, left: 10 }}>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="tick"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ReTooltip content={<ChartTooltip />} />
                                <ReferenceArea y1={76} y2={100} fill="rgba(132, 204, 22, 0.05)" />
                                <ReferenceArea y1={52} y2={76} fill="rgba(250, 204, 21, 0.05)" />
                                <ReferenceArea y1={0} y2={52} fill="rgba(251, 146, 60, 0.05)" />
                                <Line type="monotone" dataKey="viability" stroke="#a3e635" strokeWidth={2.5} dot={false} name="viability" />
                                <Line type="monotone" dataKey="trust" stroke="#84cc16" strokeWidth={1.2} dot={false} name="trust" strokeDasharray="3 2" />
                                <Line type="monotone" dataKey="agency" stroke="#65a30d" strokeWidth={1.2} dot={false} name="agency" strokeDasharray="3 2" />
                                <Line type="monotone" dataKey="harm" stroke="#fb923c" strokeWidth={1.2} dot={false} name="harm" strokeDasharray="3 2" />
                                <Line type="monotone" dataKey="repair" stroke="#bef264" strokeWidth={1.2} dot={false} name="repair" strokeDasharray="3 2" />
                                <Line type="monotone" dataKey="domination" stroke="#f97316" strokeWidth={1.2} dot={false} name="domination" strokeDasharray="3 2" />
                                <Line type="monotone" dataKey="ecology" stroke="#22d3ee" strokeWidth={1.2} dot={false} name="ecology" strokeDasharray="3 2" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {tab === 'sheaf' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        five moral frames (medical, military, kin, legal, market) each rate
                        every action under the current state and pressures · the consistency
                        radius is the standard deviation across frames, high values are
                        sheaf-cohomological obstructions to a single global moral assignment
                    </div>
                    <ObstructionGrid rows={obstruction} highlightAction={lastAction} />
                    <div className="text-xs text-lime-200/60 font-mono">
                        average obstruction across actions:{' '}
                        <span className={
                            meanObstruction > 0.5 ? 'text-orange-400' :
                            meanObstruction > 0.3 ? 'text-yellow-400' :
                            'text-lime-400'
                        }>
                            {meanObstruction.toFixed(3)}
                        </span>
                        {snapshot && (
                            <>
                                {' '}· saved scenario {snapshot.label} viability:{' '}
                                <span className="text-orange-400">{snapshot.viability.toFixed(0)}</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {tab === 'forbidden' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        Δ-viability for each action under current pressures and state · cells
                        below −0.5 are <span className="text-orange-400">forbidden</span>, the
                        action would collapse the graph · the forbidden set shifts as you change
                        scarcity, empathy, institutional strength, etc.
                    </div>
                    <ForbiddenHeatmap cells={forbiddenCells} />
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-lime-200/60 font-mono">sweep pressure</span>
                            <div className="flex gap-1 flex-wrap">
                                {PRESSURE_SPECS.map((spec) => (
                                    <button
                                        key={spec.key}
                                        onClick={() => onSweepParamChange(spec.key)}
                                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                            sweepParam === spec.key
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {spec.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            {sweepLabel} sweep · how viability and the six metrics respond when
                            this pressure varies (action: keep promise from current baseline)
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="sweepValue"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v: number) => v.toFixed(2)}
                                    />
                                    <YAxis
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ReTooltip content={<ChartTooltip />} />
                                    <Line type="monotone" dataKey="viability" stroke="#a3e635" strokeWidth={2.5} dot={false} name="viability" />
                                    <Line type="monotone" dataKey="trust" stroke="#84cc16" strokeWidth={1.2} dot={false} name="trust" strokeDasharray="3 2" />
                                    <Line type="monotone" dataKey="agency" stroke="#65a30d" strokeWidth={1.2} dot={false} name="agency" strokeDasharray="3 2" />
                                    <Line type="monotone" dataKey="harm" stroke="#fb923c" strokeWidth={1.2} dot={false} name="harm" strokeDasharray="3 2" />
                                    <Line type="monotone" dataKey="ecology" stroke="#22d3ee" strokeWidth={1.2} dot={false} name="ecology" strokeDasharray="3 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={viability}
                        outputLabel="viability"
                    />

                    <CalibrationPanel results={calibration} outputLabel="viability" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
