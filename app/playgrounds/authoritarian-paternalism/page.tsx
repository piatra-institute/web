import { Metadata } from 'next';
import dynamic from 'next/dynamic';



const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'authoritarian paternalism · playgrounds',
    description: 'Dark agent simulation exploring paternal signaling, order, and support co-evolution in authoritarian systems',
};

export default function AuthoritarianPaternalismPage() {
    return <Playground />;
}