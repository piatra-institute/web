import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'criticality · playgrounds',
    description: 'Interactive exploration of branching criticality and distance-to-criticality metrics in complex systems.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'criticality · playgrounds · piatra.institute',
        description: 'Interactive exploration of branching criticality and distance-to-criticality metrics in complex systems.',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/criticality.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
