import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import ByteBirthPlayground from './playground';



export const metadata: Metadata = {
    title: 'byte birth · playgrounds',
    description: 'the emergence of digital life from computational primitives',

    openGraph: {
        ...defaultOpenGraph,
        title: 'byte birth · playgrounds · piatra.institute',
        description: 'the emergence of digital life from computational primitives',
    },
};

export default function ByteBirth() {
    return (
        <ByteBirthPlayground />
    );
}