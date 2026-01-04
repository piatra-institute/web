import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import MetamaterialsPlayground from './playground';



export const metadata: Metadata = {
    title: 'metamaterials · playgrounds',
    description: 'materials engineered to exhibit life-like properties',

    openGraph: {
        ...defaultOpenGraph,
        title: 'metamaterials · playgrounds · piatra.institute',
        description: 'materials engineered to exhibit life-like properties',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/metamaterials.png',
            },
        ],
    },
};

export default function Metamaterials() {
    return (
        <MetamaterialsPlayground />
    );
}
