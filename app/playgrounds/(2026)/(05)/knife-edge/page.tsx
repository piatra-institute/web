import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/knife-edge',
    {
        name: 'knife-edge',
        title: 'knife edge',
        description:
            'wave fate across subcritical, critical, and supercritical regimes, with sheaf-laplacian diagnostics',
        topics: ['physics', 'neuroscience', 'mathematics'],
        operations: ['threshold', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'knife edge · playgrounds',
    description:
        'wave fate across subcritical, critical, and supercritical regimes, with sheaf-laplacian diagnostics',

    openGraph: {
        ...defaultOpenGraph,
        title: 'knife edge · playgrounds · piatra.institute',
        description:
            'wave fate across subcritical, critical, and supercritical regimes, with sheaf-laplacian diagnostics',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/knife-edge.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
