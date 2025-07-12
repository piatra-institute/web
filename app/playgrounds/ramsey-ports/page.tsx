import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { defaultOpenGraph } from '@/data/metadata';



export const metadata: Metadata = {
    title: 'ramsey ports · playgrounds',
    description: 'Interactive exploration of airport pricing models based on Ramsey pricing principles. Compare economic outcomes between current and privatized airport models.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'ramsey ports · playgrounds · piatra.institute',
        description: 'Interactive exploration of airport pricing models based on Ramsey pricing principles. Compare economic outcomes between current and privatized airport models.',
    },
};


const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export default function Page() {
    return <Playground />;
}