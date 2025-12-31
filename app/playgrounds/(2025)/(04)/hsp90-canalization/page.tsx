import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'Hsp90 canalization · playgrounds',
    description: 'chaperone-driven canalization of latent phenotypic variation',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Hsp90 canalization · playgrounds · piatra.institute',
        description: 'chaperone-driven canalization of latent phenotypic variation',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
