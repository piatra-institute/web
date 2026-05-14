import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'mapping when higher taxes help, hurt, or become state capacity across four fiscal rationales';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/fiscal-compass',
    {
        name: 'fiscal-compass',
        title: 'fiscal compass',
        description,
        topics: ['economics', 'political-science', 'philosophy'],
        operations: ['landscape', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'fiscal compass · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'fiscal compass · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/fiscal-compass.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
