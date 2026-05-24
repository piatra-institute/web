import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'horizons, null paths, and the causal structure of rotating black holes';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/kerr-causality',
    {
        name: 'kerr-causality',
        title: 'Kerr causality',
        description,
        topics: ['physics', 'mathematics'],
        operations: ['landscape', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'Kerr causality · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'Kerr causality · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/kerr-causality.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
