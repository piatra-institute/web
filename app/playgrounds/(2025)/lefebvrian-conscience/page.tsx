import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import {
    defaultOpenGraph,
} from '@/data/metadata';



export const metadata: Metadata = {
    title: 'Lefebvrian conscience · playgrounds',
    description: 'agent-based simulation exploring Lefebvre\'s Algebra of Conscience',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Lefebvrian conscience · playgrounds · piatra.institute',
        description: 'agent-based simulation exploring Lefebvre\'s Algebra of Conscience',
    },
};

// Disable SSR for the playground canvas
const LefebvrePlayground = dynamic(
    () => import('./playground'),
    { ssr: false }
);


export default function Page() {
    return (
        <LefebvrePlayground />
    );
}
