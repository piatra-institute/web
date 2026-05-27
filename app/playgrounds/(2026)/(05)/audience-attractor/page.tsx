import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'how floors, ceilings, and basin transitions shape the viewership of personality-driven media';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/audience-attractor',
    {
        name: 'audience-attractor',
        title: 'audience attractor',
        description,
        topics: ['economics', 'sociology', 'mathematics'],
        operations: ['landscape', 'threshold'],
    },
);

export const metadata: Metadata = {
    title: 'audience attractor · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'audience attractor · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/audience-attractor.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
