import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'how moral saturation, ressentiment, and tribal reward push people from ordinary care to defending the indefensible';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/uncare-engine',
    {
        name: 'uncare-engine',
        title: 'the uncare engine',
        description,
        topics: ['philosophy', 'sociology', 'psychology'],
        operations: ['threshold', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'the uncare engine · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'the uncare engine · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/uncare-engine.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
