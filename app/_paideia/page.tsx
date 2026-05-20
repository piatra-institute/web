import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';

import PaideiaList from './components/PaideiaList';



export const metadata: Metadata = {
    title: 'paideia',
    description: 'patient public literacy',

    openGraph: {
        ...defaultOpenGraph,
        title: 'paideia · piatra.institute',
        description: 'patient public literacy',
    },
};


export default function Paideia() {
    return <PaideiaList />;
}
