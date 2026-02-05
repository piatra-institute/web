import { Metadata } from 'next';
import { defaultOpenGraph } from '@/data/metadata';
import Playground from './playground';

export const metadata: Metadata = {
  title: 'gait gambit · playgrounds',
  description:
    'A computational model of gait selection using active inference.',

  openGraph: {
    ...defaultOpenGraph,
    title: 'gait gambit · playgrounds · piatra.institute',
    description:
      'A computational model of gait selection using active inference.',
    images: [
      {
        url: 'https://piatra.institute/assets-playgrounds/og/gait-gambit.png',
      },
    ],
  },
};

export default function Page() {
  return <Playground />;
}
