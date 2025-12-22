import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

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
  return <ClientPlayground />;
}
