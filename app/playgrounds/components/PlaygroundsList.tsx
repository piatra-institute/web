'use client';

import Link from 'next/link';

import IndexLayout from '@/components/IndexLayout';
import IndexFilters from '@/components/IndexFilters';
import { linkAnchorStyle } from '@/data/styles';
import { TOPICS, OPERATIONS } from '@/data/classification';

import { playgrounds } from '../data';


type Playground = (typeof playgrounds)[number];


export interface BenchSummary {
    n: number;
    avg: number;
    unattributed: number;
    models: { key: string; label: string; n: number; mean: number }[];
}


function getDate(p: Playground): string | null {
    return p.date ?? null;
}

function getSearchableText(p: Playground): string {
    return `${p.name} ${p.description}`;
}


const barFill = (s: number) =>
    s >= 90 ? 'bg-lime-400' : s >= 70 ? 'bg-lime-500' : s >= 50 ? 'bg-yellow-500' : 'bg-orange-500';


function ModelLeaderboard({ bench }: { bench: BenchSummary }) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4 mb-10">
            <div className="border border-lime-500/20 p-4">
                <Link
                    href="/piatrabench"
                    className="flex items-baseline justify-between mb-3 group focus:outline-none focus-visible:outline-1 focus-visible:outline-lime-500"
                >
                    <span className="text-xs uppercase tracking-wide text-lime-400 group-hover:underline">
                        piatrabench · model leaderboard
                    </span>
                    <span className="text-[10px] text-lime-200/40 group-hover:text-lime-400">
                        {bench.n} scored · view all →
                    </span>
                </Link>
                <div className="space-y-1.5 font-mono text-xs">
                    {bench.models.map((m, i) => (
                        <div key={m.key} className="flex items-center gap-2">
                            <span className="text-lime-200/30 w-3 text-right">{i + 1}</span>
                            <span className="text-lime-100 flex-1 truncate">{m.label}</span>
                            <span className="inline-block bg-lime-500/10 h-1.5 w-16">
                                <span className={`block h-full ${barFill(m.mean)}`} style={{ width: `${m.mean}%` }} />
                            </span>
                            <span className="text-lime-400 w-10 text-right">{m.mean}</span>
                            <span className="text-lime-200/30 w-6 text-right">{m.n}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 text-[10px] text-lime-200/30 leading-relaxed">
                    deterministic conformance score; self-declared model. subjective quality and an Elo arena are later layers.
                </div>
            </div>
        </div>
    );
}


export default function PlaygroundsList({ bench }: { bench?: BenchSummary | null }) {
    return (
        <IndexLayout
            title="playgrounds"
            description={
                <>
                    the playgrounds are in various stages of development
                    <br />
                    from conceptual sketches to fully functional applications
                </>
            }
        >
            {bench && bench.models.length > 0 && <ModelLeaderboard bench={bench} />}
            <IndexFilters
                items={playgrounds}
                getDate={getDate}
                getSearchableText={getSearchableText}
                storageKey="playgrounds-filter"
                dataLabel="playground"
                chipGroups={[
                    {
                        key: 'topics',
                        label: 'topic',
                        options: TOPICS,
                        getItemKeys: (p) => p.topics,
                    },
                    {
                        key: 'operations',
                        label: 'operation',
                        options: OPERATIONS,
                        getItemKeys: (p) => p.operations,
                    },
                ]}
            >
                {(filtered) => (
                    <div className="p-6 w-full">
                        {filtered.length === 0 ? (
                            <div className="text-center text-sm text-gray-500">
                                no playgrounds match these filters
                            </div>
                        ) : (
                            filtered.map((p) => (
                                <Link
                                    key={p.name + p.link}
                                    href={p.link}
                                    className="mb-8 block focus:outline-none focus-visible:outline-1 focus-visible:outline-lime-500 text-center"
                                    draggable={false}
                                >
                                    <div className={linkAnchorStyle}>
                                        {p.name} · {p.date}
                                    </div>

                                    {p.description && <div>{p.description}</div>}
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </IndexFilters>
        </IndexLayout>
    );
}
