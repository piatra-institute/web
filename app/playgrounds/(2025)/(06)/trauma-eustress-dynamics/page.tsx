import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

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
    return <ClientPlayground />;
}
