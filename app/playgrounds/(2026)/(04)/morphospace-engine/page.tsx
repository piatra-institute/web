import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/morphospace-engine',
    {
        name: 'morphospace-engine',
        title: 'Morphospace engine',
        description: 'node-graph experiments in the space of possible forms',
        topics: ['biology', 'philosophy', 'mathematics'],
        operations: ['morphogenesis', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'morphospace engine \u00B7 playgrounds',
    description: 'node-graph experiments in the space of possible forms',

    openGraph: {
        ...defaultOpenGraph,
        title: 'morphospace engine \u00B7 playgrounds \u00B7 piatra.institute',
        description: 'node-graph experiments in the space of possible forms',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/morphospace-engine.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
