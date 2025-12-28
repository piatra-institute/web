import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'Chladni generator · playgrounds',
    description: 'exploring standing waves, reaction-diffusion, and morphogenesis patterns',
};

export default function Page() {
    return <ClientPlayground />;
}
