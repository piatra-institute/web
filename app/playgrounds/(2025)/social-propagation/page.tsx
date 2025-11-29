import { Metadata } from 'next';
import Playground from './playground';

export const metadata: Metadata = {
    title: 'social propagation · playgrounds',
    description: 'comparing free-for-all vs policy-based social networks to measure political manipulation reduction',
};

export default function Page() {
    return <Playground />;
}
