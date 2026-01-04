import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'tuition resentment · playgrounds',
    description: 'Exploring high-tuition psychodynamics and attribution of blame',

    openGraph: {
        ...defaultOpenGraph,
        title: 'tuition resentment · playgrounds · piatra.institute',
        description: 'Exploring high-tuition psychodynamics and attribution of blame',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
