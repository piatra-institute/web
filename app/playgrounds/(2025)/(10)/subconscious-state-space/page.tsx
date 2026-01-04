import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'subconscious state space · playgrounds',
    description: 'exploring molecular-scale control of conscious access through neural dynamics simulation',

    openGraph: {
        ...defaultOpenGraph,
        title: 'subconscious state space · playgrounds · piatra.institute',
        description: 'exploring molecular-scale control of conscious access through neural dynamics simulation',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/subconscious-state-space.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
