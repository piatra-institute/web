import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(05)/fiscal-compass/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'fiscal compass · research · playgrounds',
    description: 'research companion for the fiscal compass playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'fiscal compass · research · playgrounds · piatra.institute',
        description: 'research companion for the fiscal compass playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="fiscal compass" />
            </div>
        </div>
    );
}
