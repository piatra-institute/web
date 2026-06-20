import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PiatraBenchView, { BenchData } from './components/PiatraBenchView';


export const dynamic = 'force-static';


export const metadata: Metadata = {
    title: 'piatrabench',
    description: 'a benchmark for the playgrounds: every one scored on conformance, ranked by generating model',

    openGraph: {
        ...defaultOpenGraph,
        title: 'piatrabench · piatra.institute',
        description: 'a benchmark for the playgrounds: every one scored on conformance, ranked by generating model',
    },
};


function loadReport(): BenchData | null {
    try {
        const raw = fs.readFileSync(path.join(process.cwd(), 'piatrabench/report.json'), 'utf-8');
        const report = JSON.parse(raw);
        return {
            generated: report.generated,
            n: report.n,
            avg: report.avg,
            unattributed: report.unattributed,
            honestyCounts: report.honestyCounts,
            links: report.links,
            models: report.models,
            playgrounds: report.results.map((r: {
                slug: string; name: string; link: string; date: string | null;
                era: string; year: number | null; month: number | null;
                model: string | null; score: number; headline: number;
                catPct: Record<string, number | null>;
                honesty: {
                    calibration: string;
                    fit: { mean: number; worst: number } | null;
                    citations: string;
                    verdict: string;
                    flags: string[];
                };
            }) => ({
                slug: r.slug,
                name: r.name,
                link: r.link,
                date: r.date,
                ym: (r.year ?? 0) * 100 + (r.month ?? 0),
                model: r.model,
                score: r.score,
                headline: r.headline,
                catPct: r.catPct,
                honesty: r.honesty,
            })),
        };
    } catch {
        return null;
    }
}


const data = loadReport();


export default function Page() {
    return <PiatraBenchView data={data} />;
}
