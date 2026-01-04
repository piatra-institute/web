import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';



export const metadata: Metadata = {
    title: 'fracqunx · playgrounds',
    description: 'dynamical, fractional quincunx-like board',

    openGraph: {
        ...defaultOpenGraph,
        title: 'fracqunx · playgrounds · piatra.institute',
        description: 'dynamical, fractional quincunx-like board',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/fracqunx.png',
            },
        ],
    },
};

export default function Fracqunx() {
    return (
        <ClientPlayground />
    );
}
