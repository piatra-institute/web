'use client';

import React, { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceDot,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';

import {
    Params,
    AnalyticalMetrics,
    LiveMetrics,
    Snapshot,
    SweepableParam,
    SweepDatum,
    PARAM_SPECS,
} from '../../logic';
import LatticeCanvas from '../LatticeCanvas';
import PhaseDiagram from '../PhaseDiagram';
import SpectrumChart from '../SpectrumChart';


type Tab = 'lattice' | 'avalanches' | 'spectrum' | 'phase' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'lattice', label: 'lattice' },
    { key: 'avalanches', label: 'avalanches' },
    { key: 'spectrum', label: 'spectrum' },
    { key: 'phase', label: 'phase' },
    { key: 'analysis', label: 'analysis' },
];

interface ViewerProps {
    params: Params;
    analytical: AnalyticalMetrics;
    live: LiveMetrics;
    fieldRef: React.MutableRefObject<Float32Array>;
    snapshot: Snapshot | null;
    sweepParam: SweepableParam;
    onSweepParamChange: (p: SweepableParam) => void;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    onPickPhasePoint: (gain: number, damping: number) => void;
}

function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; color: string }>;
    label?: string | number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: '#0a0a0a',
                border: '1px solid #84cc16',
                padding: 10,
                color: '#ecfccb',
                fontSize: 11,
            }}
        >
            <div style={{ marginBottom: 4, color: '#a3e635' }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i}>
                    <span style={{ color: p.color }}>{p.name}</span>:{' '}
                    {Number(p.value).toFixed(3)}
                </div>
            ))}
        </div>
    );
}

export default function Viewer({
    params,
    analytical,
    live,
    fieldRef,
    snapshot,
    sweepParam,
    onSweepParamChange,
    sweep,
    sensitivityBars,
    calibration,
    assumptions,
    versions,
    onPickPhasePoint,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('lattice');

    const sweepLabel = PARAM_SPECS.find((s) => s.key === sweepParam)?.label ?? sweepParam;

    const avalancheData = useMemo(() => {
        return live.avalancheBins.map((b) => ({
            logSize: Math.log10(b.size),
            logCount: Math.log10(b.count),
            size: b.size,
            count: b.count,
        }));
    }, [live.avalancheBins]);

    const tauReferenceLine = useMemo(() => {
        if (avalancheData.length < 2) return null;
        const xs = avalancheData.map((d) => d.logSize);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        // Plot the theoretical -3/2 line, normalized so the centroid passes through the data centroid
        const centroidX = avalancheData.reduce((a, d) => a + d.logSize, 0) / avalancheData.length;
        const centroidY = avalancheData.reduce((a, d) => a + d.logCount, 0) / avalancheData.length;
        const tau = 1.5;
        const intercept = centroidY + tau * centroidX;
        return [
            { logSize: minX, logCount: intercept - tau * minX, label: 'theory' },
            { logSize: maxX, logCount: intercept - tau * maxX, label: 'theory' },
        ];
    }, [avalancheData]);

    const fittedLine = useMemo(() => {
        if (live.tauObserved === null || avalancheData.length < 2) return null;
        const tau = -live.tauObserved;
        const centroidX = avalancheData.reduce((a, d) => a + d.logSize, 0) / avalancheData.length;
        const centroidY = avalancheData.reduce((a, d) => a + d.logCount, 0) / avalancheData.length;
        const intercept = centroidY + tau * centroidX;
        const xs = avalancheData.map((d) => d.logSize);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        return [
            { logSize: minX, logCount: intercept - tau * minX },
            { logSize: maxX, logCount: intercept - tau * maxX },
        ];
    }, [live.tauObserved, avalancheData]);

    const regimeColor = analytical.regime === 'critical'
        ? 'text-lime-400'
        : analytical.regime === 'subcritical'
            ? 'text-lime-300'
            : 'text-orange-400';

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className={`font-semibold text-sm ${regimeColor}`}>
                            {analytical.regimeLabel}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            preset: <span className="text-lime-200/80">{params.preset}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            λ_max: <span className="text-lime-400">{analytical.lambdaMax.toFixed(3)}</span>
                        </div>
                        <div>
                            ξ: <span className="text-lime-400">{analytical.correlationLengthEstimate.toFixed(1)}</span>
                        </div>
                        <div>
                            τ: <span className="text-lime-400">{live.tauObserved !== null ? live.tauObserved.toFixed(2) : '-'}</span>
                        </div>
                        <div>
                            gap: <span className="text-lime-400">{live.spectralGap.toFixed(3)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'amplitude', value: live.amplitude.toFixed(2) },
                    { label: 'energy', value: live.energy.toFixed(3) },
                    { label: 'corr. len.', value: live.correlationLength.toFixed(1) },
                    { label: 'active', value: `${(live.activeFraction * 100).toFixed(0)}%` },
                ].map((m) => (
                    <div key={m.label} className="border border-lime-500/20 p-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">{m.label}</div>
                        <div className="text-lg font-mono text-lime-400 mt-1">{m.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex gap-1 flex-wrap border-b border-lime-500/20">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-3 py-1.5 text-xs font-mono border-b-2 -mb-px transition-colors cursor-pointer ${
                            tab === t.key
                                ? 'border-lime-500 text-lime-400'
                                : 'border-transparent text-lime-200/50 hover:text-lime-200/80'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'lattice' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        96-site periodic 1D lattice · sheaf patches shown as faint columns · the
                        active threshold is |u_i| &gt; 0.22
                    </div>
                    <LatticeCanvas fieldRef={fieldRef} activeFraction={live.activeFraction} />
                    {snapshot && (
                        <div className="text-xs text-orange-300/70 font-mono">
                            saved snapshot: {snapshot.label} · λ_max = {snapshot.analytical.lambdaMax.toFixed(3)} ·
                            τ = {snapshot.live.tauObserved !== null ? snapshot.live.tauObserved.toFixed(2) : '-'} ·
                            gap = {snapshot.live.spectralGap.toFixed(3)}
                        </div>
                    )}
                </div>
            )}

            {tab === 'avalanches' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        avalanche size distribution P(s) on log-log axes · the dashed grey line
                        is the theoretical mean-field exponent τ = -3/2 · the lime line is the
                        empirical OLS fit
                    </div>
                    <div style={{ width: '100%', height: 360 }}>
                        <ResponsiveContainer width="100%" height={360} minWidth={0}>
                            <ScatterChart margin={{ top: 18, right: 30, bottom: 30, left: 14 }}>
                                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    dataKey="logSize"
                                    domain={['auto', 'auto']}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => `10^${v.toFixed(1)}`}
                                    label={{ value: 'log avalanche size', position: 'insideBottom', offset: -10, fill: '#a3e635', fontSize: 10 }}
                                />
                                <YAxis
                                    type="number"
                                    dataKey="logCount"
                                    domain={['auto', 'auto']}
                                    tick={{ fill: '#a3e635', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                    label={{ value: 'log count', angle: -90, position: 'insideLeft', fill: '#a3e635', fontSize: 10 }}
                                />
                                <ReTooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null;
                                        const p = payload[0].payload as { size: number; count: number };
                                        return (
                                            <div style={{ background: '#0a0a0a', border: '1px solid #84cc16', padding: 10, color: '#ecfccb', fontSize: 11 }}>
                                                <div>size: {p.size?.toFixed(1)}</div>
                                                <div>count: {p.count}</div>
                                            </div>
                                        );
                                    }}
                                />
                                <Scatter name="avalanches" data={avalancheData} fill="#a3e635" />
                                {tauReferenceLine && (
                                    <Scatter name="τ = -3/2 (theory)" data={tauReferenceLine} line={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 3' }} shape={() => <g />} legendType="none" />
                                )}
                                {fittedLine && (
                                    <Scatter name={`τ-fit ≈ ${live.tauObserved?.toFixed(2)}`} data={fittedLine} line={{ stroke: '#84cc16', strokeWidth: 2 }} shape={() => <g />} legendType="none" />
                                )}
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-lime-200/60 font-mono flex justify-between">
                        <span>empirical τ-fit: <span className="text-lime-400">{live.tauObserved !== null ? live.tauObserved.toFixed(3) : 'collecting…'}</span></span>
                        <span>theoretical τ (analytical): <span className="text-lime-400">{analytical.tauTheoretical.toFixed(3)}</span></span>
                    </div>
                </div>
            )}

            {tab === 'spectrum' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        cellular sheaf laplacian over the lattice · the lime band marks the
                        kernel (≅ H⁰), eigenvalues below the threshold count as global
                        sections · the smallest non-zero eigenvalue is the spectral gap
                    </div>
                    <SpectrumChart
                        eigenvalues={live.eigenvalues}
                        kernelDim={live.kernelDim}
                        spectralGap={live.spectralGap}
                    />
                    <div className="grid grid-cols-3 gap-3">
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide">kernel dim</div>
                            <div className="text-lg font-mono text-lime-400 mt-1">{live.kernelDim}</div>
                            <div className="text-[10px] text-lime-200/40 mt-1">≅ dim H⁰(X; F)</div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide">spectral gap</div>
                            <div className="text-lg font-mono text-lime-400 mt-1">{live.spectralGap.toFixed(3)}</div>
                            <div className="text-[10px] text-lime-200/40 mt-1">smallest non-zero eigenvalue</div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide">analytical gap</div>
                            <div className="text-lg font-mono text-lime-400 mt-1">{analytical.spectralGapEstimate.toFixed(3)}</div>
                            <div className="text-[10px] text-lime-200/40 mt-1">expected from λ_max</div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'phase' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        (gain, damping) phase plane · the dashed lime curve is λ_max = 0 · click
                        anywhere to jump the operating point
                    </div>
                    <PhaseDiagram params={params} onPickPoint={onPickPhasePoint} />
                    <div className="text-xs text-lime-200/60 font-mono">
                        operating point: gain = <span className="text-lime-400">{params.gain.toFixed(3)}</span> ·
                        damping = <span className="text-lime-400">{params.damping.toFixed(3)}</span> ·
                        distance to critical curve: <span className="text-lime-400">{analytical.distance.toFixed(3)}</span>
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                            <div className="flex gap-1 flex-wrap">
                                {PARAM_SPECS.map((spec) => (
                                    <button
                                        key={spec.key}
                                        onClick={() => onSweepParamChange(spec.key)}
                                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                            sweepParam === spec.key
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {spec.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            {sweepLabel} sweep · how λ_max, normalised correlation length,
                            normalised |τ| and spectral gap respond as one parameter is swept
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="sweepValue"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v: number) => v.toFixed(2)}
                                    />
                                    <YAxis
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v: number) => v.toFixed(2)}
                                    />
                                    <ReTooltip content={<ChartTooltip />} />
                                    <ReferenceLine y={0} stroke="#a3e635" strokeOpacity={0.4} strokeDasharray="3 3" />
                                    <ReferenceLine
                                        x={params[sweepParam]}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="lambdaMax" stroke="#a3e635" strokeWidth={2.5} dot={false} name="λ_max" />
                                    <Line type="monotone" dataKey="correlationLength" stroke="#84cc16" strokeWidth={1.5} dot={false} name="ξ (norm)" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="tauTheoretical" stroke="#65a30d" strokeWidth={1.5} dot={false} name="|τ|/3" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="spectralGap" stroke="#f97316" strokeWidth={1.5} dot={false} name="gap" strokeDasharray="2 4" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={analytical.lambdaMax}
                        outputLabel="λ_max"
                    />

                    <CalibrationPanel results={calibration} outputLabel="τ exponent" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
