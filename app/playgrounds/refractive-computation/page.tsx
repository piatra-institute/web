import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import RefractiveComputationPlayground from './playground';



export const metadata: Metadata = {
    title: 'refractive computation · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'refractive computation · playgrounds · piatra.institute',
        description: '',
    },
};

export default function RefractiveComputation() {
    return (
        <RefractiveComputationPlayground />
    );
}
