import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'descent & closure · playgrounds',
    description: 'from local micro-events to autonomous macro-processes via sheaf theory',

    openGraph: {
        ...defaultOpenGraph,
        title: 'descent & closure · playgrounds · piatra.institute',
        description: 'from local micro-events to autonomous macro-processes via sheaf theory',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/descent-and-closure.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
