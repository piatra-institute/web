import { Metadata } from 'next';
import Playground from './playground';

export const metadata: Metadata = {
    title: 'ownership parity rule · playgrounds',
    description: 'consumer-equity parity principle: investing equal amounts when purchasing tech products',
};

export default function Page() {
    return <Playground />;
}
