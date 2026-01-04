import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PlatformsList from './components/PlatformsList';



export const metadata: Metadata = {
    title: 'platforms',
    description: 'platforms for research and development',

    openGraph: {
        ...defaultOpenGraph,
        title: 'platforms · piatra.institute',
        description: 'platforms for research and development',
    },
};


export default function Platforms() {
    return <PlatformsList />;
}
