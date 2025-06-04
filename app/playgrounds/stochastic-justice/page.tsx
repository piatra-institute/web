import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { defaultOpenGraph } from '@/data/metadata';

const StochasticJusticePlayground = dynamic(() => import('./playground'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'stochastic justice · playgrounds',
  description: 'Interactive exploration of how randomness can counteract corruption in institutional decision-making, using information theory to model fairness entropy',

  openGraph: {
    ...defaultOpenGraph,
    title: 'stochastic justice · playgrounds · piatra.institute',
    description: 'Interactive exploration of how randomness can counteract corruption in institutional decision-making, using information theory to model fairness entropy',
  },
};

export default function StochasticJusticePage() {
  return <StochasticJusticePlayground />;
}