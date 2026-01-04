import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PlaygroundsList from './PlaygroundsList';


export const metadata: Metadata = {
    title: 'playgrounds',
    description: 'interactive explorations of ideas and concepts',

    openGraph: {
        ...defaultOpenGraph,
        title: 'playgrounds · piatra.institute',
        description: 'interactive explorations of ideas and concepts',
    },
};


export default function Playgrounds() {
    return <PlaygroundsList />;
}
