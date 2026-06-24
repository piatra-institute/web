import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(03)/greimas-square-dynamics/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'greimas square dynamics · research · playgrounds',
    description: 'research companion for the greimas square dynamics playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'greimas square dynamics · research · playgrounds · piatra.institute',
        description: 'research companion for the greimas square dynamics playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="greimas square dynamics" />
            </div>
        </div>
    );
}
