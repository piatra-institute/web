import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import CoasellularMorphogenesisPlayground from './playground';



export const metadata: Metadata = {
    title: 'coasellular morphogenesis · playgrounds',
    description: 'bioelectric and cellular agents interactions and negotiations based on Coasean transaction costs',

    openGraph: {
        ...defaultOpenGraph,
        title: 'coasellular morphogenesis · playgrounds · piatra.institute',
        description: 'bioelectric and cellular agents interactions and negotiations based on Coasean transaction costs',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/coasellular-morphogenesis.png',
            },
        ],
    },
};

export default function CoasellularMorphogenesis() {
    return (
        <CoasellularMorphogenesisPlayground />
    );
}
