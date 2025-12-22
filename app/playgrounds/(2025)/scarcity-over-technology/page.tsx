import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';



export const metadata: Metadata = {
    title: 'scarcity over technology · playgrounds',
    description: 'economy as ∂(scarcity)/∂(technology)',

    openGraph: {
        ...defaultOpenGraph,
        title: 'scarcity over technology · playgrounds · piatra.institute',
        description: 'economy as ∂(scarcity)/∂(technology)',
    },
};

export default function ScarcityOverTechnology() {
    return (
        <ClientPlayground />
    );
}
