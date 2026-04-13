import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'epistemic lensing · playgrounds',
    description: 'how mediated channels deform belief formation',

    openGraph: {
        ...defaultOpenGraph,
        title: 'epistemic lensing · playgrounds · piatra.institute',
        description: 'how mediated channels deform belief formation',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/epistemic-lensing.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
