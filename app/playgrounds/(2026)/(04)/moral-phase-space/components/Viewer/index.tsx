'use client';

import { useMemo, useState } from 'react';
import {
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
    BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar,
    LineChart, Line, ScatterChart, Scatter, ZAxis,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Params, Metrics, SweepDatum, SweepableKey,
    SWEEP_PARAM_SPECS, computeSweep,
} from '../../logic';


interface ViewerProps {
    params: Params;
    metrics: Metrics;
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    sweepParam: SweepableKey;
    onSweepParamChange: (key: SweepableKey) => void;
}


function SummaryCard({ label, value, sub, tone }: {
    label: string; value: string; sub?: string; tone?: 'good' | 'bad' | 'warn' | 'neutral';
}) {
    const borderColor = tone === 'bad' ? 'border-red-500/30' : tone === 'warn' ? 'border-yellow-500/30' : tone === 'good' ? 'border-lime-500/30' : 'border-lime-500/20';
    const valueColor = tone === 'bad' ? 'text-red-400' : tone === 'warn' ? 'text-yellow-400' : 'text-lime-400';
    return (
        <div className={`border ${borderColor} p-3`}>
            <div className="text-xs text-lime-200/50 uppercase tracking-wider">{label}</div>
            <div className={`mt-1 font-mono text-lg ${valueColor}`}>{value}</div>
            {sub && <div className="text-xs text-lime-200/40 mt-0.5">{sub}</div>}
        </div>
    );
}

function ChartTooltip({ active, payload, label }: {
    active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="border border-lime-500/30 bg-black/90 p-2 text-xs font-mono">
            {label !== undefined && <div className="text-lime-200/60 mb-1">{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
            ))}
        </div>
    );
}


export default function Viewer({
    params, metrics, sensitivityBars, assumptions, versions,
    sweepParam, onSweepParamChange,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'compare' | 'deontic' | 'capabilities' | 'state-space' | 'sweep'>('compare');

    const d = metrics.deontic;
    const c = metrics.capabilities;
    const st = metrics.trajectory;

    const sweep = useMemo(() => computeSweep(params, sweepParam), [params, sweepParam]);

    const lineData = st.points.map(p => ({ step: p.step, domination: p.domination, repair: p.repair, risk: p.risk }));

    const tabs: { key: typeof activeTab; label: string }[] = [
        { key: 'compare', label: 'compare' },
        { key: 'deontic', label: 'deontic' },
        { key: 'capabilities', label: 'capabilities' },
        { key: 'state-space', label: 'state-space' },
        { key: 'sweep', label: 'sweep' },
    ];

    const deonticTone = d.forbidden ? 'bad' as const : d.severity > 18 ? 'warn' as const : 'good' as const;

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Summary */}
            <div className="border border-lime-500/20 p-4 mb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs text-lime-200/40 uppercase tracking-wider">normative gate</div>
                        <div className={`text-lg font-semibold mt-1 ${d.forbidden ? 'text-red-400' : d.severity > 18 ? 'text-yellow-400' : 'text-lime-400'}`}>
                            {d.status}
                        </div>
                        <div className="text-xs text-lime-200/50 mt-1">
                            {d.violations.length} violation{d.violations.length !== 1 ? 's' : ''} {'\u00B7'} severity {d.severity.toFixed(0)} {'\u00B7'} {st.basin}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryCard label="deontic" value={`${(100 - d.severity).toFixed(0)}`} sub="admissibility score" tone={deonticTone} />
                <SummaryCard label="capability" value={c.adjusted.toFixed(0)} sub={`floor = ${c.floor}`} tone={c.floor >= 70 ? 'good' : c.floor >= 45 ? 'warn' : 'bad'} />
                <SummaryCard label="state-space" value={`${(100 - st.currentRisk).toFixed(0)}`} sub="trajectory safety" tone={st.currentRisk < 30 ? 'good' : st.currentRisk < 55 ? 'warn' : 'bad'} />
                <SummaryCard label="naive utility" value={metrics.utility.toFixed(0)} sub="foil metric" tone="neutral" />
            </div>

            <div className="mb-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
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

            {/* Compare tab */}
            {activeTab === 'compare' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">Framework comparison</div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                <BarChart data={metrics.summary} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <YAxis type="category" dataKey="framework" width={110} tick={{ fill: 'rgba(163,230,53,0.5)', fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="value" fill="#a3e635" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {metrics.summary.map(row => (
                            <div key={row.framework} className="border border-lime-500/20 p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-lime-200/70 font-medium">{row.framework}</span>
                                    <span className="font-mono text-lime-400 text-sm">{Math.round(row.value)}</span>
                                </div>
                                <div className="text-xs text-lime-200/40 mt-1">{row.note}</div>
                            </div>
                        ))}
                    </div>

                    <div className="border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200/70 leading-relaxed">
                        The point is not to force agreement between the models. It is to show what each one notices: rule-violation, freedom-floor, or long-run institutional drift.
                    </div>
                </div>
            )}

            {/* Deontic tab */}
            {activeTab === 'deontic' && (
                <div className="space-y-6">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Rights as constraints. Some actions are not merely costly; they are forbidden.
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <SummaryCard label="status" value={d.status} tone={deonticTone} />
                        <SummaryCard label="violation load" value={d.severity.toFixed(0)} sub="hard protections breached" tone={deonticTone} />
                        <SummaryCard label="future promise" value={`${params.futureWelfarePromise}`} sub="cannot override prohibitions" tone="neutral" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="border border-red-500/20 bg-red-500/5 p-3">
                            <div className="text-xs text-red-400 font-medium mb-2">Violations</div>
                            <div className="text-xs text-red-300/70 space-y-1">
                                {d.violations.length > 0
                                    ? d.violations.map(v => <div key={v}>{'\u2022'} {v}</div>)
                                    : <div>{'\u2022'} No hard-rights breach triggered</div>
                                }
                            </div>
                        </div>
                        <div className="border border-lime-500/20 bg-lime-500/5 p-3">
                            <div className="text-xs text-lime-400 font-medium mb-2">Active duties</div>
                            <div className="text-xs text-lime-300/70 space-y-1">
                                {d.obligations.length > 0
                                    ? d.obligations.map(v => <div key={v}>{'\u2022'} {v}</div>)
                                    : <div>{'\u2022'} Repair duties remain institutionally weak</div>
                                }
                            </div>
                        </div>
                        <div className="border border-cyan-500/20 bg-cyan-500/5 p-3">
                            <div className="text-xs text-cyan-400 font-medium mb-2">Derivation</div>
                            <div className="text-xs text-cyan-300/70 space-y-1">
                                <div>1. Test basic protections.</div>
                                <div>2. If breached, mark as inadmissible.</div>
                                <div>3. Only then compare secondary goods.</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer width="100%" height={220} minWidth={0}>
                            <BarChart
                                data={[
                                    { name: 'Severity', value: Math.round(d.severity) },
                                    { name: 'Residual admissibility', value: Math.round(100 - d.severity) },
                                ]}
                                margin={{ top: 10, right: 20, bottom: 20, left: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                <XAxis dataKey="name" tick={{ fill: 'rgba(163,230,53,0.5)', fontSize: 10 }} />
                                <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="value" fill="#a3e635" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <SensitivityAnalysis bars={sensitivityBars} baseline={100 - d.severity} outputLabel="admissibility" />
                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}

            {/* Capabilities tab */}
            {activeTab === 'capabilities' && (
                <div className="space-y-6">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Compare social states by real freedoms and floors, not just preference-satisfaction.
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <SummaryCard label="capability floor" value={`${c.floor}`} sub="worst protected freedom" tone={c.floor >= 70 ? 'good' : c.floor >= 45 ? 'warn' : 'bad'} />
                        <SummaryCard label="adjusted standing" value={c.adjusted.toFixed(0)} sub="mean + floor \u2212 domination" tone={c.adjusted >= 70 ? 'good' : c.adjusted >= 45 ? 'warn' : 'bad'} />
                        <SummaryCard label="order class" value={c.partialOrderClass} tone="neutral" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs text-lime-200/50 mb-2">Capability radar</div>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <RadarChart data={c.data} outerRadius="72%">
                                        <PolarGrid stroke="rgba(132,204,22,0.15)" />
                                        <PolarAngleAxis dataKey="label" tick={{ fill: 'rgba(163,230,53,0.6)', fontSize: 11 }} />
                                        <Radar dataKey="value" stroke="#a3e635" fill="#a3e635" fillOpacity={0.2} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-lime-200/50 mb-2">Capability bars</div>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <BarChart data={c.data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                        <XAxis dataKey="label" tick={{ fill: 'rgba(163,230,53,0.5)', fontSize: 10 }} angle={-25} textAnchor="end" height={50} />
                                        <YAxis domain={[0, 100]} tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="value" fill="#a3e635" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
                        <p>{'\u2022'} States can be incomparable: one may improve education while worsening political voice.</p>
                        <p>{'\u2022'} The capability floor matters because a society with one collapsed freedom is not redeemed by luxuries elsewhere.</p>
                        <p>{'\u2022'} Domination enters as a structural penalty because formally equal opportunities can coexist with targeted subordination.</p>
                    </div>
                </div>
            )}

            {/* State-space tab */}
            {activeTab === 'state-space' && (
                <div className="space-y-6">
                    <div className="text-xs text-lime-200/50 mb-2">
                        What matters is not just the snapshot, but where the institutional dynamics are trying to drag the polity.
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <SummaryCard label="risk" value={`${st.currentRisk}`} sub="trajectory endpoint risk" tone={st.currentRisk < 30 ? 'good' : st.currentRisk < 55 ? 'warn' : 'bad'} />
                        <SummaryCard label="basin" value={st.basin} tone="neutral" />
                        <SummaryCard label="repair capacity" value={`${params.repairCapacity}`} sub="counter-force strength" tone={params.repairCapacity >= 70 ? 'good' : params.repairCapacity >= 45 ? 'warn' : 'bad'} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs text-lime-200/50 mb-2">Domination / repair trajectory</div>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <LineChart data={lineData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                        <XAxis dataKey="step" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} label={{ value: 'time step', fill: 'rgba(163,230,53,0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                                        <YAxis domain={[0, 100]} tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Line type="monotone" dataKey="domination" name="domination" stroke="#f87171" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="repair" name="repair" stroke="#a3e635" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="risk" name="risk" stroke="#fbbf24" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-lime-200/50 mb-2">Phase view (domination vs repair)</div>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                        <XAxis type="number" dataKey="domination" domain={[0, 100]} name="Domination" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} label={{ value: 'domination', fill: 'rgba(163,230,53,0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                                        <YAxis type="number" dataKey="repair" domain={[0, 100]} name="Repair" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} label={{ value: 'repair', fill: 'rgba(163,230,53,0.3)', fontSize: 10, angle: -90, position: 'insideLeft' }} />
                                        <ZAxis type="number" dataKey="size" range={[60, 300]} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter data={st.points} fill="#a3e635" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                            { color: '#f87171', label: 'domination' },
                            { color: '#a3e635', label: 'repair' },
                            { color: '#fbbf24', label: 'risk' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className="w-3 h-0.5" style={{ background: l.color }} />
                                <span className="text-lime-200/50">{l.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
                        <p><strong className="text-lime-200">Path dependence:</strong> domination can become self-reinforcing even when some present indicators look tolerable.</p>
                        <p><strong className="text-lime-200">Repair institutions:</strong> function as dynamic counter-forces rather than static values.</p>
                    </div>
                </div>
            )}

            {/* Sweep tab */}
            {activeTab === 'sweep' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Sweep one parameter 0{'\u2013'}100 and compare how each framework responds.
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {SWEEP_PARAM_SPECS.map(spec => (
                            <button
                                key={spec.key}
                                onClick={() => onSweepParamChange(spec.key)}
                                className={`px-3 py-1 text-xs border transition-colors ${
                                    sweepParam === spec.key
                                        ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                        : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                }`}
                            >
                                {spec.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height={400} minWidth={0}>
                            <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                <XAxis dataKey="sweepValue" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} tickFormatter={(v: number) => v.toFixed(0)} label={{ value: sweepParam, fill: 'rgba(163,230,53,0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="deontic" name="deontic" stroke="#a3e635" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="capability" name="capability" stroke="#22d3ee" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="stateSpace" name="state-space" stroke="#fbbf24" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                                <Line type="monotone" dataKey="utility" name="naive utility" stroke="#f87171" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        {[
                            { color: '#a3e635', label: 'deontic' },
                            { color: '#22d3ee', label: 'capability' },
                            { color: '#fbbf24', label: 'state-space' },
                            { color: '#f87171', label: 'naive utility' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className="w-3 h-0.5" style={{ background: l.color }} />
                                <span className="text-lime-200/50">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
