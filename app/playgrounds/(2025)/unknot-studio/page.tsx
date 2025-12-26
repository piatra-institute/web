import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'unknot studio · playgrounds',
    description: 'interactive exploration of torus knots, connected sums, and projection invariants',
};

export default function Page() {
    return <ClientPlayground />;
}
