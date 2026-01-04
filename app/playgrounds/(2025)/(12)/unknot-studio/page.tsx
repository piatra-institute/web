import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'unknot studio · playgrounds',
    description: 'interactive exploration of torus knots, connected sums, and projection invariants',

    openGraph: {
        ...defaultOpenGraph,
        title: 'unknot studio · playgrounds · piatra.institute',
        description: 'interactive exploration of torus knots, connected sums, and projection invariants',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
