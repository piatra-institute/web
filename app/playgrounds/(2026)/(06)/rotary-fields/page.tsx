import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'rotary attention and neural phase coding share one move: position as angle.';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/rotary-fields',
    {
        name: 'rotary-fields',
        title: 'rotary fields',
        description,
        topics: ['computer-science', 'neuroscience', 'mathematics'],
        operations: ['symmetry', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'rotary fields · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'rotary fields · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/rotary-fields.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
