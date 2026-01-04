import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'Cipolla quadrant · playgrounds',
    description: 'exploring stupidity, intelligence, helplessness, and banditry through Cipolla\'s framework',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Cipolla quadrant · playgrounds · piatra.institute',
        description: 'exploring stupidity, intelligence, helplessness, and banditry through Cipolla\'s framework',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/cipolla-quadrant.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
