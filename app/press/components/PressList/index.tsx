'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import IndexLayout from '@/components/IndexLayout';
import IndexFilters from '@/components/IndexFilters';
import { PressItem } from '@/data';

import PressTitle from '../PressTitle';



interface OtherPressItem {
    link: string;
    title: string;
    subtitle?: string;
    originalTitle?: string;
    authors?: string;
    year?: string;
    doi?: string;
    pdf?: string;
}

type Entry =
    | { kind: 'press'; item: PressItem }
    | { kind: 'other'; item: OtherPressItem };

interface PressListProps {
    pressItems: PressItem[];
    otherPress: OtherPressItem[];
}


function getDate(entry: Entry): string | null {
    if (entry.kind === 'press') return entry.item.details.year ?? null;
    return entry.item.year ?? null;
}

function getSearchableText(entry: Entry): string {
    if (entry.kind === 'press') {
        const d = entry.item.details;
        return [d.title, d.translation, d.metadata, d.language, ...(d.authors ?? [])].join(' ');
    }
    const it = entry.item;
    return [it.title, it.subtitle, it.originalTitle, it.authors, it.link].filter(Boolean).join(' ');
}


export default function PressList({
    pressItems,
    otherPress,
}: PressListProps) {
    const entries: Entry[] = [
        ...pressItems.map((item): Entry => ({ kind: 'press', item })),
        ...otherPress.map((item): Entry => ({ kind: 'other', item })),
    ];

    return (
        <IndexLayout
            title="press"
            description="translations and original publications"
        >
            <IndexFilters
                items={entries}
                getDate={getDate}
                getSearchableText={getSearchableText}
                storageKey="press-filter"
                dataLabel="press item"
            >
                {(filtered) => (
                    <div className="p-6">
                        {filtered.length === 0 ? (
                            <div className="text-center text-sm text-gray-500">
                                no press items match these filters
                            </div>
                        ) : (
                            filtered.map((entry, idx) => {
                                if (entry.kind === 'press') {
                                    const pressItem = entry.item;
                                    const { link, title } = pressItem.details;
                                    return (
                                        <Link
                                            key={`press-${title}-${link}-${idx}`}
                                            href={link}
                                            className="max-w-150 mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center p-3"
                                        >
                                            <PressTitle {...pressItem.details} />
                                        </Link>
                                    );
                                }

                                const item = entry.item;
                                return (
                                    <div
                                        key={`other-${item.title}-${item.link}-${idx}`}
                                        className="max-w-150 mb-8 block text-center p-3 border border-transparent hover:border-lime transition-colors"
                                    >
                                        {item.year && (
                                            <div className="text-white text-sm mb-2">
                                                {item.year}
                                            </div>
                                        )}

                                        <div className="font-bold mb-2">{item.title}</div>

                                        {item.subtitle && (
                                            <div className="text-white text-sm mb-2">
                                                {item.subtitle}
                                            </div>
                                        )}

                                        {item.authors && (
                                            <div className="text-white text-sm my-2">
                                                {item.authors}
                                            </div>
                                        )}

                                        {item.originalTitle && (
                                            <div className="text-white text-sm opacity-70">
                                                {item.originalTitle}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center gap-4 mt-3">
                                            <a
                                                href={item.link}
                                                className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <span>GitHub</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>

                                            {item.pdf && (
                                                <a
                                                    href={item.pdf}
                                                    className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <span>PDF</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}

                                            {item.doi && (
                                                <a
                                                    href={item.doi}
                                                    className="inline-flex items-center gap-1 text-lime hover:underline text-sm"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <span>DOI: {item.doi.replace('https://doi.org/', '')}</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </IndexFilters>
        </IndexLayout>
    );
}
