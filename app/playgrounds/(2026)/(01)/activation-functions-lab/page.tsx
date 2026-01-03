import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'activation functions lab | Piatra Institute',
    description: 'Invent, explore, and compare neural network activation functions including DoReLU, MaRCeLU, and custom expressions',
};

export default function Page() {
    return <ClientPlayground />;
}
