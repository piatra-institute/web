import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'hydride anomaly · playgrounds',
    description: 'hydrogen bonding and the anomalous thermodynamics of water',

    openGraph: {
        ...defaultOpenGraph,
        title: 'hydride anomaly · playgrounds · piatra.institute',
        description: 'hydrogen bonding and the anomalous thermodynamics of water',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/hydride-anomaly.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
