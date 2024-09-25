import type { Metadata } from 'next';

import EstigradePlayground from './playground';



export const metadata: Metadata = {
    title: 'estigrade · playgrounds',
    description: 'enhances grades when students accurately estimate their exam scores',
};

export default function Estigrade() {
    return (
        <EstigradePlayground />
    );
}
