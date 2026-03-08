import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'periodic table of state spaces · playgrounds',
    description: 'a synthetic taxonomy of what kind of space a science studies',

    openGraph: {
        ...defaultOpenGraph,
        title: 'periodic table of state spaces · playgrounds · piatra.institute',
        description: 'a synthetic taxonomy of what kind of space a science studies',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/periodic-table-of-state-spaces.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
