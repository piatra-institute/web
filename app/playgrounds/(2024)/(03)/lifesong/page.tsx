import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import LifesongPlayground from './playground';



export const metadata: Metadata = {
    title: 'lifesong · playgrounds',
    description: 'musical patterns that emerge from biological processes',

    openGraph: {
        ...defaultOpenGraph,
        title: 'lifesong · playgrounds · piatra.institute',
        description: 'musical patterns that emerge from biological processes',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/lifesong.png',
            },
        ],
    },
};

export default function Lifesong() {
    return (
        <LifesongPlayground />
    );
}
