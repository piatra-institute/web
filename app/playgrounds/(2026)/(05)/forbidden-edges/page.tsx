import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/forbidden-edges',
    {
        name: 'forbidden-edges',
        title: 'forbidden edges',
        description:
            'morality as constraint geometry over a multi-scale graph of agency, harm, and obstruction',
        topics: ['philosophy', 'sociology', 'neuroscience'],
        operations: ['tension', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'forbidden edges · playgrounds',
    description:
        'morality as constraint geometry over a multi-scale graph of agency, harm, and obstruction',

    openGraph: {
        ...defaultOpenGraph,
        title: 'forbidden edges · playgrounds · piatra.institute',
        description:
            'morality as constraint geometry over a multi-scale graph of agency, harm, and obstruction',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/forbidden-edges.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
