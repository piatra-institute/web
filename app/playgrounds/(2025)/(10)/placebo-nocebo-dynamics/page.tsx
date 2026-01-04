import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'placebo-nocebo dynamics · playgrounds',
    description: 'precision-weighted prediction model of placebo analgesia and nocebo hyperalgesia',

    openGraph: {
        ...defaultOpenGraph,
        title: 'placebo-nocebo dynamics · playgrounds · piatra.institute',
        description: 'precision-weighted prediction model of placebo analgesia and nocebo hyperalgesia',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
