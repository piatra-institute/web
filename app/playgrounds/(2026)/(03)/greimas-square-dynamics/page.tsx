import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'Greimas square dynamics \u00b7 playgrounds',
    description: 'the semiotic square as typed opposition structure and Klein four-group',

    openGraph: {
        ...defaultOpenGraph,
        title: 'Greimas square dynamics \u00b7 playgrounds \u00b7 piatra.institute',
        description: 'the semiotic square as typed opposition structure and Klein four-group',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/greimas-square-dynamics.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
