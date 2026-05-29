'use client';

import Link from 'next/link';
import { ExternalLink, FileText } from 'lucide-react';

import IndexLayout from '@/components/IndexLayout';
import IndexFilters from '@/components/IndexFilters';
import SubtitleDateable from '@/components/SubtitleDateable';
import { Paper } from '@/data';
import { TOPICS, KINDS, type Topic, type Kind } from '@/data/classification';


export interface OwnPaper {
    title: string;
    authors?: string;
    date: string;
    abstract: string;
    pdf: string;
    github?: string;
    doi?: string;
    topics?: readonly Topic[];
    kinds?: readonly Kind[];
}

type Entry =
    | { kind: 'own'; item: OwnPaper }
    | { kind: 'paper'; item: Paper };

interface PapersListProps {
    papers: Paper[];
    ownPapers: OwnPaper[];
}


function getDate(entry: Entry): string | null {
    return entry.item.date ?? null;
}

function getSearchableText(entry: Entry): string {
    if (entry.kind === 'own') {
        const it = entry.item;
        return [it.title, it.abstract, it.authors].filter(Boolean).join(' ');
    }
    const it = entry.item;
    return [it.title, it.abstract].filter(Boolean).join(' ');
}

function getTopics(entry: Entry): readonly string[] {
    if (entry.kind === 'own') return entry.item.topics ?? [];
    return [];
}

function getKinds(entry: Entry): readonly string[] {
    if (entry.kind === 'own') return entry.item.kinds ?? [];
    return [];
}


export default function PapersList({
    papers,
    ownPapers,
}: PapersListProps) {
    const entries: Entry[] = [
        ...ownPapers.map((item): Entry => ({ kind: 'own', item })),
        ...papers.map((item): Entry => ({ kind: 'paper', item })),
    ];

    return (
        <IndexLayout
            title="papers"
            description="ensearches, structured enquiries without the promise of resolution"
        >
            <IndexFilters
                items={entries}
                getDate={getDate}
                getSearchableText={getSearchableText}
                storageKey="papers-filter"
                dataLabel="paper"
                chipGroups={[
                    {
                        key: 'topics',
                        label: 'topic',
                        options: TOPICS,
                        getItemKeys: getTopics,
                    },
                    {
                        key: 'kinds',
                        label: 'kind',
                        options: KINDS,
                        getItemKeys: getKinds,
                    },
                ]}
            >
                {(filtered) => (
                    <div className="p-6">
                        {filtered.length === 0 ? (
                            <div className="text-center text-sm text-gray-500">
                                no papers match these filters
                            </div>
                        ) : (
                            filtered.map((entry, idx) => {
                                if (entry.kind === 'own') {
                                    const paper = entry.item;
                                    return (
                                        <div
                                            key={`own-${paper.title}-${idx}`}
                                            className="max-w-150 mb-12 block text-center p-3 border border-transparent hover:border-lime transition-colors"
                                        >
                                            <div className="text-white text-sm mb-2">{paper.date}</div>
                                            <div className="font-bold mb-2">{paper.title}</div>

                                            {paper.authors && (
                                                <div className="text-white text-sm my-2">
                                                    {paper.authors}
                                                </div>
                                            )}

                                            <div className="text-sm text-white/70 leading-relaxed mt-3 text-left">
                                                {paper.abstract}
                                            </div>

                                            <div className="flex items-center justify-center gap-4 mt-4">
                                                <a
                                                    href={paper.pdf}
                                                    className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    <span>PDF</span>
                                                </a>

                                                {paper.github && (
                                                    <a
                                                        href={paper.github}
                                                        className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span>GitHub</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}

                                                {paper.doi && (
                                                    <a
                                                        href={paper.doi}
                                                        className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <span>DOI: {paper.doi.replace('https://doi.org/', '')}</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }

                                const paper = entry.item;
                                return (
                                    <Link
                                        key={paper.id}
                                        href={`/papers/${paper.path}`}
                                        className="max-w-150 mb-8 block text-center p-3 border border-transparent hover:border-lime transition-colors"
                                    >
                                        <SubtitleDateable text={paper.title} date={paper.date} />
                                        <div className="text-sm p-2 pt-1 text-white/70">
                                            {paper.abstract}
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                )}
            </IndexFilters>
        </IndexLayout>
    );
}
