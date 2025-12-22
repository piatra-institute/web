import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'Lefebvrian conscience · playgrounds',
    description: 'agent-based simulation exploring Lefebvre\'s Algebra of Conscience',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Lefebvrian conscience · playgrounds · piatra.institute',
        description: 'agent-based simulation exploring Lefebvre\'s Algebra of Conscience',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
