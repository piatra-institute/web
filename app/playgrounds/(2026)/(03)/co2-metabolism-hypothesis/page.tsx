import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(03)/co2-metabolism-hypothesis',
    {
        name: 'co2-metabolism-hypothesis',
        title: 'co2 metabolism hypothesis',
        description: 'proto-metabolic threshold behavior in alkaline hydrothermal vent chemistry',
        topics: ['biology', 'chemistry'],
        operations: ['threshold', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'co₂-metabolism hypothesis · playgrounds',
    description: 'proto-metabolic threshold behavior in alkaline hydrothermal vent chemistry',

    openGraph: {
        ...defaultOpenGraph,
        title: 'co₂-metabolism hypothesis · playgrounds · piatra.institute',
        description: 'proto-metabolic threshold behavior in alkaline hydrothermal vent chemistry',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/co2-metabolism-hypothesis.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
