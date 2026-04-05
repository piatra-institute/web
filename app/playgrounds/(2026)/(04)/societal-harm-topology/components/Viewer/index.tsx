import { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line, Cell,
} from 'recharts';

import AssumptionPanel from '@/components/AssumptionPanel';
import SensitivityAnalysis from '@/components/SensitivityAnalysis';
import VersionSelector from '@/components/VersionSelector';

import type { Assumption } from '@/components/AssumptionPanel';
import type { SensitivityBar } from '@/components/SensitivityAnalysis';
import type { ModelVersion } from '@/components/VersionSelector';

import {
    Metrics,
    Snapshot,
    SweepDatum,
    SweepableParam,
    SectorPair,
    DIMENSIONS,
    DimensionKey,
    PARAM_SPECS,
    computeSheafMatrix,
    computeSectorPairs,
    vectorGini,
} from '../../logic';


interface ViewerProps {
    metrics: Metrics;
    displayVector: Record<DimensionKey, number>;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
}


function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="border border-lime-500/30 bg-black/95 px-3 py-2 text-xs">
            <div className="text-lime-200/60 mb-1">{label}</div>
            {payload.map((p, i) => (
                <div key={i} className="text-lime-400 font-mono">
                    {p.name}: {p.value.toFixed(1)}
                </div>
            ))}
        </div>
    );
}


export default function Viewer({
    metrics,
    displayVector,
    sweep,
    sensitivityBars,
    assumptions,
    versions,
    snapshot,
    sweepParam,
    onSweepParamChange,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'vector' | 'sheaf' | 'sweep'>('vector');

    // Chart data for global harm vector
    const vectorChartData = useMemo(() =>
        DIMENSIONS.map(d => ({
            name: d.label,
            value: Number(displayVector[d.key as DimensionKey].toFixed(2)),
            ...(snapshot ? {
                snapshot: Number(snapshot.metrics.globalVector[d.key as DimensionKey].toFixed(2)),
            } : {}),
        })),
        [displayVector, snapshot],
    );

    // Radar data
    const radarData = useMemo(() =>
        DIMENSIONS.map(d => ({
            dimension: d.label,
            value: Number(displayVector[d.key as DimensionKey].toFixed(2)),
            ...(snapshot ? {
                snapshot: Number(snapshot.metrics.globalVector[d.key as DimensionKey].toFixed(2)),
            } : {}),
        })),
        [displayVector, snapshot],
    );

    // Sector bar data
    const sectorBarData = useMemo(() =>
        metrics.local.map(s => ({
            name: s.name,
            gross: Number(s.gross.toFixed(1)),
            net: Number(s.net.toFixed(1)),
        })),
        [metrics.local],
    );

    // Sheaf consistency matrix
    const sheafMatrix = useMemo(() => computeSheafMatrix(metrics), [metrics]);

    // Sector pairs for coherence
    const sectorPairs = useMemo(() => computeSectorPairs(metrics), [metrics]);

    // Gini concentration
    const gini = useMemo(() => vectorGini(metrics.globalVector), [metrics.globalVector]);

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Net harm', value: metrics.netTotal.toFixed(0), color: metrics.netTotal > 300 ? 'text-orange-400' : 'text-lime-400' },
                    { label: 'Sheaf consistency', value: `${metrics.sheafConsistency.toFixed(0)}%`, color: metrics.sheafConsistency > 72 ? 'text-lime-400' : 'text-orange-400' },
                    { label: 'Fragility', value: metrics.fragility.toFixed(0), color: metrics.fragility > 150 ? 'text-orange-400' : 'text-lime-400' },
                    { label: 'Scalar index', value: metrics.scalarIndex.toFixed(0), color: 'text-lime-400' },
                ].map(card => (
                    <div key={card.label} className="border border-lime-500/20 p-3">
                        <div className="text-xs text-lime-200/50">{card.label}</div>
                        <div className={`text-xl font-mono mt-1 ${card.color}`}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Sub-metrics ── */}
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
                <div className="border border-lime-500/10 p-2 text-center">
                    <div className="text-[10px] text-lime-200/40">gross</div>
                    <div className="text-xs font-mono text-lime-200/60">{metrics.grossTotal.toFixed(0)}</div>
                </div>
                <div className="border border-lime-500/10 p-2 text-center">
                    <div className="text-[10px] text-lime-200/40">repair</div>
                    <div className="text-xs font-mono text-lime-200/60">{metrics.repair.toFixed(0)}</div>
                </div>
                <div className="border border-lime-500/10 p-2 text-center">
                    <div className="text-[10px] text-lime-200/40">obstruction</div>
                    <div className="text-xs font-mono text-lime-200/60">{metrics.obstruction.toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/10 p-2 text-center">
                    <div className="text-[10px] text-lime-200/40">Gini</div>
                    <div className="text-xs font-mono text-lime-200/60">{gini.toFixed(2)}</div>
                </div>
                <div className="border border-lime-500/10 p-2 text-center">
                    <div className="text-[10px] text-lime-200/40">top sector</div>
                    <div className="text-xs font-mono text-lime-200/60">{metrics.dominantSector.name}</div>
                </div>
                <div className="border border-lime-500/10 p-2 text-center">
                    <div className="text-[10px] text-lime-200/40">top dimension</div>
                    <div className="text-xs font-mono text-lime-200/60">{metrics.dominantDimension.label}</div>
                </div>
            </div>

            {/* ── Tab Navigation ── */}
            <div className="flex gap-2 mb-6">
                {(['vector', 'sheaf', 'sweep'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs border transition-colors ${
                            activeTab === tab
                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                        }`}
                    >
                        {tab === 'vector' ? 'harm vector' : tab === 'sheaf' ? 'sheaf coherence' : 'parameter sweep'}
                    </button>
                ))}
            </div>

            {/* ── VECTOR TAB ── */}
            {activeTab === 'vector' && (
                <div className="space-y-6">
                    {/* Global harm vector bar chart + radar */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/50 mb-1">global harm vector</div>
                            <div className="text-[10px] text-lime-200/30 mb-3">aggregated across all sectors</div>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <BarChart data={vectorChartData} margin={{ top: 8, right: 8, left: 4, bottom: 48 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#a3e635', fontSize: 10 }}
                                            angle={-25}
                                            textAnchor="end"
                                            height={56}
                                        />
                                        <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} />
                                        <RechartsTooltip content={<ChartTooltip />} />
                                        <Bar dataKey="value" name="current" radius={[2, 2, 0, 0]}>
                                            {vectorChartData.map((_, i) => (
                                                <Cell key={i} fill={i % 2 === 0 ? '#a3e635' : '#84cc16'} />
                                            ))}
                                        </Bar>
                                        {snapshot && (
                                            <Bar dataKey="snapshot" name="snapshot" fill="none" stroke="#f97316" strokeWidth={2} radius={[2, 2, 0, 0]}>
                                                {vectorChartData.map((_, i) => (
                                                    <Cell key={i} fill="transparent" stroke="#f97316" />
                                                ))}
                                            </Bar>
                                        )}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/50 mb-1">vector geometry</div>
                            <div className="text-[10px] text-lime-200/30 mb-3">shape of harm, not just magnitude</div>
                            <div style={{ width: '100%', height: 320 }}>
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <RadarChart data={radarData} outerRadius="68%">
                                        <PolarGrid stroke="rgba(132,204,22,0.12)" />
                                        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#a3e635', fontSize: 10 }} />
                                        <PolarRadiusAxis tick={{ fill: '#a3e635', fontSize: 9 }} />
                                        <Radar name="current" dataKey="value" stroke="#a3e635" fill="#a3e635" fillOpacity={0.25} />
                                        {snapshot && (
                                            <Radar name="snapshot" dataKey="snapshot" stroke="#f97316" fill="none" strokeDasharray="6 3" />
                                        )}
                                        <RechartsTooltip content={<ChartTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Sector contribution */}
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/50 mb-1">sector contribution</div>
                        <div className="text-[10px] text-lime-200/30 mb-3">gross (gray) vs net (lime) by local context</div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <BarChart data={sectorBarData} margin={{ top: 8, right: 8, left: 4, bottom: 36 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        angle={-15}
                                        textAnchor="end"
                                        height={48}
                                    />
                                    <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} />
                                    <RechartsTooltip content={<ChartTooltip />} />
                                    <Bar dataKey="gross" name="gross" fill="#4a5568" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="net" name="net" fill="#84cc16" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sensitivity & Assumptions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SensitivityAnalysis
                            bars={sensitivityBars}
                            baseline={metrics.scalarIndex}
                            outputLabel="scalar index"
                        />
                        <AssumptionPanel assumptions={assumptions} />
                    </div>

                    {/* Version */}
                    <VersionSelector versions={versions} active="claude-v1" />
                </div>
            )}

            {/* ── SHEAF TAB ── */}
            {activeTab === 'sheaf' && (
                <div className="space-y-6">
                    {/* Sheaf consistency heatmap */}
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/50 mb-1">sheaf consistency matrix</div>
                        <div className="text-[10px] text-lime-200/30 mb-3">
                            each cell shows what share (%) of a global dimension&apos;s mass comes from that sector.
                            when local sections are consistent, they glue into a coherent global account.
                        </div>
                        <div className="overflow-x-auto">
                            <div
                                className="grid min-w-[640px] gap-1"
                                style={{ gridTemplateColumns: `140px repeat(${DIMENSIONS.length}, minmax(60px, 1fr))` }}
                            >
                                <div />
                                {DIMENSIONS.map(d => (
                                    <div key={d.key} className="text-center text-[10px] text-lime-200/40">
                                        {d.symbol}
                                    </div>
                                ))}
                                {metrics.local.map(sector => (
                                    <div key={sector.id} className="contents">
                                        <div className="text-xs text-lime-200/60 py-1 truncate">{sector.name}</div>
                                        {DIMENSIONS.map(d => {
                                            const cell = sheafMatrix.find(
                                                c => c.sectorId === sector.id && c.dimensionKey === (d.key as DimensionKey),
                                            );
                                            const val = cell?.value ?? 0;
                                            const alpha = 0.08 + (val / 100) * 0.72;
                                            return (
                                                <div
                                                    key={`${sector.id}-${d.key}`}
                                                    className="h-7 border border-lime-500/10 flex items-center justify-center"
                                                    style={{ backgroundColor: `rgba(132, 204, 22, ${alpha})` }}
                                                    title={`${sector.name} / ${d.label}: ${val.toFixed(0)}%`}
                                                >
                                                    <span className="text-[9px] font-mono text-black/60">{val.toFixed(0)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pairwise coherence */}
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/50 mb-1">pairwise sector coherence</div>
                        <div className="text-[10px] text-lime-200/30 mb-3">
                            cosine similarity between sector harm profiles. low similarity = divergent local stories = accountability gaps.
                        </div>
                        <div className="space-y-1">
                            {sectorPairs.map((pair, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="text-[10px] text-lime-200/40 w-[200px] shrink-0 truncate">
                                        {pair.sectorA} / {pair.sectorB}
                                    </div>
                                    <div className="flex-1 h-3 bg-lime-500/5 relative">
                                        <div
                                            className={`h-full ${pair.compatible ? 'bg-lime-500/40' : 'bg-orange-500/40'}`}
                                            style={{ width: `${Math.max(0, pair.similarity) * 100}%` }}
                                        />
                                    </div>
                                    <div className={`text-[10px] font-mono w-10 text-right ${
                                        pair.compatible ? 'text-lime-400' : 'text-orange-400'
                                    }`}>
                                        {pair.similarity.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Obstruction & consistency summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-widest">compatibility</div>
                            <div className="text-2xl font-mono text-lime-400 mt-2">{metrics.sheafConsistency.toFixed(0)}%</div>
                            <p className="text-[10px] text-lime-200/30 mt-2 leading-relaxed">
                                high values mean local harm profiles point in compatible directions.
                                low values mean sectors tell divergent stories that resist global narration.
                            </p>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-widest">H&sup1; obstruction</div>
                            <div className={`text-2xl font-mono mt-2 ${metrics.obstruction > 32 ? 'text-orange-400' : 'text-lime-400'}`}>
                                {metrics.obstruction.toFixed(0)}
                            </div>
                            <p className="text-[10px] text-lime-200/30 mt-2 leading-relaxed">
                                offshore ownership, subcontracting, lobbying intermediaries, and platform opacity
                                create loops where local responsibility exists but global accountability fails.
                            </p>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-widest">repair reserve</div>
                            <div className="text-2xl font-mono text-lime-400 mt-2">{metrics.repair.toFixed(0)}</div>
                            <p className="text-[10px] text-lime-200/30 mt-2 leading-relaxed">
                                regulation, redistribution, remediation, and social counter-power.
                                reduces the net scalar but does not erase the underlying vector geometry.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SWEEP TAB ── */}
            {activeTab === 'sweep' && (
                <div className="space-y-6">
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/50 mb-1">parameter sweep</div>
                        <div className="text-[10px] text-lime-200/30 mb-3">
                            sweep one parameter across its range, hold others constant
                        </div>
                        <div className="flex gap-2 mb-4">
                            {PARAM_SPECS.map(spec => (
                                <button
                                    key={spec.key}
                                    onClick={() => onSweepParamChange(spec.key)}
                                    className={`px-2 py-1 text-[10px] border transition-colors ${
                                        sweepParam === spec.key
                                            ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                            : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    {spec.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer width="100%" height={350} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis
                                        dataKey="sweepValue"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        label={{ value: PARAM_SPECS.find(s => s.key === sweepParam)?.label, fill: '#a3e635', fontSize: 10, position: 'bottom' }}
                                    />
                                    <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} />
                                    <RechartsTooltip content={<ChartTooltip />} />
                                    <Line type="monotone" dataKey="scalarIndex" name="scalar index" stroke="#a3e635" dot={false} strokeWidth={2} />
                                    <Line type="monotone" dataKey="netTotal" name="net harm" stroke="#84cc16" dot={false} strokeWidth={1} strokeDasharray="4 2" />
                                    <Line type="monotone" dataKey="fragility" name="fragility" stroke="#f97316" dot={false} strokeWidth={1} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
