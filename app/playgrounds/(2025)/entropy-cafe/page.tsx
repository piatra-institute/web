import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import EntropyCafePlayground from './playground';



export const metadata: Metadata = {
    title: 'entropy café · playgrounds',
    description: 'entropy and complexity through coffee mixing metaphor',

    openGraph: {
        ...defaultOpenGraph,
        title: 'entropy café · playgrounds · piatra.institute',
        description: 'entropy and complexity through coffee mixing metaphor',
    },
};

export default function EntropyCafe() {
    return (
        <EntropyCafePlayground />
    );
}