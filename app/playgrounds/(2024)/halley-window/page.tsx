import type { Metadata } from 'next';

import dynamic from 'next/dynamic';

import {
    defaultOpenGraph,
} from '@/data/metadata';



export const metadata: Metadata = {
    title: 'Halley window · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Halley window · playgrounds · piatra.institute',
        description: 'Halley\'s method fractal patterns',
    },
};


// Disable SSR for the playground canvas
const HalleyWindowPlayground = dynamic(
    () => import('./playground'),
    { ssr: false }
);


export default function Page() {
    return (
        <HalleyWindowPlayground />
    );
}
