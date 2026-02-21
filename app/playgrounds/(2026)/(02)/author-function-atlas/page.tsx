import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'author-function atlas · playgrounds',
    description: 'how quotes become clichés through circulation, context collapse, and attribution drift',

    openGraph: {
        ...defaultOpenGraph,
        title: 'author-function atlas · playgrounds · piatra.institute',
        description: 'how quotes become clichés through circulation, context collapse, and attribution drift',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/author-function-atlas.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
