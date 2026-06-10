import type { Metadata } from 'next';

import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import EntropyCafePlayground from './playground';


const description =
    'cream into coffee: entropy rises while complexity rises and then falls.';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2025)/(07)/entropy-cafe',
    {
        name: 'entropy-cafe',
        title: 'entropy café',
        description,
        topics: ['physics', 'chemistry'],
        operations: ['morphogenesis'],
    },
);

export const metadata: Metadata = {
    title: 'entropy café · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'entropy café · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/entropy-cafe.png',
            },
        ],
    },
};

export default function Page() {
    return <EntropyCafePlayground sourceContext={sourceContext} />;
}
