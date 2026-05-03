import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PoliciesList from './components/PoliciesList';



export const metadata: Metadata = {
    title: 'policies',
    description: 'policy and advocacy work — roadmaps and position documents',

    openGraph: {
        ...defaultOpenGraph,
        title: 'policies · piatra.institute',
        description: 'policy and advocacy work — roadmaps and position documents',
    },
};


export default function Policies() {
    return <PoliciesList />;
}
