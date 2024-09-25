import type { Metadata } from 'next';

import EstigradePlayground from './playground';



export const metadata: Metadata = {
    title: 'estigrade · playgrounds',
    description: 'enhances grades when students accurately estimate their exam scores',

    openGraph: {
        type: 'website',
        url: 'https://piatra.institute',
        title: 'estigrade · playgrounds · piatra.institute',
        description: 'enhances grades when students accurately estimate their exam scores',
        siteName: 'piatra.institute',
        images: [
            {
                url: 'https://piatra.institute/og.png',
            },
        ],
    },
};

export default function Estigrade() {
    return (
        <EstigradePlayground />
    );
}
