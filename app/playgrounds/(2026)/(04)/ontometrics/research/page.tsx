import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(04)/ontometrics/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'ontometrics · research · playgrounds',
    description: 'research companion for the ontometrics playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'ontometrics · research · playgrounds · piatra.institute',
        description: 'research companion for the ontometrics playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="ontometrics" />
            </div>
        </div>
    );
}
