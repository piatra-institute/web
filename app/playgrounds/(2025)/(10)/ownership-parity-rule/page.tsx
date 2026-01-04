import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'ownership parity rule · playgrounds',
    description: 'consumer-equity parity principle: investing equal amounts when purchasing tech products',

    openGraph: {
        ...defaultOpenGraph,
        title: 'ownership parity rule · playgrounds · piatra.institute',
        description: 'consumer-equity parity principle: investing equal amounts when purchasing tech products',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
