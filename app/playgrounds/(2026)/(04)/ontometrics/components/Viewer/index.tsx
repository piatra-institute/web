'use client';

import { useState } from 'react';
import {
    ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis,
    Tooltip, Bar,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import { OntologyState, Metrics } from '../../logic';


interface ViewerProps {
    state: OntologyState;
    metrics: Metrics;
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
            {label !== undefined && <div className="text-lime-200/60 mb-1">{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</div>
            ))}
        </div>
    );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="text-lime-200/50">{label}</span>
                <span className="font-mono text-lime-400">{(value * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-lime-500/10">
                <div className="h-full transition-all" style={{ width: `${Math.round(value * 100)}%`, background: color }} />
            </div>
        </div>
    );
}


export default function Viewer({ state, metrics, sensitivityBars, assumptions, versions }: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'metrics' | 'phase' | 'violations' | 'analysis'>('metrics');

    const phaseTone = metrics.phase === 'Calibrated' ? 'good' as const
        : metrics.phase === 'Underdeveloped' ? 'warn' as const
        : metrics.phase === 'Overdetermined' || metrics.phase === 'Brittle confusion' ? 'bad' as const
        : 'warn' as const;

    const phaseX = 30 + metrics.structureLoad * 260;
    const phaseY = 190 - metrics.fit * 150;

    const harmanLabel = metrics.harmanIndex > 0.3 ? 'overmining' : metrics.harmanIndex < -0.3 ? 'undermining' : 'balanced';

    const mdlData = [
        { name: 'L(O)', value: +(metrics.mdl.descriptionLength * 100).toFixed(1) },
        { name: 'L(D|O)', value: +(metrics.mdl.residualSurprise * 100).toFixed(1) },
    ];

    const tabs: { key: typeof activeTab; label: string }[] = [
        { key: 'metrics', label: 'metrics' },
        { key: 'phase', label: 'phase map' },
        { key: 'violations', label: `violations (${metrics.violations.length})` },
        { key: 'analysis', label: 'analysis' },
    ];

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Summary */}
            <div className="border border-lime-500/20 p-4 mb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-xs text-lime-200/40 uppercase tracking-wider">current phase</div>
                        <div className={`text-lg font-semibold mt-1 ${phaseTone === 'good' ? 'text-lime-400' : phaseTone === 'warn' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {metrics.phase}
                        </div>
                        <div className="text-xs text-lime-200/50 mt-1">
                            {state.categories.length} categories {'\u00B7'} {state.axioms.length} axioms {'\u00B7'} {state.cases.length} cases
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryCard label="quality Q" value={`${(metrics.quality * 100).toFixed(0)}%`} sub="MDL-inspired score" tone={phaseTone} />
                <SummaryCard label="fit" value={`${(metrics.fit * 100).toFixed(0)}%`} sub="coverage + discrimination" tone={metrics.fit >= 0.6 ? 'good' : metrics.fit >= 0.4 ? 'warn' : 'bad'} />
                <SummaryCard label="structure load" value={`${(metrics.structureLoad * 100).toFixed(0)}%`} sub="complexity + redundancy + inconsistency" tone={metrics.structureLoad < 0.5 ? 'good' : metrics.structureLoad < 0.7 ? 'warn' : 'bad'} />
                <SummaryCard label="Harman" value={harmanLabel} sub={`index: ${metrics.harmanIndex.toFixed(2)}`} tone="neutral" />
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

            {/* Metrics tab */}
            {activeTab === 'metrics' && (
                <div className="space-y-6">
                    <div className="space-y-3">
                        <MetricBar label="Coverage" value={metrics.coverage} color="#a3e635" />
                        <MetricBar label="Discrimination" value={metrics.discrimination} color="#22d3ee" />
                        <MetricBar label="Redundancy" value={metrics.redundancy} color="#fbbf24" />
                        <MetricBar label="Inconsistency" value={metrics.inconsistency} color="#f87171" />
                        <MetricBar label="Complexity" value={metrics.complexity} color="#c084fc" />
                        <MetricBar label="Brittleness" value={metrics.brittleness} color="#fb7185" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <SummaryCard label="avg labels/case" value={metrics.meanAssigned.toFixed(2)} tone="neutral" />
                        <SummaryCard label="assignment density" value={`${(metrics.density * 100).toFixed(0)}%`} tone="neutral" />
                    </div>

                    {/* MDL decomposition */}
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">MDL decomposition: L(O) + L(D|O)</div>
                        <div style={{ width: '100%', height: 180 }}>
                            <ResponsiveContainer width="100%" height={180} minWidth={0}>
                                <BarChart data={mdlData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="name" tick={{ fill: 'rgba(163,230,53,0.5)', fontSize: 11 }} />
                                    <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="value" fill="#a3e635" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-xs text-lime-200/40 mt-1">
                            L(O) = description length of ontology. L(D|O) = residual surprise (unexplained phenomena). Good ontology minimizes the sum.
                        </div>
                    </div>

                    {/* Harman indicator */}
                    <div className="border border-lime-500/20 p-3">
                        <div className="text-xs text-lime-200/50 mb-2">Harman undermining / overmining axis</div>
                        <div className="relative h-3 bg-lime-500/10 mb-1">
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-lime-500/30" />
                            <div
                                className="absolute top-0 bottom-0 w-3 bg-lime-400"
                                style={{ left: `${50 + metrics.harmanIndex * 50}%`, transform: 'translateX(-50%)' }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-lime-200/40">
                            <span>undermining</span>
                            <span>balanced</span>
                            <span>overmining</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Phase map tab */}
            {activeTab === 'phase' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Fit (vertical) vs structure load (horizontal). Good ontologies sit in the upper-left quadrant.
                    </div>
                    <div className="border border-lime-500/20 p-2 max-w-[500px] mx-auto">
                        <svg viewBox="0 0 320 220" className="w-full h-auto">
                            <rect x="30" y="20" width="260" height="170" rx="2" fill="rgba(132,204,22,0.03)" />
                            <line x1="160" y1="20" x2="160" y2="190" stroke="rgba(132,204,22,0.15)" strokeDasharray="4 4" />
                            <line x1="30" y1="105" x2="290" y2="105" stroke="rgba(132,204,22,0.15)" strokeDasharray="4 4" />
                            <text x="45" y="42" fill="rgba(163,230,53,0.4)" fontSize="9">Underdeveloped</text>
                            <text x="190" y="42" fill="rgba(163,230,53,0.4)" fontSize="9">Overdetermined</text>
                            <text x="45" y="180" fill="rgba(163,230,53,0.4)" fontSize="9">Brittle confusion</text>
                            <text x="190" y="180" fill="rgba(163,230,53,0.4)" fontSize="9">Calibrated / heavy</text>
                            <text x="100" y="210" fill="rgba(163,230,53,0.3)" fontSize="9">Structure load {'\u2192'}</text>
                            <text x="8" y="120" transform="rotate(-90 8 120)" fill="rgba(163,230,53,0.3)" fontSize="9">Fit {'\u2192'}</text>
                            <circle cx={phaseX} cy={phaseY} r="6" fill="#a3e635" />
                            <circle cx={phaseX} cy={phaseY} r="12" fill="rgba(163,230,53,0.15)" />
                        </svg>
                    </div>
                    <div className="text-xs text-lime-200/50 leading-relaxed">
                        {metrics.phaseText}
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
                        <div className="text-xs text-lime-200/50 font-mono mb-2">
                            Q = Fit {'\u2212'} {'\u03BB'}{'\u00B7'}Complexity {'\u2212'} {'\u03BC'}{'\u00B7'}Redundancy {'\u2212'} {'\u03BD'}{'\u00B7'}Inconsistency {'\u2212'} {'\u03C1'}{'\u00B7'}Brittleness + 0.28
                        </div>
                        <p>Good ontology = maximal discrimination and coherence at minimal justified complexity.</p>
                        <p>The map is not an oracle of being; it is an engineering instrument for comparing ontological designs.</p>
                    </div>
                </div>
            )}

            {/* Violations tab */}
            {activeTab === 'violations' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/50 mb-2">
                        Where the extensional cases clash with the intensional axioms.
                    </div>
                    {metrics.violations.length === 0 ? (
                        <div className="border border-lime-500/30 bg-lime-500/5 p-4 text-xs text-lime-400">
                            No explicit violations detected in the current case matrix.
                        </div>
                    ) : (
                        metrics.violations.map((v, i) => (
                            <div key={i} className="border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300/70">
                                {v}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Analysis tab */}
            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    <SensitivityAnalysis bars={sensitivityBars} baseline={metrics.quality * 100} outputLabel="quality Q" />
                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
