import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import RaupianMorphospacePlayground from './playground';



export const metadata: Metadata = {
    title: 'Raupian morphospace · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Raupian morphospace · playgrounds · piatra.institute',
        description: '',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/raupian-morphospace.png',
            },
        ],
    },
};

export default function RaupianMorphospace() {
    return (
        <RaupianMorphospacePlayground />
    );
}
