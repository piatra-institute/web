import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'authoritarian paternalism · playgrounds',
    description: 'Paternal signaling, order, and support co-evolution in authoritarian systems',

    openGraph: {
        ...defaultOpenGraph,
        title: 'authoritarian paternalism · playgrounds · piatra.institute',
        description: 'Paternal signaling, order, and support co-evolution in authoritarian systems',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
