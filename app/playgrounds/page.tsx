import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PlaygroundsList from './components/PlaygroundsList';



export const dynamic = 'force-static';


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
