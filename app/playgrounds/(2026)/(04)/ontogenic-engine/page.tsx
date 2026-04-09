import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/ontogenic-engine',
    {
        name: 'ontogenic-engine',
        title: 'Ontogenic engine',
        description: 'individuation, learning, and self-maintaining entityhood as modeled through coupled dynamics of viability, coherence, novelty, tension, and boundary flux',
        topics: ['philosophy', 'biology', 'neuroscience'],
        operations: ['landscape', 'anatomy'],
    },
);

export const metadata: Metadata = {
    title: 'ontogenic engine · playgrounds',
    description: 'individuation, learning, and self-maintaining entityhood',

    openGraph: {
        ...defaultOpenGraph,
        title: 'ontogenic engine · playgrounds · piatra.institute',
        description: 'individuation, learning, and self-maintaining entityhood',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/ontogenic-engine.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
