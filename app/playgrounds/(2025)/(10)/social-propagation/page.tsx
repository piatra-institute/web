import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description = 'comparing free-for-all vs policy-based social networks to measure political manipulation reduction';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2025)/(10)/social-propagation',
    {
        name: 'social-propagation',
        title: 'social propagation',
        description,
        topics: ['political-science', 'sociology'],
        operations: ['tension', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'social propagation · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'social propagation · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/social-propagation.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
