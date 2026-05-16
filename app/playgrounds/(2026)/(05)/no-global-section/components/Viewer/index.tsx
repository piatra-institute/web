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
    ReferenceLine,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    AXIS_SPECS,
    AXIS_KEYS,
    AXIS_LABELS,
    CASES,
    CLUSTER_LABELS,
    LENSES,
    Params,
    Metrics,
    Snapshot,
    SweepableAxis,
    SweepDatum,
    Reading,
    comparativeRanking,
    scoreModel,
} from '../../logic';
import ObstructionMap from '../ObstructionMap';


type Tab = 'map' | 'figure' | 'lens' | 'figures' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'map', label: 'map' },
    { key: 'figure', label: 'figure' },
    { key: 'lens', label: 'lens' },
    { key: 'figures', label: 'figures' },
    { key: 'analysis', label: 'analysis' },
];

const INVARIANT_ROWS: { key: keyof Metrics; label: string; higherIsBetter: boolean }[] = [
    { key: 'obstruction', label: 'obstruction', higherIsBetter: false },
    { key: 'glue', label: 'glue', higherIsBetter: true },
    { key: 'mythicCharge', label: 'mythic charge', higherIsBetter: true },
    { key: 'modernity', label: 'modernity', higherIsBetter: true },
    { key: 'germPersistence', label: 'germ persistence', higherIsBetter: true },
    { key: 'monodromyTwist', label: 'monodromy twist', higherIsBetter: false },
];

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
            <div style={{ marginBottom: 4, color: '#a3e635' }}>
                {typeof label === 'number' ? label.toFixed(0) : label}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(0)}
                </div>
            ))}
        </div>
    );
}

function InvariantBar({
    label,
    value,
    saved,
}: {
    label: string;
    value: number;
    saved?: number;
}) {
    return (
        <div className="grid grid-cols-[140px_1fr_36px] items-center gap-3">
            <div className="text-xs font-mono text-lime-200/70">{label}</div>
            <div className="relative h-4 bg-lime-500/5 border border-lime-500/15">
                <div
                    className="h-full bg-lime-500/60"
                    style={{ width: `${value}%` }}
                />
                {saved !== undefined && (
                    <div
                        className="absolute top-0 h-full border-l-2 border-orange-400 border-dashed"
                        style={{ left: `${saved}%` }}
                    />
                )}
            </div>
            <div className="text-right text-xs font-mono text-lime-400">{value}</div>
        </div>
    );
}

interface ViewerProps {
    params: Params;
    metrics: Metrics;
    snapshot: Snapshot | null;
    reading: Reading;
    sweepAxis: SweepableAxis;
    onSweepAxisChange: (a: SweepableAxis) => void;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}

export default function Viewer({
    params,
    metrics,
    snapshot,
    reading,
    sweepAxis,
    onSweepAxisChange,
    sweep,
    sensitivityBars,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('map');

    const c = CASES[params.case];
    const lens = LENSES[params.lens];
    const sweepSpec = AXIS_SPECS.find((s) => s.key === sweepAxis);
    const sweepLabel = sweepSpec?.label ?? sweepAxis;

    const ranking = useMemo(() => comparativeRanking(params), [params]);

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {c.label} · through {lens.label}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            cluster: <span className="text-lime-200/80">{CLUSTER_LABELS[c.cluster]}</span>
                            {' · '}
                            preset: <span className="text-lime-200/80">{params.preset}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            obstruction: <span className="text-lime-400">{metrics.obstruction}</span>
                        </div>
                        <div>
                            glue: <span className="text-lime-400">{metrics.glue}</span>
                        </div>
                        <div>
                            tension: <span className="text-lime-400">{metrics.localGlobalTension}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {INVARIANT_ROWS.map((r) => (
                    <div key={r.key} className="border border-lime-500/20 p-3">
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">{r.label}</div>
                        <div className="text-lg font-mono text-lime-400 mt-1">{metrics[r.key]}</div>
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

            {tab === 'map' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        six axes placed on a hex · lime edges weighted by minimum-pair value and overall gluing capacity · dashed orange marks the central local-global rupture, and (above obstruction 60) the dominant-vs-weakest tension
                    </div>
                    <ObstructionMap
                        axes={params}
                        metrics={metrics}
                        snapshotAxes={snapshot ? snapshot.axes : null}
                    />
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            theorem
                        </div>
                        <div className="text-sm text-lime-100 mt-2 leading-relaxed">
                            {reading.theorem}
                        </div>
                        <div className="border-l-2 border-lime-500/40 pl-3 mt-3">
                            <div className="text-base text-lime-200/90 italic leading-relaxed">
                                {reading.aphorism}
                            </div>
                        </div>
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wider mt-3 font-mono">
                            {reading.fieldNote}
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4 space-y-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">invariants</div>
                        {INVARIANT_ROWS.map((r) => (
                            <InvariantBar
                                key={r.key}
                                label={r.label}
                                value={metrics[r.key]}
                                saved={snapshot ? snapshot.metrics[r.key] : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {tab === 'figure' && (
                <div className="space-y-4">
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-sm text-lime-400 font-semibold mb-1">
                            {c.label}
                        </div>
                        <div className="text-xs text-lime-200/60 mb-3 italic">{c.subtitle}</div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">
                            {c.premise}
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            thesis
                        </div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">
                            {c.thesis}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                formula
                            </div>
                            <div className="text-xs font-mono text-lime-300/80 leading-relaxed">
                                {c.formula}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                cluster
                            </div>
                            <div className="text-sm text-lime-100/80">
                                {CLUSTER_LABELS[c.cluster]}
                            </div>
                            <div className="text-[10px] text-lime-200/40 mt-2">
                                canonical expected obstruction: <span className="text-lime-300/80 font-mono">{c.expectedObstruction}</span>
                            </div>
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            objects in this sheaf
                        </div>
                        <ul className="space-y-1.5 text-sm text-lime-100/80">
                            {c.objects.map((x) => (
                                <li key={x}>· {x}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {tab === 'lens' && (
                <div className="space-y-4">
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-sm text-lime-400 font-semibold mb-1">
                            {lens.label}
                        </div>
                        <div className="text-xs font-mono text-lime-300/80 mb-3">
                            {lens.formula}
                        </div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">
                            {lens.description}
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            this lens foregrounds
                        </div>
                        <div className="text-sm text-lime-100/80">
                            {lens.foregrounds}
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            formal object
                        </div>
                        <div className="font-mono text-xs leading-6 text-lime-300/80 space-y-1">
                            <div>X = stratified narrative space</div>
                            <div>F(U) = local commitments over U</div>
                            <div>s_i in F(U_i)</div>
                            <div>s_i|U_ij &ne; s_j|U_ij  rArr  obstruction</div>
                            <div>alpha in H^1(X, Aut(F))</div>
                            <div>truth = germ + transport + residue</div>
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            generated fragment
                        </div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">
                            {reading.compact}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'figures' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        ten figures ranked by the model&apos;s obstruction computed from each one&apos;s canonical axis profile · the currently selected figure is highlighted · this is the calibration in compact form
                    </div>
                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[1fr_120px_80px] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>figure</div>
                            <div>cluster</div>
                            <div className="text-right">obstruction</div>
                        </div>
                        {ranking.map((r) => {
                            const cc = CASES[r.caseKey];
                            const active = r.caseKey === params.case;
                            return (
                                <div
                                    key={r.caseKey}
                                    className={`grid grid-cols-[1fr_120px_80px] gap-2 px-3 py-2 border-b border-lime-500/10 last:border-b-0 items-center ${
                                        active ? 'bg-lime-500/10' : ''
                                    }`}
                                >
                                    <div>
                                        <div className={`text-sm ${active ? 'text-lime-400' : 'text-lime-100/80'}`}>
                                            {r.label}
                                        </div>
                                        <div className="text-[10px] text-lime-200/40 italic">{cc.subtitle}</div>
                                    </div>
                                    <div className="text-[11px] text-lime-200/50">{CLUSTER_LABELS[cc.cluster]}</div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono text-lime-400">{r.obstruction}</span>
                                        <div className="text-[10px] text-lime-200/40 font-mono">
                                            exp {cc.expectedObstruction}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the canonical profile for each figure was assigned from scholarly reading, not from the model&apos;s output · close agreement between predicted and expected indicates the model&apos;s emergent obstruction matches reader intuition for that figure
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                            <div className="flex gap-1 flex-wrap">
                                {AXIS_SPECS.map((spec) => (
                                    <button
                                        key={spec.key}
                                        onClick={() => onSweepAxisChange(spec.key)}
                                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                            sweepAxis === spec.key
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
                            {sweepLabel} sweep · how the invariants respond as one axis is swept while the others are held
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
                                        tickFormatter={(v: number) => v.toFixed(0)}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ReTooltip content={<ChartTooltip />} />
                                    <ReferenceLine
                                        x={params[sweepAxis]}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="obstruction" stroke="#f97316" strokeWidth={2.5} dot={false} name="obstruction" />
                                    <Line type="monotone" dataKey="glue" stroke="#a3e635" strokeWidth={2} dot={false} name="glue" />
                                    <Line type="monotone" dataKey="mythicCharge" stroke="#84cc16" strokeWidth={1.5} dot={false} name="mythic" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="modernity" stroke="#65a30d" strokeWidth={1.5} dot={false} name="modernity" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="germPersistence" stroke="#4d7c0f" strokeWidth={1.5} dot={false} name="germ" strokeDasharray="2 4" />
                                    <Line type="monotone" dataKey="monodromyTwist" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="twist" strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.obstruction}
                        outputLabel="obstruction"
                    />

                    <CalibrationPanel results={calibration} outputLabel="obstruction" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
