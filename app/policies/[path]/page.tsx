import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

import { defaultOpenGraph } from '@/data/metadata';

import Header from '@/components/Header';
import PolicyHero from '@/components/PolicyHero';
import PolicySection from '@/components/PolicySection';
import PolicyDemonstrator from '@/components/PolicyDemonstrator';
import PolicyTimeline from '@/components/PolicyTimeline';
import PolicyFAQ from '@/components/PolicyFAQ';
import PolicyCTA from '@/components/PolicyCTA';
import PolicyDownloads from '@/components/PolicyDownloads';

import { findPolicyByPath, policies } from '../data';



type Props = {
    params: Promise<{ path: string }>;
};


export async function generateStaticParams() {
    return policies.map(p => ({ path: p.path }));
}


export async function generateMetadata(
    { params }: Props,
    _parent: ResolvingMetadata,
): Promise<Metadata> {
    const { path } = await params;
    const policy = findPolicyByPath(path);
    if (!policy) {
        return {};
    }

    const titleLine = policy.subtitle ? `${policy.title}, ${policy.subtitle}` : policy.title;

    const pageUrl = `https://piatra.institute/policies/${path}`;

    return {
        title: `${titleLine} · policies`,
        description: policy.description,

        alternates: {
            canonical: pageUrl,
        },

        openGraph: {
            ...defaultOpenGraph,
            type: 'article',
            url: pageUrl,
            title: `${titleLine} · policies · piatra.institute`,
            description: policy.description,
            images: [
                {
                    url: `https://piatra.institute/assets-policies/og/${path}.png`,
                    width: 1200,
                    height: 630,
                    alt: `${titleLine}`,
                },
            ],
        },

        twitter: {
            card: 'summary_large_image',
            title: `${titleLine} · policies · piatra.institute`,
            description: policy.description,
            images: [`https://piatra.institute/assets-policies/og/${path}.png`],
        },
    };
}


export default async function PolicyPage({ params }: Props) {
    const { path } = await params;
    const policy = findPolicyByPath(path);
    if (!policy) {
        notFound();
    }

    const pageUrl = `https://piatra.institute/policies/${path}`;
    const titleLine = policy.subtitle ? `${policy.title}, ${policy.subtitle}` : policy.title;

    // schema.org Article for policy documents. Policy briefs don't have a
    // dedicated schema type; Article is the closest broadly-indexed one.
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: titleLine,
        description: policy.description,
        url: pageUrl,
        datePublished: policy.date,
        inLanguage: 'en',
        articleSection: 'Policy',
        author: {
            '@type': 'Organization',
            name: 'Piatra . Institute',
            url: 'https://piatra.institute',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Piatra . Institute',
            url: 'https://piatra.institute',
            logo: {
                '@type': 'ImageObject',
                url: 'https://piatra.institute/piatra-institute.png',
            },
        },
        image: `https://piatra.institute/assets-policies/og/${path}.png`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': pageUrl,
        },
    };

    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-black text-white">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-black focus:text-white focus:px-3 focus:py-2 focus:ring-1 focus:ring-white"
            >
                Skip to content
            </a>

            <Header />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <main id="main" className="w-full flex flex-col items-center">

            <PolicyHero
                title={policy.title}
                subtitle={policy.subtitle}
                tagline={policy.tagline}
                status={policy.status}
                date={policy.date}
                bodyNames={policy.bodyNames}
                downloadHref={policy.pdf}
                downloadLabel={policy.pdfLabel}
            />

            <section
                id="summary"
                className="my-10 w-full max-w-2xl px-6 scroll-mt-20"
            >
                <h2 className="text-lg md:text-xl font-bold mb-4 uppercase tracking-wide">
                    <a href="#summary" className="hover:underline">executive summary</a>
                </h2>
                <div className="space-y-4">
                    {policy.executiveSummary.map((p, i) => (
                        <p
                            key={i}
                            className="text-sm md:text-base leading-relaxed text-white/85"
                            dangerouslySetInnerHTML={{ __html: p }}
                        />
                    ))}
                </div>
            </section>

            <div className="w-full max-w-2xl px-6">
                {policy.sections.map((section) => (
                    <PolicySection key={section.id} section={section} />
                ))}
            </div>

            {policy.demonstrator && (
                <div className="w-full max-w-2xl px-6">
                    <PolicyDemonstrator data={policy.demonstrator} />
                </div>
            )}

            {policy.timeline && (
                <div className="w-full max-w-2xl px-6">
                    <PolicyTimeline
                        phases={policy.timeline.phases}
                        heading={policy.timeline.heading}
                        footer={policy.timeline.footer}
                    />
                </div>
            )}

            {policy.faq && policy.faq.length > 0 && (
                <div className="w-full max-w-2xl px-6">
                    <PolicyFAQ items={policy.faq} />
                </div>
            )}

            {policy.cta && (
                <div className="w-full max-w-2xl px-6">
                    <PolicyCTA
                        heading={policy.cta.heading}
                        lead={policy.cta.lead}
                        audiences={policy.cta.audiences}
                        contactEmail={policy.cta.contactEmail}
                        contactLabel={policy.cta.contactLabel}
                        footnote={policy.cta.footnote}
                    />
                </div>
            )}

            {policy.downloads && policy.downloads.length > 0 && (
                <div className="w-full max-w-2xl px-6">
                    <PolicyDownloads items={policy.downloads} />
                </div>
            )}

            <div className="px-6 py-10" />

            </main>
        </div>
    );
}
