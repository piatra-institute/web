import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'measuring how an actor swap bends a forecast from its causal baseline';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/ideological-bent',
    {
        name: 'ideological-bent',
        title: 'ideological bent',
        description,
        topics: ['political-science', 'psychology'],
        operations: ['symmetry', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'ideological bent · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'ideological bent · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/ideological-bent.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
