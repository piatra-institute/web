import { ReactNode } from 'react';

import { focusStyle } from '@/data/styles';
import { documentIcon } from '@/data/icons';


interface PolicyHeroProps {
    title: string;
    subtitle?: string;
    tagline?: string;
    status?: string;
    date?: string;
    bodyNames?: { primary: string; secondary?: string }[];
    downloadHref?: string;
    downloadLabel?: string;
    aside?: ReactNode;
}


export default function PolicyHero({
    title,
    subtitle,
    tagline,
    status,
    date,
    bodyNames,
    downloadHref,
    downloadLabel = 'pdf',
    aside,
}: PolicyHeroProps) {
    return (
        <section className="w-full max-w-3xl px-6 py-12 flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3">
                {title}
            </h1>

            {subtitle && (
                <div className="text-base md:text-lg mb-4">
                    {subtitle}
                </div>
            )}

            {tagline && (
                <div className="text-sm md:text-base italic text-white/70 mb-6 max-w-xl">
                    {tagline}
                </div>
            )}

            {bodyNames && bodyNames.length > 0 && (
                <div className="text-xs md:text-sm text-white/60 mb-6 flex flex-col gap-1">
                    {bodyNames.map((b, i) => (
                        <div key={i}>
                            <span className="font-semibold text-white/80">{b.primary}</span>
                            {b.secondary && (
                                <span className="text-white/50">: {b.secondary}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {(status || date) && (
                <div className="text-xs uppercase text-white/50 mb-6 flex gap-4">
                    {date && <span>{date}</span>}
                    {status && <span>{status}</span>}
                </div>
            )}

            {downloadHref && (
                <a
                    href={downloadHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-xs uppercase underline underline-offset-4 p-2 ${focusStyle}`}
                    download
                    aria-label={`download ${downloadLabel}`}
                >
                    <span aria-hidden="true" className="inline-flex">
                        {documentIcon}
                    </span>
                    <span>{downloadLabel}</span>
                </a>
            )}

            {aside && (
                <div className="mt-8 w-full">
                    {aside}
                </div>
            )}
        </section>
    );
}
