import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'activation functions lab · playgrounds',
    description: 'invent, explore, and compare neural network activations',

    openGraph: {
        ...defaultOpenGraph,
        title: 'activation functions lab · playgrounds · piatra.institute',
        description: 'invent, explore, and compare neural network activations',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/activation-functions-lab.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
