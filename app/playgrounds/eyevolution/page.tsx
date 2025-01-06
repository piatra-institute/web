import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import EyevolutionPlayground from './playground';



export const metadata: Metadata = {
    title: 'eyevolution · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'eyevolution · playgrounds · piatra.institute',
        description: '',
    },
};

export default function Fracqunx() {
    return (
        <EyevolutionPlayground />
    );
}
