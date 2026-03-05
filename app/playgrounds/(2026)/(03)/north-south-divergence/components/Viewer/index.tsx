'use client';

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
} from 'recharts';

import {
    GapDataPoint,
    RadarDataPoint,
    ShapleyResult,
    GapMode,
} from '../../logic';

interface ViewerProps {
    gapData: GapDataPoint[];
    radarData: RadarDataPoint[];
    shapley: ShapleyResult[];
    selectedBinId: string;
    onSelectBin: (id: string) => void;
    northLabel: string;
    southLabel: string;
    gapMode: GapMode;
}

function GapTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ payload: GapDataPoint }> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid #84cc16',
            borderRadius: 0,
            padding: 10,
            color: '#ecfccb',
            fontSize: 11,
        }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
            <div style={{ color: '#a3e635' }}>{d.period}</div>
            <div style={{ marginTop: 4 }}>gap: {d.gap.toFixed(4)}</div>
            <div>north: {d.northScore.toFixed(4)}</div>
            <div>south: {d.southScore.toFixed(4)}</div>
        </div>
    );
}

function ShapleyTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ payload: ShapleyResult; value: number }> }) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div style={{
            background: '#0a0a0a',
            border: '1px solid #84cc16',
            borderRadius: 0,
            padding: 10,
            color: '#ecfccb',
            fontSize: 11,
        }}>
            <div style={{ fontWeight: 600 }}>{d.payload.label}</div>
            <div style={{ marginTop: 4 }}>contribution: {d.value.toFixed(4)}</div>
        </div>
    );
}

function RadarTooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
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
            {payload.map((p, i) => (
                <div key={i}>{p.name}: {Number(p.value).toFixed(2)}</div>
            ))}
        </div>
    );
}

export default function Viewer({
    gapData,
    radarData,
    shapley,
    selectedBinId,
    onSelectBin,
    northLabel,
    southLabel,
    gapMode,
}: ViewerProps) {
    const selectedBin = useMemo(
        () => gapData.find((d) => d.id === selectedBinId),
        [gapData, selectedBinId],
    );

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1000px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            {/* Header */}
            <div className="text-center">
                <div className="text-lime-200/60 text-xs font-mono">
                    selected: <span className="text-lime-400">{selectedBin?.label ?? ''}</span>
                    {selectedBin && <span className="ml-2">{selectedBin.period}</span>}
                    {selectedBin && <span className="ml-2">gap: <span className="text-lime-400">{selectedBin.gap.toFixed(4)}</span></span>}
                </div>
            </div>

            {/* Gap over time */}
            <div>
                <div className="text-xs text-lime-200/60 mb-2 font-mono">
                    gap over time ({gapMode === 'ratio' ? 'f(N)/f(S)' : 'f(N)\u2212f(S)'})
                </div>
                <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer width="100%" height={280} minWidth={0}>
                        <LineChart
                            data={gapData}
                            margin={{ top: 10, right: 20, bottom: 30, left: 10 }}
                            onClick={(e: Record<string, unknown>) => {
                                const ap = e?.activePayload as Array<{ payload: GapDataPoint }> | undefined;
                                if (ap?.[0]?.payload?.id) {
                                    onSelectBin(ap[0].payload.id);
                                }
                            }}
                        >
                            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#a3e635', fontSize: 9 }}
                                angle={-30}
                                textAnchor="end"
                                height={50}
                                interval={0}
                            />
                            <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} />
                            <ReTooltip content={<GapTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="gap"
                                stroke="#84cc16"
                                strokeWidth={2}
                                dot={(props: Record<string, unknown>) => {
                                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: GapDataPoint };
                                    const isSelected = (payload as GapDataPoint)?.id === selectedBinId;
                                    return (
                                        <circle
                                            key={String(payload?.id ?? cx)}
                                            cx={cx}
                                            cy={cy}
                                            r={isSelected ? 6 : 3}
                                            fill={isSelected ? '#84cc16' : '#0a0a0a'}
                                            stroke="#84cc16"
                                            strokeWidth={isSelected ? 2 : 1}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    );
                                }}
                                activeDot={{ r: 5, fill: '#84cc16' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Radar + Shapley side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Radar profile */}
                <div>
                    <div className="text-xs text-lime-200/60 mb-2 font-mono">
                        bin profile: {northLabel} vs {southLabel}
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height={300} minWidth={0}>
                            <RadarChart data={radarData} outerRadius="75%">
                                <PolarGrid stroke="#333" />
                                <PolarAngleAxis
                                    dataKey="axis"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                />
                                <PolarRadiusAxis
                                    domain={[0, 1]}
                                    tick={{ fill: '#666', fontSize: 9 }}
                                    axisLine={false}
                                />
                                <Radar
                                    name={northLabel}
                                    dataKey="north"
                                    stroke="#84cc16"
                                    fill="#84cc16"
                                    fillOpacity={0.15}
                                />
                                <Radar
                                    name={southLabel}
                                    dataKey="south"
                                    stroke="#65a30d"
                                    fill="#65a30d"
                                    fillOpacity={0.1}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 11, color: '#a3e635' }}
                                />
                                <ReTooltip content={<RadarTooltipContent />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shapley attribution */}
                <div>
                    <div className="text-xs text-lime-200/60 mb-2 font-mono">
                        Shapley attribution (Monte Carlo)
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height={300} minWidth={0}>
                            <BarChart
                                data={shapley}
                                margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
                                layout="vertical"
                            >
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                />
                                <YAxis
                                    dataKey="label"
                                    type="category"
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    width={50}
                                />
                                <ReTooltip content={<ShapleyTooltipContent />} />
                                <Bar
                                    dataKey="contribution"
                                    fill="#84cc16"
                                    fillOpacity={0.7}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-lime-200/40 mt-1">
                        Positive bars increase the N\u2013S gap under the current model.
                    </div>
                </div>
            </div>
        </div>
    );
}
