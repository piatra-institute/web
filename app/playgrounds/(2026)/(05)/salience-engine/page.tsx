import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'how a neutral physical difference climbs from molecule to sign to value to attention to a world-filter';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(05)/salience-engine',
    {
        name: 'salience-engine',
        title: 'salience engine',
        description,
        topics: ['neuroscience', 'psychology', 'philosophy'],
        operations: ['morphogenesis', 'threshold'],
    },
);

export const metadata: Metadata = {
    title: 'salience engine · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'salience engine · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/salience-engine.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
