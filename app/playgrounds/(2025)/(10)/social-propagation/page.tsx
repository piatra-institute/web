import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'social propagation · playgrounds',
    description: 'comparing free-for-all vs policy-based social networks to measure political manipulation reduction',

    openGraph: {
        ...defaultOpenGraph,
        title: 'social propagation · playgrounds · piatra.institute',
        description: 'comparing free-for-all vs policy-based social networks to measure political manipulation reduction',
    },
};

export default function Page() {
    return <Playground />;
}
