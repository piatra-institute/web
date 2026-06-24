import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import ResearchRenderer from '@/components/ResearchRenderer';


const content = fs.readFileSync(
    path.join(process.cwd(), 'app/playgrounds/(2026)/(02)/order-theoretic-ontology/research/content.md'),
    'utf-8',
);

export const metadata: Metadata = {
    title: 'order theoretic ontology · research · playgrounds',
    description: 'research companion for the order-theoretic ontology playground',
    openGraph: {
        ...defaultOpenGraph,
        title: 'order theoretic ontology · research · playgrounds · piatra.institute',
        description: 'research companion for the order-theoretic ontology playground',
    },
};

export default function ResearchPage() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={content} title="order theoretic ontology" />
            </div>
        </div>
    );
}
