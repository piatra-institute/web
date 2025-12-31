import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'truth violence dynamics · playgrounds',
    description: 'Interactive exploration of the coupled ODE model for uncertainty, truth-seeking, and punitive force dynamics',
};

export default function TruthViolenceDynamicsPage() {
    return <ClientPlayground />;
}
