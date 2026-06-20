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

const scoreText = (s: number) =>
    s >= 90 ? 'text-lime-400' : s >= 70 ? 'text-lime-200' : s >= 50 ? 'text-yellow-400' : 'text-orange-400';
const barFill = (s: number) =>
    s >= 90 ? 'bg-lime-400' : s >= 70 ? 'bg-lime-500' : s >= 50 ? 'bg-yellow-500' : 'bg-orange-500';
const catText = (v: number | null) =>
    v == null ? 'text-lime-200/20' : v >= 100 ? 'text-lime-400/90' : v >= 60 ? 'text-lime-200/60' : 'text-orange-400/80';

function honestyBadge(h: Honesty): { text: string; cls: string; title: string } {
    if (h.verdict === 'fail') {
        return { text: 'fail', cls: 'text-orange-400', title: `honesty gate failed (calibration ${h.calibration}, citations ${h.citations})` };
    }
    if (h.calibration === 'verified') {
        const fit = h.fit ? ` worst fit ${(h.fit.worst * 100).toFixed(0)}%` : '';
        return { text: 'cal ✓', cls: 'text-lime-400', title: `calibration executes and reproduces its displayed values.${fit}` };
    }
    if (h.calibration === 'unverified') {
        return { text: 'cal ?', cls: 'text-yellow-400', title: 'calibration present but could not be executed headlessly' };
    }
    return { text: '–', cls: 'text-lime-200/20', title: 'no calibration, or prediction is computed in-component (not auto-verifiable)' };
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
                <div className="p-6 text-center text-sm text-lime-200/60">
                    run <span className="font-mono text-lime-400">node piatrabench/scorer.mjs</span> to generate the report.
                </div>
            </IndexLayout>
        );
    }

    const sortHeader = (key: SortKey, label: string, align = 'text-left') => (
        <th
            className={`${align} px-2 py-2 cursor-pointer select-none hover:text-lime-400 ${sortKey === key ? 'text-lime-400' : 'text-lime-200/60'}`}
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
                {/* methodology */}
                <div className="text-xs text-lime-200/50 leading-relaxed mb-10 max-w-2xl mx-auto text-center">
                    Layer 0 is deterministic: build &amp; types (25), registration &amp; metadata (15), structure (20),
                    scientific infrastructure (25), and style &amp; house rules (15). No model judgement yet: subjective
                    quality and a head-to-head Elo arena are later layers. Models are self-declared in each playground&apos;s
                    versions.ts; the corpus is currently almost all Claude, so this compares Claude versions more than vendors.
                    {' '}Underneath runs an honesty gate: each calibration.ts is executed and must genuinely reproduce the
                    numbers it displays (not hardcode them to match); a failure caps the score. Fit (how close predicted is
                    to expected) is shown but never gates, since an honest playground may deliberately show a poor-fitting model.
                    <div className="mt-3 text-lime-200/40">
                        {data.n} playgrounds · mean {data.avg}/100 ·{' '}
                        {data.honestyCounts.verified} calibrations verified · {data.honestyCounts.failed} honesty failures
                        {!data.links && ' · citations not checked'} ·{' '}
                        <Link href="/playgrounds" className="underline hover:text-lime-400">back to playgrounds</Link>
                    </div>
                </div>

                {/* model leaderboard */}
                <h2 className="text-lime-400 text-sm uppercase tracking-wide mb-3">model leaderboard</h2>
                <div className="overflow-x-auto border border-lime-500/20 mb-12">
                    <table className="w-full text-xs font-mono">
                        <thead className="text-lime-200/60 border-b border-lime-500/20">
                            <tr>
                                <th className="text-left px-2 py-2 w-8">#</th>
                                <th className="text-left px-2 py-2">model</th>
                                <th className="text-right px-2 py-2">n</th>
                                <th className="text-left px-2 py-2 w-40">mean</th>
                                {CATS.map((c) => <th key={c} className="text-right px-2 py-2 hidden sm:table-cell">{c}</th>)}
                                <th className="text-left px-2 py-2 hidden md:table-cell">best</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.models.map((m, i) => (
                                <tr
                                    key={m.key}
                                    className={`border-b border-lime-500/10 cursor-pointer hover:bg-lime-500/5 ${modelFilter === m.label ? 'bg-lime-500/10' : ''}`}
                                    onClick={() => setModelFilter(modelFilter === m.label ? 'all' : m.label)}
                                >
                                    <td className="px-2 py-2 text-lime-200/40">{i + 1}</td>
                                    <td className="px-2 py-2 text-lime-100">{m.label}</td>
                                    <td className="px-2 py-2 text-right text-lime-200/60">{m.n}</td>
                                    <td className="px-2 py-2">
                                        <Bar value={m.mean} />{' '}
                                        <span className={scoreText(m.mean)}>{m.mean}</span>
                                    </td>
                                    {CATS.map((c) => (
                                        <td key={c} className={`px-2 py-2 text-right hidden sm:table-cell ${catText(m.meanByCat[c])}`}>
                                            {m.meanByCat[c] == null ? '–' : `${m.meanByCat[c]}`}
                                        </td>
                                    ))}
                                    <td className="px-2 py-2 text-lime-200/50 hidden md:table-cell">{m.best.slug} ({m.best.score})</td>
                                </tr>
                            ))}
                            <tr className="text-lime-200/40">
                                <td className="px-2 py-2"></td>
                                <td className="px-2 py-2">(unattributed)</td>
                                <td className="px-2 py-2 text-right">{data.unattributed}</td>
                                <td className="px-2 py-2" colSpan={1 + CATS.length + 1}>no versions.ts declared</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* playground leaderboard */}
                <div className="flex items-baseline justify-between mb-3">
                    <h2 className="text-lime-400 text-sm uppercase tracking-wide">playgrounds</h2>
                    {modelFilter !== 'all' && (
                        <button
                            className="text-xs text-lime-200/60 hover:text-lime-400 underline"
                            onClick={() => setModelFilter('all')}
                        >
                            clear filter: {modelFilter} ({rows.length})
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto border border-lime-500/20">
                    <table className="w-full text-xs font-mono">
                        <thead className="border-b border-lime-500/20">
                            <tr>
                                <th className="text-left px-2 py-2 w-8 text-lime-200/40">#</th>
                                {sortHeader('name', 'playground')}
                                {sortHeader('date', 'date', 'text-left hidden sm:table-cell')}
                                {sortHeader('model', 'model', 'text-left hidden sm:table-cell')}
                                {sortHeader('score', 'score', 'text-left')}
                                <th className="text-left px-2 py-2 text-lime-200/60">honesty</th>
                                {CATS.map((c) => (
                                    <th key={c} className="text-right px-2 py-2 text-lime-200/60 hidden md:table-cell">{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((p, i) => (
                                <tr key={p.slug} className="border-b border-lime-500/10 hover:bg-lime-500/5">
                                    <td className="px-2 py-2 text-lime-200/30">{i + 1}</td>
                                    <td className="px-2 py-2">
                                        <Link href={p.link} className="text-lime-100 hover:text-lime-400 hover:underline">
                                            {p.slug}
                                        </Link>
                                    </td>
                                    <td className="px-2 py-2 text-lime-200/50 hidden sm:table-cell">{p.date || '?'}</td>
                                    <td className="px-2 py-2 text-lime-200/50 hidden sm:table-cell">{p.model || '–'}</td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        <Bar value={p.headline} width={48} />{' '}
                                        <span className={scoreText(p.headline)}>{p.headline}</span>
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                        {(() => { const b = honestyBadge(p.honesty); return <span className={b.cls} title={b.title}>{b.text}</span>; })()}
                                    </td>
                                    {CATS.map((c) => (
                                        <td key={c} className={`px-2 py-2 text-right hidden md:table-cell ${catText(p.catPct[c])}`}>
                                            {p.catPct[c] == null ? '–' : p.catPct[c]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </IndexLayout>
    );
}
