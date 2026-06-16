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
import SensitivityAnalysis from '@/components/SensitivityAnalysis';
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import ChartTooltip from '@/components/ChartTooltip';

import {
    INTEREST_MODELS,
    KIND_LABEL,
    KIND_ORDER,
    SCENARIOS,
    SCENARIO_KEYS,
    SWEEP_LEVERS,
    computeModelMatrix,
    computeSensitivity,
    computeSweep,
    type DomainKind,
    type Params,
    type ScenarioMetric,
    type SweepLever,
} from '../../logic';


type Tab = 'misalignment' | 'decomposition' | 'models' | 'sensitivity' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'misalignment', label: 'misalignment' },
    { key: 'decomposition', label: 'decomposition' },
    { key: 'models', label: 'interest models' },
    { key: 'sensitivity', label: 'sensitivity' },
    { key: 'analysis', label: 'analysis' },
];

const SCENARIO_COLOR: Record<string, string> = {
    lgbtq: '#a3e635',
    muslim: '#facc15',
    latino: '#38bdf8',
};

const KIND_TINT: Record<DomainKind, string> = {
    rights: 'text-lime-300',
    security: 'text-amber-300',
    material: 'text-sky-300',
    expressive: 'text-fuchsia-300',
    institutional: 'text-lime-200',
};


interface ViewerProps {
    params: Params;
    onParamsChange: (p: Params) => void;
    metrics: ScenarioMetric[];
    focus: ScenarioMetric | undefined;
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}


function fmt(x: number): string {
    return x.toFixed(3);
}


export default function Viewer({
    params,
    onParamsChange,
    metrics,
    focus,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('misalignment');
    const [lever, setLever] = useState<SweepLever>('tolerance');

    const matrix = useMemo(() => computeModelMatrix(params), [params]);
    const sweep = useMemo(() => computeSweep(params, lever), [params, lever]);
    const sensitivity = useMemo(
        () => (focus ? computeSensitivity(SCENARIOS[focus.id], params) : { bars: [], baseline: 0 }),
        [focus, params],
    );

    const sorted = useMemo(() => [...metrics].sort((a, b) => b.display - a.display), [metrics]);
    const maxScale = useMemo(
        () => Math.max(0.001, ...metrics.map((m) => Math.max(m.display, m.interval.high))),
        [metrics],
    );

    const modeLabel = `${params.net ? 'net' : 'gross'} · ${params.populationWeighted ? 'population-weighted' : 'per supporter'}`;
    const leverLabel = SWEEP_LEVERS.find((l) => l.key === lever)?.label ?? lever;

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">
                            {INTEREST_MODELS[params.interestModel].label} interest model
                        </div>
                        <div className="text-lime-200/60 text-xs mt-1 max-w-[660px] leading-relaxed">
                            synthetic, illustrative scoring of rights-dependence voting misalignment. each case is a group
                            supporting a coalition coded hostile on its domains; the ranking is an artifact of the chosen
                            assumptions, not a verdict about real voters.
                        </div>
                    </div>
                    {focus && (
                        <div className="flex gap-5 text-xs font-mono text-lime-200/60">
                            <div>{focus.label}: <span className="text-lime-400">{fmt(focus.display)}</span></div>
                            <div>rank: <span className="text-lime-400">#{focus.rank}</span></div>
                        </div>
                    )}
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

            {tab === 'misalignment' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        {modeLabel} · click a bar to focus that case · the faint band is the 90% interval
                    </div>
                    <div className="space-y-3">
                        {sorted.map((m) => {
                            const color = SCENARIO_COLOR[m.id] ?? '#a3e635';
                            const widthPct = (m.display / maxScale) * 100;
                            const lowPct = (m.interval.low / maxScale) * 100;
                            const bandPct = ((m.interval.high - m.interval.low) / maxScale) * 100;
                            const active = m.id === params.focusScenario;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => onParamsChange({ ...params, focusScenario: m.id })}
                                    className={`w-full text-left border p-3 transition-colors cursor-pointer ${
                                        active ? 'border-lime-500/60 bg-lime-500/5' : 'border-lime-500/20 hover:border-lime-500/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-lime-100">
                                            {m.group} <span className="text-lime-200/40">#{m.rank}</span>
                                        </span>
                                        <span className="font-mono text-lime-400">{fmt(m.display)}</span>
                                    </div>
                                    <div className="h-4 relative bg-lime-500/5 border border-lime-500/10">
                                        {params.showUncertainty && (
                                            <div
                                                className="absolute top-0 bottom-0 bg-lime-200/10"
                                                style={{ left: `${lowPct}%`, width: `${Math.max(bandPct, 0.5)}%` }}
                                            />
                                        )}
                                        <div
                                            className="absolute top-0.5 bottom-0.5 left-0"
                                            style={{ width: `${Math.max(widthPct, 0.5)}%`, backgroundColor: color, opacity: 0.65 }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-lime-200/40 font-mono mt-1">
                                        <span>vote share {(SCENARIOS[m.id].voteShare * 100).toFixed(0)}%</span>
                                        {params.showUncertainty && <span>90%: {fmt(m.interval.low)} &ndash; {fmt(m.interval.high)}</span>}
                                        {m.dominantDomain && <span>top: {m.dominantDomain.label}</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="border-l-2 border-lime-500/40 pl-3 text-[11px] text-lime-200/70 leading-relaxed">
                        the small high-exposure case and the large low-exposure case can swap order between per-supporter and
                        population-weighted, and again between interest models. that instability is the finding, not a bug.
                    </div>
                </div>
            )}

            {tab === 'decomposition' && focus && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        {focus.group} · per-domain breakdown under the {INTEREST_MODELS[params.interestModel].label} model
                    </div>
                    <div className="border border-lime-500/20">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-lime-200/40 font-mono uppercase tracking-wide text-[10px]">
                                    <th className="text-left p-2">domain</th>
                                    <th className="text-left p-2">kind</th>
                                    <th className="text-right p-2">priority risk</th>
                                    <th className="text-right p-2">benefit</th>
                                    <th className="text-right p-2">net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {focus.contributions.map((d) => (
                                    <tr key={d.domainId} className="border-t border-lime-500/10">
                                        <td className="p-2 text-lime-100">{d.label}</td>
                                        <td className={`p-2 ${KIND_TINT[d.kind]}`}>{KIND_LABEL[d.kind]}</td>
                                        <td className="p-2 text-right font-mono text-lime-200/70">{fmt(d.priorityRisk)}</td>
                                        <td className="p-2 text-right font-mono text-lime-200/50">{fmt(d.benefit)}</td>
                                        <td className="p-2 text-right font-mono text-lime-400">{fmt(d.netContribution)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="space-y-2">
                        {focus.contributions.map((d) => {
                            const maxPr = Math.max(0.001, ...focus.contributions.map((c) => c.priorityRisk));
                            return (
                                <div key={d.domainId} className="flex items-center gap-2 text-[11px]">
                                    <span className="w-44 truncate text-lime-200/60 shrink-0">{d.label}</span>
                                    <div className="flex-1 h-3 bg-lime-500/5 border border-lime-500/10 relative">
                                        <div className="absolute top-0 bottom-0 left-0 bg-lime-500/40" style={{ width: `${(d.priorityRisk / maxPr) * 100}%` }} />
                                    </div>
                                    <span className="w-12 text-right font-mono text-lime-200/50">{fmt(d.priorityRisk)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Metric label="gross / supporter" value={fmt(focus.grossPerSupporter)} note="raw priority risk" />
                        <Metric label="net / supporter" value={fmt(focus.netPerSupporter)} note="after benefit, τ, weights" />
                        <Metric label="population-weighted" value={fmt(focus.populationWeighted)} note="× vote share" />
                        <Metric label="vote share" value={`${(SCENARIOS[focus.id].voteShare * 100).toFixed(0)}%`} note="of the group" />
                        <Metric
                            label="disillusionment"
                            value={`${(focus.regret * 100).toFixed(0)} pts`}
                            note="illustrative approval drop"
                            tone={focus.regret > 0.1 ? 'warn' : 'ok'}
                        />
                        <Metric label="rank" value={`#${focus.rank} / ${metrics.length}`} note="current ordering" />
                    </div>
                </div>
            )}

            {tab === 'models' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        population-weighted net score for every case under every interest model · the top case is highlighted per row
                    </div>
                    <div className="border border-lime-500/20 overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-lime-200/40 font-mono uppercase tracking-wide text-[10px]">
                                    <th className="text-left p-2">interest model</th>
                                    {SCENARIO_KEYS.map((sk) => (
                                        <th key={sk} className="text-right p-2">{SCENARIOS[sk].label}</th>
                                    ))}
                                    <th className="text-left p-2 pl-4">top case</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((row) => (
                                    <tr
                                        key={row.key}
                                        className={`border-t border-lime-500/10 ${row.key === params.interestModel ? 'bg-lime-500/5' : ''}`}
                                    >
                                        <td className="p-2 text-lime-100">{row.label}</td>
                                        {SCENARIO_KEYS.map((sk) => {
                                            const isTop = SCENARIOS[sk].label === row.topScenario;
                                            return (
                                                <td key={sk} className={`p-2 text-right font-mono ${isTop ? 'text-lime-400' : 'text-lime-200/50'}`}>
                                                    {fmt(row.scores[sk] ?? 0)}
                                                </td>
                                            );
                                        })}
                                        <td className="p-2 pl-4 text-lime-300">{row.topScenario}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-wide text-lime-200/40 mb-2">
                            weight profile · {INTEREST_MODELS[params.interestModel].label}
                        </div>
                        <div className="space-y-1.5">
                            {KIND_ORDER.map((kind) => {
                                const w = INTEREST_MODELS[params.interestModel].weights[kind];
                                return (
                                    <div key={kind} className="flex items-center gap-2 text-[11px]">
                                        <span className="w-36 text-lime-200/60 shrink-0">{KIND_LABEL[kind]}</span>
                                        <div className="flex-1 h-3 bg-lime-500/5 border border-lime-500/10 relative">
                                            <div className="absolute top-0 bottom-0 left-0 bg-lime-500/40" style={{ width: `${w * 100}%` }} />
                                        </div>
                                        <span className="w-10 text-right font-mono text-lime-200/50">{w.toFixed(1)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="border-l-2 border-lime-500/40 pl-3 text-[11px] text-lime-200/70 leading-relaxed">
                        if the top case is the same in every row, the misalignment claim is robust to the definition of interest.
                        where it changes, the claim depends entirely on which interest you privilege.
                    </div>
                </div>
            )}

            {tab === 'sensitivity' && focus && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        {focus.group} · net per-supporter score · each assumption family swept min&rarr;max with the others held
                    </div>
                    <SensitivityAnalysis bars={sensitivity.bars} baseline={sensitivity.baseline} outputLabel="net misalignment" />
                    <div className="border-l-2 border-lime-500/40 pl-3 text-[11px] text-lime-200/70 leading-relaxed">
                        the longest bars are the assumptions the conclusion rests on. if a controversial score depends mostly on one
                        hand-set assumption, that is exactly what the sensitivity view is meant to expose.
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            sweep · population-weighted net score for each case as one lever moves across its range
                        </div>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                            {SWEEP_LEVERS.map((l) => (
                                <button
                                    key={l.key}
                                    onClick={() => setLever(l.key)}
                                    className={`px-2 py-1 text-[11px] border transition-colors cursor-pointer ${
                                        lever === l.key ? 'border-lime-500 bg-lime-500/10 text-lime-400' : 'border-lime-500/20 text-lime-200/60 hover:border-lime-500/40'
                                    }`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height={300} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis dataKey="value" tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} type="number" domain={['dataMin', 'dataMax']} />
                                    <YAxis tick={{ fill: '#a3e635', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 'dataMax']} />
                                    <ReTooltip
                                        content={
                                            <ChartTooltip
                                                labelFormat={(l) => (typeof l === 'number' ? `${leverLabel} ${l.toFixed(0)}` : String(l))}
                                                valueFormat={(v) => Number(v).toFixed(3)}
                                            />
                                        }
                                    />
                                    {SCENARIO_KEYS.map((sk) => (
                                        <Line
                                            key={sk}
                                            type="monotone"
                                            dataKey={sk}
                                            stroke={SCENARIO_COLOR[sk] ?? '#a3e635'}
                                            strokeWidth={2}
                                            dot={false}
                                            name={SCENARIOS[sk].label}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-[10px] text-lime-200/40 font-mono mt-1">
                            {SCENARIO_KEYS.map((sk) => SCENARIOS[sk].label).join(' · ')} · sweeping {leverLabel}
                        </div>
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="worked example" />

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
            <div className={`text-lg font-mono mt-1 ${tone === 'warn' ? 'text-orange-400' : 'text-lime-400'}`}>{value}</div>
            <div className="text-[10px] text-lime-200/40 mt-1 leading-relaxed">{note}</div>
        </div>
    );
}
