import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { defaultOpenGraph } from '@/data/metadata';



export const metadata: Metadata = {
    title: 'criticality · playgrounds',
    description: 'Interactive exploration of branching criticality and distance-to-criticality metrics in complex systems.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'criticality · playgrounds · piatra.institute',
        description: 'Interactive exploration of branching criticality and distance-to-criticality metrics in complex systems.',
    },
};


const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export default function Page() {
    return <Playground />;
}
