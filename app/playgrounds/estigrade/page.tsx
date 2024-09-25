import type { Metadata } from 'next';

import EstigradePlayground from './playground';



export const metadata: Metadata = {
    title: 'estigrade · playgrounds',
};

export default function Estigrade() {
    return (
        <EstigradePlayground />
    );
}
