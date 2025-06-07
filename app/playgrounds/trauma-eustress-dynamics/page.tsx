import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import dynamic from 'next/dynamic';

const TraumaEustressDynamicsPlayground = dynamic(
    () => import('./playground'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'trauma-eustress dynamics · playgrounds',
    description: 'Explore how constriction and expansion influence post-trauma trajectories through resilience, recovery, chronic narrowing, and growth pathways.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'trauma-eustress dynamics · playgrounds · piatra.institute',
        description: 'Explore how constriction and expansion influence post-trauma trajectories through resilience, recovery, chronic narrowing, and growth pathways.',
    },
};

export default function Page() {
    return <TraumaEustressDynamicsPlayground />;
}