import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'Story Suffering Coherence · playgrounds',
    description: 'Explore how cohesion of sufferings leads to a story which obtains a point of view over reality',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Story Suffering Coherence · playgrounds · piatra.institute',
        description: 'Explore how cohesion of sufferings leads to a story which obtains a point of view over reality',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/story-suffering-coherence.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
