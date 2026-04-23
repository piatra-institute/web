export interface PolicyFAQItem {
    question: string;
    answer: string;
}


interface PolicyFAQProps {
    items: PolicyFAQItem[];
    heading?: string;
}


export default function PolicyFAQ({
    items,
    heading = 'frequently asked questions',
}: PolicyFAQProps) {
    return (
        <section
            id="faq"
            className="my-10 w-full max-w-2xl scroll-mt-20"
        >
            <h2 className="text-lg md:text-xl font-bold mb-6 uppercase tracking-wide">
                <a href="#faq" className="hover:underline">{heading}</a>
            </h2>

            <div className="space-y-3">
                {items.map((item, i) => (
                    <details
                        key={i}
                        className="group border-t border-white/20 py-3"
                    >
                        <summary className="cursor-pointer list-none flex items-start justify-between gap-4 text-base md:text-lg font-semibold text-white/95 hover:text-white focus:outline-none focus:ring-1 focus:ring-white">
                            <span>{item.question}</span>
                            <span
                                className="shrink-0 mt-1 text-white/50 group-open:rotate-45 transition-transform"
                                aria-hidden="true"
                            >
                                +
                            </span>
                        </summary>
                        <div
                            className="mt-3 text-sm md:text-base leading-relaxed text-white/80"
                            dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                    </details>
                ))}
            </div>
        </section>
    );
}
