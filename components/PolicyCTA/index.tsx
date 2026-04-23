import { ReactNode } from 'react';


export interface PolicyCTAAudience {
    label: string;
    description: string;
}


interface PolicyCTAProps {
    heading?: string;
    lead?: ReactNode;
    audiences?: PolicyCTAAudience[];
    contactEmail?: string;
    contactLabel?: string;
    footnote?: ReactNode;
}


export default function PolicyCTA({
    heading = 'how to engage',
    lead,
    audiences,
    contactEmail,
    contactLabel = 'contact',
    footnote,
}: PolicyCTAProps) {
    return (
        <section
            id="engage"
            className="my-10 w-full max-w-2xl scroll-mt-20"
        >
            <h2 className="text-lg md:text-xl font-bold mb-4 uppercase tracking-wide">
                <a href="#engage" className="hover:underline">{heading}</a>
            </h2>

            {lead && (
                <div className="text-sm md:text-base leading-relaxed text-white/85 mb-6">
                    {lead}
                </div>
            )}

            {audiences && audiences.length > 0 && (
                <ul className="space-y-4 mb-6">
                    {audiences.map((a, i) => (
                        <li key={i} className="text-sm md:text-base">
                            <div className="font-semibold text-white/95">{a.label}</div>
                            <div className="text-white/75 leading-relaxed">{a.description}</div>
                        </li>
                    ))}
                </ul>
            )}

            {contactEmail && (
                <div className="text-sm md:text-base">
                    <span className="text-white/75">{contactLabel}:</span>{' '}
                    <a
                        href={`mailto:${contactEmail}`}
                        className="underline underline-offset-4 hover:text-white focus:outline-none focus:ring-1 focus:ring-white"
                    >
                        {contactEmail}
                    </a>
                </div>
            )}

            {footnote && (
                <div className="text-xs text-white/60 italic mt-6">
                    {footnote}
                </div>
            )}
        </section>
    );
}
