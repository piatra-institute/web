import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';



export const metadata: Metadata = {
    title: 'entropy café · playgrounds',
    description: 'entropy and complexity through coffee mixing metaphor',

    openGraph: {
        ...defaultOpenGraph,
        title: 'entropy café · playgrounds · piatra.institute',
        description: 'entropy and complexity through coffee mixing metaphor',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/entropy-cafe.png',
            },
        ],
    },
};

export default function EntropyCafe() {
    return (
        <ClientPlayground />
    );
}
