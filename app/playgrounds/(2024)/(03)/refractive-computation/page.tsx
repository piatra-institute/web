import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import RefractiveComputationPlayground from './playground';



export const metadata: Metadata = {
    title: 'refractive computation · playgrounds',
    description: 'computing with light through optical refraction principles',

    openGraph: {
        ...defaultOpenGraph,
        title: 'refractive computation · playgrounds · piatra.institute',
        description: 'computing with light through optical refraction principles',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/refractive-computation.png',
            },
        ],
    },
};

export default function RefractiveComputation() {
    return (
        <RefractiveComputationPlayground />
    );
}
