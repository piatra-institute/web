import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'authoritarian paternalism · playgrounds',
    description: 'Paternal signaling, order, and support co-evolution in authoritarian systems',
};

export default function AuthoritarianPaternalismPage() {
    return <ClientPlayground />;
}
