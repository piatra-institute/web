import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { defaultOpenGraph } from '@/data/metadata';



export const metadata: Metadata = {
    title: 'expected free energy · playgrounds',
    description: 'Interactive visualization of Expected Free Energy (EFE) estimation via Monte Carlo sampling in active inference.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'expected free energy · playgrounds · piatra.institute',
        description: 'Interactive visualization of Expected Free Energy (EFE) estimation via Monte Carlo sampling in active inference.',
    },
};


const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export default function Page() {
    return <Playground />;
}
