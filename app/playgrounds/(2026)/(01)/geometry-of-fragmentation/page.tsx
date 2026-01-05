import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';



export const metadata: Metadata = {
    title: 'geometry of fragmentation · playgrounds',
    description: 'random fragmentation converging to universal attractors',

    openGraph: {
        ...defaultOpenGraph,
        title: 'geometry of fragmentation · playgrounds · piatra.institute',
        description: 'random fragmentation converging to universal attractors',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/geometry-of-fragmentation.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
