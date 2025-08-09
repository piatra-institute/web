import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'tuition resentment · playgrounds',
    description: 'Exploring high-tuition psychodynamics and attribution of blame',
};

export default function TuitionResentmentPage() {
    return <Playground />;
}