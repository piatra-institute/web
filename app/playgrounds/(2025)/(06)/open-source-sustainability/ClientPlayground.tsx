'use client';

import dynamic from 'next/dynamic';
import { PlaygroundSourceContext } from '@/lib/readPlaygroundSource';

const Playground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export default function ClientPlayground({
    sourceContext,
}: {
    sourceContext?: PlaygroundSourceContext;
}) {
    return <Playground sourceContext={sourceContext} />;
}
