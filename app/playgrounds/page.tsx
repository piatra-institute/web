import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PlaygroundsList, { BenchSummary } from './components/PlaygroundsList';



export const dynamic = 'force-static';


export const metadata: Metadata = {
    title: 'playgrounds',
    description: 'interactive explorations of ideas and concepts',

    openGraph: {
        ...defaultOpenGraph,
        title: 'playgrounds · piatra.institute',
        description: 'interactive explorations of ideas and concepts',
    },
};


function loadBench(): BenchSummary | null {
    try {
        const raw = fs.readFileSync(path.join(process.cwd(), 'piatrabench/report.json'), 'utf-8');
        const report = JSON.parse(raw);
        return {
            n: report.n,
            avg: report.avg,
            unattributed: report.unattributed,
            models: (report.models as { key: string; label: string; n: number; mean: number }[])
                .map((m) => ({ key: m.key, label: m.label, n: m.n, mean: m.mean })),
        };
    } catch {
        return null;
    }
}


const bench = loadBench();


export default function Playgrounds() {
    return <PlaygroundsList bench={bench} />;
}
