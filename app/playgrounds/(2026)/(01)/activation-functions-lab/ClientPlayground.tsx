'use client';

import dynamic from 'next/dynamic';

const Playground = dynamic(() => import('./playground'), { ssr: false });

export default function ClientPlayground() {
    return <Playground />;
}
