import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import BerkshireEnginePlayground from './playground';



export const metadata: Metadata = {
    title: 'berkshire engine · playgrounds',
    description: 'explore how Warren Buffett uses insurance float as an investment engine',

    openGraph: {
        ...defaultOpenGraph,
        title: 'berkshire engine · playgrounds · piatra.institute',
        description: 'explore how Warren Buffett uses insurance float as an investment engine',
    },
};

export default function BerkshireEngine() {
    return (
        <BerkshireEnginePlayground />
    );
}