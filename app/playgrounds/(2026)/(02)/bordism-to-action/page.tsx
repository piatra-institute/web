import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'bordism to action · playgrounds',
    description: 'Comparing classical mechanics (F=ma) with fully local TQFT (Chern-Simons braids and quantum amplitudes).',

    openGraph: {
        ...defaultOpenGraph,
        title: 'bordism to action · playgrounds · piatra.institute',
        description: 'Comparing classical mechanics (F=ma) with fully local TQFT (Chern-Simons braids and quantum amplitudes).',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/bordism-to-action.png',
            },
        ],
    },
};

export default function Page() {
    return <Playground />;
}
