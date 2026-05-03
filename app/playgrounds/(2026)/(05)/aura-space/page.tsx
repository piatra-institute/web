import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/aura-space',
    {
        name: 'aura-atlas',
        title: 'aura atlas',
        description:
            'navigating aura as a relational field over object, context, observer, and historical time',
        topics: ['philosophy', 'aesthetics', 'sociology'],
        operations: ['landscape', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'aura atlas · playgrounds',
    description:
        'navigating the relational field of cultural distance, scarcity, ritual, institution, and reception',

    openGraph: {
        ...defaultOpenGraph,
        title: 'aura atlas · playgrounds · piatra.institute',
        description:
            'navigating the relational field of cultural distance, scarcity, ritual, institution, and reception',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/aura-atlas.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
