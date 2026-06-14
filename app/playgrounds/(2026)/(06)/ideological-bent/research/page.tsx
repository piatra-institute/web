import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(06)/ideological-bent/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'ideological bent · research · playgrounds',
    description: 'research companion for the ideological bent playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'ideological bent · research · playgrounds · piatra.institute',
        description: 'research companion for the ideological bent playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="ideological bent" />
            </div>
        </div>
    );
}
