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
import VersionSelector, { ModelVersion } from '@/components/VersionSelector';
import ChartTooltip from '@/components/ChartTooltip';
import Equation from '@/components/Equation';

import {
    CONTRONYMS,
    chosenAttractor,
    lexiconRows,
    type Metrics,
    type Params,
    type SweepDatum,
} from '../../logic';
import SemanticMap from '../SemanticMap';


type Tab = 'map' | 'operator' | 'lexicon' | 'analysis';

const TABS: { key: Tab; label: string }[] = [
    { key: 'map', label: 'map' },
    { key: 'operator', label: 'operator' },
    { key: 'lexicon', label: 'lexicon' },
    { key: 'analysis', label: 'analysis' },
];


interface ViewerProps {
    params: Params;
    metrics: Metrics;
    sweep: SweepDatum[];
    calibration: CalibrationResult[];
    assumptions: Assumption[];
    versions: ModelVersion[];
}


export default function Viewer({
    params,
    metrics,
    sweep,
    calibration,
    assumptions,
    versions,
}: ViewerProps) {
    const [tab, setTab] = useState<Tab>('map');

    const word = CONTRONYMS[params.word];
    const chosen = chosenAttractor(params);
    const rows = lexiconRows();

    return (
        <div className="w-[90vw] h-[90vh] max-w-[1100px] overflow-y-auto space-y-6 outline-none [&_*]:outline-none text-lime-100">
            <div className="flex items-center justify-between gap-4">
                <VersionSelector versions={versions} active={versions[0]?.id ?? ''} />
            </div>

            <div className="border border-lime-500/30 p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="font-semibold text-sm text-lime-400">{word.label}</div>
                        <div className="text-lime-200/60 text-xs mt-1">
                            operator <span className="italic text-lime-200/80">{word.operator}</span>
                            {' · '}A <span className="text-lime-200/80">{word.a.title}</span>
                            {' · '}B <span className="text-lime-200/80">{word.b.title}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono text-lime-200/60">
                        <div>polarity: <span className="text-lime-400">{metrics.polarity.toFixed(0)}</span></div>
                        <div>conf: <span className="text-lime-400">{metrics.confidence}%</span></div>
                        <div>
                            basin:{' '}
                            <span className="text-lime-400">
                                {metrics.contradiction ? 'collapsed' : metrics.basin === 'none' ? 'undetermined' : metrics.basin}
                            </span>
                        </div>
                    </div>
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

            {tab === 'map' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        a point moving between two semantic attractors · context selects a basin · in collapse mode both basins are forced into one slot and the reading turns contradictory
                    </div>
                    <SemanticMap
                        polarity={metrics.polarity}
                        collapse={metrics.contradiction}
                        labelA={word.a.title}
                        labelB={word.b.title}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            className={`border p-4 ${
                                !metrics.contradiction && metrics.basin === 'A'
                                    ? 'border-lime-500 bg-lime-500/5'
                                    : 'border-lime-500/20'
                            }`}
                        >
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40">attractor A</div>
                            <div className="text-sm text-lime-300 mt-1">{word.a.title}</div>
                            <div className="text-xs text-lime-200/60 mt-1 leading-relaxed">{word.a.desc}</div>
                        </div>
                        <div
                            className={`border p-4 ${
                                !metrics.contradiction && metrics.basin === 'B'
                                    ? 'border-amber-500 bg-amber-500/5'
                                    : 'border-lime-500/20'
                            }`}
                        >
                            <div className="text-[10px] uppercase tracking-wide text-lime-200/40">attractor B</div>
                            <div className="text-sm text-amber-300 mt-1">{word.b.title}</div>
                            <div className="text-xs text-lime-200/60 mt-1 leading-relaxed">{word.b.desc}</div>
                        </div>
                    </div>
                    <div className="border border-lime-500/30 p-4">
                        <div className="text-xs text-lime-200/40 uppercase tracking-wide">current reading</div>
                        {metrics.contradiction ? (
                            <div className="text-sm text-orange-300 mt-2 leading-relaxed">
                                apparent contradiction: {word.label} = {'{'} {word.a.title} {'}'} and {'{'} {word.b.title} {'}'}. P and not-P, only because the context index was deleted.
                            </div>
                        ) : chosen ? (
                            <div className="text-sm text-lime-100 mt-2 leading-relaxed">
                                {chosen.title}: selected with about {metrics.confidence}% confidence.
                            </div>
                        ) : (
                            <div className="text-sm text-lime-200/70 mt-2 leading-relaxed">
                                underdetermined: the current context does not strongly select either basin.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'operator' && (
                <div className="space-y-4">
                    <div className="text-xs text-lime-200/60 font-mono">
                        the formal shape · a contronym as a function from context to polarity
                    </div>
                    <div className="border border-lime-500/30 p-4 space-y-3">
                        <Equation mode="block" math="M(w, c) = f_w(c)" />
                        <div className="text-sm text-lime-200/80 leading-relaxed">
                            the token <span className="font-mono text-lime-300">{word.label}</span> carries one deep
                            operation, <span className="italic">{word.operator}</span>. context{' '}
                            <Equation math="c" /> supplies the direction:
                        </div>
                        <Equation
                            mode="block"
                            math={`\\exists\\, c_1, c_2 : M(w, c_1) = P,\\ M(w, c_2) = \\lnot P`}
                        />
                        <div className="border-l-2 border-lime-500/40 pl-3">
                            <div className="text-sm text-lime-200/80 leading-relaxed">
                                but never <Equation math="M(w, c) = P \land \lnot P" /> at one and the same context.
                                the contradiction is a property of the collapsed representation, not of the word.
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {word.contexts.map((c, i) => (
                            <div
                                key={c.name}
                                className={`border p-3 ${
                                    i === params.contextIndex ? 'border-lime-500 bg-lime-500/5' : 'border-lime-500/20'
                                }`}
                            >
                                <div className="text-xs text-lime-300">{c.name}</div>
                                <div className="text-[10px] text-lime-200/40 font-mono mt-1">
                                    pull {c.score > 0 ? '+' : ''}{c.score} {' '}
                                    {c.score < 0 ? '→ A' : c.score > 0 ? '→ B' : '→ middle'}
                                </div>
                                <div className="text-[10px] text-lime-200/50 mt-1">
                                    cues: {c.hints.slice(0, 4).join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'lexicon' && (
                <div className="space-y-3">
                    <div className="text-xs text-lime-200/60 font-mono">
                        every contronym as one deep operator with two opposed surface meanings · the active word is highlighted
                    </div>
                    <div className="border border-lime-500/20">
                        <div className="grid grid-cols-[90px_1fr_1fr_1fr] gap-2 px-3 py-2 border-b border-lime-500/20 text-[10px] uppercase tracking-wide text-lime-200/40">
                            <div>word</div>
                            <div>deep operator</div>
                            <div>meaning A</div>
                            <div>meaning B</div>
                        </div>
                        {rows.map((r) => {
                            const active = r.key === params.word;
                            return (
                                <div
                                    key={r.key}
                                    className={`grid grid-cols-[90px_1fr_1fr_1fr] gap-2 px-3 py-2 border-b border-lime-500/10 last:border-b-0 items-center ${
                                        active ? 'bg-lime-500/10' : ''
                                    }`}
                                >
                                    <div className={`text-sm ${active ? 'text-lime-400' : 'text-lime-100/80'}`}>{r.label}</div>
                                    <div className="text-[11px] text-lime-200/60 italic">{r.operator}</div>
                                    <div className="text-[11px] text-lime-300/80">{r.a}</div>
                                    <div className="text-[11px] text-amber-300/80">{r.b}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="border border-lime-500/20 p-3 text-xs text-lime-200/60 leading-relaxed">
                        the two senses are not arbitrary opposites. each is a direction of the same reversible operation, and context is what fixes the sign.
                    </div>
                </div>
            )}

            {tab === 'analysis' && (
                <div className="space-y-6">
                    <div>
                        <div className="text-xs text-lime-200/60 mb-2 font-mono">
                            manual-pull sweep · how the combined polarity and confidence respond as the contextual pull moves from A to B, holding the frame and the sentence fixed
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer width="100%" height={280} minWidth={0}>
                                <LineChart data={sweep} margin={{ top: 10, right: 20, bottom: 16, left: 10 }}>
                                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="pull"
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#a3e635', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[-100, 100]}
                                    />
                                    <ReTooltip
                                        content={
                                            <ChartTooltip
                                                labelFormat={(l) => (typeof l === 'number' ? `pull ${l.toFixed(0)}` : String(l))}
                                                valueFormat={(v) => Number(v).toFixed(1)}
                                            />
                                        }
                                    />
                                    <ReferenceLine y={0} stroke="#a3e635" strokeOpacity={0.3} />
                                    <ReferenceLine
                                        x={params.manualPull}
                                        stroke="#a3e635"
                                        strokeDasharray="3 3"
                                        strokeOpacity={0.5}
                                        label={{ value: 'now', fill: '#a3e635', fontSize: 9, position: 'top' }}
                                    />
                                    <Line type="monotone" dataKey="polarity" stroke="#a3e635" strokeWidth={2} dot={false} name="polarity" />
                                    <Line type="monotone" dataKey="confidence" stroke="#facc15" strokeWidth={1.5} dot={false} name="confidence" strokeDasharray="6 3" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <CalibrationPanel results={calibration} outputLabel="polarity toward second sense" />

                    <AssumptionPanel assumptions={assumptions} />
                </div>
            )}
        </div>
    );
}
