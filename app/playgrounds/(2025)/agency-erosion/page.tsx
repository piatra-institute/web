import { Metadata } from 'next';
import dynamic from 'next/dynamic';



const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'agency erosion · playgrounds',
    description: 'Interactive exploration of identity substitution dynamics and the erosion of collective agency through amplified signaling',
};

export default function AgencyErosionPage() {
    return <Playground />;
}
