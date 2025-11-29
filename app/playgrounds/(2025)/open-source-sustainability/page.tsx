import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'open source sustainability · playgrounds',
  description: 'Interactive model of how open source software projects face pressure to change from permissive to restrictive licenses',
  
  openGraph: {
    ...defaultOpenGraph,
    title: 'open source sustainability · playgrounds · piatra.institute',
    description: 'Interactive model of how open source software projects face pressure to change from permissive to restrictive licenses',
  },
};

const Playground = dynamic(
  () => import('./playground'),
  { ssr: false }
);

export default function Page() {
  return <Playground />;
}