'use client';

import Link from 'next/link';
import { ExternalLink, FileText } from 'lucide-react';

import IndexLayout from '@/components/IndexLayout';
import SubtitleDateable from '@/components/SubtitleDateable';
import { Paper } from '@/data';


interface OwnPaper {
    title: string;
    authors?: string;
    date: string;
    abstract: string;
    pdf: string;
    github?: string;
    doi?: string;
}

interface PapersListProps {
    papers: Paper[];
    ownPapers: OwnPaper[];
}


export default function PapersList({
    papers,
    ownPapers,
}: PapersListProps) {
    return (
        <IndexLayout
            title="papers"
            description="ensearches, structured enquiries without the promise of resolution"
        >
            <div className="p-6">
                {ownPapers.map((paper) => (
                    <div
                        key={paper.title}
                        className="max-w-150 mb-12 block text-center p-3 border border-transparent hover:border-lime transition-colors"
                    >
                        <div className="text-white text-sm mb-2">
                            {paper.date}
                        </div>

                        <div className="font-bold mb-2">
                            {paper.title}
                        </div>

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
                ))}

                {papers.map((paper) => {
                    const {
                        id,
                        path,
                        title,
                        abstract,
                        date,
                    } = paper;

                    return (
                        <Link
                            key={id}
                            href={`/papers/${path}`}
                            className="max-w-150 mb-8 block text-center p-3 border border-transparent hover:border-lime transition-colors"
                        >
                            <SubtitleDateable
                                text={title}
                                date={date}
                            />

                            <div className="text-sm p-2 pt-1 text-white/70">
                                {abstract}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </IndexLayout>
    );
}
