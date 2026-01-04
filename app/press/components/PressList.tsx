'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import IndexLayout from '@/components/IndexLayout';
import { PressItem } from '@/data';

import PressTitle from './PressTitle';


interface OtherPressItem {
    link: string;
    title: string;
    originalTitle?: string;
    authors?: string;
    year?: string;
    doi?: string;
}

interface PressListProps {
    pressItems: PressItem[];
    otherPress: OtherPressItem[];
}


export default function PressList({
    pressItems,
    otherPress,
}: PressListProps) {
    return (
        <IndexLayout
            title="press"
            description="translations and original publications"
        >
            <div className="p-6">
                {pressItems.map((pressItem) => {
                    const { link, title } = pressItem.details;

                    return (
                        <Link
                            key={title + link}
                            href={link}
                            className="max-w-150 mb-8 block focus:outline-none focus:ring-1 focus:ring-white text-center p-3"
                        >
                            <PressTitle {...pressItem.details} />
                        </Link>
                    );
                })}

                {otherPress.map((item) => (
                    <div
                        key={item.title + item.link}
                        className="max-w-150 mb-8 block text-center p-3 border border-transparent hover:border-lime transition-colors"
                    >
                        {item.year && (
                            <div className="text-white text-sm mb-2">
                                {item.year}
                            </div>
                        )}

                        <div className="font-bold mb-2">
                            {item.title}
                        </div>

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
                ))}
            </div>
        </IndexLayout>
    );
}
