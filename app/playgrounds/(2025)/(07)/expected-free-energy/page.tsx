import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'expected free energy · playgrounds',
    description: 'Interactive visualization of Expected Free Energy (EFE) estimation via Monte Carlo sampling in active inference.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'expected free energy · playgrounds · piatra.institute',
        description: 'Interactive visualization of Expected Free Energy (EFE) estimation via Monte Carlo sampling in active inference.',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/expected-free-energy.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
