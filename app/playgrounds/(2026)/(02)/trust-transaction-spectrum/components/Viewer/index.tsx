'use client';

import { useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

import type { ModelResult, CompareResult, ChartItem } from '../../logic';


interface ViewerProps {
    model: ModelResult;
    compare: CompareResult | null;
    crisis: boolean;
}

interface TooltipPayloadItem {
    payload: ChartItem;
}

function ContributionTooltip({ active, payload }: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
        <div className="border border-lime-500/30 bg-black p-3">
            <div className="text-sm text-lime-100">{p.name}</div>
            <div className="text-xs text-lime-200/60 mt-1">Weighted contribution to transactionality index</div>
            <div className="text-sm font-mono text-lime-400 mt-2">{Math.round(p.contrib * 100)}%</div>
            <div className="text-xs text-lime-200/50 mt-1">
                w = {Math.round(p.weight * 100)}% &middot; x = {p.input}/10
            </div>
        </div>
    );
}

function pct(n: number): string {
    return `${Math.round(n)}%`;
}


export default function Viewer({ model, compare, crisis }: ViewerProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const tier =
        model.score < 25 ? 'Rules-based posture'
        : model.score < 45 ? 'Moderate realism'
        : model.score < 65 ? 'Hedging posture'
        : 'High transactionalism';

    return (
        <div className="w-[90vw] h-[90vh] max-w-7xl overflow-y-auto p-4 md:p-6 space-y-4">
            {/* Transactionality Index */}
            <div className="border border-lime-500/30 bg-[#0a0a0a] p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <div className="text-xs text-lime-200/50 uppercase tracking-wider mb-2">
                            Transactionality Index
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="text-3xl font-mono text-lime-400">{Math.round(model.score)}</div>
                            <div className="text-sm text-lime-200/60">/ 100</div>
                            <span className="border border-lime-500/30 px-2.5 py-1 text-xs text-lime-200/70">
                                {tier}
                            </span>
                            {crisis && (
                                <span className="border border-red-500/30 px-2.5 py-1 text-xs text-red-400">
                                    Crisis regime
                                </span>
                            )}
                        </div>
                        <div className="text-lg text-lime-100 mt-2">{model.posture.name}</div>
                        <div className="text-sm text-lime-200/60 mt-1 max-w-xl leading-relaxed">
                            {model.posture.tagline}
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-xs text-lime-200/50 mb-1">Autonomy adjustment</div>
                        <div className="flex flex-wrap md:justify-end gap-2">
                            <span className="border border-lime-500/20 px-2 py-1 text-xs text-lime-200/50">
                                &Delta;<sub>pen</sub>: &minus;{model.leveragePenalty.toFixed(1)}
                            </span>
                            <span className="border border-lime-500/20 px-2 py-1 text-xs text-lime-200/50">
                                &Delta;<sub>boost</sub>: +{model.leverageBoost.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Driver Decomposition: 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-lime-500/30 bg-[#0a0a0a] p-4">
                    <div className="text-sm text-lime-400 font-semibold mb-3">
                        Transactionality drivers
                    </div>
                    <div className="space-y-2">
                        {model.topToward.map((d) => (
                            <div key={d.key} className="flex items-center justify-between gap-3">
                                <span className="text-sm text-lime-100">{d.key}</span>
                                <span className="text-sm font-mono text-lime-400">{pct(d.contrib * 100)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border border-lime-500/30 bg-[#0a0a0a] p-4">
                    <div className="text-sm text-lime-400 font-semibold mb-3">
                        Institutional and reputational stabilisers
                    </div>
                    <div className="space-y-2">
                        {model.anti.map((d) => (
                            <div key={d.key} className="flex items-center justify-between gap-3">
                                <span className="text-sm text-lime-100">{d.key}</span>
                                <span className="text-sm font-mono text-lime-400">{pct(d.value * 100)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Factor Contribution Decomposition */}
            <div className="border border-lime-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-lime-400 font-semibold">
                        Weighted factor decomposition
                    </div>
                    <span className="border border-lime-500/20 px-2 py-1 text-xs text-lime-200/50">
                        &sum;w<sub>i</sub>x<sub>i</sub> &asymp; {Math.round(model.chart.reduce((a, x) => a + x.contrib, 0) * 100)}%
                    </span>
                </div>
                <div className="h-64">
                    {mounted && <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart
                            layout="vertical"
                            data={model.chart}
                            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid horizontal={false} stroke="#84cc1610" />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={200}
                                tick={{ fill: '#d9f99d99', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <XAxis
                                type="number"
                                tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                                tick={{ fill: '#d9f99d99', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<ContributionTooltip />}
                                cursor={{ fill: '#84cc1610' }}
                            />
                            <Bar
                                dataKey="contrib"
                                fill="#84cc16"
                                radius={0}
                            />
                        </BarChart>
                    </ResponsiveContainer>}
                </div>
            </div>

            {/* Policy Adjustment Vectors */}
            <div className="border border-lime-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-sm text-lime-400 font-semibold">
                            Policy adjustment vectors
                        </div>
                        <div className="text-xs text-lime-200/50 mt-0.5">
                            Actionable interventions that shift the transactionality index holding geography constant
                        </div>
                    </div>
                    <span className="border border-lime-500/20 px-2 py-1 text-xs text-lime-200/50">
                        {crisis ? 'Crisis weights' : 'Baseline weights'}
                    </span>
                </div>
                <ul className="space-y-1.5">
                    {model.suggestions.map((s, i) => (
                        <li key={i} className="text-sm text-lime-100 leading-relaxed">
                            {s}
                        </li>
                    ))}
                </ul>
            </div>

            {/* De-escalation Threshold Conditions */}
            <div className="border border-lime-500/30 bg-[#0a0a0a] p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-sm text-lime-400 font-semibold">
                            De-escalation threshold conditions
                        </div>
                        <div className="text-xs text-lime-200/50 mt-0.5">
                            Five stabiliser thresholds for transitioning toward rules-based posture
                        </div>
                    </div>
                    <span className="border border-lime-500/20 px-2 py-1 text-xs text-lime-200/50">
                        {model.exitScore}/5 met
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {model.exitConditions.map((c) => (
                        <div
                            key={c.k}
                            className="flex items-center justify-between gap-2 border border-lime-500/20 bg-black px-3 py-2"
                        >
                            <span className="text-sm text-lime-100">{c.k}</span>
                            <span className={`text-xs px-1.5 py-0.5 border ${
                                c.ok
                                    ? 'border-lime-500/30 text-lime-400'
                                    : 'border-lime-500/10 text-lime-200/40'
                            }`}>
                                {c.ok ? 'satisfied' : 'unmet'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scenario Comparison */}
            {compare && (
                <div className="border border-lime-500/30 bg-[#0a0a0a] p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-sm text-lime-400 font-semibold">Scenario comparison</div>
                            <div className="text-xs text-lime-200/50 mt-0.5">
                                Parameter delta: current vs &ldquo;{compare.scenario.name}&rdquo;
                            </div>
                        </div>
                        <span className="border border-lime-500/20 px-2 py-1 text-xs text-lime-200/50 font-mono">
                            {Math.round(compare.scenario.score)} &rarr; {Math.round(model.score)}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(compare.diff).map(([k, v]) => (
                            <div
                                key={k}
                                className="flex items-center justify-between gap-2 border border-lime-500/20 bg-black px-3 py-2"
                            >
                                <span className="text-xs text-lime-200/60 capitalize">{k}</span>
                                <span className={`text-xs font-mono ${
                                    v === 0 ? 'text-lime-200/40'
                                    : v > 0 ? 'text-lime-400'
                                    : 'text-red-400'
                                }`}>
                                    {v === 0 ? '0' : v > 0 ? `+${v}` : `${v}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
