import type { Metadata } from 'next';

import Playground from './playground';


export const metadata: Metadata = {
    title: 'logical morphogenesis',
    description: 'truth-value rhythms from self-referential sentences',
};


export default function Page() {
    return <Playground />;
}
