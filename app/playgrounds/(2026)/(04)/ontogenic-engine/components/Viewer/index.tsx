'use client';

import { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceArea,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ScatterChart,
    Scatter,
    ZAxis,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Scores,
    SimResult,
    SweepableParam,
    SweepDatum,
    PARAM_SPECS,
} from '../../logic';


interface ViewerProps {
    sim: SimResult;
    scores: Scores;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    sweepParam: SweepableParam;
    onSweepParamChange: (key: SweepableParam) => void;
    visibleSteps: number;
}


function SummaryCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
    return (
        <div className="border border-lime-500/20 p-3">
            <div className="text-xs text-lime-200/50 uppercase tracking-wider">{label}</div>
            <div className="mt-1 font-mono text-lg text-lime-400">{value}</div>
            {sub && <div className="text-xs text-lime-200/40 mt-0.5">{sub}</div>}
        </div>
    );
}


function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="border border-lime-500/30 bg-black/90 p-2 text-xs font-mono">
            <div className="text-lime-200/60 mb-1">t = {label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                </div>
            ))}
        </div>
    );
}


function ScatterTooltip({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="border border-lime-500/30 bg-black/90 p-2 text-xs font-mono">
            {payload.map((p, i) => (
                <div key={i} className="text-lime-200/70">
                    {p.name}: {p.value.toFixed(1)}
                </div>
            ))}
        </div>
    );
}


export default function Viewer({
    sim,
    scores,
    sweep,
    sensitivityBars,
    assumptions,
    versions,
    sweepParam,
    onSweepParamChange,
    visibleSteps,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'dynamics' | 'phase' | 'profile' | 'sweep'>('dynamics');

    const displaySeries = useMemo(
        () => sim.series.slice(0, visibleSteps),
        [sim.series, visibleSteps],
    );

    const displayPhaseSpace = useMemo(
        () => sim.phaseSpace.slice(0, visibleSteps),
        [sim.phaseSpace, visibleSteps],
    );

    const tabs: { key: typeof activeTab; label: string }[] = [
        { key: 'dynamics', label: 'dynamics' },
        { key: 'phase', label: 'phase space' },
        { key: 'profile', label: 'profile' },
        { key: 'sweep', label: 'sweep' },
    ];

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                <SummaryCard label="becoming" value={scores.becomingIndex} />
                <SummaryCard label="viability" value={scores.viability} />
                <SummaryCard label="coherence" value={scores.coherence} />
                <SummaryCard label="novelty" value={scores.novelty} />
                <SummaryCard label="tension" value={scores.tension} />
                <SummaryCard label="boundary flux" value={scores.boundaryFlux} />
            </div>

            {/* Version */}
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

            {/* Dynamics tab */}
            {activeTab === 'dynamics' && (
                <div className="space-y-6">
                    <div style={{ width: '100%', height: 420 }}>
                        <ResponsiveContainer width="100%" height={420} minWidth={0}>
                            <LineChart data={displaySeries} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.08)" />
                                <XAxis
                                    dataKey="t"
                                    tick={{ fill: 'rgba(163, 230, 53, 0.4)', fontSize: 10 }}
                                    label={{ value: 'time', fill: 'rgba(163, 230, 53, 0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: 'rgba(163, 230, 53, 0.4)', fontSize: 10 }}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <ReferenceArea y1={45} y2={80} fill="rgba(132, 204, 22, 0.03)" />
                                <ReferenceArea y1={0} y2={25} fill="rgba(239, 68, 68, 0.03)" />
                                <Line type="monotone" dataKey="viability" name="viability" stroke="#22d3ee" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="coherence" name="coherence" stroke="#a78bfa" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="novelty" name="novelty" stroke="#facc15" strokeWidth={1.8} dot={false} />
                                <Line type="monotone" dataKey="tension" name="tension" stroke="#f87171" strokeWidth={1.8} dot={false} />
                                <Line type="monotone" dataKey="becoming" name="becoming" stroke="#a3e635" strokeWidth={2.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5" style={{ background: '#22d3ee' }} />
                            <span className="text-lime-200/50">viability</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5" style={{ background: '#a78bfa' }} />
                            <span className="text-lime-200/50">coherence</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5" style={{ background: '#facc15' }} />
                            <span className="text-lime-200/50">novelty</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5" style={{ background: '#f87171' }} />
                            <span className="text-lime-200/50">tension</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5" style={{ background: '#a3e635' }} />
                            <span className="text-lime-200/50">becoming</span>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={scores.avgBecoming}
                        outputLabel="avg. becoming"
                    />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}

            {/* Phase space tab */}
            {activeTab === 'phase' && (
                <div className="space-y-6">
                    <div style={{ width: '100%', height: 420 }}>
                        <ResponsiveContainer width="100%" height={420} minWidth={0}>
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.08)" />
                                <XAxis
                                    type="number"
                                    dataKey="x"
                                    domain={[0, 100]}
                                    name="Boundary Flux"
                                    tick={{ fill: 'rgba(163, 230, 53, 0.4)', fontSize: 10 }}
                                    label={{ value: 'boundary flux', fill: 'rgba(163, 230, 53, 0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="y"
                                    domain={[0, 100]}
                                    name="Tension"
                                    tick={{ fill: 'rgba(163, 230, 53, 0.4)', fontSize: 10 }}
                                    label={{ value: 'tension', fill: 'rgba(163, 230, 53, 0.3)', fontSize: 10, angle: -90, position: 'insideLeft' }}
                                />
                                <ZAxis type="number" dataKey="z" range={[40, 300]} />
                                <Tooltip content={<ScatterTooltip />} />
                                {/* Regime regions */}
                                <ReferenceArea x1={35} x2={65} y1={15} y2={55} fill="rgba(132, 204, 22, 0.05)" />
                                <ReferenceArea x1={0} x2={25} y1={0} y2={35} fill="rgba(250, 204, 21, 0.04)" />
                                <ReferenceArea x1={60} x2={100} y1={60} y2={100} fill="rgba(239, 68, 68, 0.04)" />
                                <Scatter data={displayPhaseSpace} fill="rgba(163, 230, 53, 0.7)" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="border border-yellow-500/20 p-3">
                            <div className="text-yellow-400/80 uppercase tracking-wider mb-1">low flux, low tension</div>
                            <div className="text-lime-200/60 leading-relaxed">
                                Closure and rigidity. Identity is strong, but the system risks becoming unable to adapt.
                            </div>
                        </div>
                        <div className="border border-lime-500/30 p-3">
                            <div className="text-lime-400 uppercase tracking-wider mb-1">metastable corridor</div>
                            <div className="text-lime-200/60 leading-relaxed">
                                A viable entity lives here: bounded, stressed, but not overwhelmed; open, but not dissolved.
                            </div>
                        </div>
                        <div className="border border-red-500/20 p-3">
                            <div className="text-red-400/80 uppercase tracking-wider mb-1">high flux, high tension</div>
                            <div className="text-lime-200/60 leading-relaxed">
                                Chaotic drift. There is change without enough self-maintaining organization to count as individuation.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile tab */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer width="100%" height={360} minWidth={0}>
                            <RadarChart data={sim.radar} outerRadius="70%">
                                <PolarGrid stroke="rgba(132, 204, 22, 0.15)" />
                                <PolarAngleAxis
                                    dataKey="metric"
                                    tick={{ fill: 'rgba(163, 230, 53, 0.6)', fontSize: 11 }}
                                />
                                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    dataKey="value"
                                    stroke="#a3e635"
                                    fill="rgba(163, 230, 53, 0.15)"
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <SummaryCard label="rigidity" value={scores.rigidity} sub="(memory + boundary − plasticity) / 2" />
                        <SummaryCard label="exposure risk" value={scores.exposureRisk} sub="(perturbation + coupling − boundary) / 1.5" />
                        <SummaryCard label="mean becoming" value={scores.avgBecoming} sub="average across full trajectory" />
                        <SummaryCard label="mean viability" value={scores.avgViability} sub="how well system stays viable over time" />
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed">
                        The hidden hypothesis: an entity is not defined by fixed substance,
                        but by the sustained closure of repair, boundary formation, and world engagement.
                        The strongest regime is one in which plasticity does not destroy coherence
                        and coherence does not suffocate novelty.
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
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(132, 204, 22, 0.08)" />
                                <XAxis
                                    dataKey="sweepValue"
                                    tick={{ fill: 'rgba(163, 230, 53, 0.4)', fontSize: 10 }}
                                    tickFormatter={(v: number) => v.toFixed(0)}
                                    label={{ value: sweepParam, fill: 'rgba(163, 230, 53, 0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }}
                                />
                                <YAxis tick={{ fill: 'rgba(163, 230, 53, 0.4)', fontSize: 10 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="avgBecoming" name="avg becoming" stroke="#a3e635" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="finalBecoming" name="final becoming" stroke="#84cc16" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                                <Line type="monotone" dataKey="avgViability" name="avg viability" stroke="#22d3ee" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
