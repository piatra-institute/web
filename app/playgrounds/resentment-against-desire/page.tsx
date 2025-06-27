import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import dynamic from 'next/dynamic';



const Playground = dynamic(() => import('./playground'), {
    ssr: false,
});

export const metadata: Metadata = {
    title: 'resentment against desire · playgrounds',
    description: 'An interactive exploration of the Ultimatum Game, modeling the tension between rational self-interest and fairness based on Güth, Schmittberger, and Schwarze\'s groundbreaking 1982 experiment.',
    openGraph: {
        ...defaultOpenGraph,
        title: 'resentment against desire · playgrounds · piatra.institute',
        description: 'An interactive exploration of the Ultimatum Game, modeling the tension between rational self-interest and fairness based on Güth, Schmittberger, and Schwarze\'s groundbreaking 1982 experiment.',
    },
};

export default function ResentmentAgainstDesirePage() {
    return <Playground />;
}
