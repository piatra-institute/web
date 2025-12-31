import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import CptVariancePlayground from './playground';



export const metadata: Metadata = {
    title: 'cpt-variance · playgrounds',
    description: 'symmetry exploration of charge, parity, and time reversal',

    openGraph: {
        ...defaultOpenGraph,
        title: 'cpt-variance · playgrounds · piatra.institute',
        description: 'symmetry exploration of charge, parity, and time reversal',
    },
};

export default function CptVariance() {
    return (
        <CptVariancePlayground />
    );
}
