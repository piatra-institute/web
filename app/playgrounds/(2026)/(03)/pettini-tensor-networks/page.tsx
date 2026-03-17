import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';


export const metadata: Metadata = {
    title: 'pettini tensor networks · playgrounds',
    description: 'tensor network compression of biological search processes with optional long-range electrodynamic recruitment',

    openGraph: {
        ...defaultOpenGraph,
        title: 'pettini tensor networks · playgrounds · piatra.institute',
        description: 'tensor network compression of biological search processes with optional long-range electrodynamic recruitment',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/pettini-tensor-networks.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
