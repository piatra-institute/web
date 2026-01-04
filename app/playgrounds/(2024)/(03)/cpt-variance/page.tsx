import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import CptVariancePlayground from './playground';



export const metadata: Metadata = {
    title: 'CPT variance · playgrounds',
    description: 'symmetry exploration of charge, parity, and time reversal',

    openGraph: {
        ...defaultOpenGraph,
        title: 'CPT variance · playgrounds · piatra.institute',
        description: 'symmetry exploration of charge, parity, and time reversal',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/cpt-variance.png',
            },
        ],
    },
};

export default function CptVariance() {
    return (
        <CptVariancePlayground />
    );
}
