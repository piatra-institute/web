import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2025)/(06)/debt-singularity/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'debt singularity · research · playgrounds',
    description: 'research companion for the debt singularity playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'debt singularity · research · playgrounds · piatra.institute',
        description: 'research companion for the debt singularity playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="debt singularity" />
            </div>
        </div>
    );
}
