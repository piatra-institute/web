import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'agency erosion · playgrounds',
    description: 'Interactive exploration of identity substitution dynamics and the erosion of collective agency through amplified signaling',
};

export default function AgencyErosionPage() {
    return <ClientPlayground />;
}
