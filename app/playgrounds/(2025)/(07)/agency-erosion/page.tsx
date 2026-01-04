import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'agency erosion · playgrounds',
    description: 'Interactive exploration of identity substitution dynamics and the erosion of collective agency through amplified signaling',

    openGraph: {
        ...defaultOpenGraph,
        title: 'agency erosion · playgrounds · piatra.institute',
        description: 'Interactive exploration of identity substitution dynamics and the erosion of collective agency through amplified signaling',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/agency-erosion.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
