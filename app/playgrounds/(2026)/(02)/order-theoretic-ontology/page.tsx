import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'order-theoretic ontology · playgrounds',
    description: 'Build ontologies as posets and diagnose cycles, leaks, and relation-level contradictions.',

    openGraph: {
        ...defaultOpenGraph,
        title: 'order-theoretic ontology · playgrounds · piatra.institute',
        description: 'Build ontologies as posets and diagnose cycles, leaks, and relation-level contradictions.',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/order-theoretic-ontology.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
