import type { Metadata } from 'next';

import {
    defaultOpenGraph,
} from '@/data/metadata';

import EstigradePlayground from './playground';



export const metadata: Metadata = {
    title: 'estigrade · playgrounds',
    description: 'enhance grades when students accurately estimate their exam scores',

    openGraph: {
        ...defaultOpenGraph,
        title: 'estigrade · playgrounds · piatra.institute',
        description: 'enhance grades when students accurately estimate their exam scores',
    },
};

export default function Estigrade() {
    return (
        <EstigradePlayground />
    );
}
