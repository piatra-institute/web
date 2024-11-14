import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import CoasellularMorphogenesisPlayground from './playground';



export const metadata: Metadata = {
    title: 'coasellular morphogenesis · playgrounds',
    description: 'bioelectric and cellular agents interactions and negotiations based on Coase\'s theorem',

    openGraph: {
        ...defaultOpenGraph,
        title: 'coasellular morphogenesis · playgrounds · piatra.institute',
        description: 'bioelectric and cellular agents interactions and negotiations based on Coase\'s theorem',
    },
};

export default function CoasellularMorphogenesis() {
    return (
        <CoasellularMorphogenesisPlayground />
    );
}
