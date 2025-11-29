import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { defaultOpenGraph } from '@/data/metadata';



export const metadata: Metadata = {
    title: 'debt singularity · playgrounds',
    description: 'Explore the phase transitions of debt through economic conditions. Interactive visualization of how interest rates and inflation affect the real value of debt over time.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'debt singularity · playgrounds · piatra.institute',
        description: 'Explore the phase transitions of debt through economic conditions. Interactive visualization of how interest rates and inflation affect the real value of debt over time.',
    },
};


const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export default function Page() {
    return <Playground />;
}
