import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(03)/geometries-of-action',
    {
        name: 'geometries-of-action',
        title: 'Geometries of Action',
        description: 'Exploring neural manifolds as geometry, dynamics, cross-subject alignment, and clinical decoding',
        topics: ['neuroscience', 'mathematics'],
        operations: ['landscape', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'geometries of action \u00b7 playgrounds',
    description: 'Neural manifolds as geometry, dynamics, alignment, and decoding \u2014 explore the core claims of the neural manifold framework',

    openGraph: {
        ...defaultOpenGraph,
        title: 'geometries of action \u00b7 playgrounds \u00b7 piatra.institute',
        description: 'Neural manifolds as geometry, dynamics, alignment, and decoding',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/geometries-of-action.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
