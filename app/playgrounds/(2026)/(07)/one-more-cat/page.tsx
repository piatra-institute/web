import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'a systems model of how a household crosses from one cat to a hundred, where care capacity breaks, and what bends the curve';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(07)/one-more-cat',
    {
        name: 'one-more-cat',
        title: 'one more cat',
        description,
        topics: ['economics', 'psychology', 'sociology'],
        operations: ['threshold', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'one more cat · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'one more cat · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/one-more-cat.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
