import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'kernel smoothing · playgrounds',
    description: 'attention as kernel smoothing: similarity-to-weight mapping and weighted averages',

    openGraph: {
        ...defaultOpenGraph,
        title: 'kernel smoothing · playgrounds · piatra.institute',
        description: 'attention as kernel smoothing: similarity-to-weight mapping and weighted averages',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/kernel-smoothing.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
