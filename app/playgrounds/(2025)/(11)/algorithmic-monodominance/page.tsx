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
    },
};

export default function Page() {
    return <Playground />;
}
