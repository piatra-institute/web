export interface PolicyDemonstratorCriterion {
    title: string;
    description: string;
}


export interface PolicyDemonstratorCandidate {
    role: string;
    name: string;
    task: string;
    substrate: string;
    metric: string;
    why: string;
}


export interface PolicyDemonstratorData {
    heading?: string;
    intro: string[];
    criteriaHeading?: string;
    criteria: PolicyDemonstratorCriterion[];
    candidatesHeading?: string;
    candidates: PolicyDemonstratorCandidate[];
    note?: string;
}


interface PolicyDemonstratorProps {
    data: PolicyDemonstratorData;
}


export default function PolicyDemonstrator({ data }: PolicyDemonstratorProps) {
    return (
        <section
            id="demonstrator"
            className="my-10 w-full max-w-2xl scroll-mt-20"
        >
            <h2 className="text-lg md:text-xl font-bold mb-4 uppercase tracking-wide">
                <a href="#demonstrator" className="hover:underline">
                    {data.heading || 'benchmark demonstrator'}
                </a>
            </h2>

            <div className="space-y-4 mb-8">
                {data.intro.map((p, i) => (
                    <p
                        key={i}
                        className="text-sm md:text-base leading-relaxed text-white/85"
                        dangerouslySetInnerHTML={{ __html: p }}
                    />
                ))}
            </div>

            {data.criteria.length > 0 && (
                <>
                    <h3 className="text-base md:text-lg font-semibold mt-8 mb-3 text-white/90">
                        {data.criteriaHeading || 'what makes a good demonstrator'}
                    </h3>
                    <ul className="space-y-2 mb-8 text-sm md:text-base">
                        {data.criteria.map((c, i) => (
                            <li key={i} className="leading-relaxed text-white/85">
                                <span className="font-semibold text-white/95">{c.title}.</span>{' '}
                                {c.description}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {data.candidates.length > 0 && (
                <>
                    <h3 className="text-base md:text-lg font-semibold mt-8 mb-3 text-white/90">
                        {data.candidatesHeading || 'recommended candidates'}
                    </h3>
                    <div className="space-y-6">
                        {data.candidates.map((c, i) => (
                            <div
                                key={i}
                                className="border-l-2 border-white/30 pl-4"
                            >
                                <div className="text-xs uppercase text-white/50 mb-1 tracking-wider">
                                    {c.role}
                                </div>
                                <div className="text-base md:text-lg font-semibold mb-2">
                                    {c.name}
                                </div>
                                <dl className="text-sm md:text-base text-white/85 space-y-1">
                                    <div>
                                        <dt className="inline font-semibold text-white/95">Task: </dt>
                                        <dd className="inline">{c.task}</dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-semibold text-white/95">Substrate: </dt>
                                        <dd className="inline">{c.substrate}</dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-semibold text-white/95">Metric: </dt>
                                        <dd className="inline">{c.metric}</dd>
                                    </div>
                                    <div>
                                        <dt className="inline font-semibold text-white/95">Why: </dt>
                                        <dd className="inline">{c.why}</dd>
                                    </div>
                                </dl>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {data.note && (
                <div className="text-xs text-white/60 italic mt-6">
                    {data.note}
                </div>
            )}
        </section>
    );
}
