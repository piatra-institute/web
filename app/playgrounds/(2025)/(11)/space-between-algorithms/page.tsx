import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'space between algorithms · playgrounds',
    description: 'intra- and inter-algorithm freedom through policy manifolds and goal slack',

    openGraph: {
        ...defaultOpenGraph,
        title: 'space between algorithms · playgrounds · piatra.institute',
        description: 'intra- and inter-algorithm freedom through policy manifolds and goal slack',
    },
};

export default function Page() {
    return <Playground />;
}
