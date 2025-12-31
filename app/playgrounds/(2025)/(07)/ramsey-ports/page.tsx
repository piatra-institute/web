import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'ramsey ports · playgrounds',
    description: 'Interactive exploration of airport pricing models based on Ramsey pricing principles. Compare economic outcomes between current and privatized airport models.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'ramsey ports · playgrounds · piatra.institute',
        description: 'Interactive exploration of airport pricing models based on Ramsey pricing principles. Compare economic outcomes between current and privatized airport models.',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
