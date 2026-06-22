import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'metabolic rate, body mass, and the three-quarter-power law';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/allometric-scaling',
    {
        name: 'allometric-scaling',
        title: 'allometric scaling',
        description,
        topics: ['biology', 'physics'],
        operations: ['symmetry', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'allometric scaling · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'allometric scaling · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/allometric-scaling.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
