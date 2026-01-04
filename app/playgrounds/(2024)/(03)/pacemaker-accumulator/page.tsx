import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import PacemakerAccumulatorPlayground from './playground';



export const metadata: Metadata = {
    title: 'pacemaker-accumulator · playgrounds',
    description: 'cellular timing through pacemaker–accumulator mechanisms',

    openGraph: {
        ...defaultOpenGraph,
        title: 'pacemaker-accumulator · playgrounds · piatra.institute',
        description: 'cellular timing through pacemaker–accumulator mechanisms',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/pacemaker-accumulator.png',
            },
        ],
    },
};

export default function PacemakerAccumulator() {
    return (
        <PacemakerAccumulatorPlayground />
    );
}
