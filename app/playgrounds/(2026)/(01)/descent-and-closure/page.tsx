import type { Metadata } from 'next';

import Playground from './playground';

export const metadata: Metadata = {
    title: 'Descent & Closure',
    description: 'From local micro-events to autonomous macro-processes via sheaf theory',
    openGraph: {
        images: ['/assets-playgrounds/og/descent-and-closure.png'],
    },
};

export default function Page() {
    return <Playground />;
}
