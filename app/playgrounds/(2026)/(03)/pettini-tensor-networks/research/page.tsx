import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import fs from 'fs';
import path from 'path';

import ResearchRenderer from '@/components/ResearchRenderer';

const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(03)/pettini-tensor-networks/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'Pettini tensor networks · research · playgrounds',
    description: 'research companion for Pettini tensor networks',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Pettini tensor networks · research · playgrounds · piatra.institute',
        description: 'research companion for Pettini tensor networks',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="pettini tensor networks" />
            </div>
        </div>
    );
}
