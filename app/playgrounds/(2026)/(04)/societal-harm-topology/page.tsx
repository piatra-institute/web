import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/societal-harm-topology',
    {
        name: 'societal-harm-topology',
        title: 'Societal harm topology',
        description: 'counterfactual, distributed, multi-domain harm from concentrated private power',
        topics: ['political-science', 'economics', 'philosophy'],
        operations: ['anatomy', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'societal harm topology · playgrounds',
    description: 'counterfactual, distributed, multi-domain harm from concentrated private power',

    openGraph: {
        ...defaultOpenGraph,
        title: 'societal harm topology · playgrounds · piatra.institute',
        description: 'counterfactual, distributed, multi-domain harm from concentrated private power',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/societal-harm-topology.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
