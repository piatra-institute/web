import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/counterfactual-growth-engine',
    {
        name: 'counterfactual-growth-engine',
        title: 'Counterfactual growth engine',
        description: 'explore how countries might have evolved under another country’s economic path',
        topics: ['economics', 'political-science', 'mathematics'],
        operations: ['landscape', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'counterfactual growth engine · playgrounds',
    description: 'explore how countries might have evolved under another country’s economic path',

    openGraph: {
        ...defaultOpenGraph,
        title: 'counterfactual growth engine · playgrounds · piatra.institute',
        description: 'explore how countries might have evolved under another country’s economic path',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/counterfactual-growth-engine.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
