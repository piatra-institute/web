'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

import type {
    MicroTrajectory,
    LocalSection,
    GlueResult,
    ReducedModel,
    OverlapStats,
} from '../../logic';

interface ChartPoint {
    t: number;
    micro?: number;
    local?: number;
    glued?: number;
    macro?: number;
    pred?: number;
}

interface ViewerProps {
    micro: MicroTrajectory;
    sections: LocalSection[];
    glueResult: GlueResult;
    macro: number[];
    reduced: ReducedModel;
    overlapStats: OverlapStats;
}

export default function Viewer({
    micro,
    sections,
    glueResult,
    macro,
    reduced,
    overlapStats,
}: ViewerProps) {
    const chartData = useMemo(() => {
        const data: ChartPoint[] = [];
        for (let i = 0; i < micro.t.length; i++) {
            data.push({
                t: micro.t[i],
                micro: micro.x[i],
                glued: Number.isFinite(glueResult.glued[i]) ? glueResult.glued[i] : undefined,
                macro: Number.isFinite(macro[i]) ? macro[i] : undefined,
                pred: Number.isFinite(reduced.pred[i]) ? reduced.pred[i] : undefined,
            });
        }
        return data;
    }, [micro, glueResult.glued, macro, reduced.pred]);

    const localOverlay = useMemo(() => {
        const section = sections[0];
        if (!section) return [] as ChartPoint[];

        const arr: ChartPoint[] = micro.t.map((tt) => ({ t: tt }));
        for (let j = 0; j < section.indices.length; j++) {
            const gi = section.indices[j];
            arr[gi].local = section.values[j];
            arr[gi].micro = micro.x[gi];
        }
        return arr;
    }, [micro, sections]);

    const sheafVerdict = glueResult.ok ? 'GLUED' : 'FAIL';
    const closureRMSE = reduced.rmse;

    return (
        <div className="w-full h-full flex flex-col gap-4 p-4">
            {/* Main chart */}
            <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="t"
                            tickFormatter={(v) => Number(v).toFixed(1)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 11 }}
                        />
                        <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            labelStyle={{ color: '#888' }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line
                            type="monotone"
                            dataKey="micro"
                            name="micro X(t)"
                            stroke="#666"
                            dot={false}
                            strokeWidth={1}
                        />
                        <Line
                            type="monotone"
                            dataKey="glued"
                            name="glued"
                            stroke="#84cc16"
                            dot={false}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="macro"
                            name="macro M(t)"
                            stroke="#22d3ee"
                            dot={false}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="pred"
                            name="reduced pred"
                            stroke="#f472b6"
                            dot={false}
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Local section overlay */}
            <div className="h-[160px]">
                <div className="text-xs text-lime-200/60 mb-2">Local section overlay (interval 0)</div>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={localOverlay} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="t"
                            tickFormatter={(v) => Number(v).toFixed(1)}
                            stroke="#666"
                            tick={{ fill: '#888', fontSize: 10 }}
                        />
                        <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            labelStyle={{ color: '#888' }}
                        />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line
                            type="monotone"
                            dataKey="micro"
                            name="global micro"
                            stroke="#666"
                            dot={false}
                            strokeWidth={1}
                        />
                        <Line
                            type="monotone"
                            dataKey="local"
                            name="local section"
                            stroke="#a3e635"
                            dot={false}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-4 text-sm font-mono">
                <div className="flex items-center gap-2 border border-lime-500/30 px-3 py-2">
                    <span className="text-lime-200/60">Sheaf gluing:</span>
                    <span className={glueResult.ok ? 'text-lime-400' : 'text-red-400'}>
                        {sheafVerdict}
                    </span>
                </div>
                <div className="flex items-center gap-2 border border-lime-500/30 px-3 py-2">
                    <span className="text-lime-200/60">Max overlap mismatch:</span>
                    <span className="text-lime-400">{overlapStats.maxAbs.toFixed(3)}</span>
                </div>
                <div className="flex items-center gap-2 border border-lime-500/30 px-3 py-2">
                    <span className="text-lime-200/60">Closure RMSE:</span>
                    <span className="text-lime-400">{closureRMSE.toFixed(3)}</span>
                </div>
            </div>
        </div>
    );
}
