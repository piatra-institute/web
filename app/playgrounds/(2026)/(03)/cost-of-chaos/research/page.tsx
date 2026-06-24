import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(03)/cost-of-chaos/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'cost of chaos · research · playgrounds',
    description: 'research companion for the cost of chaos playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'cost of chaos · research · playgrounds · piatra.institute',
        description: 'research companion for the cost of chaos playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="cost of chaos" />
            </div>
        </div>
    );
}
