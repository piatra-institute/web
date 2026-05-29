'use client';

import React, { useState } from 'react';
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
import InvariantBar from '@/components/InvariantBar';

import {
    FIELD_KEYS,
    FIELD_LABELS,
    FIELD_SYMBOLS,
    LADDER,
    OBJECTS,
    OBJECT_DIM_KEYS,
    OBJECT_DIM_LABELS,
    STATUSES,
    statusOf,
    type ComparativeRow,
    type Metrics,
    type ObjectState,
    type Params,
    type Reading,
    type Snapshot,
    type SweepDatum,
    type SweepableField,
} from '../../logic';
import SalienceLadder from '../SalienceLadder';


type Tab = 'ladder' | 'object' | 'field' | 'objects' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'ladder', label: 'ladder' },
    { key: 'object', label: 'object' },
    { key: 'field', label: 'field' },
    { key: 'objects', label: 'objects' },
    { key: 'analysis', label: 'analysis' },
];

const INVARIANT_ROWS: { key: keyof Metrics; label: string }[] = [
    { key: 'salience', label: 'salience' },
    { key: 'overSalience', label: 'over-salience' },
    { key: 'attentionShare', label: 'attention share' },
    { key: 'concentration', label: 'concentration' },
    { key: 'meaning', label: 'meaning' },
    { key: 'stability', label: 'stability' },
];

interface ViewerProps {
    params: Params;
    metrics: Metrics;
    focal: ObjectState;
    field: ObjectState[];
    snapshot: Snapshot | null;
    reading: Reading;
    ranking: ComparativeRow[];
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
    focal,
    field,
    snapshot,
    reading,
    ranking,
    sweepField,
    onSweepFieldChange,
    sweep,
    sensitivityBars,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('ladder');

    const obj = OBJECTS[params.object];
    const status = statusOf(focal);
    const maxAttention = Math.max(...field.map((s) => s.attention), 0.0001);

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {obj.label} · climb {focal.climb} · {LADDER[focal.climb].title}
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            preset: <span className="text-lime-200/80">{params.preset}</span>
                            {' · '}regime: <span className="text-lime-200/80">{params.regime}</span>
                            {' · '}
                            <span className="italic" style={{ color: status.color }}>
                                {status.title}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>
                            salience: <span className="text-lime-400">{metrics.salience}</span>
                        </div>
                        <div>
                            over: <span className="text-lime-400">{metrics.overSalience}</span>
                        </div>
                        <div>
                            meaning: <span className="text-lime-400">{metrics.meaning}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {INVARIANT_ROWS.map((r) => (
                    <div key={r.key} className="border border-lime-500/20 p-3">
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">{r.label}</div>
                        <div className="text-lg font-mono text-lime-400 mt-1">{metrics[r.key]}</div>
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

            {tab === 'ladder' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        eight rungs from a neutral physical difference to an object that has become a world-filter · bar length is how strongly the focal object activates each rung · dashed orange traces a saved snapshot
                    </div>
                    <SalienceLadder focal={focal} objectKey={params.object} snapshot={snapshot} />
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">diagnosis</div>
                        <div className="text-sm text-lime-100 mt-2 leading-relaxed">
                            {reading.diagnosis}
                        </div>
                        <div className="border-l-2 border-lime-500/40 pl-3 mt-3">
                            <div className="text-base text-lime-200/90 italic leading-relaxed">
                                {reading.fieldNote}
                            </div>
                        </div>
                        <div className="text-[10px] text-lime-200/40 uppercase tracking-wider mt-3 font-mono">
                            {reading.compact}
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-4 space-y-3">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">invariants</div>
                        {INVARIANT_ROWS.map((r) => (
                            <InvariantBar
                                key={r.key}
                                label={r.label}
                                value={metrics[r.key]}
                                saved={snapshot ? snapshot.metrics[r.key] : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}

            {tab === 'object' && (
                <div className="space-y-4">
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-sm text-lime-400 font-semibold mb-1">{obj.label}</div>
                        <div className="text-xs text-lime-200/60 mb-3 italic">{obj.subtitle}</div>
                        <div className="text-sm text-lime-100/80 leading-relaxed">{obj.gloss}</div>
                    </div>
                    <div className="border border-lime-500/20 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-3">
                            object profile · eight intrinsic dimensions
                        </div>
                        <div className="space-y-2">
                            {OBJECT_DIM_KEYS.map((k) => (
                                <div key={k} className="grid grid-cols-[150px_1fr_32px] items-center gap-3">
                                    <div className="text-xs font-mono text-lime-200/70">
                                        {OBJECT_DIM_LABELS[k]}
                                    </div>
                                    <div className="relative h-3 bg-lime-500/5 border border-lime-500/15">
                                        <div
                                            className="h-full bg-lime-500/55"
                                            style={{ width: `${obj.profile[k]}%` }}
                                        />
                                    </div>
                                    <div className="text-right text-xs font-mono text-lime-400">
                                        {obj.profile[k]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                derived signals · current regime
                            </div>
                            <div className="space-y-1 text-[11px] font-mono text-lime-200/70">
                                <div className="flex justify-between">
                                    <span>prediction error</span>
                                    <span className="text-lime-400">{focal.predictionError}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>uncertainty</span>
                                    <span className="text-lime-400">{focal.uncertainty}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>attachment</span>
                                    <span className="text-lime-400">{focal.attachment}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>attention share</span>
                                    <span className="text-lime-400">{Math.round(focal.attention * 100)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-4">
                            <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                                expected vs predicted salience
                            </div>
                            <div className="flex items-end gap-6">
                                <div>
                                    <div className="text-2xl font-mono text-lime-400">{focal.salience}</div>
                                    <div className="text-[10px] text-lime-200/40 mt-1">predicted</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-mono text-lime-200/70">
                                        {obj.expectedSalience}
                                    </div>
                                    <div className="text-[10px] text-lime-200/40 mt-1">expected</div>
                                </div>
                            </div>
                            <div className="text-[10px] text-lime-200/40 mt-2">
                                expected status: {STATUSES[obj.expectedStatus].title}
                            </div>
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-3 text-[11px] text-lime-200/50 leading-relaxed">
                        {obj.source}
                    </div>
                </div>
            )}

            {tab === 'field' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        attention is a softmax over salience · low temperature makes the allocation winner-takes-most · the focal object is highlighted
                    </div>
                    <div className="border border-lime-500/20 p-4 space-y-2">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide mb-2">
                            attention allocation
                        </div>
                        {[...field]
                            .sort((a, b) => b.attention - a.attention)
                            .map((s) => {
                                const oc = statusOf(s).color;
                                const isFocal = s.key === params.object;
                                return (
                                    <div
                                        key={s.key}
                                        className="grid grid-cols-[150px_1fr_44px] items-center gap-3"
                                    >
                                        <div
                                            className={`text-xs font-mono ${
                                                isFocal ? 'text-lime-400' : 'text-lime-200/70'
                                            }`}
                                        >
                                            {OBJECTS[s.key].label}
                                        </div>
                                        <div className="relative h-5 bg-lime-500/5 border border-lime-500/15">
                                            <div
                                                className="h-full"
                                                style={{
                                                    width: `${(s.attention / maxAttention) * 100}%`,
                                                    backgroundColor: oc,
                                                    opacity: isFocal ? 0.8 : 0.4,
                                                }}
                                            />
                                        </div>
                                        <div className="text-right text-xs font-mono text-lime-400">
                                            {Math.round(s.attention * 100)}%
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                                concentration
                            </div>
                            <div className="text-lg font-mono text-lime-400 mt-1">
                                {metrics.concentration}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                                focal share
                            </div>
                            <div className="text-lg font-mono text-lime-400 mt-1">
                                {metrics.attentionShare}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                                temperature
                            </div>
                            <div className="text-lg font-mono text-lime-400 mt-1">
                                {params.temperature}
                            </div>
                        </div>
                        <div className="border border-lime-500/20 p-3">
                            <div className="text-[10px] text-lime-200/40 uppercase tracking-wide">
                                objects in field
                            </div>
                            <div className="text-lg font-mono text-lime-400 mt-1">{field.length}</div>
                        </div>
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        concentration is one minus the normalised entropy of the attention distribution. at 100 a single object has swallowed the field; near 0 attention is evenly spread. lowering temperature or raising one object&apos;s salience both push concentration up.
                    </div>
                </div>
            )}

            {tab === 'objects' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        all six objects under the current field, ranked by salience · the selected object is highlighted · this is the calibration in compact form
                    </div>
                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[1fr_70px_70px_70px] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>object</div>
                            <div className="text-right">salience</div>
                            <div className="text-right">over</div>
                            <div className="text-right">attention</div>
                        </div>
                        {ranking.map((r) => {
                            const active = r.key === params.object;
                            const rc = STATUSES[r.statusIndex].color;
                            return (
                                <div
                                    key={r.key}
                                    className={`grid grid-cols-[1fr_70px_70px_70px] gap-2 px-3 py-2 border-b border-lime-500/10 last:border-b-0 items-center ${
                                        active ? 'bg-lime-500/10' : ''
                                    }`}
                                >
                                    <div>
                                        <div className={`text-sm ${active ? 'text-lime-400' : 'text-lime-100/80'}`}>
                                            {r.label}
                                        </div>
                                        <div
                                            className="text-[10px] italic"
                                            style={{ color: rc }}
                                        >
                                            {STATUSES[r.statusIndex].title} · climb {r.climb}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm font-mono text-lime-400">
                                        {r.salience}
                                    </div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">
                                        {r.overSalience}
                                    </div>
                                    <div className="text-right text-sm font-mono text-lime-200/70">
                                        {r.attention}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the same eight-weight field acts on every object. differences in salience come only from each object&apos;s intrinsic profile and from the signal regime. a high-cognition, low-reward object like a possible rival can still outrank a pure incentive cue: salience is not the same as liking.
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
                            {FIELD_LABELS[sweepField]} ({FIELD_SYMBOLS[sweepField]}) sweep · how the six metrics respond as one field weight is swept while the others are held
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
                                        tickFormatter={(v: number) => v.toFixed(0)}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ReTooltip content={<ChartTooltip />} />
                                    <ReferenceLine
                                        x={Math.round(params[sweepField])}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="salience" stroke="#a3e635" strokeWidth={2.5} dot={false} name="salience" />
                                    <Line type="monotone" dataKey="overSalience" stroke="#ea580c" strokeWidth={2} dot={false} name="over-salience" />
                                    <Line type="monotone" dataKey="meaning" stroke="#84cc16" strokeWidth={1.5} dot={false} name="meaning" strokeDasharray="6 3" />
                                    <Line type="monotone" dataKey="concentration" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="concentration" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="attentionShare" stroke="#facc15" strokeWidth={1.5} dot={false} name="attention" strokeDasharray="2 4" />
                                    <Line type="monotone" dataKey="stability" stroke="#65a30d" strokeWidth={1.5} dot={false} name="stability" strokeDasharray="5 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <SensitivityAnalysis
                        bars={sensitivityBars}
                        baseline={metrics.salience}
                        outputLabel="salience"
                    />

                    <CalibrationPanel results={calibration} outputLabel="salience" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
