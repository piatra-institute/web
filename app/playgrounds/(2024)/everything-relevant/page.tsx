import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import EverythingRelevantPlayground from './playground';



export const metadata: Metadata = {
    title: 'everything... relevant · playgrounds',
    description: 'playful take on a theory of everything',

    openGraph: {
        ...defaultOpenGraph,
        title: 'everything... relevant · playgrounds · piatra.institute',
        description: 'playful take on a theory of everything',
    },
};

export default function EverythingRelevant() {
    return (
        <EverythingRelevantPlayground />
    );
}
