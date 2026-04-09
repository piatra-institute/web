import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/photosynthetic-state-space',
    {
        name: 'photosynthetic-state-space',
        title: 'Photosynthetic state space',
        description: 'the Z-scheme as a controllable landscape of energy flow, protection, and regime shifts across five species strategies',
        topics: ['biology', 'chemistry', 'physics'],
        operations: ['landscape', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'photosynthetic state space · playgrounds',
    description: 'the Z-scheme as a controllable landscape of energy flow, protection, and regime shifts',

    openGraph: {
        ...defaultOpenGraph,
        title: 'photosynthetic state space · playgrounds · piatra.institute',
        description: 'the Z-scheme as a controllable landscape of energy flow, protection, and regime shifts',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/photosynthetic-state-space.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
