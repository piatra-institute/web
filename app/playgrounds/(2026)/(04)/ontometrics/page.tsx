import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/ontometrics',
    {
        name: 'ontometrics',
        title: 'Ontometrics',
        description: 'measuring whether an ontology is underdeveloped, calibrated, or overdetermined',
        topics: ['philosophy', 'mathematics', 'computer-science'],
        operations: ['anatomy', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'ontometrics \u00B7 playgrounds',
    description: 'measuring whether an ontology is underdeveloped, calibrated, or overdetermined',

    openGraph: {
        ...defaultOpenGraph,
        title: 'ontometrics \u00B7 playgrounds \u00B7 piatra.institute',
        description: 'measuring whether an ontology is underdeveloped, calibrated, or overdetermined',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/ontometrics.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
