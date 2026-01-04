import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'algorithmic monodominance · playgrounds',
    description: 'phase transitions from concave to convex returns in algorithmic competition',

    openGraph: {
        ...defaultOpenGraph,
        title: 'algorithmic monodominance · playgrounds · piatra.institute',
        description: 'phase transitions from concave to convex returns in algorithmic competition',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/algorithmic-monodominance.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
