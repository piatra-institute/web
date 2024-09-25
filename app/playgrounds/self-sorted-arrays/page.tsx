import type { Metadata } from 'next';

import SelfSortedArraysPlayground from './playground';



export const metadata: Metadata = {
    title: 'self-sorted arrays · playgrounds',
    description: 'arrays sorted bottom-up with cell-like numbers',

    openGraph: {
        type: 'website',
        url: 'https://piatra.institute',
        title: 'self-sorted arrays · playgrounds · piatra.institute',
        description: 'arrays sorted bottom-up with cell-like numbers',
        siteName: 'piatra.institute',
        images: [
            {
                url: 'https://piatra.institute/og.png',
            },
        ],
    },
};

export default function SelfSortedArrays() {
    return (
        <SelfSortedArraysPlayground />
    );
}
