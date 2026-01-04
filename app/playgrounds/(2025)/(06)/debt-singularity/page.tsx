import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'debt singularity · playgrounds',
    description: 'Explore the phase transitions of debt through economic conditions. Interactive visualization of how interest rates and inflation affect the real value of debt over time.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'debt singularity · playgrounds · piatra.institute',
        description: 'Explore the phase transitions of debt through economic conditions. Interactive visualization of how interest rates and inflation affect the real value of debt over time.',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/debt-singularity.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
