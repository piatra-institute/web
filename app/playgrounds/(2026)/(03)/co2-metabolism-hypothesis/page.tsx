import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'co₂-metabolism hypothesis · playgrounds',
    description: 'proto-metabolic threshold behavior in alkaline hydrothermal vent chemistry',

    openGraph: {
        ...defaultOpenGraph,
        title: 'co₂-metabolism hypothesis · playgrounds · piatra.institute',
        description: 'proto-metabolic threshold behavior in alkaline hydrothermal vent chemistry',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/co2-metabolism-hypothesis.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
