import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'north-south divergence · playgrounds',
    description: 'accelerants, aggregation models, and Shapley attribution across historical time bins',

    openGraph: {
        ...defaultOpenGraph,
        title: 'north-south divergence · playgrounds · piatra.institute',
        description: 'accelerants, aggregation models, and Shapley attribution across historical time bins',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/north-south-divergence.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
