'use client';

import { useState, useMemo } from 'react';
import {
    ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid,
    PolarAngleAxis, Radar, CartesianGrid, XAxis, YAxis, Tooltip,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import { StepState, SCALE_LABELS, Params } from '../../logic';


interface ViewerProps {
    params: Params;
    steps: StepState[];
    currentStep: StepState;
    tick: number;
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    versions: ModelVersion[];
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
            {label !== undefined && <div className="text-lime-200/60 mb-1">t={label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
            ))}
        </div>
    );
}


export default function Viewer({
    params, steps, currentStep, tick,
    sensitivityBars, assumptions, versions,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'dynamics' | 'sheaf' | 'harm' | 'analysis'>('dynamics');

    const regimeTone = currentStep.regime === 'Adaptive' ? 'good' as const
        : currentStep.regime === 'Rigid lock-in' ? 'warn' as const
        : 'bad' as const;

    const lineData = useMemo(() => steps.map(s => ({
        t: s.t,
        coherence: +(s.coherence * 100).toFixed(1),
        far: +(s.far * 100).toFixed(1),
        misallocation: +(s.misallocation * 100).toFixed(1),
        pricePressure: +(s.pricePressure * 100).toFixed(1),
        defect: +(s.cohomologyDefect * 100).toFixed(1),
        basinStability: +(s.basinStability * 100).toFixed(1),
    })), [steps]);

    const harmData = [
        { dim: 'Agency', value: +(currentStep.harm.agency * 100).toFixed(1) },
        { dim: 'Material', value: +(currentStep.harm.material * 100).toFixed(1) },
        { dim: 'Stability', value: +(currentStep.harm.stability * 100).toFixed(1) },
        { dim: 'Mobility', value: +(currentStep.harm.mobility * 100).toFixed(1) },
    ];

    // Sheaf diagram positions
    const sheafW = 620;
    const sheafH = 200;
    const sheafLeft = 60;
    const sheafRight = sheafW - 60;
    const sheafStepX = (sheafRight - sheafLeft) / Math.max(currentStep.nodes.length - 1, 1);
    const sheafPositions = currentStep.nodes.map((node, i) => ({
        x: sheafLeft + i * sheafStepX,
        y: 100 + (node.actual - node.desired) * 80,
        ...node,
    }));

    const tabs: { key: typeof activeTab; label: string }[] = [
        { key: 'dynamics', label: 'dynamics' },
        { key: 'sheaf', label: 'sheaf diagram' },
        { key: 'harm', label: 'harm obstruction' },
        { key: 'analysis', label: 'analysis' },
    ];

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Summary */}
            <div className="border border-lime-500/20 p-4 mb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs text-lime-200/40 uppercase tracking-wider">system regime</div>
                        <div className={`text-lg font-semibold mt-1 ${regimeTone === 'good' ? 'text-lime-400' : regimeTone === 'warn' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {currentStep.regime}
                        </div>
                        <div className="text-xs text-lime-200/50 mt-1">
                            step {currentStep.t + 1}/{steps.length} {'\u00B7'} goal {(currentStep.globalGoal * 100).toFixed(0)}% {'\u00B7'} signal fidelity {(currentStep.effectiveSignalFidelity * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryCard label="coherence" value={`${(currentStep.coherence * 100).toFixed(0)}%`} sub="cross-scale alignment" tone={currentStep.coherence > 0.55 ? 'good' : currentStep.coherence > 0.35 ? 'warn' : 'bad'} />
                <SummaryCard label="FAR" value={`${(currentStep.far * 100).toFixed(0)}%`} sub="functional adaptation rate" tone={currentStep.far > 0.5 ? 'good' : currentStep.far > 0.3 ? 'warn' : 'bad'} />
                <SummaryCard label="defect" value={`${(currentStep.cohomologyDefect * 100).toFixed(0)}%`} sub="cohomology defect" tone={currentStep.cohomologyDefect < 0.3 ? 'good' : currentStep.cohomologyDefect < 0.55 ? 'warn' : 'bad'} />
                <SummaryCard label="basin" value={`${(currentStep.basinStability * 100).toFixed(0)}%`} sub="basin stability" tone={currentStep.basinStability > 0.5 ? 'good' : currentStep.basinStability > 0.3 ? 'warn' : 'bad'} />
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

            {/* Dynamics tab */}
            {activeTab === 'dynamics' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">System metrics across time</div>
                        <div style={{ width: '100%', height: 340 }}>
                            <ResponsiveContainer width="100%" height={340} minWidth={0}>
                                <LineChart data={lineData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="t" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} label={{ value: 'time step', fill: 'rgba(163,230,53,0.3)', fontSize: 10, position: 'insideBottom', offset: -10 }} />
                                    <YAxis domain={[0, 100]} tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Line type="monotone" dataKey="coherence" name="coherence" stroke="#a3e635" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="far" name="FAR" stroke="#22d3ee" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="pricePressure" name="price pressure" stroke="#f87171" strokeWidth={1.5} dot={false} strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="defect" name="cohomology defect" stroke="#c084fc" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="basinStability" name="basin stability" stroke="#fbbf24" strokeWidth={1.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-xs">
                        {[
                            { color: '#a3e635', label: 'coherence' },
                            { color: '#22d3ee', label: 'FAR' },
                            { color: '#f87171', label: 'price pressure' },
                            { color: '#c084fc', label: 'cohomology defect' },
                            { color: '#fbbf24', label: 'basin stability' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className="w-3 h-0.5" style={{ background: l.color }} />
                                <span className="text-lime-200/50">{l.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Per-node state at current tick */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {currentStep.nodes.map(node => {
                            const mismatch = Math.abs(node.desired - node.actual);
                            return (
                                <div key={node.label} className="border border-lime-500/15 p-2 text-xs">
                                    <div className="text-lime-200/50">{node.label}</div>
                                    <div className="font-mono text-lime-400 mt-0.5">
                                        {(node.actual * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-lime-200/30 text-[10px]">
                                        slack {(node.slack * 100).toFixed(0)} {'\u00B7'} veto {(node.vetoLoad * 100).toFixed(0)} {'\u00B7'} glue err {(node.glueError * 100).toFixed(0)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sheaf diagram tab */}
            {activeTab === 'sheaf' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Sheaf-like gluing map. Adjacent scales should compose into a coherent global section. Vertical offset shows mismatch between desired and actual state. Line opacity shows cross-scale coherence.
                    </div>

                    <div className="border border-lime-500/20 p-2">
                        <svg viewBox={`0 0 ${sheafW} ${sheafH + 30}`} className="w-full h-auto">
                            {/* Baseline */}
                            <line x1={sheafLeft - 20} y1={100} x2={sheafRight + 20} y2={100} stroke="rgba(163,230,53,0.1)" strokeDasharray="6 6" />

                            {/* Edges */}
                            {sheafPositions.map((node, i) => {
                                if (i === sheafPositions.length - 1) return null;
                                const next = sheafPositions[i + 1];
                                const gap = Math.abs(node.actual - next.actual) + Math.abs(node.desired - next.desired) * 0.4;
                                const opacity = Math.max(0.15, 1 - gap * 0.95);
                                return (
                                    <line
                                        key={`${node.label}-${next.label}`}
                                        x1={node.x} y1={node.y}
                                        x2={next.x} y2={next.y}
                                        stroke="#a3e635" strokeWidth={2.5} opacity={opacity}
                                    />
                                );
                            })}

                            {/* Nodes */}
                            {sheafPositions.map(node => {
                                const radius = 10 + node.actual * 8;
                                return (
                                    <g key={node.label}>
                                        <circle cx={node.x} cy={100} r={4} fill="#a3e635" opacity={0.15} />
                                        <line x1={node.x} y1={100} x2={node.x} y2={node.y} stroke="#a3e635" opacity={0.1} strokeDasharray="3 3" />
                                        <circle cx={node.x} cy={node.y} r={radius} fill="#a3e635" opacity={0.08 + node.slack * 0.2} />
                                        <circle cx={node.x} cy={node.y} r={7} fill="#a3e635" />
                                        <text x={node.x} y={sheafH + 20} textAnchor="middle" fontSize="10" fill="rgba(163,230,53,0.5)">
                                            {node.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
                        <p><strong className="text-lime-200">Gluing:</strong> local sections (each scale&apos;s desired state) compose into a global section only when the restriction maps (cross-scale signals) are consistent. Failure to glue produces a cohomology defect.</p>
                        <p><strong className="text-lime-200">Morphogenetic pull:</strong> when repair capacity and gluing are strong, higher scales recruit lower scales toward system goals (Levin-style top-down patterning).</p>
                        <p><strong className="text-lime-200">Hysteresis:</strong> accumulated misallocation degrades signal fidelity over time. The system&apos;s own failures distort future perception, creating path dependence.</p>
                    </div>
                </div>
            )}

            {/* Harm obstruction tab */}
            {activeTab === 'harm' && (
                <div className="space-y-6">
                    <div className="text-xs text-lime-200/50 mb-2">
                        When scales fail to glue, the unabsorbed demand converts into specific harm dimensions. This radar shows which dimensions are most affected by the current coordination failure.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs text-lime-200/50 mb-2">Harm obstruction radar</div>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                    <RadarChart data={harmData} outerRadius="72%">
                                        <PolarGrid stroke="rgba(132,204,22,0.15)" />
                                        <PolarAngleAxis dataKey="dim" tick={{ fill: 'rgba(163,230,53,0.6)', fontSize: 11 }} />
                                        <Radar dataKey="value" stroke="#f87171" fill="#f87171" fillOpacity={0.2} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SummaryCard label="agency harm" value={`${(currentStep.harm.agency * 100).toFixed(0)}%`} sub="loss of choice and access" tone={currentStep.harm.agency > 0.5 ? 'bad' : currentStep.harm.agency > 0.3 ? 'warn' : 'good'} />
                            <SummaryCard label="material harm" value={`${(currentStep.harm.material * 100).toFixed(0)}%`} sub="price spikes and affordability" tone={currentStep.harm.material > 0.5 ? 'bad' : currentStep.harm.material > 0.3 ? 'warn' : 'good'} />
                            <SummaryCard label="stability harm" value={`${(currentStep.harm.stability * 100).toFixed(0)}%`} sub="bubble and tail risk" tone={currentStep.harm.stability > 0.5 ? 'bad' : currentStep.harm.stability > 0.3 ? 'warn' : 'good'} />
                            <SummaryCard label="mobility harm" value={`${(currentStep.harm.mobility * 100).toFixed(0)}%`} sub="lock-in and relocation barriers" tone={currentStep.harm.mobility > 0.5 ? 'bad' : currentStep.harm.mobility > 0.3 ? 'warn' : 'good'} />
                        </div>
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
                        <p><strong className="text-lime-200">Agency:</strong> when scales are locked, would-be residents lose the capacity to choose where and how to live. Unmet demand is not just a number; it is foreclosed possibility.</p>
                        <p><strong className="text-lime-200">Material:</strong> price spikes and rent inflation concentrate costs on marginal buyers and renters. Incumbent capture converts scarcity into asset gains for those already in.</p>
                        <p><strong className="text-lime-200">Stability:</strong> finance misalignment and broken gluing create fragile equilibria. High cohomology defect + low basin stability = latent systemic crisis.</p>
                        <p><strong className="text-lime-200">Mobility:</strong> queue pressure, infrastructure gaps, and veto walls trap households in suboptimal locations. The spatial labor market fails.</p>
                    </div>
                </div>
            )}

            {/* Analysis tab */}
            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    <SensitivityAnalysis bars={sensitivityBars} baseline={currentStep.far * 100} outputLabel="FAR" />
                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
