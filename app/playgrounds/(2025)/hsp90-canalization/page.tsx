import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import {
    defaultOpenGraph,
} from '@/data/metadata';



export const metadata: Metadata = {
    title: 'Hsp90 canalization · playgrounds',
    description: 'chaperone-driven canalization of latent phenotypic variation',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Hsp90 canalization · playgrounds · piatra.institute',
        description: 'chaperone-driven canalization of latent phenotypic variation',
    },
};

// Disable SSR for the playground canvas
const Hsp90CanalizationPlayground = dynamic(
    () => import('./playground'),
    { ssr: false }
);


export default function Page() {
    return (
        <Hsp90CanalizationPlayground />
    );
}
