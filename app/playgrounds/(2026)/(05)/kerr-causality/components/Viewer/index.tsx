'use client';

import React, { useMemo, useState } from 'react';
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
    CASES,
    FIELD_KEYS,
    FIELD_LABELS,
    REGIMES,
    comparativeRanking,
    currentCase,
    statusOf,
    type ComparativeRow,
    type Metrics,
    type Params,
    type Reading,
    type Snapshot,
    type SweepDatum,
    type SweepableField,
} from '../../logic';
import CausalDiagram from '../CausalDiagram';
import RadialPotential from '../RadialPotential';


type Tab = 'diagram' | 'potential' | 'scenario' | 'cases' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'diagram', label: 'diagram' },
    { key: 'potential', label: 'potential' },
    { key: 'scenario', label: 'scenario' },
    { key: 'cases', label: 'cases' },
    { key: 'analysis', label: 'analysis' },
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
                {typeof label === 'number' ? label.toFixed(2) : label}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(3)}
                </div>
            ))}
        </div>
    );
}

interface ViewerProps {
    params: Params;
    metrics: Metrics;
    phase: number;
    snapshot: Snapshot | null;
    reading: Reading;
    sweepField: SweepableField;
    onSweepFieldChange: (f: SweepableField) => void;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}

export default function Viewer({
    params,
    metrics,
    phase,
    snapshot,
    reading,
    sweepField,
    onSweepFieldChange,
    sweep,
    sensitivityBars,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('diagram');

    const cse = currentCase(params);
    const reg = statusOf(metrics);
    const ranking: ComparativeRow[] = useMemo(() => comparativeRanking(), []);

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {cse.label} · {reg.title}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            a = <span className="text-lime-200/80">{params.a.toFixed(2)}</span>
                            {' · '}E = <span className="text-lime-200/80">{params.E.toFixed(2)}</span>
                            {' · '}L = <span className="text-lime-200/80">{params.L.toFixed(2)}</span>
                            {' · '}Q = <span className="text-lime-200/80">{params.Q.toFixed(2)}</span>
                            {' · '}
                            <span className="italic" style={{ color: reg.color }}>
                                {reg.label}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            span: <span className="text-lime-400">{metrics.allowedSpan.toFixed(2)}</span>
                        </div>
                        <div>
                            cross: <span className="text-lime-400">{metrics.crossings}</span>
                        </div>
                        <div>
                            phase: <span className="text-lime-400">{phase.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">r-</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.rMinus.toFixed(3)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">r+</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.rPlus.toFixed(3)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">rmin</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">
                        {Number.isFinite(metrics.rMin) ? metrics.rMin.toFixed(3) : 'n/a'}
                    </div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">rmax</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">
                        {Number.isFinite(metrics.rMax) ? metrics.rMax.toFixed(3) : 'n/a'}
                    </div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">span</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.allowedSpan.toFixed(3)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">crossings</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.crossings}</div>
                </div>
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

            {tab === 'diagram' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        eight stacked tiles for the maximally extended Kerr causal sectors · outer horizons in lime, inner horizons in orange, turning surfaces in dashed red · the photon dot traces the allowed corridor; dashed orange shows the saved snapshot
                    </div>
                    <CausalDiagram params={params} metrics={metrics} phase={phase} snapshot={snapshot} />
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">diagnosis</div>
                        <div className="text-sm text-lime-100 mt-2 leading-relaxed">{reading.diagnosis}</div>
                        <div className="border-l-2 border-lime-500/40 pl-3 mt-3">
                            <div className="text-base text-lime-200/90 italic leading-relaxed">{reading.fieldNote}</div>
                        </div>
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wider mt-3 font-mono">
                            {reading.compact}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'potential' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        R(r) is the radial null-geodesic potential. allowed motion is exactly the union of intervals where R(r) is non-negative · turning points are real roots · dashed orange overlays the saved snapshot
                    </div>
                    <RadialPotential params={params} snapshot={snapshot} />
                </div>
            )}

            {tab === 'scenario' && (
                <div className="space-y-4">
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-sm text-lime-400 font-semibold mb-1">{cse.label}</div>
                        <div className="text-xs text-lime-200/60 mb-3 italic">{cse.subtitle}</div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">{cse.gloss}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                canonical profile
                            </div>
                            <div className="space-y-1 text-[11px] font-mono text-lime-200/70">
                                {FIELD_KEYS.map((k) => (
                                    <div key={k} className="flex justify-between">
                                        <span>{FIELD_LABELS[k]}</span>
                                        <span className="text-lime-400">{cse.profile[k].toFixed(3)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                current vs canonical
                            </div>
                            <div className="space-y-1 text-[11px] font-mono text-lime-200/70">
                                {FIELD_KEYS.map((k) => {
                                    const cur = params[k];
                                    const can = cse.profile[k];
                                    const delta = cur - can;
                                    const off = Math.abs(delta) > 1e-3;
                                    return (
                                        <div key={k} className="flex justify-between">
                                            <span>{FIELD_LABELS[k]}</span>
                                            <span className={off ? 'text-orange-400' : 'text-lime-200/60'}>
                                                {cur.toFixed(3)} {off ? `(${delta >= 0 ? '+' : ''}${delta.toFixed(3)})` : ''}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                expected vs predicted allowed span
                            </div>
                            <div className="flex items-end gap-6">
                                <div>
                                    <div className="text-2xl font-mono text-lime-400">
                                        {metrics.allowedSpan.toFixed(3)}
                                    </div>
                                    <div className="text-[10px] text-lime-200/40 mt-1">predicted</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-mono text-lime-200/70">
                                        {cse.expectedAllowedSpan.toFixed(3)}
                                    </div>
                                    <div className="text-[10px] text-lime-200/40 mt-1">expected</div>
                                </div>
                            </div>
                            <div className="text-[10px] text-lime-200/40 mt-2">
                                expected regime: {REGIMES[cse.expectedRegimeIndex].title}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                regimes legend
                            </div>
                            <div className="space-y-1 text-[11px]">
                                {REGIMES.map((r) => (
                                    <div key={r.key} className="flex justify-between font-mono">
                                        <span style={{ color: r.color }}>{r.index} · {r.title}</span>
                                        <span className="text-lime-200/40">
                                            {metrics.regimeIndex === r.index ? '<- current' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-3 text-[11px] text-lime-200/50 leading-relaxed">
                        {cse.source}
                    </div>
                </div>
            )}

            {tab === 'cases' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        six scenarios at their canonical parameters, ranked by allowed corridor span · the selected scenario is highlighted · this is the calibration in compact form
                    </div>
                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[1fr_70px_70px_70px_60px] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>scenario</div>
                            <div className="text-right">span</div>
                            <div className="text-right">rmin</div>
                            <div className="text-right">rmax</div>
                            <div className="text-right">cross</div>
                        </div>
                        {ranking.map((r) => {
                            const cc = CASES[r.key];
                            const active = r.key === params.case;
                            const rc = REGIMES[r.regimeIndex].color;
                            return (
                                <div
                                    key={r.key}
                                    className={`grid grid-cols-[1fr_70px_70px_70px_60px] gap-2 px-3 py-2 border-b border-lime-500/10 last:border-b-0 items-center ${
                                        active ? 'bg-lime-500/10' : ''
                                    }`}
                                >
                                    <div>
                                        <div className={`text-sm ${active ? 'text-lime-400' : 'text-lime-100/80'}`}>
                                            {r.label}
                                        </div>
                                        <div className="text-[10px] italic" style={{ color: rc }}>
                                            {REGIMES[r.regimeIndex].title}
                                        </div>
                                        <div className="text-[10px] text-lime-200/40 italic">{cc.subtitle}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono text-lime-400">{r.allowedSpan.toFixed(2)}</span>
                                        <div className="text-[10px] text-lime-200/40 font-mono">exp {r.expectedAllowedSpan.toFixed(2)}</div>
                                    </div>
                                    <div className="text-right text-xs font-mono text-lime-200/70">
                                        {Number.isFinite(r.rMin) ? r.rMin.toFixed(2) : 'n/a'}
                                    </div>
                                    <div className="text-right text-xs font-mono text-lime-200/70">
                                        {Number.isFinite(r.rMax) ? r.rMax.toFixed(2) : 'n/a'}
                                    </div>
                                    <div className="text-right text-xs font-mono text-lime-400">{r.crossings}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the Schwarzschild and E = 0 rows have expected spans from closed-form formulas, so they double as numerical regression checks on the root-finder. the other rows carry reader-assigned reference values from the cited literature.
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                            <div className="flex gap-1 flex-wrap">
                                {FIELD_KEYS.map((k) => (
                                    <button
                                        key={k}
                                        onClick={() => onSweepFieldChange(k)}
                                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                            sweepField === k
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {FIELD_LABELS[k]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            {FIELD_LABELS[sweepField]} sweep · how the corridor and horizons respond as one constant is swept while the others are held
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
                                    <ReferenceLine
                                        x={Number(params[sweepField].toFixed(3))}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="allowedSpan" stroke="#a3e635" strokeWidth={2.5} dot={false} name="span" />
                                    <Line type="monotone" dataKey="rMax" stroke="#84cc16" strokeWidth={1.5} dot={false} name="rmax" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="rMin" stroke="#65a30d" strokeWidth={1.5} dot={false} name="rmin" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="rPlus" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="r+" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="rMinus" stroke="#ea580c" strokeWidth={1.5} dot={false} name="r-" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="crossings" stroke="#facc15" strokeWidth={1.5} dot={false} name="crossings" strokeDasharray="2 4" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.allowedSpan}
                        outputLabel="allowed corridor span"
                    />

                    <CalibrationPanel results={calibration} outputLabel="allowed span" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
