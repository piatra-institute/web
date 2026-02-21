import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import fs from 'fs';
import path from 'path';

import ResearchRenderer from '@/components/ResearchRenderer';

const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(02)/trust-transaction-spectrum/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'trust-transaction spectrum · research · playgrounds',
    description: 'research companion for trust-transaction spectrum',

    openGraph: {
        ...defaultOpenGraph,
        title: 'trust-transaction spectrum · research · playgrounds · piatra.institute',
        description: 'research companion for trust-transaction spectrum',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} />
            </div>
        </div>
    );
}
