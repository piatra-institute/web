import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import FracqunxPlayground from './playground';



export const metadata: Metadata = {
    title: 'fracqunx · playgrounds',
    description: 'dynamical, fractional quincunx-like board',

    openGraph: {
        ...defaultOpenGraph,
        title: 'fracqunx · playgrounds · piatra.institute',
        description: 'dynamical, fractional quincunx-like board',
    },
};

export default function Fracqunx() {
    return (
        <FracqunxPlayground />
    );
}
