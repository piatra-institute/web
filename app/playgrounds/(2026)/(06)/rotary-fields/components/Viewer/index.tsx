'use client';

import React, { useMemo, useState } from 'react';
import {
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
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import SensitivityAnalysis, { SensitivityBar } from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import ChartTooltip from '@/components/ChartTooltip';

import {
    FIELD_KEYS,
    FIELD_LABELS,
    SCENARIOS,
    comparativeRanking,
    currentScenario,
    type ComparativeRow,
    type Metrics,
    type Params,
    type Reading,
    type SimResult,
    type Snapshot,
    type SweepDatum,
    type SweepableField,
} from '../../logic';
import RopePlane from '../RopePlane';
import AttentionHeatmap from '../AttentionHeatmap';
import NeuralPhase from '../NeuralPhase';
import GridInterference from '../GridInterference';
import BridgeDiagram from '../BridgeDiagram';


type Tab = 'rope' | 'neural' | 'bridge' | 'scenarios' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'rope', label: 'rope' },
    { key: 'neural', label: 'neural' },
    { key: 'bridge', label: 'bridge' },
    { key: 'scenarios', label: 'scenarios' },
    { key: 'analysis', label: 'analysis' },
];


interface ViewerProps {
    params: Params;
    metrics: Metrics;
    result: SimResult;
    snapshot: Snapshot | null;
    reading: Reading;
    sweepField: SweepableField;
    onSweepFieldChange: (f: SweepableField) => void;
    sweep: SweepDatum[];
    sensitivityBars: SensitivityBar[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}


export default function Viewer({
    params,
    metrics,
    result,
    snapshot,
    reading,
    sweepField,
    onSweepFieldChange,
    sweep,
    sensitivityBars,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('rope');

    const cse = currentScenario(params);
    const ranking: ComparativeRow[] = useMemo(() => comparativeRanking(), []);

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {cse.label}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            seqLen <span className="text-lime-200/80">{params.seqLen}</span>
                            {' · '}pairs <span className="text-lime-200/80">{params.pairs}</span>
                            {' · '}base <span className="text-lime-200/80">{params.base}</span>
                            {' · '}
                            <span className="italic text-lime-200/70">{cse.subtitle}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>conc: <span className="text-lime-400">{(metrics.concentration * 100).toFixed(0)}%</span></div>
                        <div>ctx: <span className="text-lime-400">{metrics.contextWidth.toFixed(1)}</span></div>
                        <div>drift: <span className="text-lime-400">{metrics.translationDrift.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">peak score</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.peakScore.toFixed(2)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">nearby</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.nearbyMass.toFixed(2)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">distant</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.distantMass.toFixed(2)}</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">rel angle</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.relativeAngle.toFixed(0)}°</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">phase adv</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.phaseAdvance.toFixed(0)}°</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">grid coh</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.gridCoherence * 100).toFixed(0)}%</div>
                </div>
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

            {tab === 'rope' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the rotation circle is the first 2D pair · the heatmap is the full RoPE-rotated attention score over all (i, j) · selected cell is highlighted in yellow · dashed orange marks cells that differ by more than 25% from the saved snapshot
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <RopePlane params={params} metrics={metrics} />
                        <AttentionHeatmap
                            matrix={result.attention}
                            tokenI={params.tokenI}
                            tokenJ={params.tokenJ}
                            snapshotMatrix={snapshot?.result.attention}
                        />
                    </div>
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">diagnosis</div>
                        <div className="text-sm text-lime-100 mt-2 leading-relaxed">{reading.diagnosis}</div>
                        <div className="border-l-2 border-lime-500/40 pl-3 mt-3">
                            <div className="text-base text-lime-200/90 italic leading-relaxed">{reading.aphorism}</div>
                        </div>
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wider mt-3 font-mono">
                            {reading.compact}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'neural' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        theta phase precession · place-field rate envelope crossed with spike phase · grid-like interference field built by summing three oscillations at 60° offsets
                    </div>
                    <NeuralPhase params={params} metrics={metrics} />
                    <GridInterference field={result.grid} />
                </div>
            )}

            {tab === 'bridge' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the same geometric move on both sides · vector rotation on the left, spike phase on the right, the shared abstraction in the middle
                    </div>
                    <BridgeDiagram params={params} metrics={metrics} />
                    <div className="border border-lime-500/30 p-4 space-y-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">bridge note</div>
                        <div className="text-sm text-lime-100 leading-relaxed">{reading.bridgeNote}</div>
                        <div className="border border-lime-500/20 p-3 font-mono text-xs text-lime-200/70 leading-relaxed">
                            transformer side: token position p → rotation angle θ = p·ω<br />
                            neural side: trajectory position x → spike phase φ = φ₀ − s·x<br />
                            shared abstraction: relative position is recoverable from phase difference.
                        </div>
                    </div>
                </div>
            )}

            {tab === 'scenarios' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        all five presets under their canonical settings · sorted by attention concentration · the active preset is highlighted
                    </div>
                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[1fr_70px_70px_70px_70px] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>preset</div>
                            <div className="text-right">conc</div>
                            <div className="text-right">ctx</div>
                            <div className="text-right">near</div>
                            <div className="text-right">far</div>
                        </div>
                        {ranking.map((r) => {
                            const cc = SCENARIOS[r.key];
                            const active = r.key === params.preset;
                            return (
                                <div
                                    key={r.key}
                                    className={`grid grid-cols-[1fr_70px_70px_70px_70px] gap-2 px-3 py-2 border-b border-lime-500/10 last:border-b-0 items-center ${
                                        active ? 'bg-lime-500/10' : ''
                                    }`}
                                >
                                    <div>
                                        <div className={`text-sm ${active ? 'text-lime-400' : 'text-lime-100/80'}`}>
                                            {r.label}
                                        </div>
                                        <div className="text-[10px] text-lime-200/40 italic">{cc.subtitle}</div>
                                    </div>
                                    <div className="text-right text-sm font-mono text-lime-400">{r.concentration.toFixed(0)}%</div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">{r.contextWidth.toFixed(1)}</div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">{r.nearbyMass.toFixed(2)}</div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">{r.distantMass.toFixed(2)}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the calibration table compares the model&apos;s predicted attention concentration against the canonical target for each preset. close agreement means the simple toy mirrors the empirical behaviour of the regime; large gaps point at where the toy stops being a faithful sketch.
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs text-lime-200/60 font-mono">sweep</span>
                            <div className="flex gap-1 flex-wrap">
                                {FIELD_KEYS.map((k) => (
                                    <button
                                        key={k}
                                        onClick={() => onSweepFieldChange(k)}
                                        className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                                            sweepField === k
                                                ? 'border-lime-500 bg-lime-500/10 text-lime-400'
                                                : 'border-lime-500/20 text-lime-200/50 hover:border-lime-500/40'
                                        }`}
                                    >
                                        {FIELD_LABELS[k]}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            {FIELD_LABELS[sweepField]} sweep · how attention concentration, context width, and translation drift respond as one parameter moves through its range
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
                                    />
                                    <YAxis
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ReTooltip
                                        content={
                                            <ChartTooltip
                                                labelFormat={(l) => typeof l === 'number' ? l.toFixed(2) : String(l)}
                                                valueFormat={(v) => Number(v).toFixed(1)}
                                            />
                                        }
                                    />
                                    <ReferenceLine
                                        x={Number((params[sweepField] as number).toFixed(2))}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="concentration" stroke="#a3e635" strokeWidth={2} dot={false} name="concentration" />
                                    <Line type="monotone" dataKey="contextWidth" stroke="#84cc16" strokeWidth={1.5} dot={false} name="context width" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="nearbyMass" stroke="#facc15" strokeWidth={1.5} dot={false} name="nearby x100" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="distantMass" stroke="#ea580c" strokeWidth={1.5} dot={false} name="distant x100" strokeDasharray="2 4" />
                                    <Line type="monotone" dataKey="translationDrift" stroke="#65a30d" strokeWidth={1.5} dot={false} name="drift x100" strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.concentration * 100}
                        outputLabel="attention concentration"
                    />

                    <CalibrationPanel results={calibration} outputLabel="attention concentration" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
