'use client';

import { useMemo, useState } from 'react';
import {
    ResponsiveContainer, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Params, Metrics, LandscapePoint, TrajectoryStep,
    InvariantCheck, SweepDatum, SweepableParam, PARAM_SPECS,
    SPECIES,
} from '../../logic';


interface ViewerProps {
    params: Params;
    metrics: Metrics;
    landscape: LandscapePoint[];
    trajectory: TrajectoryStep[];
    invariants: InvariantCheck[];
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    sweepParam: SweepableParam;
    onSweepParamChange: (key: SweepableParam) => void;
    visibleTrajectorySteps: number;
}


function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="border border-lime-500/20 p-3">
            <div className="text-xs text-lime-200/50 uppercase tracking-wider">{label}</div>
            <div className="mt-1 font-mono text-lg text-lime-400">{value}</div>
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
    params, metrics, landscape, trajectory, invariants,
    sweep, sensitivityBars, assumptions, versions,
    sweepParam, onSweepParamChange, visibleTrajectorySteps,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'landscape' | 'trajectory' | 'sweep'>('landscape');

    const displayTrajectory = useMemo(
        () => trajectory.slice(0, visibleTrajectorySteps),
        [trajectory, visibleTrajectorySteps],
    );

    const species = SPECIES[params.species];

    const tabs: { key: typeof activeTab; label: string }[] = [
        { key: 'landscape', label: 'landscape' },
        { key: 'trajectory', label: 'trajectory' },
        { key: 'sweep', label: 'sweep' },
    ];

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Regime + summary cards */}
            <div className="border border-lime-500/20 p-4 mb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs text-lime-200/40 uppercase tracking-wider">current regime</div>
                        <div className="text-lg text-lime-400 font-semibold mt-1">{metrics.attractor}</div>
                        <div className="text-xs text-lime-200/50 mt-1">
                            {species.label} · PSII {metrics.psiiEV.toFixed(2)} eV · PSI {metrics.psiEV.toFixed(2)} eV
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryCard label="fixation" value={metrics.assimilation.toFixed(1)} sub="carbon fixation proxy" />
                <SummaryCard label="ROS index" value={metrics.rosIndex.toFixed(1)} sub="reactive oxygen load" />
                <SummaryCard label="homeostasis" value={metrics.homeostasis.toFixed(1)} sub="operating window slack" />
                <SummaryCard label="bifurcation risk" value={`${metrics.bifurcationRisk.toFixed(0)}%`} sub="regime-switch signal" />
            </div>

            {/* Invariant windows */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {invariants.map(inv => (
                    <div
                        key={inv.label}
                        className={`border p-2 text-xs ${
                            inv.ok
                                ? 'border-lime-500/30 bg-lime-500/5 text-lime-400'
                                : 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
                        }`}
                    >
                        <div className="text-lime-200/50">{inv.label}</div>
                        <div className="font-mono mt-0.5">{inv.value}</div>
                    </div>
                ))}
            </div>

            <div className="mb-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
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

            {/* Landscape tab */}
            {activeTab === 'landscape' && (
                <div className="space-y-6">
                    {/* Z-scheme energy ladder */}
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">Z-scheme energy ladder</div>
                        <div style={{ width: '100%', height: 260 }}>
                            <ResponsiveContainer width="100%" height={260} minWidth={0}>
                                <LineChart data={metrics.zData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="stage" tick={{ fill: 'rgba(163,230,53,0.5)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} label={{ value: 'eV', fill: 'rgba(163,230,53,0.3)', fontSize: 10, angle: -90, position: 'insideLeft' }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Line type="monotone" dataKey="energy" stroke="#a3e635" strokeWidth={2.5} dot={{ r: 4, fill: '#a3e635' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Light-response landscape */}
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">Light-response landscape</div>
                        <div style={{ width: '100%', height: 320 }}>
                            <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                <AreaChart data={landscape} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="light" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} label={{ value: 'μmol m⁻² s⁻¹', fill: 'rgba(163,230,53,0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                                    <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area type="monotone" dataKey="fixation" name="fixation" stroke="#a3e635" fill="rgba(163,230,53,0.1)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="ros" name="ROS" stroke="#f87171" fill="rgba(248,113,113,0.08)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="homeostasis" name="homeostasis" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
                                    <ReferenceDot x={params.lightIntensity} y={metrics.assimilation} r={5} fill="#a3e635" stroke="#fff" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis bars={sensitivityBars} baseline={metrics.assimilation} outputLabel="fixation" />
                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}

            {/* Trajectory tab */}
            {activeTab === 'trajectory' && (
                <div className="space-y-6">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Perturbation profile: <span className="text-lime-400">{params.perturbation}</span>
                    </div>
                    <div style={{ width: '100%', height: 380 }}>
                        <ResponsiveContainer width="100%" height={380} minWidth={0}>
                            <LineChart data={displayTrajectory} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                <XAxis dataKey="step" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} label={{ value: 'time step', fill: 'rgba(163,230,53,0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                                <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="fixation" name="fixation" stroke="#a3e635" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="ros" name="ROS" stroke="#f87171" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="memory" name="damage memory" stroke="#c084fc" strokeWidth={1.8} dot={false} />
                                <Line type="monotone" dataKey="homeostasis" name="homeostasis" stroke="#22d3ee" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                        {[
                            { color: '#a3e635', label: 'fixation' },
                            { color: '#f87171', label: 'ROS' },
                            { color: '#c084fc', label: 'damage memory' },
                            { color: '#22d3ee', label: 'homeostasis' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className="w-3 h-0.5" style={{ background: l.color }} />
                                <span className="text-lime-200/50">{l.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
                        <p><strong className="text-lime-200">Path dependence:</strong> the same controls can land in different states depending on prior stress, repair latency, and the temporal structure of light.</p>
                        <p><strong className="text-lime-200">Bifurcations:</strong> once ROS production outruns repair and quenching, the system can abruptly collapse into a photoinhibited regime.</p>
                    </div>
                </div>
            )}

            {/* Sweep tab */}
            {activeTab === 'sweep' && (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                        {PARAM_SPECS.map(spec => (
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
                                <XAxis dataKey="sweepValue" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} tickFormatter={(v: number) => v.toFixed(1)} label={{ value: sweepParam, fill: 'rgba(163,230,53,0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                                <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="assimilation" name="fixation" stroke="#a3e635" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="rosIndex" name="ROS" stroke="#f87171" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                                <Line type="monotone" dataKey="homeostasis" name="homeostasis" stroke="#22d3ee" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
