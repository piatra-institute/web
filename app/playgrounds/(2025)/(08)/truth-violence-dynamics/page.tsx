import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'truth violence dynamics · playgrounds',
    description: 'Interactive exploration of the coupled ODE model for uncertainty, truth-seeking, and punitive force dynamics',

    openGraph: {
        ...defaultOpenGraph,
        title: 'truth violence dynamics · playgrounds · piatra.institute',
        description: 'Interactive exploration of the coupled ODE model for uncertainty, truth-seeking, and punitive force dynamics',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/truth-violence-dynamics.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
