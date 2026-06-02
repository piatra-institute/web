import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'how moral weights and observation noise push a child-protection institution into removal, reunification, or rupture';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/family-threshold',
    {
        name: 'family-threshold',
        title: 'family threshold',
        description,
        topics: ['psychology', 'sociology', 'political-science'],
        operations: ['threshold', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'family threshold · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'family threshold · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/family-threshold.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
