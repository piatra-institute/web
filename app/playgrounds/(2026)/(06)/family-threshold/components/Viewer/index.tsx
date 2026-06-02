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
    REGIMES,
    SCENARIOS,
    comparativeRanking,
    currentCase,
    statusOf,
    type ComparativeRow,
    type Metrics,
    type Params,
    type Reading,
    type SimResult,
    type Snapshot,
    type StepRecord,
    type SweepDatum,
    type SweepableField,
} from '../../logic';
import BeliefField from '../BeliefField';
import TrajectoryChart from '../TrajectoryChart';
import LossTable from '../LossTable';


type Tab = 'belief' | 'trajectory' | 'losses' | 'scenarios' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'belief', label: 'belief' },
    { key: 'trajectory', label: 'trajectory' },
    { key: 'losses', label: 'losses' },
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
    const [tab, setTab] = useState<Tab>('belief');

    const cse = currentCase(params);
    const reg = statusOf(metrics);
    const ranking: ComparativeRow[] = useMemo(() => comparativeRanking(), []);

    const lastStep: StepRecord | undefined = result.steps[result.steps.length - 1];

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {cse.label} · {reg.title}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            placement <span className="text-lime-200/80">{metrics.placement}</span>
                            {' · '}removals <span className="text-lime-200/80">{metrics.removalCount}</span>
                            {' · '}reunifications <span className="text-lime-200/80">{metrics.reunifyCount}</span>
                            {' · '}
                            <span className="italic" style={{ color: reg.color }}>{reg.label}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>belief: <span className="text-lime-400">{(metrics.finalBelief * 100).toFixed(0)}%</span></div>
                        <div>harm: <span className="text-lime-400">{(metrics.finalHarm * 100).toFixed(0)}%</span></div>
                        <div>family: <span className="text-lime-400">{(metrics.finalFamily * 100).toFixed(0)}%</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">belief</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.finalBelief * 100).toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">actual harm</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.finalHarm * 100).toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">attachment</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.finalAttachment * 100).toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">family</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.finalFamily * 100).toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">trust</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{(metrics.finalTrust * 100).toFixed(0)}%</div>
                </div>
                <div className="border border-lime-500/20 p-3">
                    <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">loss</div>
                    <div className="text-lg font-mono text-lime-400 mt-1">{metrics.cumulativeLoss.toFixed(1)}</div>
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

            {tab === 'belief' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        2D phase plot of state belief versus actual harm · diagonal is perfect knowledge · horizontal lines mark removal and adoption thresholds · the four quadrants are the four error regions · dashed orange traces a saved snapshot
                    </div>
                    <BeliefField params={params} metrics={metrics} steps={result.steps} snapshot={snapshot} />
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">diagnosis</div>
                        <div className="text-sm text-lime-100 mt-2 leading-relaxed">{reading.diagnosis}</div>
                        <div className="border-l-2 border-lime-500/40 pl-3 mt-3">
                            <div className="text-base text-lime-200/90 italic leading-relaxed">{reading.fieldNote}</div>
                        </div>
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wider mt-3 font-mono">
                            {reading.compact}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'trajectory' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        five state variables and the institution&apos;s belief over the {result.steps.length}-step horizon · vertical orange dashes mark removal events, lime for reunification, deep orange for permanent separation
                    </div>
                    <TrajectoryChart steps={result.steps} snapshot={snapshot} />
                </div>
            )}

            {tab === 'losses' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        expected-loss decomposition for the final step · the highlighted row is the action the institution would choose now · the explanation column shows what each action trades off
                    </div>
                    {lastStep && <LossTable losses={lastStep.losses} chosen={lastStep.action} />}
                </div>
            )}

            {tab === 'scenarios' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        all five named scenarios under their canonical institutional weights · sorted by outcome regime · the active scenario is highlighted
                    </div>
                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[1fr_70px_70px_70px_70px] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>scenario</div>
                            <div className="text-right">belief</div>
                            <div className="text-right">harm</div>
                            <div className="text-right">family</div>
                            <div className="text-right">loss</div>
                        </div>
                        {ranking.map((r) => {
                            const cc = SCENARIOS[r.key];
                            const active = r.key === params.case;
                            const rc = REGIMES[r.outcomeIndex].color;
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
                                        <div className="text-[10px] italic" style={{ color: rc }}>
                                            {REGIMES[r.outcomeIndex].title} · {r.placement}
                                        </div>
                                        <div className="text-[10px] text-lime-200/40 italic">{cc.subtitle}</div>
                                    </div>
                                    <div className="text-right text-sm font-mono text-lime-400">{(r.finalBelief * 100).toFixed(0)}%</div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">{(r.finalHarm * 100).toFixed(0)}%</div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">{(r.finalFamily * 100).toFixed(0)}%</div>
                                    <div className="text-right text-sm font-mono text-lime-400">{r.cumulativeLoss.toFixed(1)}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the calibration table compares the predicted outcome regime against a reader-assigned expected regime for each scenario. close agreement means the model&apos;s shape matches a careful reading of how that kind of case typically resolves under the canonical weights.
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
                            {FIELD_LABELS[sweepField]} sweep · how final-state metrics respond as one weight moves through its range
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
                                        domain={[0, 100]}
                                    />
                                    <ReTooltip
                                        content={
                                            <ChartTooltip
                                                labelFormat={(l) => typeof l === 'number' ? l.toFixed(2) : String(l)}
                                                valueFormat={(v) => Number(v).toFixed(0)}
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
                                    <Line type="monotone" dataKey="finalBelief" stroke="#a3e635" strokeWidth={2} dot={false} name="belief" />
                                    <Line type="monotone" dataKey="finalHarm" stroke="#ea580c" strokeWidth={2} dot={false} name="harm" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="finalAttachment" stroke="#84cc16" strokeWidth={1.5} dot={false} name="attachment" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="finalFamily" stroke="#facc15" strokeWidth={1.5} dot={false} name="family" strokeDasharray="2 4" />
                                    <Line type="monotone" dataKey="finalTrust" stroke="#65a30d" strokeWidth={1.5} dot={false} name="trust" strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.finalFamily * 100}
                        outputLabel="final family integrity"
                    />

                    <CalibrationPanel results={calibration} outputLabel="final family integrity" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
