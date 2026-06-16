import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';

import Playground from './playground';


const description =
    'decomposing when group vote choice is misaligned with measurable policy exposure';

const sourceContext = readPlaygroundSource(
    'app/playgrounds/(2026)/(06)/political-autoimmunity',
    {
        name: 'political-autoimmunity',
        title: 'political autoimmunity',
        description,
        topics: ['political-science', 'economics', 'psychology'],
        operations: ['anatomy', 'tension'],
    },
);

export const metadata: Metadata = {
    title: 'political autoimmunity · playgrounds',
    description,

    openGraph: {
        ...defaultOpenGraph,
        title: 'political autoimmunity · playgrounds · piatra.institute',
        description,
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/political-autoimmunity.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground sourceContext={sourceContext} />;
}
