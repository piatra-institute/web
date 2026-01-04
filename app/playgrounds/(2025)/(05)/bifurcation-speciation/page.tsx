import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import BifurcationSpeciationPlayground from './playground';

export const metadata: Metadata = {
    title: 'bifurcation speciation · playgrounds',
    description: '',

    openGraph: {
        ...defaultOpenGraph,
        title: 'bifurcation speciation · playgrounds · piatra.institute',
        description: '',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/bifurcation-speciation.png',
            },
        ],
    },
};

export default function Page() {
    return <BifurcationSpeciationPlayground />;
}
