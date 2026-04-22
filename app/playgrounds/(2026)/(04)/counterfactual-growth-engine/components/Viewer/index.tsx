'use client';

import { useState, useMemo } from 'react';
import {
    ResponsiveContainer, LineChart, Line, AreaChart, Area,
    BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
    ReferenceLine, ComposedChart,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Params, ComparisonRow, Kpis, PolicyAttribution,
    CountryCode, COUNTRIES, EVENTS, normalizeBlend,
    formatMoneyBillions, formatPct,
} from '../../logic';


interface ViewerProps {
    params: Params;
    comparison: ComparisonRow[];
    kpis: Kpis;
    policyDecomp: PolicyAttribution[];
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

function ChartTooltip({ active, payload, label, formatter }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string | number;
    formatter?: (v: number) => string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="border border-lime-500/30 bg-black/90 p-2 text-xs font-mono">
            {label !== undefined && <div className="text-lime-200/60 mb-1">{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color }}>
                    {p.name}: {formatter ? formatter(p.value) : (typeof p.value === 'number' ? p.value.toFixed(1) : p.value)}
                </div>
            ))}
        </div>
    );
}


export default function Viewer({
    params, comparison, kpis, policyDecomp, sensitivityBars, assumptions, versions,
}: ViewerProps) {
    const [activeTab, setActiveTab] = useState<'paths' | 'gap' | 'policy' | 'analysis'>('paths');

    const targetName = COUNTRIES[params.target].name;
    const targetColor = COUNTRIES[params.target].color;
    const blend = normalizeBlend(params.models);
    const blendLabel = Object.entries(blend).map(([c, w]) => `${c} ${Math.round((w ?? 0) * 100)}%`).join(' + ') || 'none';

    const relevantEvents = useMemo(() => {
        return EVENTS.filter(e => {
            if (e.scope === 'global') return true;
            if (e.scope === 'europe') return true;
            return e.scope.includes(params.target) || Object.keys(blend).some(c => (e.scope as CountryCode[]).includes(c as CountryCode));
        });
    }, [params.target, blend]);

    // Chart data, filtered by analysis window
    const chartData = comparison
        .filter(r => r.year >= params.analysisStart && r.year <= params.analysisEnd)
        .map(r => ({
            year: r.year,
            actual: +r.actualGDPB.toFixed(2),
            counterfactual: +r.counterfactualGDPB.toFixed(2),
            cfLow: +r.counterfactualGDPLowB.toFixed(2),
            cfHigh: +r.counterfactualGDPHighB.toFixed(2),
            bandRange: +(r.counterfactualGDPHighB - r.counterfactualGDPLowB).toFixed(2),
            bandBase: +r.counterfactualGDPLowB.toFixed(2),
            annualGap: +r.annualGapB.toFixed(2),
            actualPC: Math.round(r.actualGDPPC),
            cfPC: Math.round(r.counterfactualGDPPC),
        }));

    // Cumulative gap over time (full range, filtered to window for display)
    const cumulativeGapData = useMemo(() => {
        let cum = 0;
        return comparison.map(r => {
            cum += r.annualGapB;
            return { year: r.year, cumulative: +cum.toFixed(2) };
        }).filter(r => r.year >= params.analysisStart && r.year <= params.analysisEnd);
    }, [comparison, params.analysisStart, params.analysisEnd]);

    const tabs: { key: typeof activeTab; label: string }[] = [
        { key: 'paths', label: 'paths' },
        { key: 'gap', label: 'gap' },
        { key: 'policy', label: 'policy decomposition' },
        { key: 'analysis', label: 'analysis' },
    ];

    const pctLiftTone = kpis.pctLift > 5 ? 'good' as const : kpis.pctLift < -5 ? 'bad' as const : 'neutral' as const;
    const cumTone = kpis.cumulativeGapB > 100 ? 'good' as const : kpis.cumulativeGapB < -100 ? 'bad' as const : 'neutral' as const;

    return (
        <div className="w-[90vw] h-[90vh] overflow-y-auto outline-none [&_*]:outline-none">
            {/* Summary */}
            <div className="border border-lime-500/20 p-4 mb-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs text-lime-200/40 uppercase tracking-wider">scenario</div>
                        <div className="text-lg text-lime-400 font-semibold mt-1">
                            {targetName} under {blendLabel}
                        </div>
                        <div className="text-xs text-lime-200/50 mt-1">
                            {params.mode === 'path' ? 'path transfer' : 'decision basket'} {'·'} {params.startYear}–{params.endYear}
                            {params.phaseInYears > 0 && ` · phase-in ${params.phaseInYears}y`}
                            {' · intensity '}{Math.round(params.transferIntensity * 100)}%
                            {' · drag '}{params.convergenceDrag.toFixed(1)}pp
                            {params.reverseFraming && ' · REVERSED'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <SummaryCard label="actual 2024" value={formatMoneyBillions(kpis.latestActualGDPB)} sub={`${targetName} baseline`} />
                <SummaryCard label="counterfactual 2024" value={formatMoneyBillions(kpis.latestCounterfactualGDPB)} sub={`± ${formatMoneyBillions(kpis.bandWidthB / 2)}`} tone={pctLiftTone} />
                <SummaryCard label="2024 lift" value={formatPct(kpis.pctLift)} sub={`per capita ${formatPct(kpis.gdpPcLift)}`} tone={pctLiftTone} />
                <SummaryCard label="cumulative 1990–2024" value={formatMoneyBillions(kpis.cumulativeGapB)} sub="sum of annual gaps" tone={cumTone} />
            </div>

            <div className="mb-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

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

            {activeTab === 'paths' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">
                            GDP trajectory (billions USD, constant 2010). Shaded band = confidence interval. Dashed lines = historical events.
                        </div>
                        <div style={{ width: '100%', height: 380 }}>
                            <ResponsiveContainer width="100%" height={380} minWidth={0}>
                                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="year" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}B`} />
                                    <Tooltip content={<ChartTooltip formatter={(v: number) => formatMoneyBillions(v)} />} />

                                    {/* Event markers */}
                                    {relevantEvents
                                        .filter(ev => ev.year >= params.analysisStart && ev.year <= params.analysisEnd)
                                        .map(ev => (
                                            <ReferenceLine
                                                key={ev.year + ev.label}
                                                x={ev.year}
                                                stroke="rgba(163,230,53,0.25)"
                                                strokeDasharray="3 3"
                                                label={{ value: ev.label, position: 'top', fill: 'rgba(163,230,53,0.4)', fontSize: 9, angle: -35 }}
                                            />
                                        ))}

                                    {/* Reform start/end markers */}
                                    {params.startYear >= params.analysisStart && params.startYear <= params.analysisEnd && (
                                        <ReferenceLine
                                            x={params.startYear}
                                            stroke="rgba(34,211,238,0.7)"
                                            strokeWidth={1.5}
                                            label={{ value: 'reform start', position: 'insideTopLeft', fill: '#22d3ee', fontSize: 10 }}
                                        />
                                    )}
                                    {params.endYear < 2024 && params.endYear >= params.analysisStart && params.endYear <= params.analysisEnd && (
                                        <ReferenceLine
                                            x={params.endYear}
                                            stroke="rgba(248,113,113,0.7)"
                                            strokeWidth={1.5}
                                            label={{ value: 'reform end', position: 'insideTopRight', fill: '#f87171', fontSize: 10 }}
                                        />
                                    )}

                                    {/* Confidence band */}
                                    <Area type="monotone" dataKey="bandBase" stackId="band" stroke="none" fill="transparent" name="cf low" />
                                    <Area type="monotone" dataKey="bandRange" stackId="band" stroke="none" fill="rgba(163,230,53,0.12)" name="cf band" />

                                    {/* Actual */}
                                    <Line type="monotone" dataKey="actual" name={`actual ${targetName}`} stroke={targetColor} strokeWidth={2} dot={false} />
                                    {/* Counterfactual */}
                                    <Line type="monotone" dataKey="counterfactual" name="counterfactual" stroke="#a3e635" strokeWidth={2.5} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                        {[
                            { color: targetColor, label: `actual ${targetName}` },
                            { color: '#a3e635', label: 'counterfactual' },
                            { color: 'rgba(163,230,53,0.4)', label: 'confidence band' },
                            { color: 'rgba(163,230,53,0.25)', label: 'historical event' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className="w-3 h-0.5" style={{ background: l.color }} />
                                <span className="text-lime-200/50">{l.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Per capita view */}
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">GDP per capita (USD, constant 2010)</div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="year" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<ChartTooltip formatter={(v: number) => `$${v.toLocaleString()}`} />} />
                                    <Line type="monotone" dataKey="actualPC" name="actual per capita" stroke={targetColor} strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="cfPC" name="counterfactual per capita" stroke="#a3e635" strokeWidth={2.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'gap' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">Annual output gap (counterfactual − actual, billions USD)</div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="year" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} tickFormatter={(v: number) => `$${v.toFixed(0)}B`} />
                                    <Tooltip content={<ChartTooltip formatter={(v: number) => formatMoneyBillions(v)} />} />
                                    <ReferenceLine y={0} stroke="rgba(163,230,53,0.3)" />
                                    <Area type="monotone" dataKey="annualGap" name="annual gap" stroke="#a3e635" fill="rgba(163,230,53,0.25)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">Cumulative gap since 1990 (billions USD)</div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <AreaChart data={cumulativeGapData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis dataKey="year" tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <YAxis tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}T` : `$${v.toFixed(0)}B`} />
                                    <Tooltip content={<ChartTooltip formatter={(v: number) => formatMoneyBillions(v)} />} />
                                    <ReferenceLine y={0} stroke="rgba(163,230,53,0.3)" />
                                    <Area type="monotone" dataKey="cumulative" name="cumulative gap" stroke="#22d3ee" fill="rgba(34,211,238,0.2)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="border border-lime-500/20 p-4 text-xs text-lime-200/60 leading-relaxed space-y-2">
                        <p><strong className="text-lime-200">Annual gap:</strong> the yearly difference between counterfactual and actual GDP. Positive means the counterfactual outperforms baseline that year.</p>
                        <p><strong className="text-lime-200">Cumulative gap:</strong> the running total. This is the best single number for &ldquo;how much output was foregone&rdquo; under the counterfactual assumption set.</p>
                        <p><strong className="text-lime-200">Interpretation:</strong> this is a benchmark, not a courtroom damages figure. Real policy transfers are not free, not instant, and not deterministic.</p>
                    </div>
                </div>
            )}

            {activeTab === 'policy' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">
                            Policy scores: target country vs blended model. Gap = model − target. Contribution = share of total positive gap.
                        </div>
                        <div style={{ width: '100%', height: 340 }}>
                            <ResponsiveContainer width="100%" height={340} minWidth={0}>
                                <BarChart data={policyDecomp} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(132,204,22,0.08)" />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(163,230,53,0.4)', fontSize: 10 }} />
                                    <YAxis type="category" dataKey="label" width={110} tick={{ fill: 'rgba(163,230,53,0.5)', fontSize: 10 }} />
                                    <Tooltip content={<ChartTooltip formatter={(v: number) => v.toFixed(1)} />} />
                                    <Bar dataKey="targetScore" name="target" fill="rgba(163,230,53,0.3)" />
                                    <Bar dataKey="modelScore" name="model" fill="#a3e635" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-lime-200/50 mb-2">Gap decomposition: which dimensions contribute most to the total policy gap?</div>
                        <div className="space-y-2">
                            {policyDecomp.filter(d => d.gap > 0).sort((a, b) => b.contribution - a.contribution).map(d => (
                                <div key={d.key} className="border border-lime-500/10 p-2">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-lime-200">{d.label}</span>
                                        <span className="font-mono text-lime-400">
                                            +{d.gap.toFixed(1)} {'·'} {d.contribution.toFixed(0)}% of gap
                                        </span>
                                    </div>
                                    <div className="h-1 bg-lime-500/10">
                                        <div className="h-full bg-lime-500" style={{ width: `${d.contribution}%` }} />
                                    </div>
                                </div>
                            ))}
                            {policyDecomp.filter(d => d.gap > 0).length === 0 && (
                                <div className="text-xs text-lime-200/50 border border-lime-500/20 p-3">
                                    No positive policy gap detected — the model does not outperform the target on any dimension.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    <SensitivityAnalysis bars={sensitivityBars} baseline={kpis.cumulativeGapB / 1000} outputLabel="cumulative gap ($T)" />
                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
