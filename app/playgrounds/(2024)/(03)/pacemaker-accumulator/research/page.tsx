import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2024)/(03)/pacemaker-accumulator/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'pacemaker-accumulator · research · playgrounds',
    description: 'research companion for the pacemaker-accumulator playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'pacemaker-accumulator · research · playgrounds · piatra.institute',
        description: 'research companion for the pacemaker-accumulator playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="pacemaker-accumulator" />
            </div>
        </div>
    );
}
