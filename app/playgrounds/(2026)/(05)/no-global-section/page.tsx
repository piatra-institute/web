import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'myths, novels, and the failure to glue local meaning into a single human story';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/no-global-section',
    {
        name: 'no-global-section',
        title: 'no global section',
        description,
        topics: ['philosophy', 'mathematics', 'aesthetics'],
        operations: ['anatomy', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'no global section · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'no global section · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/no-global-section.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
