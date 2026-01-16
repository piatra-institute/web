import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'nested observer windows · playgrounds',
    description: 'multi-scale oscillator coupling for hierarchical consciousness based on Riddle & Schooler (2024)',

    openGraph: {
        ...defaultOpenGraph,
        title: 'nested observer windows · playgrounds · piatra.institute',
        description: 'multi-scale oscillator coupling for hierarchical consciousness based on Riddle & Schooler (2024)',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/nested-observer-windows.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
