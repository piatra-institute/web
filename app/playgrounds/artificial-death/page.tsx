import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import ArtificialDeathPlayground from './playground';



export const metadata: Metadata = {
    title: 'artificial death · playgrounds',
    description: 'exploring the concept of artificial death in digital systems',

    openGraph: {
        ...defaultOpenGraph,
        title: 'artificial death · playgrounds · piatra.institute',
        description: 'exploring the concept of artificial death in digital systems',
    },
};

export default function ArtificialDeath() {
    return (
        <ArtificialDeathPlayground />
    );
}