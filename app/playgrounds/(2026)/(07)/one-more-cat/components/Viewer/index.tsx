'use client';

import React, { useMemo, useState } from 'react';
import {
    LineChart,
    Line,
    Area,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import Dropdown from '@/components/Dropdown';
import ChartTooltip from '@/components/ChartTooltip';
import Equation from '@/components/Equation';

import {
    PARAM_META,
    SWEEP_KEYS,
    computePhase,
    computeSweep,
    decisionMetrics,
    formatParamValue,
    monthLabel,
    type EnsembleResult,
    type ParamKey,
    type Params,
    type Regime,
    type SimMode,
    type SimResult,
    type Snapshot,
} from '../../logic';
import PhaseMap, { PhaseMetric } from '../PhaseMap';


type Tab = 'timeline' | 'decision' | 'scanner' | 'phase' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'timeline', label: 'timeline' },
    { key: 'decision', label: 'one more cat' },
    { key: 'scanner', label: 'threshold scanner' },
    { key: 'phase', label: 'phase map' },
    { key: 'analysis', label: 'analysis' },
];

const DECISION_MAX = 60;

const TONE_CLASS: Record<Regime['tone'], string> = {
    good: 'text-lime-400 border-lime-500/50',
    accent: 'text-lime-300 border-lime-400/50',
    warn: 'text-amber-400 border-amber-500/50',
    danger: 'text-red-400 border-red-500/50',
};

const sweepMetas = PARAM_META.filter((m) => SWEEP_KEYS.includes(m.key));
const labelOf = (k: ParamKey) => sweepMetas.find((m) => m.key === k)?.label ?? k;
const keyOf = (label: string) => sweepMetas.find((m) => m.label === label)?.key ?? sweepMetas[0].key;

const PHASE_METRICS: { key: PhaseMetric; label: string }[] = [
    { key: 'regime', label: 'regime' },
    { key: 'finalCats', label: 'final cats' },
    { key: 'peakRho', label: 'peak load' },
    { key: 'minWelfare', label: 'min welfare' },
];


interface ViewerProps {
    params: Params;
    mode: SimMode;
    sim: SimResult;
    simNoIntervention: SimResult | null;
    ensemble: EnsembleResult | null;
    snapshot: Snapshot | null;
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
    sensitivity: { bars: SensitivityBar[]; baseline: number };
}


function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-lime-200/40">{label}</span>
            <span className={`font-mono text-sm ${accent ?? 'text-lime-300'}`}>{value}</span>
        </div>
    );
}


export default function Viewer({
    params, mode, sim, simNoIntervention, ensemble, snapshot,
    calibration, assumptions, versions, sensitivity,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('timeline');
    const [scannerParam, setScannerParam] = useState<ParamKey>('sterilizedShare');
    const [phaseX, setPhaseX] = useState<ParamKey>('baseArrivalsPerYear');
    const [phaseY, setPhaseY] = useState<ParamKey>('intakeDiscipline');
    const [phaseMetric, setPhaseMetric] = useState<PhaseMetric>('regime');
    const [decisionN, setDecisionN] = useState(1);

    const timelineData = useMemo(
        () => sim.rows.map((r, i) => ({
            month: r.month,
            n: Number(r.n.toFixed(2)),
            capacity: Number(r.capacity.toFixed(2)),
            rho: Number(r.rho.toFixed(3)),
            welfare: Number(r.welfare.toFixed(1)),
            strain: Number(r.strain.toFixed(1)),
            snap: snapshot ? snapshot.series[i]?.n : undefined,
            noInt: simNoIntervention ? simNoIntervention.rows[i]?.n : undefined,
        })),
        [sim, snapshot, simNoIntervention],
    );

    const ensembleData = useMemo(
        () => (ensemble ? ensemble.rows.map((r) => ({
            month: r.month,
            n10: Number(r.n10.toFixed(2)),
            n50: Number(r.n50.toFixed(2)),
            n90: Number(r.n90.toFixed(2)),
            band: Number((r.n90 - r.n10).toFixed(2)),
            welfare50: Number(r.welfare50.toFixed(1)),
        })) : []),
        [ensemble],
    );

    const decisionCurve = useMemo(() => {
        const arr: { n: number; pAccept: number; benefit: number; cost: number }[] = [];
        for (let n = 0; n <= DECISION_MAX; n++) {
            const d = decisionMetrics(n, params, 0, 0);
            arr.push({ n, pAccept: Number((d.acceptProbability * 100).toFixed(1)), benefit: Number(d.benefit.toFixed(3)), cost: Number(d.perceivedCost.toFixed(3)) });
        }
        return arr;
    }, [params]);

    const decisionAt = useMemo(() => decisionMetrics(decisionN, params, 0, 0), [decisionN, params]);

    const sweep = useMemo(
        () => (tab === 'scanner' ? computeSweep(params, scannerParam) : null),
        [tab, params, scannerParam],
    );

    const phase = useMemo(
        () => (tab === 'phase' ? computePhase(params, phaseX, phaseY) : null),
        [tab, params, phaseX, phaseY],
    );

    const sweepData = useMemo(
        () => (sweep ? sweep.points.map((p) => ({
            value: Number(p.value.toFixed(3)),
            finalCats: Number(p.finalCats.toFixed(2)),
            peakRho: Number(p.peakRho.toFixed(3)),
            minWelfare: Number(p.minWelfare.toFixed(1)),
        })) : []),
        [sweep],
    );

    const regime = sim.regime;
    const benefitBars = Object.entries(decisionAt.benefitComponents).filter(([, v]) => Math.abs(v) > 1e-4);
    const costBars = Object.entries(decisionAt.costComponents).filter(([, v]) => Math.abs(v) > 1e-4);
    const compMax = Math.max(1e-3, ...benefitBars.map(([, v]) => Math.abs(v)), ...costBars.map(([, v]) => Math.abs(v)));

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            {/* status card */}
            <div className={`border p-4 ${TONE_CLASS[regime.tone]}`}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm">{regime.label}</div>
                        <div className="text-lime-200/55 text-xs mt-1 max-w-[520px] leading-snug">{regime.note}</div>
                    </div>
                    <div className="flex gap-5 flex-wrap">
                        <Stat label="final cats" value={sim.final.n.toFixed(1)} />
                        <Stat label="peak" value={`${sim.peakN.toFixed(0)} cats`} />
                        <Stat label="peak load" value={`${sim.peakRho.toFixed(2)}x`} accent={sim.peakRho >= 1 ? 'text-amber-400' : 'text-lime-300'} />
                        <Stat label="min welfare" value={sim.minWelfare.toFixed(0)} accent={sim.minWelfare < 40 ? 'text-red-400' : sim.minWelfare < 70 ? 'text-amber-400' : 'text-lime-300'} />
                        <Stat label="crossed rho=1" value={monthLabel(sim.firstOverload)} accent={sim.firstOverload !== null ? 'text-amber-400' : 'text-lime-300'} />
                    </div>
                </div>
                {mode === 'ensemble' && ensemble && (
                    <div className="flex gap-5 flex-wrap mt-3 pt-3 border-t border-lime-500/15">
                        <Stat label="final (P10-P90)" value={`${ensemble.final10.toFixed(0)}-${ensemble.final90.toFixed(0)}`} />
                        <Stat label="median final" value={ensemble.final50.toFixed(0)} />
                        <Stat label="P(overload)" value={`${Math.round(ensemble.overloadProb * 100)}%`} accent={ensemble.overloadProb > 0.5 ? 'text-amber-400' : 'text-lime-300'} />
                        <Stat label="P(reach 120)" value={`${Math.round(ensemble.reach120Prob * 100)}%`} accent={ensemble.reach120Prob > 0.2 ? 'text-red-400' : 'text-lime-300'} />
                        <Stat label="P(severe welfare)" value={`${Math.round(ensemble.severeProb * 100)}%`} accent={ensemble.severeProb > 0.3 ? 'text-red-400' : 'text-lime-300'} />
                        <Stat label="runs" value={`${ensemble.runs}`} />
                    </div>
                )}
            </div>

            {/* tabs */}
            <div className="flex gap-1 flex-wrap border-b border-lime-500/20">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-3 py-1.5 text-xs font-mono border-b-2 -mb-px transition-colors cursor-pointer ${
                            tab === t.key ? 'border-lime-500 text-lime-400' : 'border-transparent text-lime-200/50 hover:text-lime-200/80'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'timeline' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            population vs effective care capacity{mode === 'ensemble' ? ' · P10 / median / P90 across 200 runs' : ''}
                            {snapshot ? ' · dashed orange is the saved snapshot' : ''}
                            {simNoIntervention && mode !== 'ensemble' ? ' · dashed amber is the no-intervention counterfactual' : ''}
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                {mode === 'ensemble' ? (
                                    <ComposedChart data={ensembleData} margin={{ top: 10, right: 16, bottom: 16, left: 6 }}>
                                        <CartesianGrid stroke="#1f2a12" strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <ReTooltip content={<ChartTooltip labelFormat={(l) => `month ${l}`} valueFormat={(v) => Number(v).toFixed(1)} />} />
                                        <Area type="monotone" dataKey="n10" stackId="band" stroke="none" fill="transparent" />
                                        <Area type="monotone" dataKey="band" stackId="band" stroke="none" fill="#84cc16" fillOpacity={0.14} name="P10-P90" />
                                        <Line type="monotone" dataKey="n50" stroke="#a3e635" strokeWidth={2} dot={false} name="median cats" />
                                        <ReferenceLine y={120} stroke="#dc2626" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: '120', fill: '#dc2626', fontSize: 9, position: 'right' }} />
                                    </ComposedChart>
                                ) : (
                                    <LineChart data={timelineData} margin={{ top: 10, right: 16, bottom: 16, left: 6 }}>
                                        <CartesianGrid stroke="#1f2a12" strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <ReTooltip content={<ChartTooltip labelFormat={(l) => `month ${l}`} valueFormat={(v) => Number(v).toFixed(1)} />} />
                                        <Line type="monotone" dataKey="n" stroke="#a3e635" strokeWidth={2} dot={false} name="cats" />
                                        <Line type="monotone" dataKey="capacity" stroke="#65a30d" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="capacity" />
                                        {snapshot && <Line type="monotone" dataKey="snap" stroke="#f97316" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="snapshot" />}
                                        {simNoIntervention && <Line type="monotone" dataKey="noInt" stroke="#facc15" strokeWidth={1.5} strokeDasharray="2 3" dot={false} name="no intervention" />}
                                        <ReferenceLine y={120} stroke="#dc2626" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: '120', fill: '#dc2626', fontSize: 9, position: 'right' }} />
                                        {params.interventionMonth > 0 && (
                                            <ReferenceLine x={params.interventionMonth} stroke="#a3e635" strokeDasharray="3 3" strokeOpacity={0.4} label={{ value: 'intervention', fill: '#a3e635', fontSize: 9, position: 'top' }} />
                                        )}
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs text-lime-200/60 mb-2 font-mono">care-load ratio rho · the threshold is rho = 1</div>
                            <div style={{ width: '100%', height: 200 }}>
                                <ResponsiveContainer width="100%" height={200} minWidth={0}>
                                    <LineChart data={timelineData} margin={{ top: 8, right: 12, bottom: 12, left: 6 }}>
                                        <CartesianGrid stroke="#1f2a12" strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                                        <ReTooltip content={<ChartTooltip labelFormat={(l) => `month ${l}`} valueFormat={(v) => `${Number(v).toFixed(2)}x`} />} />
                                        <ReferenceLine y={1} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'capacity', fill: '#f59e0b', fontSize: 9, position: 'right' }} />
                                        <Line type="monotone" dataKey="rho" stroke="#f59e0b" strokeWidth={2} dot={false} name="rho" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-lime-200/60 mb-2 font-mono">synthetic welfare and caregiver strain (0-100)</div>
                            <div style={{ width: '100%', height: 200 }}>
                                <ResponsiveContainer width="100%" height={200} minWidth={0}>
                                    <LineChart data={timelineData} margin={{ top: 8, right: 12, bottom: 12, left: 6 }}>
                                        <CartesianGrid stroke="#1f2a12" strokeDasharray="3 3" />
                                        <XAxis dataKey="month" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                                        <ReTooltip content={<ChartTooltip labelFormat={(l) => `month ${l}`} valueFormat={(v) => Number(v).toFixed(0)} />} />
                                        <ReferenceLine y={40} stroke="#dc2626" strokeDasharray="4 3" strokeOpacity={0.5} />
                                        <Line type="monotone" dataKey="welfare" stroke="#a3e635" strokeWidth={2} dot={false} name="welfare" />
                                        <Line type="monotone" dataKey="strain" stroke="#f97316" strokeWidth={1.5} dot={false} name="strain" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">threshold events</div>
                        {sim.events.length === 0 ? (
                            <div className="text-xs text-lime-200/50">no thresholds crossed on this trajectory.</div>
                        ) : (
                            <div className="space-y-1">
                                {sim.events.map((e, i) => (
                                    <div key={i} className="flex items-baseline gap-3 text-xs">
                                        <span className={`font-mono w-16 shrink-0 ${e.severity === 'danger' ? 'text-red-400' : e.severity === 'warn' ? 'text-amber-400' : 'text-lime-400'}`}>
                                            {monthLabel(e.month)}
                                        </span>
                                        <span className="text-lime-200/80">{e.title}</span>
                                        <span className="text-lime-200/40 hidden sm:inline">{e.note}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'decision' && (
                <div className="space-y-5">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the cold-start marginal decision at a given count · P(accept) = logistic[2.7 (benefit − perceived cost)]
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-lime-200/60 font-mono w-24 shrink-0">already own {decisionN}</span>
                        <input
                            type="range" min={0} max={DECISION_MAX} step={1} value={decisionN}
                            onChange={(e) => setDecisionN(parseInt(e.target.value, 10))}
                            className="w-full h-1 accent-lime-500 cursor-pointer bg-lime-500/20"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-lime-500/30 p-4 flex flex-col items-center justify-center">
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40">P(accept next cat)</div>
                            <div className="text-3xl font-mono text-lime-400 mt-1">{Math.round(decisionAt.acceptProbability * 100)}%</div>
                            <div className="text-[10px] text-lime-200/50 mt-1">benefit {decisionAt.benefit.toFixed(2)} · cost {decisionAt.perceivedCost.toFixed(2)}</div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">benefit of one more</div>
                            <div className="space-y-1.5">
                                {benefitBars.map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-2">
                                        <span className="w-32 text-[10px] text-lime-200/60 truncate shrink-0">{k}</span>
                                        <div className="flex-1 h-2 bg-lime-500/5">
                                            <div className="h-full bg-lime-500/60" style={{ width: `${(Math.abs(v) / compMax) * 100}%` }} />
                                        </div>
                                        <span className="w-10 text-right text-[10px] font-mono text-lime-200/50">{v.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">perceived cost of one more</div>
                            <div className="space-y-1.5">
                                {costBars.map(([k, v]) => (
                                    <div key={k} className="flex items-center gap-2">
                                        <span className="w-32 text-[10px] text-lime-200/60 truncate shrink-0">{k}</span>
                                        <div className="flex-1 h-2 bg-lime-500/5 relative">
                                            <div className={`h-full ${v >= 0 ? 'bg-orange-500/60' : 'bg-lime-500/40'}`} style={{ width: `${(Math.abs(v) / compMax) * 100}%` }} />
                                        </div>
                                        <span className="w-10 text-right text-[10px] font-mono text-lime-200/50">{v.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[9px] text-lime-200/30 mt-2">green rows are discounts (habituation, second-cat infrastructure)</div>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">acceptance probability as the household grows · a downward slope is self-limiting; a flat high line is runaway</div>
                        <div style={{ width: '100%', height: 240 }}>
                            <ResponsiveContainer width="100%" height={240} minWidth={0}>
                                <LineChart data={decisionCurve} margin={{ top: 8, right: 16, bottom: 16, left: 6 }}>
                                    <CartesianGrid stroke="#1f2a12" strokeDasharray="3 3" />
                                    <XAxis dataKey="n" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'cats already owned', fill: '#65a30d', fontSize: 10, position: 'insideBottom', dy: 12 }} />
                                    <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <ReTooltip content={<ChartTooltip labelFormat={(l) => `at ${l} cats`} valueFormat={(v) => `${Number(v).toFixed(1)}%`} />} />
                                    <ReferenceLine x={decisionN} stroke="#a3e635" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'here', fill: '#a3e635', fontSize: 9, position: 'top' }} />
                                    <Line type="monotone" dataKey="pAccept" stroke="#a3e635" strokeWidth={2} dot={false} name="P(accept)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'scanner' && sweep && (
                <div className="space-y-5">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Dropdown
                            name="scan"
                            selected={labelOf(scannerParam)}
                            selectables={sweepMetas.map((m) => m.label)}
                            atSelect={(l) => setScannerParam(keyOf(l))}
                        />
                        <div className="text-[11px] text-lime-200/50 font-mono">
                            largest cliff near {formatParamValue(scannerParam, sweep.cliffValue)}
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">final population and minimum welfare as {labelOf(scannerParam)} is swept, all else fixed</div>
                        <div style={{ width: '100%', height: 260 }}>
                            <ResponsiveContainer width="100%" height={260} minWidth={0}>
                                <ComposedChart data={sweepData} margin={{ top: 10, right: 16, bottom: 16, left: 6 }}>
                                    <CartesianGrid stroke="#1f2a12" strokeDasharray="3 3" />
                                    <XAxis dataKey="value" type="number" domain={['dataMin', 'dataMax']} tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#f97316', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <ReTooltip content={<ChartTooltip labelFormat={(l) => `${labelOf(scannerParam)} ${Number(l).toFixed(2)}`} valueFormat={(v) => Number(v).toFixed(1)} />} />
                                    <ReferenceLine yAxisId="left" x={params[scannerParam]} stroke="#a3e635" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }} />
                                    <ReferenceLine yAxisId="left" x={sweep.cliffValue} stroke="#dc2626" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'cliff', fill: '#dc2626', fontSize: 9, position: 'top' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="finalCats" stroke="#a3e635" strokeWidth={2} dot={false} name="final cats" />
                                    <Line yAxisId="right" type="monotone" dataKey="minWelfare" stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="min welfare" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">peak care-load ratio · where it crosses 1, the household loses its capacity margin</div>
                        <div style={{ width: '100%', height: 200 }}>
                            <ResponsiveContainer width="100%" height={200} minWidth={0}>
                                <LineChart data={sweepData} margin={{ top: 8, right: 16, bottom: 16, left: 6 }}>
                                    <CartesianGrid stroke="#1f2a12" strokeDasharray="3 3" />
                                    <XAxis dataKey="value" type="number" domain={['dataMin', 'dataMax']} tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: '#f59e0b', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <ReTooltip content={<ChartTooltip labelFormat={(l) => `${labelOf(scannerParam)} ${Number(l).toFixed(2)}`} valueFormat={(v) => `${Number(v).toFixed(2)}x`} />} />
                                    <ReferenceLine y={1} stroke="#f59e0b" strokeDasharray="4 3" label={{ value: 'rho=1', fill: '#f59e0b', fontSize: 9, position: 'right' }} />
                                    <ReferenceLine x={params[scannerParam]} stroke="#a3e635" strokeDasharray="3 3" strokeOpacity={0.5} />
                                    <Line type="monotone" dataKey="peakRho" stroke="#f59e0b" strokeWidth={2} dot={false} name="peak rho" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">threshold crossings</div>
                        {sweep.crossings.length === 0 ? (
                            <div className="text-xs text-lime-200/50">no thresholds are crossed anywhere in this parameter&apos;s range.</div>
                        ) : (
                            <div className="space-y-1">
                                {sweep.crossings.map((c, i) => (
                                    <div key={i} className="flex items-baseline gap-3 text-xs">
                                        <span className="font-mono text-lime-400 w-24 shrink-0">{formatParamValue(scannerParam, c.value)}</span>
                                        <span className="text-lime-200/70">{c.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'phase' && phase && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <Dropdown name="x" selected={labelOf(phaseX)} selectables={sweepMetas.map((m) => m.label)} atSelect={(l) => setPhaseX(keyOf(l))} />
                        <Dropdown name="y" selected={labelOf(phaseY)} selectables={sweepMetas.map((m) => m.label)} atSelect={(l) => setPhaseY(keyOf(l))} />
                        <div className="flex gap-1">
                            {PHASE_METRICS.map((m) => (
                                <button
                                    key={m.key}
                                    onClick={() => setPhaseMetric(m.key)}
                                    className={`px-2 py-1 text-[10px] font-mono border transition-colors cursor-pointer ${
                                        phaseMetric === m.key ? 'border-lime-500 bg-lime-500/10 text-lime-400' : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                    }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {phaseX === phaseY ? (
                        <div className="text-xs text-amber-400/80 border border-amber-500/30 p-3">
                            pick two different parameters for the two axes.
                        </div>
                    ) : (
                        <>
                            <div className="border border-lime-500/20 p-3">
                                <PhaseMap
                                    phase={phase}
                                    metric={phaseMetric}
                                    xLabel={labelOf(phaseX)}
                                    yLabel={labelOf(phaseY)}
                                    formatX={(v) => formatParamValue(phaseX, v)}
                                    formatY={(v) => formatParamValue(phaseY, v)}
                                    currentX={params[phaseX]}
                                    currentY={params[phaseY]}
                                />
                                <div className="text-[10px] text-lime-200/40 font-mono mt-2">
                                    the white ring marks your current settings · each cell is a full simulation at that (x, y)
                                </div>
                            </div>
                            <div className="flex gap-5 flex-wrap">
                                <Stat label="cells overloaded" value={`${Math.round(phase.overloadedShare * 100)}%`} accent={phase.overloadedShare > 0.5 ? 'text-amber-400' : 'text-lime-300'} />
                                <Stat label="cells reaching 120" value={`${Math.round(phase.reach120Share * 100)}%`} accent={phase.reach120Share > 0.2 ? 'text-red-400' : 'text-lime-300'} />
                                <Stat label="stable high-count" value={`${Math.round(phase.stableHighShare * 100)}%`} accent="text-lime-300" />
                            </div>
                        </>
                    )}
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div className="border border-lime-500/30 p-4 space-y-3">
                        <div className="text-sm text-lime-200/80 leading-relaxed">the state update and the boundary that actually matters</div>
                        <Equation mode="block" math="n_{t+1} = n_t + a_t + b_t - r_t - d_t" />
                        <Equation mode="block" math="\rho = \frac{\text{required care load}}{\text{effective capacity}}, \qquad P(\text{accept}) = \sigma\!\big(2.7\,[\,\text{benefit} - \text{perceived cost}\,]\big)" />
                        <div className="border-l-2 border-lime-500/40 pl-3 text-sm text-lime-200/70 leading-relaxed">
                            arrivals <Equation math="a_t" />, births <Equation math="b_t" />, rehomings <Equation math="r_t" />, and exits <Equation math="d_t" /> are all functions of the state. crossing <Equation math="\rho = 1" />, not any particular cat count, is where care begins to fail.
                        </div>
                    </div>

                    <SensitivityAnalysis bars={sensitivity.bars} baseline={sensitivity.baseline} outputLabel="final cats" />

                    <CalibrationPanel results={calibration} outputLabel="engine identities" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
