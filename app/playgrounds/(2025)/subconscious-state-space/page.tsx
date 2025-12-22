import { Metadata } from 'next';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'subconscious state space · playgrounds',
    description: 'exploring molecular-scale control of conscious access through neural dynamics simulation',
};

export default function Page() {
    return <ClientPlayground />;
}
