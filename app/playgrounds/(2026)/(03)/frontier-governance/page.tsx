import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(03)/frontier-governance',
    {
        name: 'frontier-governance',
        title: 'Frontier governance',
        description: 'when state control of profits helps vs. harms innovation across frontier sectors',
        topics: ['economics', 'political-science'],
        operations: ['landscape', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'frontier governance · playgrounds',
    description: 'when state control of profits helps vs. harms innovation across frontier sectors',

    openGraph: {
        ...defaultOpenGraph,
        title: 'frontier governance · playgrounds · piatra.institute',
        description: 'when state control of profits helps vs. harms innovation across frontier sectors',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/frontier-governance.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
