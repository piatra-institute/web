import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'Halley window · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Halley window · playgrounds · piatra.institute',
        description: 'Halley\'s method fractal patterns',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/halley-window.png',
            },
        ],
    },
};

export default function Page() {
    return <ClientPlayground />;
}
