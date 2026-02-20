import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';


export const metadata: Metadata = {
    title: 'trust-transaction spectrum · playgrounds',
    description: 'strategic posture optimization for small states under geopolitical constraints',

    openGraph: {
        ...defaultOpenGraph,
        title: 'trust-transaction spectrum · playgrounds · piatra.institute',
        description: 'strategic posture optimization for small states under geopolitical constraints',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/trust-transaction-spectrum.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
