import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(03)/modes-of-combination',
    {
        name: 'modes-of-combination',
        title: 'Modes of Combination',
        description: 'Atlas of product constructions across group theory, ring theory, category theory, and topology',
        topics: ['mathematics', 'philosophy'],
        operations: ['landscape', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'modes of combination · playgrounds',
    description: 'Atlas of product constructions — explore how mathematical objects combine across algebra, category theory, and topology',

    openGraph: {
        ...defaultOpenGraph,
        title: 'modes of combination · playgrounds · piatra.institute',
        description: 'Atlas of product constructions across group theory, ring theory, category theory, and topology',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/modes-of-combination.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
