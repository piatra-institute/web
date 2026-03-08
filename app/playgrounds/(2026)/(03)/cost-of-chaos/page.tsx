import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'cost of chaos - playgrounds',
    description: 'the combinatorial inevitability of structure and the cost of maintaining disorder',

    openGraph: {
        ...defaultOpenGraph,
        title: 'cost of chaos - playgrounds - piatra.institute',
        description: 'the combinatorial inevitability of structure and the cost of maintaining disorder',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/cost-of-chaos.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
