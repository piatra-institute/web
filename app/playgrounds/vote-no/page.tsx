import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import VoteNoPlayground from './playground';



export const metadata: Metadata = {
    title: 'vote no · playgrounds',
    description: 'exploring democratic resistance and the power of rejection',

    openGraph: {
        ...defaultOpenGraph,
        title: 'vote no · playgrounds · piatra.institute',
        description: 'exploring democratic resistance and the power of rejection',
    },
};

export default function VoteNo() {
    return (
        <VoteNoPlayground />
    );
}
