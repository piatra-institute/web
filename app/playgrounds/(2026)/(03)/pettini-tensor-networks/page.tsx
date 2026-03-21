import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(03)/pettini-tensor-networks',
    {
        name: 'pettini-tensor-networks',
        title: 'Pettini tensor networks',
        description: 'tensor network compression of biological search with optional long-range electrodynamic recruitment',
        topics: ['physics', 'biology'],
        operations: ['anatomy', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'Pettini tensor networks · playgrounds',
    description: 'tensor network compression of biological search processes with optional long-range electrodynamic recruitment',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Pettini tensor networks · playgrounds · piatra.institute',
        description: 'tensor network compression of biological search processes with optional long-range electrodynamic recruitment',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/pettini-tensor-networks.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
