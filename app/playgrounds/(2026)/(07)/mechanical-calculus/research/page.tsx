import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(07)/mechanical-calculus/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'mechanical calculus · research · playgrounds',
    description: 'research companion for mechanical calculus: the differential analyzer as an error budget',

    openGraph: {
        ...defaultOpenGraph,
        title: 'mechanical calculus · research · playgrounds · piatra.institute',
        description: 'research companion for mechanical calculus: the differential analyzer as an error budget',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="mechanical calculus" />
            </div>
        </div>
    );
}
