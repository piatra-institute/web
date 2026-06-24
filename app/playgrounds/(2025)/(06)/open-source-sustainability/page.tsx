import type { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import { readPlaygroundSource } from '@/lib/readPlaygroundSource';
import ClientPlayground from './ClientPlayground';

const sourceContext = readPlaygroundSource(
  'app/playgrounds/(2025)/(06)/open-source-sustainability',
  {
    name: 'open-source-sustainability',
    title: 'open source sustainability',
    description:
      'pressure dynamics in open source license transitions',
    topics: ['economics', 'computer-science'],
    operations: ['tension', 'threshold'],
  },
);

export const metadata: Metadata = {
  title: 'open source sustainability · playgrounds',
  description: 'Interactive model of how open source software projects face pressure to change from permissive to restrictive licenses',

  openGraph: {
    ...defaultOpenGraph,
    title: 'open source sustainability · playgrounds · piatra.institute',
    description: 'Interactive model of how open source software projects face pressure to change from permissive to restrictive licenses',
        images: [
            {
                url: 'https://piatra.institute/assets-playgrounds/og/open-source-sustainability.png',
            },
        ],
  },
};

export default function Page() {
  return <ClientPlayground sourceContext={sourceContext} />;
}
