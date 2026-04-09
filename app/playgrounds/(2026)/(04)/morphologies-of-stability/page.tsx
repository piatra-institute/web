import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/morphologies-of-stability',
    {
        name: 'morphologies-of-stability',
        title: 'Morphologies of stability',
        description: 'canonical patterns by which dynamical systems hold form',
        topics: ['mathematics', 'physics', 'philosophy'],
        operations: ['landscape', 'threshold'],
    },
);

export const metadata: Metadata = {
    title: 'morphologies of stability · playgrounds',
    description: 'canonical patterns by which dynamical systems hold form',

    openGraph: {
        ...defaultOpenGraph,
        title: 'morphologies of stability · playgrounds · piatra.institute',
        description: 'canonical patterns by which dynamical systems hold form',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/morphologies-of-stability.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
