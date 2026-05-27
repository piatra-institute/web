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
    FIELD_KEYS,
    FIELD_LABELS,
    REGIMES,
    SCENARIOS,
    bandLabel,
    comparativeRanking,
    currentCase,
    statusOf,
    type ComparativeRow,
    type DetectedBand,
    type Metrics,
    type Params,
    type Reading,
    type SimEvent,
    type SimRow,
    type Snapshot,
    type SweepDatum,
    type SweepableField,
} from '../../logic';
import AudienceLandscape from '../AudienceLandscape';
import TrajectoryChart from '../TrajectoryChart';
import DriftCurve from '../DriftCurve';
import BandHistogram from '../BandHistogram';


type Tab = 'landscape' | 'trajectory' | 'drift' | 'bands' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'landscape', label: 'landscape' },
    { key: 'trajectory', label: 'trajectory' },
    { key: 'drift', label: 'drift' },
    { key: 'bands', label: 'bands' },
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
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toLocaleString()}
                </div>
            ))}
        </div>
    );
}

interface ViewerProps {
    params: Params;
    metrics: Metrics;
    rows: SimRow[];
    events: SimEvent[];
    bands: DetectedBand[];
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
    rows,
    events,
    bands,
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
    const [tab, setTab] = useState<Tab>('landscape');

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
                            floor <span className="text-lime-200/80">{Math.round(params.initialFloor).toLocaleString()}</span>
                            {' · '}capacity <span className="text-lime-200/80">{Math.round(params.capacity).toLocaleString()}</span>
                            {' · '}<span className="italic" style={{ color: reg.color }}>{reg.label}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            final: <span className="text-lime-400">{Math.round(metrics.finalViewers).toLocaleString()}</span>
                        </div>
                        <div>
                            dwell: <span className="text-lime-400">{(metrics.dwellShare * 100).toFixed(0)}%</span>
                        </div>
                        <div>
                            core: <span className="text-lime-400">{(metrics.coreShare * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">final</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{Math.round(metrics.finalViewers).toLocaleString()}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">peak</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{Math.round(metrics.peakViewers).toLocaleString()}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">trough</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{Math.round(metrics.troughViewers).toLocaleString()}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">dwell</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.dwellShare * 100).toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">core share</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.coreShare * 100).toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">log range</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.logRange.toFixed(2)}</div>
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

            {tab === 'landscape' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the potential landscape U(x) over log-viewers, with the dwell histogram from the simulation overlaid as lime fill · the ball sits at the final state; dashed orange shows the saved snapshot
                    </div>
                    <AudienceLandscape
                        params={params}
                        metrics={metrics}
                        bands={bands}
                        snapshot={snapshot}
                    />
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

            {tab === 'trajectory' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        total viewers and the core/casual decomposition over time · vertical orange dashes mark scenario and exposure events · dashed orange overlay is the saved snapshot
                    </div>
                    <TrajectoryChart params={params} rows={rows} events={events} snapshot={snapshot} />
                </div>
            )}

            {tab === 'drift' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the analytic conditional drift curve, the same shape used by the simulator before noise is added · stable attractors are zero crossings with negative slope; unstable ones have positive slope
                    </div>
                    <DriftCurve params={params} />
                </div>
            )}

            {tab === 'bands' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        log-viewers histogram of the simulated trajectory, bucketed to roughly 1.78x ranges · the highest bar is the candidate attractor band
                    </div>
                    <BandHistogram bands={bands} metrics={metrics} />
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
                            {FIELD_LABELS[sweepField]} sweep · how final viewers and the band metrics respond as one parameter moves through its range
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
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v: number) => v.toLocaleString()}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fill: '#facc15', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                        tickFormatter={(v: number) => `${v}%`}
                                    />
                                    <ReTooltip content={<ChartTooltip />} />
                                    <ReferenceLine
                                        yAxisId="left"
                                        x={Number((params[sweepField] as number).toFixed(2))}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line yAxisId="left" type="monotone" dataKey="finalViewers" stroke="#a3e635" strokeWidth={2.5} dot={false} name="final" />
                                    <Line yAxisId="left" type="monotone" dataKey="peakViewers" stroke="#84cc16" strokeWidth={1.5} dot={false} name="peak" strokeDasharray="6 3" />
                                    <Line yAxisId="left" type="monotone" dataKey="troughViewers" stroke="#65a30d" strokeWidth={1.5} dot={false} name="trough" strokeDasharray="6 3" />
                                    <Line yAxisId="right" type="monotone" dataKey="dwellShare" stroke="#facc15" strokeWidth={1.5} dot={false} name="dwell %" strokeDasharray="3 3" />
                                    <Line yAxisId="right" type="monotone" dataKey="coreShare" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="core %" strokeDasharray="2 4" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.finalViewers}
                        outputLabel="final viewers"
                    />

                    <CalibrationPanel results={calibration} outputLabel="final viewers" />

                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[1fr_90px_90px_70px] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>scenario</div>
                            <div className="text-right">final</div>
                            <div className="text-right">expected</div>
                            <div className="text-right">dwell</div>
                        </div>
                        {ranking.map((r) => {
                            const cc = SCENARIOS[r.key];
                            const active = r.key === params.case;
                            const rc = REGIMES[r.regimeIndex].color;
                            return (
                                <div
                                    key={r.key}
                                    className={`grid grid-cols-[1fr_90px_90px_70px] gap-2 px-3 py-2 border-b border-lime-500/10 last:border-b-0 items-center ${
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
                                    <div className="text-right text-sm font-mono text-lime-400">
                                        {Math.round(r.finalViewers).toLocaleString()}
                                        <div className="text-[10px] text-lime-200/40">{bandLabel(r.finalViewers)}</div>
                                    </div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">
                                        {Math.round(r.expectedFinal).toLocaleString()}
                                    </div>
                                    <div className="text-right text-sm font-mono text-lime-400">
                                        {(r.dwellShare * 100).toFixed(0)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
