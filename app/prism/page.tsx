import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PrismList from './components/PrismList';



export const metadata: Metadata = {
    title: 'prism',
    description: 'films, series, and games',

    openGraph: {
        ...defaultOpenGraph,
        title: 'prism · piatra.institute',
        description: 'films, series, and games',
    },
};


export default function Prism() {
    return <PrismList />;
}
