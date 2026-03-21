'use client';

import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
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
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Metrics,
    Snapshot,
    SiteDatum,
    SweepDatum,
} from '../../logic';


interface ViewerProps {
    distribution: SiteDatum[];
    sweep: SweepDatum[];
    metrics: Metrics;
    sensitivityBars: SensitivityBar[];
    assumptions: Assumption[];
    calibrationResults: CalibrationResult[];
    versions: ModelVersion[];
    snapshot: Snapshot | null;
}

function ChartTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid #84cc16',
            borderRadius: 0,
            padding: 10,
            color: '#ecfccb',
            fontSize: 11,
        }}>
            <div style={{ marginBottom: 4, color: '#a3e635' }}>
                {typeof label === 'number' ? label : label}
            </div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>: {Number(p.value).toFixed(4)}
                </div>
            ))}
        </div>
    );
}


export default function Viewer({
    distribution,
    sweep,
    metrics,
    sensitivityBars,
    assumptions,
    calibrationResults,
    versions,
    snapshot,
}: ViewerProps) {
    const chartData = useMemo(() => {
        if (!snapshot) return distribution;
        return distribution.map((d, i) => ({
            ...d,
            snapshotWithResonance: snapshot.distribution[i]?.withResonance ?? 0,
        }));
    }, [distribution, snapshot]);

    const metricsEntries: [string, number][] = [
        ['resonance gain', metrics.resonanceGain],
        ['baseline mobility', metrics.baselineMobility],
        ['target bias', metrics.targetBias],
        ['compressibility', metrics.compressibility],
        ['search time', metrics.searchTime],
    ];

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1000px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="text-lime-400 font-semibold text-sm">
                            {metrics.resonanceGain > 0.42
                                ? 'strong resonance regime'
                                : metrics.resonanceGain > 0.2
                                    ? 'moderate resonance regime'
                                    : 'diffusion-dominated regime'}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">{metrics.interpretation}</div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>mobility: <span className="text-lime-400">{(metrics.baselineMobility * 100).toFixed(0)}%</span></div>
                        <div>search: <span className="text-lime-400">{(metrics.searchTime * 100).toFixed(0)}%</span></div>
                    </div>
                </div>
            </div>

            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    probability distribution over DNA sites &middot; protein starts at site 20 &middot; target at site 60
                    {snapshot && <span className="text-orange-400/60"> &middot; dashed = saved ({snapshot.label})</span>}
                </div>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="site"
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'DNA site', position: 'insideBottom', offset: -5, fill: '#a3e635', fontSize: 10 }}
                            />
                            <YAxis
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v: number) => (v * 100).toFixed(1)}
                                label={{ value: 'P (%)', angle: -90, position: 'insideLeft', fill: '#a3e635', fontSize: 10 }}
                            />
                            <ReTooltip content={<ChartTooltip />} />
                            <ReferenceLine x={60} stroke="#84cc16" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: 'target', fill: '#84cc16', fontSize: 10, position: 'top' }} />
                            <ReferenceLine x={20} stroke="#a3e63588" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'start', fill: '#a3e63588', fontSize: 10, position: 'top' }} />
                            <Area
                                type="monotone"
                                dataKey="withoutResonance"
                                stroke="#555"
                                fill="#555"
                                fillOpacity={0.3}
                                strokeWidth={1.5}
                                name="diffusion only"
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="resonanceEffect"
                                stroke="none"
                                fill="#84cc16"
                                fillOpacity={0.35}
                                strokeWidth={0}
                                name="resonance effect"
                                dot={false}
                                stackId="resonance"
                            />
                            <Area
                                type="monotone"
                                dataKey="withResonance"
                                stroke="#84cc16"
                                fill="none"
                                fillOpacity={0}
                                strokeWidth={2}
                                name="with resonance"
                                dot={false}
                            />
                            {snapshot && (
                                <Area
                                    type="monotone"
                                    dataKey="snapshotWithResonance"
                                    stroke="#f97316"
                                    fill="none"
                                    fillOpacity={0}
                                    strokeWidth={1.5}
                                    strokeDasharray="6 3"
                                    name={`saved (${snapshot.label})`}
                                    dot={false}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    coupling sweep &middot; search time and compressibility vs ED coupling strength
                </div>
                <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer width="100%" height={260} minWidth={0}>
                        <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="coupling"
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                label={{ value: 'coupling %', position: 'insideBottom', offset: -5, fill: '#a3e635', fontSize: 10 }}
                            />
                            <YAxis
                                tick={{ fill: '#a3e635', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 1.2]}
                                tickFormatter={(v: number) => v.toFixed(1)}
                            />
                            <ReTooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="searchTime" stroke="#84cc16" strokeWidth={2.5} dot={false} name="search time" />
                            <Line type="monotone" dataKey="compressibility" stroke="#a3e635" strokeWidth={2} dot={false} name="compressibility" strokeDasharray="6 3" />
                            <Line type="monotone" dataKey="targetBias" stroke="#65a30d" strokeWidth={1.5} dot={false} name="target bias" strokeDasharray="3 3" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {snapshot ? (
                <div className="grid grid-cols-5 gap-3">
                    {metricsEntries.map(([label, val]) => {
                        const savedVal = ({
                            'resonance gain': snapshot.metrics.resonanceGain,
                            'baseline mobility': snapshot.metrics.baselineMobility,
                            'target bias': snapshot.metrics.targetBias,
                            'compressibility': snapshot.metrics.compressibility,
                            'search time': snapshot.metrics.searchTime,
                        } as Record<string, number>)[label] ?? 0;
                        const delta = val - savedVal;
                        const isImproved = label === 'search time' ? delta < -0.005 : delta > 0.005;
                        const isWorse = label === 'search time' ? delta > 0.005 : delta < -0.005;
                        return (
                            <div key={label} className="border border-lime-500/20 p-3">
                                <div className="text-xs text-lime-200/40 uppercase tracking-wide">{label}</div>
                                <div className="text-lg font-mono text-lime-400 mt-1">{(val * 100).toFixed(1)}%</div>
                                <div className={`text-xs font-mono mt-0.5 ${isImproved ? 'text-lime-400' : isWorse ? 'text-orange-400' : 'text-lime-200/30'}`}>
                                    {delta > 0.005 ? '↑' : delta < -0.005 ? '↓' : '='} {(savedVal * 100).toFixed(1)}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-3">
                    {metricsEntries.map(([label, val]) => (
                        <div key={label} className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide">{label}</div>
                            <div className="text-lg font-mono text-lime-400 mt-1">{(val * 100).toFixed(1)}%</div>
                        </div>
                    ))}
                </div>
            )}

            <SensitivityAnalysis
                bars={sensitivityBars}
                baseline={metrics.searchTime}
                outputLabel="search time"
            />

            <AssumptionPanel assumptions={assumptions} />

            <CalibrationPanel results={calibrationResults} outputLabel="search time" />
            <div className="text-xs text-lime-200/30 -mt-4 px-1">
                Qualitative toy model — calibration error reflects intentional simplifications (no crowding, no DNA packaging, no conformational states).
            </div>
        </div>
    );
}
