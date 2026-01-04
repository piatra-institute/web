import { Metadata } from 'next';
import {
    defaultOpenGraph,
} from '@/data/metadata';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'logical morphogenesis · playgrounds',
    description: 'truth-value rhythms from self-referential sentences',

    openGraph: {
        ...defaultOpenGraph,
        title: 'logical morphogenesis · playgrounds · piatra.institute',
        description: 'truth-value rhythms from self-referential sentences',
    },
};

export default function Page() {
    return <Playground />;
}
