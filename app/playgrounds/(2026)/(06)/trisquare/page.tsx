import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'conformal quantum gravity, a perfect-square action, and 4D scalar phi-fourth';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/trisquare',
    {
        name: 'trisquare',
        title: 'trisquare',
        description,
        topics: ['physics', 'mathematics'],
        operations: ['symmetry', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'trisquare · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'trisquare · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/trisquare.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
