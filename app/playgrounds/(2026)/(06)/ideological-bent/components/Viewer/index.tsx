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
} from 'recharts';

import AssumptionPanel, { Assumption } from '@/components/AssumptionPanel';
import CalibrationPanel, { CalibrationResult } from '@/components/CalibrationPanel';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import ChartTooltip from '@/components/ChartTooltip';
import Dropdown from '@/components/Dropdown';

import {
    baselineDist,
    computeSweep,
    distTotal,
    normalizeDist,
    type Actor,
    type DiagnosisResult,
    type EvidenceDebt,
    type Metrics,
    type Params,
    type Scenario,
} from '../../logic';
import CausalMap from '../CausalMap';


type Tab = 'forecast' | 'diagnostics' | 'causal' | 'timeline' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'forecast', label: 'forecast board' },
    { key: 'diagnostics', label: 'diagnostics' },
    { key: 'causal', label: 'causal map' },
    { key: 'timeline', label: 'timeline' },
    { key: 'analysis', label: 'analysis' },
];


interface ViewerProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    scenario: Scenario;
    metrics: Metrics;
    diagnosis: DiagnosisResult;
    evidenceDebt: EvidenceDebt;
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}


function pct(x: number): number {
    return Math.round(x * 100);
}

function fmtMult(x: number): string {
    if (!isFinite(x)) return '∞';
    if (x >= 100) return `${x.toFixed(0)}x`;
    if (x >= 10) return `${x.toFixed(1)}x`;
    return `${x.toFixed(2)}x`;
}

function actorLabel(actor: Actor, blind: boolean): string {
    return blind ? actor.blind : actor.name;
}


export default function Viewer({
    params,
    onParamsChange,
    scenario,
    metrics,
    diagnosis,
    evidenceDebt,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('forecast');
    const [sweepId, setSweepId] = useState<string>(scenario.assumptions[1]?.id ?? scenario.assumptions[0].id);

    const baselines = useMemo(() => {
        const out: Record<string, Record<string, number>> = {};
        for (const a of scenario.actors) out[a.id] = baselineDist(scenario, a.id, params.assumptions);
        return out;
    }, [scenario, params.assumptions]);

    const sweep = useMemo(() => computeSweep(scenario, params, sweepId), [scenario, params, sweepId]);

    const setUser = (actorId: string, outcomeId: string, value: number) => {
        onParamsChange({
            ...params,
            user: {
                ...params.user,
                [actorId]: { ...params.user[actorId], [outcomeId]: Math.max(0, Math.min(1, value)) },
            },
        });
    };

    const normalizeActor = (actorId: string) => {
        onParamsChange({
            ...params,
            user: { ...params.user, [actorId]: normalizeDist(params.user[actorId], scenario.outcomes) },
        });
    };

    const copyBaseline = (actorId: string) => {
        onParamsChange({
            ...params,
            user: { ...params.user, [actorId]: { ...baselines[actorId] } },
        });
    };

    const toggleReason = (id: string) => {
        const has = params.selectedReasons.includes(id);
        onParamsChange({
            ...params,
            selectedReasons: has ? params.selectedReasons.filter((r) => r !== id) : [...params.selectedReasons, id],
        });
    };

    const focusActor = scenario.actors.find((a) => a.id === params.focusActor) ?? scenario.actors[1];
    const sweepLabel = scenario.assumptions.find((a) => a.id === sweepId)?.label ?? sweepId;

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">{scenario.title}</div>
                        <div className="text-lime-200/60 text-xs mt-1 max-w-[640px] leading-relaxed">
                            same facts, different actor. allocate probabilities, then read how far your forecast bends from the
                            baseline under the actor swap.
                        </div>
                    </div>
                    <div className="flex gap-5 text-xs font-mono text-lime-200/60">
                        <div>bent: <span className={metrics.bentScore > 0.55 || metrics.bentScore < -0.55 ? 'text-orange-400' : 'text-lime-400'}>{metrics.bentScore.toFixed(2)}</span></div>
                        <div>IDR: <span className={metrics.idr > 1.25 ? 'text-orange-400' : 'text-lime-400'}>{metrics.idr.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>

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

            {tab === 'forecast' && (
                <div className="space-y-4">
                    <div className="flex gap-4 text-[11px] text-lime-200/50">
                        <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1.5 bg-lime-500/30 inline-block" /> baseline model</span>
                        <span className="inline-flex items-center gap-1.5"><span className="w-4 h-1.5 bg-lime-400 inline-block" /> your forecast</span>
                    </div>
                    <div className="border-l-2 border-lime-500/40 pl-3 text-xs text-lime-200/70 leading-relaxed">
                        {scenario.instruction}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scenario.actors.map((actor) => {
                            const base = baselines[actor.id];
                            const user = params.user[actor.id] || base;
                            const total = distTotal(user, scenario.outcomes);
                            const totalOk = Math.abs(total - 1) < 0.005;
                            return (
                                <div key={actor.id} className="border border-lime-500/20">
                                    <div className="flex items-center justify-between gap-3 p-3 border-b border-lime-500/20">
                                        <div>
                                            <div className="text-sm text-lime-300 font-semibold">{actorLabel(actor, params.blind)}</div>
                                            <div className="text-[11px] text-lime-200/50 mt-0.5">
                                                {params.blind ? 'traits hidden until reveal' : actor.traits}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-lime-200/40 border border-lime-500/20 px-1.5 py-0.5">
                                            {params.blind ? 'blind' : 'actor'}
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-3">
                                        {scenario.outcomes.map((o) => {
                                            const bp = base[o.id] || 0;
                                            const up = user[o.id] || 0;
                                            return (
                                                <div key={o.id} className="grid grid-cols-[1fr_64px] gap-3 items-center">
                                                    <div>
                                                        <div className="text-xs text-lime-100/80">{o.label}</div>
                                                        <div className="mt-1 h-2 bg-lime-500/5 border border-lime-500/15 relative overflow-hidden">
                                                            <div className="absolute inset-y-0 left-0 bg-lime-500/30" style={{ width: `${pct(bp)}%` }} />
                                                            <div className="absolute left-0 top-0 h-1 bg-lime-400" style={{ width: `${pct(up)}%` }} />
                                                        </div>
                                                        <div className="text-[10px] text-lime-200/40 mt-0.5 font-mono">baseline {pct(bp)}%</div>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        value={pct(up)}
                                                        onChange={(e) => setUser(actor.id, o.id, Number(e.target.value) / 100)}
                                                        className="w-16 text-right text-xs font-mono text-lime-100 border border-lime-500/30 px-1.5 py-1 appearance-none focus:outline-none focus:border-lime-500/60"
                                                        style={{ backgroundColor: '#000' }}
                                                    />
                                                </div>
                                            );
                                        })}
                                        <div className="flex items-center justify-between border-t border-lime-500/20 pt-2 text-xs">
                                            <span className="text-lime-200/50">total</span>
                                            <span className={`font-mono ${totalOk ? 'text-lime-400' : 'text-orange-400'}`}>{(total * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => normalizeActor(actor.id)} className="flex-1 py-1 text-[11px] border border-lime-500/20 text-lime-200/60 hover:border-lime-500/40 cursor-pointer">normalize to 100</button>
                                            <button onClick={() => copyBaseline(actor.id)} className="flex-1 py-1 text-[11px] border border-lime-500/20 text-lime-200/60 hover:border-lime-500/40 cursor-pointer">copy baseline</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {tab === 'diagnostics' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-1">focus actor</div>
                            <Dropdown
                                name="actor"
                                selected={actorLabel(focusActor, params.blind)}
                                selectables={scenario.actors.map((a) => actorLabel(a, params.blind))}
                                atSelect={(label) => {
                                    const a = scenario.actors.find((ac) => actorLabel(ac, params.blind) === label);
                                    if (a) onParamsChange({ ...params, focusActor: a.id });
                                }}
                            />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-1">focus outcome</div>
                            <Dropdown
                                name="outcome"
                                selected={scenario.outcomes.find((o) => o.id === params.focusOutcome)?.label ?? ''}
                                selectables={scenario.outcomes.map((o) => o.label)}
                                atSelect={(label) => {
                                    const o = scenario.outcomes.find((oc) => oc.label === label);
                                    if (o) onParamsChange({ ...params, focusOutcome: o.id });
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Metric label="baseline" value={`${pct(metrics.baselineFocus)}%`} note="model probability" />
                        <Metric label="your forecast" value={`${pct(metrics.userFocus)}%`} note="same branch" />
                        <Metric label="identity LR" value={fmtMult(metrics.ilr)} note="odds multiplier you imply" />
                        <Metric label="bent score" value={metrics.bentScore.toFixed(2)} note="actor effect vs baseline" tone={Math.abs(metrics.bentScore) > 0.55 ? 'warn' : 'ok'} />
                    </div>

                    <div className="border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed">
                        <span className="text-amber-300 font-semibold">{diagnosis.headline}</span>{' '}
                        <span className="text-lime-200/80">{diagnosis.detail}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Metric label="brittleness (JS)" value={metrics.brittleness.toFixed(3)} note="actor distance vs baseline" tone={Math.abs(metrics.brittleness) > 0.1 ? 'warn' : 'ok'} />
                        <Metric label="identity dominance" value={metrics.idr.toFixed(2)} note="label vs fact sensitivity" tone={metrics.idr > 1.25 ? 'warn' : 'ok'} />
                        <Metric label="inadmissibility" value={`${metrics.inadmissibilityBits.toFixed(2)} bits`} note="suppression of this branch" tone={metrics.inadmissibilityBits > 2 ? 'warn' : 'ok'} />
                    </div>

                    <div className="border border-lime-500/20 p-3 space-y-2">
                        <div className="text-xs text-lime-400 font-semibold">evidence debt</div>
                        <div className="text-[11px] text-lime-200/50 leading-relaxed">
                            select the reasons that would justify moving from the baseline to your forecast. the app compares their
                            rough odds support with the multiplier your deviation requires.
                        </div>
                        {scenario.reasons.map((r) => (
                            <label key={r.id} className="flex items-start gap-2 text-xs cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={params.selectedReasons.includes(r.id)}
                                    onChange={() => toggleReason(r.id)}
                                    className="mt-0.5 accent-lime-500"
                                />
                                <span className="flex-1 text-lime-200/70">{r.label}</span>
                                <span className="font-mono text-lime-400">{r.mult.toFixed(1)}x</span>
                            </label>
                        ))}
                        <div className="border-l-2 border-lime-500/40 pl-3 text-[11px] text-lime-200/70 leading-relaxed">
                            {evidenceDebt.suppressing ? (
                                <>your forecast suppresses the baseline odds by <span className="text-lime-300">{fmtMult(evidenceDebt.suppression)}</span>. what evidence makes this branch less likely than the baseline?</>
                            ) : (
                                <>your upward deviation needs <span className="text-lime-300">{fmtMult(evidenceDebt.requiredSupport)}</span> of odds support; selected reasons supply about <span className="text-lime-300">{fmtMult(evidenceDebt.suppliedSupport)}</span>.{' '}
                                    {evidenceDebt.gap > 1.25 ? <>unexplained evidence debt: <span className="text-orange-300">{fmtMult(evidenceDebt.gap)}</span>.</> : <>the reasons roughly cover the required support.</>}</>
                            )}
                        </div>
                    </div>

                    <div className="border border-lime-500/20">
                        <div className="px-3 py-2 text-xs text-lime-400 font-semibold border-b border-lime-500/20">assumption sensitivity (baseline, focus branch)</div>
                        <div className="divide-y divide-lime-500/10">
                            {scenario.sensitivity.map((row) => {
                                const p = baselineDist(scenario, params.focusActor, { ...params.assumptions, ...row.set })[params.focusOutcome];
                                return (
                                    <div key={row.label} className="flex items-center justify-between px-3 py-2 text-xs">
                                        <span className="text-lime-200/70">{row.label}</span>
                                        <span className="font-mono text-lime-400">{pct(p)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'causal' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the actor label is one cause among many · separate it from threat, classified signal, agency pressure,
                        legal tools, and geopolitics
                    </div>
                    <div className="flex justify-center border border-lime-500/20 p-4">
                        <CausalMap />
                    </div>
                    <div className="border-l-2 border-lime-500/40 pl-3 text-xs text-lime-200/70 leading-relaxed">
                        the dangerous move is &ldquo;my opponent did X, so my side would never do X.&rdquo; the useful move asks
                        which part of the outcome came from the actor, which from state capacity, agency incentives, legal tools,
                        the underlying threat, and international pressure. the actor trait is a single arrow into Y, not the whole
                        graph.
                    </div>
                </div>
            )}

            {tab === 'timeline' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        a timeline breaks a vague claim into decision nodes, so a review, a limited strike, and a full war are not
                        treated as one thing
                    </div>
                    {scenario.timeline.map(([node, text]) => (
                        <div key={node} className="flex items-center justify-between gap-3 border border-lime-500/20 px-3 py-2 text-xs">
                            <span className="text-lime-200/80"><span className="text-lime-300 font-semibold">{node}:</span> {text}</span>
                            <span className="font-mono text-lime-200/40">locked</span>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            assumption sweep · how each actor&apos;s baseline probability for the focus branch responds as one fact
                            is moved from low to high
                        </div>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                            {scenario.assumptions.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setSweepId(a.id)}
                                    className={`px-2 py-1 text-[11px] border transition-colors cursor-pointer ${
                                        sweepId === a.id ? 'border-lime-500 bg-lime-500/10 text-lime-400' : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    {a.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis dataKey="value" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} type="number" domain={[0, 100]} />
                                    <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <ReTooltip
                                        content={
                                            <ChartTooltip
                                                labelFormat={(l) => (typeof l === 'number' ? `${sweepLabel} ${l.toFixed(0)}` : String(l))}
                                                valueFormat={(v) => `${Number(v).toFixed(1)}%`}
                                            />
                                        }
                                    />
                                    <Line type="monotone" dataKey="actorA" stroke="#a3e635" strokeWidth={2} dot={false} name={actorLabel(scenario.actors[0], params.blind)} />
                                    <Line type="monotone" dataKey="actorB" stroke="#facc15" strokeWidth={1.5} dot={false} name={actorLabel(scenario.actors[1], params.blind)} strokeDasharray="6 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-lime-200/40 font-mono mt-1">
                            solid: {actorLabel(scenario.actors[0], params.blind)} · dashed: {actorLabel(scenario.actors[1], params.blind)} · focus branch: {scenario.outcomes.find((o) => o.id === params.focusOutcome)?.label}
                        </div>
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="formula checks" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}


function Metric({ label, value, note, tone = 'ok' }: { label: string; value: string; note: string; tone?: 'ok' | 'warn' }) {
    return (
        <div className="border border-lime-500/20 p-3">
            <div className="text-[10px] uppercase tracking-wide text-lime-200/40">{label}</div>
            <div className={`text-xl font-mono mt-1 ${tone === 'warn' ? 'text-orange-400' : 'text-lime-400'}`}>{value}</div>
            <div className="text-[10px] text-lime-200/40 mt-1 leading-relaxed">{note}</div>
        </div>
    );
}
