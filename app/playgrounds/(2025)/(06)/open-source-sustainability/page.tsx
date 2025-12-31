import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import ClientPlayground from './ClientPlayground';

export const metadata: Metadata = {
  title: 'open source sustainability · playgrounds',
  description: 'Interactive model of how open source software projects face pressure to change from permissive to restrictive licenses',

  openGraph: {
    ...defaultOpenGraph,
    title: 'open source sustainability · playgrounds · piatra.institute',
    description: 'Interactive model of how open source software projects face pressure to change from permissive to restrictive licenses',
  },
};

export default function Page() {
  return <ClientPlayground />;
}
