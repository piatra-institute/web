import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'contronyms as context-sensitive operators';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/lexical-liar',
    {
        name: 'lexical-liar',
        title: 'the lexical liar',
        description,
        topics: ['philosophy', 'computer-science'],
        operations: ['tension', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'the lexical liar · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'the lexical liar · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/lexical-liar.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
