import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'truth violence dynamics · playgrounds',
    description: 'Interactive exploration of the coupled ODE model for uncertainty, truth-seeking, and punitive force dynamics',
};

export default function TruthViolenceDynamicsPage() {
    return <Playground />;
}