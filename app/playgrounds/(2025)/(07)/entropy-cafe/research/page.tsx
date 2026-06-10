import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';

const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2025)/(07)/entropy-cafe/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'entropy café · research · playgrounds',
    description: 'research companion for entropy café',
    openGraph: {
        ...defaultOpenGraph,
        title: 'entropy café · research · playgrounds · piatra.institute',
        description: 'research companion for entropy café',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="entropy café" />
            </div>
        </div>
    );
}
