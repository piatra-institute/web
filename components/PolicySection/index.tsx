export interface PolicySectionData {
    id: string;
    title: string;
    paragraphs: string[];
}


interface PolicySectionProps {
    section: PolicySectionData;
}


export default function PolicySection({ section }: PolicySectionProps) {
    const { id, title, paragraphs } = section;

    return (
        <section
            id={id}
            className="my-10 w-full max-w-2xl scroll-mt-20"
        >
            <h2 className="text-lg md:text-xl font-bold mb-4 uppercase tracking-wide">
                <a href={`#${id}`} className="hover:underline">
                    {title}
                </a>
            </h2>

            <div className="space-y-4">
                {paragraphs.map((paragraph, i) => (
                    <p
                        key={i}
                        className="text-sm md:text-base leading-relaxed text-white/85"
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                ))}
            </div>
        </section>
    );
}
