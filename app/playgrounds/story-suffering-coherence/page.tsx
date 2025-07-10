import { Metadata } from 'next'
import Playground from './playground'

export const metadata: Metadata = {
  title: 'Story Suffering Coherence - Piatra Institute',
  description: 'Explore how cohesion of sufferings leads to a story which obtains a point of view over reality',
  openGraph: {
    title: 'Story Suffering Coherence - Piatra Institute',
    description: 'Interactive visualization of narrative emergence from suffering integration',
    type: 'website',
  },
}

export default function Page() {
  return <Playground />
}