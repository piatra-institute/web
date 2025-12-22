import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'tuition resentment · playgrounds',
    description: 'Exploring high-tuition psychodynamics and attribution of blame',
};

export default function TuitionResentmentPage() {
    return <ClientPlayground />;
}
