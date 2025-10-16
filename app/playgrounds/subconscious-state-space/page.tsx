import { Metadata } from 'next';
import Playground from './playground';

export const metadata: Metadata = {
    title: 'subconscious state space · playgrounds',
    description: 'exploring molecular-scale control of conscious access through neural dynamics simulation',
};

export default function Page() {
    return <Playground />;
}
