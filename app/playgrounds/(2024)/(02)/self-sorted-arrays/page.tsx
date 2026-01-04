import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import SelfSortedArraysPlayground from './playground';



export const metadata: Metadata = {
    title: 'self-sorted arrays · playgrounds',
    description: 'arrays sorted bottom-up with cell-like numbers',

    openGraph: {
        ...defaultOpenGraph,
        title: 'self-sorted arrays · playgrounds · piatra.institute',
        description: 'arrays sorted bottom-up with cell-like numbers',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/self-sorted-arrays.png',
            },
        ],
    },
};

export default function SelfSortedArrays() {
    return (
        <SelfSortedArraysPlayground />
    );
}
