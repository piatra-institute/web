import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2025)/(07)/geometry-becoming-topology/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'geometry becoming topology · research · playgrounds',
    description: 'research companion for the geometry becoming topology playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'geometry becoming topology · research · playgrounds · piatra.institute',
        description: 'research companion for the geometry becoming topology playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="geometry becoming topology" />
            </div>
        </div>
    );
}
