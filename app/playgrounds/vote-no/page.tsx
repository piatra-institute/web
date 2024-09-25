import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import VoteNoPlayground from './playground';



export const metadata: Metadata = {
    title: 'vote no · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'vote no · playgrounds · piatra.institute',
        description: '',
    },
};

export default function VoteNo() {
    return (
        <VoteNoPlayground />
    );
}
