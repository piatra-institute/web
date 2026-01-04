import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'Chladni generator · playgrounds',
    description: 'exploring standing waves, reaction-diffusion, and morphogenesis patterns',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Chladni generator · playgrounds · piatra.institute',
        description: 'exploring standing waves, reaction-diffusion, and morphogenesis patterns',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
