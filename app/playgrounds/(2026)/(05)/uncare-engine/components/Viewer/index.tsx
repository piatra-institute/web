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
    AXIS_KEYS,
    AXIS_LABELS,
    CASES,
    Metrics,
    Params,
    Reading,
    Snapshot,
    SweepableAxis,
    SweepDatum,
    TRIGGERS,
    comparativeRanking,
} from '../../logic';
import { STAGES } from '../../logic/stages';
import WagonMap from '../WagonMap';


type Tab = 'map' | 'domain' | 'stage' | 'domains' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'map', label: 'map' },
    { key: 'domain', label: 'domain' },
    { key: 'stage', label: 'stage' },
    { key: 'domains', label: 'domains' },
    { key: 'analysis', label: 'analysis' },
];

const INVARIANT_ROWS: { key: keyof Metrics; label: string; higherIsBetter: boolean }[] = [
    { key: 'madness', label: 'madness', higherIsBetter: false },
    { key: 'escapeVelocity', label: 'escape velocity', higherIsBetter: true },
    { key: 'inversionPressure', label: 'inversion pressure', higherIsBetter: false },
    { key: 'monstrosityPotential', label: 'monstrosity', higherIsBetter: false },
    { key: 'careCapacity', label: 'care capacity', higherIsBetter: true },
    { key: 'backlashRisk', label: 'backlash risk', higherIsBetter: false },
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
    const stage = STAGES[metrics.stageIndex];
    const sweepLabel = AXIS_LABELS[sweepAxis];

    const ranking = useMemo(() => comparativeRanking(), []);

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {c.label} · stage {stage.index} · {stage.title}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            preset: <span className="text-lime-200/80">{params.preset}</span>
                            {' · '}
                            <span className="text-lime-200/80 italic">{stage.label}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            madness: <span className="text-lime-400">{metrics.madness}</span>
                        </div>
                        <div>
                            inversion: <span className="text-lime-400">{metrics.inversionPressure}</span>
                        </div>
                        <div>
                            care: <span className="text-lime-400">{metrics.careCapacity}</span>
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
                        pressure = load, shame, inflation · capture = tribe, no-exit, isolation · six diagonal bands are the six stages from ordinary load to monstrous uncare · dashed orange traces the drift from a saved snapshot
                    </div>
                    <WagonMap axes={params} metrics={metrics} snapshot={snapshot} />
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">
                            diagnosis
                        </div>
                        <div className="text-sm text-lime-100 mt-2 leading-relaxed">
                            {reading.diagnosis}
                        </div>
                        <div className="border-l-2 border-lime-500/40 pl-3 mt-3">
                            <div className="text-base text-lime-200/90 italic leading-relaxed">
                                {reading.fieldNote}
                            </div>
                        </div>
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wider mt-3 font-mono">
                            {reading.compact}
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

            {tab === 'domain' && (
                <div className="space-y-4">
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-sm text-lime-400 font-semibold mb-1">{c.label}</div>
                        <div className="text-xs text-lime-200/60 mb-3 italic">{c.subtitle}</div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">{c.accusation}</div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            chain into uncare
                        </div>
                        <div className="text-sm text-lime-100/80 leading-relaxed font-mono">
                            {c.chain}
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            inversion form
                        </div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">
                            {c.inversion}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                canonical madness
                            </div>
                            <div className="text-2xl font-mono text-lime-400">
                                {c.expectedMadness}
                            </div>
                            <div className="text-[10px] text-lime-200/40 mt-1">
                                expected stage {c.expectedStage}: {STAGES[c.expectedStage].title}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                axis profile (canonical)
                            </div>
                            <div className="space-y-1 text-[11px] font-mono text-lime-200/70">
                                {AXIS_KEYS.map((k) => (
                                    <div key={k} className="flex justify-between">
                                        <span>{AXIS_LABELS[k]}</span>
                                        <span className="text-lime-400">{c.canonical[k]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            objects in this domain
                        </div>
                        <ul className="space-y-1.5 text-sm text-lime-100/80">
                            {c.objects.map((x) => (
                                <li key={x}>· {x}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {tab === 'stage' && (
                <div className="space-y-4">
                    <div className="border border-lime-500/30 p-4">
                        <div
                            className="text-sm font-semibold mb-1"
                            style={{ color: stage.color }}
                        >
                            stage {stage.index} · {stage.title}
                        </div>
                        <div className="text-xs text-lime-200/60 mb-3 italic">{stage.label}</div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">
                            {stage.description}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                observable tells
                            </div>
                            <ul className="space-y-1.5 text-sm text-lime-100/80">
                                {stage.tells.map((t) => (
                                    <li key={t}>· {t}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                best response at this stage
                            </div>
                            <div className="text-sm text-lime-100/80 leading-relaxed">
                                {stage.intervention}
                            </div>
                        </div>
                    </div>
                    <div className="border-l-2 pl-4 py-2" style={{ borderColor: `${stage.color}66` }}>
                        <div className="text-base italic text-lime-200/90 leading-relaxed">
                            {stage.aphorism}
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-3">
                            common triggers across stages
                        </div>
                        <div className="space-y-2">
                            {TRIGGERS.map((t) => (
                                <div key={t.name} className="border border-lime-500/10 p-2">
                                    <div className="text-xs text-lime-400 font-mono">
                                        {t.name}{' '}
                                        <span className="text-lime-200/40">
                                            ({t.axes.map((a) => AXIS_LABELS[a as keyof typeof AXIS_LABELS] ?? a).join(' + ')})
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-lime-200/60 mt-1">{t.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'domains' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        ten domains ranked by predicted madness from each one&apos;s canonical axis profile · the currently selected domain is highlighted · this is the calibration in compact form
                    </div>
                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[1fr_120px_80px] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>domain</div>
                            <div>predicted stage</div>
                            <div className="text-right">madness</div>
                        </div>
                        {ranking.map((r) => {
                            const cc = CASES[r.key];
                            const active = r.key === params.case;
                            const predictedStage = STAGES[r.predictedStage];
                            return (
                                <div
                                    key={r.key}
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
                                    <div className="text-[11px] font-mono" style={{ color: predictedStage.color }}>
                                        {r.predictedStage} · {predictedStage.title}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-mono text-lime-400">{r.predictedMadness}</span>
                                        <div className="text-[10px] text-lime-200/40 font-mono">
                                            exp {r.expectedMadness}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the canonical profile for each domain was assigned from scholarly reading of representative cases, not from the model&apos;s output · close agreement between predicted and expected madness indicates the model&apos;s composite score matches reader intuition about how moral pressure plays out in that domain
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                            <div className="flex gap-1 flex-wrap">
                                {AXIS_KEYS.map((k) => (
                                    <button
                                        key={k}
                                        onClick={() => onSweepAxisChange(k)}
                                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                            sweepAxis === k
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {AXIS_LABELS[k]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            {sweepLabel} sweep · how the six metrics respond as one axis is swept while the others are held
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
                                    <Line type="monotone" dataKey="madness" stroke="#f97316" strokeWidth={2.5} dot={false} name="madness" />
                                    <Line type="monotone" dataKey="careCapacity" stroke="#a3e635" strokeWidth={2} dot={false} name="care" />
                                    <Line type="monotone" dataKey="escapeVelocity" stroke="#84cc16" strokeWidth={1.5} dot={false} name="escape" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="inversionPressure" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="inversion" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="monstrosityPotential" stroke="#ea580c" strokeWidth={1.5} dot={false} name="monstrous" strokeDasharray="2 4" />
                                    <Line type="monotone" dataKey="backlashRisk" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="backlash" strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.madness}
                        outputLabel="madness"
                    />

                    <CalibrationPanel results={calibration} outputLabel="madness" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
