import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import LifesongPlayground from './playground';



export const metadata: Metadata = {
    title: 'lifesong · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'lifesong · playgrounds · piatra.institute',
        description: '',
    },
};

export default function Lifesong() {
    return (
        <LifesongPlayground />
    );
}
