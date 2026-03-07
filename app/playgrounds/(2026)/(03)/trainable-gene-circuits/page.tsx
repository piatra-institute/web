import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'trainable gene circuits - playgrounds',
    description: 'associative memory, bistable commitment, and oscillatory state in gene regulatory networks',

    openGraph: {
        ...defaultOpenGraph,
        title: 'trainable gene circuits - playgrounds - piatra.institute',
        description: 'associative memory, bistable commitment, and oscillatory state in gene regulatory networks',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/trainable-gene-circuits.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
