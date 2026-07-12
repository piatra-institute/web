import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(07)/mechanical-calculus',
    {
        name: 'mechanical-calculus',
        title: 'mechanical calculus',
        description: 'the error budget of Vannevar Bush’s differential analyzer: slip, backlash, lag and the rim of the disc',
        topics: ['computer-science', 'physics', 'mathematics'],
        operations: ['threshold', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'mechanical calculus · playgrounds',
    description: 'the error budget of a machine that computes by moving',

    openGraph: {
        ...defaultOpenGraph,
        title: 'mechanical calculus · playgrounds · piatra.institute',
        description: 'the error budget of a machine that computes by moving',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/mechanical-calculus.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
