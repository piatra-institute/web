import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import EntropyCafePlayground from './playground';



export const metadata: Metadata = {
    title: 'entropy café · playgrounds',
    description: 'coffee and cream mixing as a metaphor for entropy',

    openGraph: {
        ...defaultOpenGraph,
        title: 'entropy café · playgrounds · piatra.institute',
        description: 'coffee and cream mixing as a metaphor for entropy',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/entropy-cafe.png',
            },
        ],
    },
};

export default function EntropyCafe() {
    return (
        <EntropyCafePlayground />
    );
}
