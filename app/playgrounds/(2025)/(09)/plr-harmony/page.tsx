import { Metadata } from 'next';
import Playground from './playground';

export const metadata: Metadata = {
    title: 'plr-harmony · playgrounds',
    description: 'neo-Riemannian PLR transformations and triadic harmony',
};

export default function Page() {
    return <Playground />;
}