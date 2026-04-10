import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/moral-phase-space',
    {
        name: 'moral-phase-space',
        title: 'Moral phase space',
        description: 'three non-crude moral formalisms applied to the same political scenario',
        topics: ['philosophy', 'political-science', 'mathematics'],
        operations: ['anatomy', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'moral phase space \u00B7 playgrounds',
    description: 'three non-crude moral formalisms applied to the same political scenario',

    openGraph: {
        ...defaultOpenGraph,
        title: 'moral phase space \u00B7 playgrounds \u00B7 piatra.institute',
        description: 'three non-crude moral formalisms applied to the same political scenario',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/moral-phase-space.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
