'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';


export interface ModelRow {
    key: string;
    label: string;
    n: number;
    mean: number;
    meanByCat: Record<string, number | null>;
    best: { slug: string; name: string; score: number };
}

export interface Honesty {
    calibration: string;
    fit: { mean: number; worst: number } | null;
    citations: string;
    verdict: string;
    flags: string[];
}

export interface PgRow {
    slug: string;
    name: string;
    link: string;
    date: string | null;
    ym: number;
    model: string | null;
    score: number;
    headline: number;
    catPct: Record<string, number | null>;
    honesty: Honesty;
}

export interface BenchData {
    generated: string;
    n: number;
    avg: number;
    unattributed: number;
    honestyCounts: { verified: number; notAutoVerifiable: number; failed: number; flagged: number };
    links: boolean;
    models: ModelRow[];
    playgrounds: PgRow[];
}

interface Props {
    data: BenchData | null;
}


const CATS = ['build', 'meta', 'structure', 'infra', 'style'] as const;
type SortKey = 'score' | 'name' | 'date' | 'model';

// the score is the single scalar; the per-category split lives in a hover tooltip
// (build, meta, structure, infra, style each out of 100).
const catBreakdown = (cat: Record<string, number | null>) =>
    CATS.map((c) => `${c} ${cat[c] ?? '–'}`).join('   ');

// Neutral by default. Lime is reserved for the score bars only; text is grey,
// and warm colour appears solely where there is a shortfall worth noticing.
const scoreText = (s: number) =>
    s >= 90 ? 'text-gray-200' : s >= 70 ? 'text-gray-400' : s >= 50 ? 'text-yellow-500' : 'text-orange-400';
const barFill = (s: number) =>
    s >= 90 ? 'bg-lime-500' : s >= 70 ? 'bg-lime-600' : s >= 50 ? 'bg-yellow-600' : 'bg-orange-500';

function honestyBadge(h: Honesty): { text: string; cls: string; title: string } {
    if (h.verdict === 'fail') {
        return { text: 'fail', cls: 'text-orange-400', title: `honesty gate failed (calibration ${h.calibration}, citations ${h.citations})` };
    }
    if (h.calibration === 'verified') {
        const fit = h.fit ? ` worst fit ${(h.fit.worst * 100).toFixed(0)}%` : '';
        return { text: 'cal ✓', cls: 'text-gray-400', title: `calibration executes and reproduces its displayed values.${fit}` };
    }
    if (h.calibration === 'unverified') {
        return { text: 'cal ?', cls: 'text-yellow-500', title: 'calibration present but could not be executed headlessly' };
    }
    return { text: '–', cls: 'text-gray-700', title: 'no calibration, or prediction is computed in-component (not auto-verifiable)' };
}


function Bar({ value, width = 70 }: { value: number; width?: number }) {
    return (
        <span className="inline-block align-middle bg-lime-500/10 h-1.5" style={{ width }}>
            <span className={`block h-full ${barFill(value)}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </span>
    );
}


export default function PiatraBenchView({ data }: Props) {
    const [sortKey, setSortKey] = useState<SortKey>('score');
    const [desc, setDesc] = useState(true);
    const [modelFilter, setModelFilter] = useState<string>('all');

    const rows = useMemo(() => {
        if (!data) return [];
        let r = [...data.playgrounds];
        if (modelFilter === 'unattributed') r = r.filter((p) => !p.model);
        else if (modelFilter !== 'all') r = r.filter((p) => p.model === modelFilter);
        const dir = desc ? -1 : 1;
        r.sort((a, b) => {
            let cmp = 0;
            if (sortKey === 'score') cmp = a.headline - b.headline;
            else if (sortKey === 'date') cmp = a.ym - b.ym;
            else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
            else if (sortKey === 'model') cmp = (a.model || '~').localeCompare(b.model || '~');
            return cmp * dir || a.name.localeCompare(b.name);
        });
        return r;
    }, [data, sortKey, desc, modelFilter]);

    if (!data) {
        return (
            <IndexLayout title="piatrabench" description="benchmark data not generated yet">
                <div className="p-6 text-center text-sm text-gray-500">
                    run <span className="font-mono text-gray-300">node piatrabench/scorer.mjs</span> to generate the report.
                </div>
            </IndexLayout>
        );
    }

    const sortHeader = (key: SortKey, label: string, align = 'text-left', title?: string) => (
        <th
            title={title}
            className={`${align} px-2 py-2 cursor-pointer select-none hover:text-gray-200 ${sortKey === key ? 'text-gray-200' : 'text-gray-500'}`}
            onClick={() => { if (sortKey === key) setDesc(!desc); else { setSortKey(key); setDesc(key !== 'name'); } }}
        >
            {label}{sortKey === key ? (desc ? ' ↓' : ' ↑') : ''}
        </th>
    );

    return (
        <IndexLayout
            title="piatrabench"
            description={
                <>
                    every playground, scored on how well it conforms to the template
                    <br />
                    and ranked by the model that generated it
                </>
            }
        >
            <div className="w-full max-w-5xl px-4 sm:px-6 pb-24">
                {/* summary */}
                <div className="text-xs text-gray-500 mb-4 text-center">
                    {data.n} playgrounds · mean {data.avg}/100 ·{' '}
                    {data.honestyCounts.verified} calibrations verified · {data.honestyCounts.failed} honesty failures
                    {!data.links && ' · citations not checked'} ·{' '}
                    <Link href="/playgrounds" className="underline hover:text-gray-300">back to playgrounds</Link>
                </div>

                {/* legend */}
                <div className="text-[11px] text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto text-center">
                    <span className="text-gray-400">score</span> is one 0 to 100 number: how well a playground conforms
                    to the template, weighting build, registration, structure, scientific infrastructure and house rules
                    into a single figure. hover a score for the per-category breakdown.{' '}
                    <span className="text-gray-400">honesty</span> <span className="font-mono">cal ✓</span> means the
                    calibration runs and reproduces its own numbers; a failure caps the score.
                </div>

                {/* model leaderboard */}
                <h2 className="text-gray-300 text-sm uppercase tracking-wide mb-3">model leaderboard</h2>
                <div className="overflow-x-auto border border-white/10 mb-12">
                    <table className="w-full text-xs font-mono">
                        <thead className="text-gray-500 border-b border-white/10">
                            <tr>
                                <th className="text-left px-2 py-2 w-8">#</th>
                                <th className="text-left px-2 py-2">model</th>
                                <th className="text-right px-2 py-2">n</th>
                                <th className="text-left px-2 py-2 w-40">mean</th>
                                <th className="text-left px-2 py-2 hidden md:table-cell">best</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.models.map((m, i) => (
                                <tr
                                    key={m.key}
                                    className={`border-b border-white/5 cursor-pointer hover:bg-white/5 ${modelFilter === m.label ? 'bg-white/5' : ''}`}
                                    onClick={() => setModelFilter(modelFilter === m.label ? 'all' : m.label)}
                                >
                                    <td className="px-2 py-2 text-gray-600">{i + 1}</td>
                                    <td className="px-2 py-2 text-gray-200 whitespace-nowrap">{m.label}</td>
                                    <td className="px-2 py-2 text-right text-gray-500">{m.n}</td>
                                    <td className="px-2 py-2 cursor-help" title={catBreakdown(m.meanByCat)}>
                                        <Bar value={m.mean} />{' '}
                                        <span className={scoreText(m.mean)}>{m.mean}</span>
                                    </td>
                                    <td className="px-2 py-2 text-gray-500 hidden md:table-cell">{m.best.slug} ({m.best.score})</td>
                                </tr>
                            ))}
                            <tr className="text-gray-600">
                                <td className="px-2 py-2"></td>
                                <td className="px-2 py-2">(unattributed)</td>
                                <td className="px-2 py-2 text-right">{data.unattributed}</td>
                                <td className="px-2 py-2" colSpan={2}>no versions.ts declared</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* playground leaderboard */}
                <div className="flex items-baseline justify-between mb-3">
                    <h2 className="text-gray-300 text-sm uppercase tracking-wide">playgrounds</h2>
                    {modelFilter !== 'all' && (
                        <button
                            className="text-xs text-gray-500 hover:text-gray-300 underline"
                            onClick={() => setModelFilter('all')}
                        >
                            clear filter: {modelFilter} ({rows.length})
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto border border-white/10">
                    <table className="w-full text-xs font-mono">
                        <thead className="border-b border-white/10">
                            <tr>
                                <th className="text-left px-2 py-2 w-8 text-gray-600">#</th>
                                {sortHeader('name', 'playground')}
                                {sortHeader('date', 'date', 'text-left hidden sm:table-cell')}
                                {sortHeader('model', 'model', 'text-left hidden sm:table-cell')}
                                {sortHeader('score', 'score', 'text-left', 'overall conformance 0 to 100; hover a score for the per-category breakdown; an honesty failure caps it at 40')}
                                <th className="text-left px-2 py-2 text-gray-500 cursor-help" title="cal ✓ = the calibration executes and reproduces its displayed numbers; a failure caps the score">honesty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((p, i) => (
                                <tr key={p.slug} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-2 py-2 text-gray-600">{i + 1}</td>
                                    <td className="px-2 py-2">
                                        <Link href={p.link} className="text-gray-200 hover:text-lime-400 hover:underline">
                                            {p.slug}
                                        </Link>
                                    </td>
                                    <td className="px-2 py-2 text-gray-500 hidden sm:table-cell whitespace-nowrap">{p.date || '?'}</td>
                                    <td className="px-2 py-2 text-gray-500 hidden sm:table-cell whitespace-nowrap">{p.model || '–'}</td>
                                    <td className="px-2 py-2 whitespace-nowrap cursor-help" title={catBreakdown(p.catPct)}>
                                        <Bar value={p.headline} width={48} />{' '}
                                        <span className={scoreText(p.headline)}>{p.headline}</span>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        {(() => { const b = honestyBadge(p.honesty); return <span className={b.cls} title={b.title}>{b.text}</span>; })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </IndexLayout>
    );
}
