import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(03)/geometries-of-action/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'geometries of action · research · playgrounds',
    description: 'research companion for the geometries of action playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'geometries of action · research · playgrounds · piatra.institute',
        description: 'research companion for the geometries of action playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="geometries of action" />
            </div>
        </div>
    );
}
