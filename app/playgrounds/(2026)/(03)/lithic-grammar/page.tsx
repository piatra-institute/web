import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'lithic grammar · playgrounds',
    description: 'the classification rules that partition continuous geological space into discrete rock names',

    openGraph: {
        ...defaultOpenGraph,
        title: 'lithic grammar · playgrounds · piatra.institute',
        description: 'the classification rules that partition continuous geological space into discrete rock names',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/lithic-grammar.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
