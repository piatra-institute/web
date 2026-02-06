import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'polity coalition attractors \u00B7 playgrounds',
    description:
        'Basins of inclusion versus exclusion under stress, norms, and contact.',

    openGraph: {
        ...defaultOpenGraph,
        title: 'polity coalition attractors \u00B7 playgrounds \u00B7 piatra.institute',
        description:
            'Basins of inclusion versus exclusion under stress, norms, and contact.',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/polity-coalition-attractors.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
