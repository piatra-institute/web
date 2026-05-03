'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ZAxis,
    Cell,
    ReferenceLine,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Metrics,
    Snapshot,
    Params,
    SweepableParam,
    PARAM_SPECS,
    SweepDatum,
    PathStage,
    EnergyPoint,
} from '../../logic';
import AuraGlyph from '../AuraGlyph';


type Tab = 'fiber' | 'energy' | 'path' | 'basins' | 'transport' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'fiber', label: 'fiber' },
    { key: 'energy', label: 'energy' },
    { key: 'path', label: 'holonomy' },
    { key: 'basins', label: 'basins' },
    { key: 'transport', label: 'transport' },
    { key: 'analysis', label: 'analysis' },
];

interface ViewerProps {
    params: Params;
    metrics: Metrics;
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    holonomyPath: PathStage[];
    energyField: EnergyPoint[];
    assumptions: Assumption[];
    versions: ModelVersion[];
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
        <div
            style={{
                background: '#0a0a0a',
                border: '1px solid #84cc16',
                padding: 10,
                color: '#ecfccb',
                fontSize: 11,
            }}
        >
            <div style={{ marginBottom: 4, color: '#a3e635' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>:{' '}
                    {Number(p.value).toFixed(3)}
                </div>
            ))}
        </div>
    );
}

export default function Viewer({
    params,
    metrics,
    snapshot,
    sweepParam,
    onSweepParamChange,
    sweep,
    sensitivityBars,
    holonomyPath,
    energyField,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('fiber');

    const sweepLabel = PARAM_SPECS.find((s) => s.key === sweepParam)?.label ?? sweepParam;

    const basinData = useMemo(
        () => metrics.basins.map((b) => ({ name: b.name, value: b.value })),
        [metrics.basins],
    );
    const transportData = useMemo(
        () => metrics.transportCosts.map((t) => ({ name: t.label, cost: t.cost })),
        [metrics.transportCosts],
    );

    const currentPoint = useMemo(
        () => [{ x: params.historicalDepth, y: params.ritualDistance, size: 240 }],
        [params.historicalDepth, params.ritualDistance],
    );

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="text-lime-400 font-semibold text-sm">
                            {metrics.auraIntensity > 0.62
                                ? 'high aura regime'
                                : metrics.auraIntensity > 0.34
                                    ? 'mixed aura regime'
                                    : 'flat aura regime'}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            {metrics.interpretation}
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            aura:{' '}
                            <span className="text-lime-400">
                                {(metrics.auraIntensity * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div>
                            curv:{' '}
                            <span className="text-lime-400">
                                {(metrics.curvature * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div>
                            holo:{' '}
                            <span className="text-lime-400">
                                {(metrics.holonomy * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div>
                            tens:{' '}
                            <span className="text-lime-400">
                                {(metrics.sheafTension * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'aura intensity', value: metrics.auraIntensity },
                    { label: 'curvature', value: metrics.curvature },
                    { label: 'holonomy', value: metrics.holonomy },
                    { label: 'sheaf tension', value: metrics.sheafTension },
                ].map((m) => (
                    <div key={m.label} className="border border-lime-500/20 p-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            {m.label}
                        </div>
                        <div className="text-lg font-mono text-lime-400 mt-1">
                            {(m.value * 100).toFixed(0)}%
                        </div>
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

            {tab === 'fiber' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        aura vector as fiber state · radius encodes the strength of each
                        cultural dimension
                        {snapshot && (
                            <span className="text-orange-400/60">
                                {' '}· dashed = saved ({snapshot.label})
                            </span>
                        )}
                    </div>
                    <AuraGlyph
                        auraVector={metrics.auraVector}
                        auraIntensity={metrics.auraIntensity}
                        snapshotVector={snapshot?.metrics.auraVector ?? null}
                    />
                </div>
            )}

            {tab === 'energy' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        energy landscape over (historical depth, ritual distance) · low
                        energy = stable aura attractors · the lime dot marks the current
                        object
                    </div>
                    <div style={{ width: '100%', height: 380 }}>
                        <ResponsiveContainer width="100%" height={380} minWidth={0}>
                            <ScatterChart margin={{ top: 18, right: 30, bottom: 30, left: 10 }}>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    domain={[0, 1]}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                    label={{
                                        value: 'historical depth',
                                        position: 'insideBottom',
                                        offset: -10,
                                        fill: '#a3e635',
                                        fontSize: 10,
                                    }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    domain={[0, 1]}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                    label={{
                                        value: 'ritual distance',
                                        angle: -90,
                                        position: 'insideLeft',
                                        fill: '#a3e635',
                                        fontSize: 10,
                                    }}
                                />
                                <ZAxis type="number" dataKey="size" range={[20, 200]} />
                                <ReTooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const d = payload[0].payload as EnergyPoint;
                                        return (
                                            <div
                                                style={{
                                                    background: '#0a0a0a',
                                                    border: '1px solid #84cc16',
                                                    padding: 10,
                                                    color: '#ecfccb',
                                                    fontSize: 11,
                                                }}
                                            >
                                                <div>history: {d.x.toFixed(2)}</div>
                                                <div>ritual: {d.y.toFixed(2)}</div>
                                                <div>energy: {d.z.toFixed(3)}</div>
                                            </div>
                                        );
                                    }}
                                />
                                <Scatter name="field" data={energyField} fill="#84cc16" fillOpacity={0.4} />
                                <Scatter name="current" data={currentPoint} fill="#a3e635" shape="circle" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {tab === 'path' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        connection and holonomy · the same object after moving through
                        studio, market, archive, crisis, and institutional return — the
                        return value depends on the path, not just the destination
                    </div>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height={320} minWidth={0}>
                            <LineChart data={holonomyPath} margin={{ top: 16, right: 24, bottom: 24, left: 10 }}>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="stage"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                />
                                <ReTooltip content={<ChartTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="aura"
                                    stroke="#84cc16"
                                    strokeWidth={2.5}
                                    dot={{ r: 5, fill: '#a3e635' }}
                                    name="aura along path"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {tab === 'basins' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        attractor basins · stable cultural regimes the object is being
                        pulled toward
                    </div>
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer width="100%" height={360} minWidth={0}>
                            <BarChart
                                data={basinData}
                                layout="vertical"
                                margin={{ top: 16, right: 30, bottom: 16, left: 140 }}
                            >
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    domain={[0, 1]}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fill: '#a3e635', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={140}
                                />
                                <ReTooltip content={<ChartTooltip />} />
                                <Bar dataKey="value" name="basin pull">
                                    {basinData.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={i === 0 ? '#a3e635' : '#84cc16'}
                                            fillOpacity={i === 0 ? 0.85 : 0.35 + 0.15 * (1 - i / basinData.length)}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {tab === 'transport' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        optimal transport cost · how far the current aura profile is from
                        each target regime · lower means the object already resembles the
                        target
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height={300} minWidth={0}>
                            <BarChart
                                data={transportData}
                                margin={{ top: 16, right: 24, bottom: 16, left: 10 }}
                            >
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: '#a3e635', fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                />
                                <ReTooltip content={<ChartTooltip />} />
                                <Bar dataKey="cost" fill="#84cc16" fillOpacity={0.6} name="transport cost" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                            <div className="flex gap-1 flex-wrap">
                                {PARAM_SPECS.map((spec) => (
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
                            {sweepLabel} sweep · how aura, curvature, holonomy, and tension
                            respond as one parameter is swept across its range
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
                                        tickFormatter={(v: number) => v.toFixed(1)}
                                    />
                                    <YAxis
                                        domain={[0, 1]}
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v: number) => v.toFixed(1)}
                                    />
                                    <ReTooltip content={<ChartTooltip />} />
                                    <ReferenceLine
                                        x={params[sweepParam]}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{
                                            value: 'now',
                                            fill: '#a3e635',
                                            fontSize: 9,
                                            position: 'top',
                                        }}
                                    />
                                    <Line type="monotone" dataKey="auraIntensity" stroke="#a3e635" strokeWidth={2.5} dot={false} name="aura" />
                                    <Line type="monotone" dataKey="curvature" stroke="#84cc16" strokeWidth={1.8} dot={false} name="curvature" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="holonomy" stroke="#65a30d" strokeWidth={1.5} dot={false} name="holonomy" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="sheafTension" stroke="#f97316" strokeWidth={1.5} dot={false} name="tension" strokeDasharray="2 4" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.auraIntensity}
                        outputLabel="aura intensity"
                    />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
