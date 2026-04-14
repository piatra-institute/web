import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(04)/coordination-under-complementarity',
    {
        name: 'coordination-under-complementarity',
        title: 'Coordination under complementarity',
        description: 'multilevel coordination failure in housing, infrastructure, and spatially fixed systems',
        topics: ['economics', 'political-science', 'mathematics'],
        operations: ['anatomy', 'landscape'],
    },
);

export const metadata: Metadata = {
    title: 'coordination under complementarity \u00B7 playgrounds',
    description: 'multilevel coordination failure in housing, infrastructure, and spatially fixed systems',

    openGraph: {
        ...defaultOpenGraph,
        title: 'coordination under complementarity \u00B7 playgrounds \u00B7 piatra.institute',
        description: 'multilevel coordination failure in housing, infrastructure, and spatially fixed systems',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/coordination-under-complementarity.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
