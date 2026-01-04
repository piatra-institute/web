import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'meaning autogenesis · playgrounds',
    description: 'Interactive exploration of how molecules become signs, based on Terrence Deacon\'s biosemiotic theory',

    openGraph: {
        ...defaultOpenGraph,
        title: 'meaning autogenesis · playgrounds · piatra.institute',
        description: 'Interactive exploration of how molecules become signs, based on Terrence Deacon\'s biosemiotic theory',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
