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
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/chladni-generator.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
