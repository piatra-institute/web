import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import EyevolutionPlayground from './playground';



export const metadata: Metadata = {
    title: 'eyevolution · playgrounds',
    description: 'evolutionary development of visual systems across species',

    openGraph: {
        ...defaultOpenGraph,
        title: 'eyevolution · playgrounds · piatra.institute',
        description: 'evolutionary development of visual systems across species',
    },
};

export default function Eyevolution() {
    return (
        <EyevolutionPlayground />
    );
}
