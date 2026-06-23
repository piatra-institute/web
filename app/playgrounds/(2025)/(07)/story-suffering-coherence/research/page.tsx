import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2025)/(07)/story-suffering-coherence/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'story-suffering coherence · research · playgrounds',
    description: 'research companion for the story-suffering coherence playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'story-suffering coherence · research · playgrounds · piatra.institute',
        description: 'research companion for the story-suffering coherence playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="story-suffering coherence" />
            </div>
        </div>
    );
}
