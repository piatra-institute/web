import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
    title: 'closedness adverse selection · playgrounds',
    description: 'how no-criticism constraints filter entrants toward lower moral aversion',

    openGraph: {
        ...defaultOpenGraph,
        title: 'closedness adverse selection · playgrounds · piatra.institute',
        description: 'how no-criticism constraints filter entrants toward lower moral aversion',
    },
};

export default function Page() {
    return <ClientPlayground />;
}
