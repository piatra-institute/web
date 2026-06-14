import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'orbits, attractors, and the shared logic of form across math, evolution, and development';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/arithmetic-dynamics',
    {
        name: 'arithmetic-dynamics',
        title: 'arithmetic dynamics',
        description,
        topics: ['mathematics', 'biology'],
        operations: ['morphogenesis', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'arithmetic dynamics · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'arithmetic dynamics · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/arithmetic-dynamics.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
