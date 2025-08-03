import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import BerkshireEnginePlayground from './playground';



export const metadata: Metadata = {
    title: 'berkshire engine · playgrounds',
    description: 'insurance float as investment capital',

    openGraph: {
        ...defaultOpenGraph,
        title: 'berkshire engine · playgrounds · piatra.institute',
        description: 'insurance float as investment capital',
    },
};

export default function BerkshireEngine() {
    return (
        <BerkshireEnginePlayground />
    );
}
