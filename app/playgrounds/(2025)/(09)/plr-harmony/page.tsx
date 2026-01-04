import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'plr-harmony · playgrounds',
    description: 'neo-Riemannian PLR transformations and triadic harmony',

    openGraph: {
        ...defaultOpenGraph,
        title: 'plr-harmony · playgrounds · piatra.institute',
        description: 'neo-Riemannian PLR transformations and triadic harmony',
    },
};

export default function Page() {
    return <Playground />;
}
