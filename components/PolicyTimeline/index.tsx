export interface PolicyTimelinePhase {
    phase: string;
    dates: string;
    milestones: string[];
    note?: string;
}


interface PolicyTimelineProps {
    phases: PolicyTimelinePhase[];
    heading?: string;
    footer?: string;
}


export default function PolicyTimeline({
    phases,
    heading = 'timeline',
    footer,
}: PolicyTimelineProps) {
    return (
        <section
            id="timeline"
            className="my-10 w-full max-w-2xl scroll-mt-20"
        >
            <h2 className="text-lg md:text-xl font-bold mb-6 uppercase tracking-wide">
                <a href="#timeline" className="hover:underline">{heading}</a>
            </h2>

            <ol className="border-l border-white/30 pl-6 space-y-8">
                {phases.map((p, i) => (
                    <li key={i} className="relative">
                        <span
                            className="absolute -left-[31px] top-1 w-3 h-3 bg-white rounded-full"
                            aria-hidden="true"
                        />
                        <div className="text-xs uppercase text-white/50 mb-1 tracking-wider">
                            {p.dates}
                        </div>
                        <div className="text-base md:text-lg font-semibold mb-2">
                            {p.phase}
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-white/85">
                            {p.milestones.map((m, j) => (
                                <li key={j}>{m}</li>
                            ))}
                        </ul>
                        {p.note && (
                            <div className="text-xs text-white/60 mt-2 italic">
                                {p.note}
                            </div>
                        )}
                    </li>
                ))}
            </ol>

            {footer && (
                <div className="text-xs text-white/60 italic mt-6">
                    {footer}
                </div>
            )}
        </section>
    );
}
