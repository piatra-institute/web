'use client'

import PlaygroundLayout from '@/components/PlaygroundLayout'
import { Settings } from './components/Settings'
import { Viewer } from './components/Viewer'
import { useState } from 'react'

export default function StorySufferingCoherencePlayground() {
  const [speed, setSpeed] = useState(1)
  const [particleCount, setParticleCount] = useState(100)
  const [connectionDistance, setConnectionDistance] = useState(100)
  const [springStrength, setSpringStrength] = useState(0.5)
  const [showConnections, setShowConnections] = useState(true)
  const [showMetrics, setShowMetrics] = useState(true)

  const settings = {
    speed,
    setSpeed,
    particleCount,
    setParticleCount,
    connectionDistance,
    setConnectionDistance,
    springStrength,
    setSpringStrength,
    showConnections,
    setShowConnections,
    showMetrics,
    setShowMetrics,
  }

  const sections = [
    {
      id: 'intro',
      type: 'intro' as const,
      content: (
        <div className="mt-12">
          <p className="text-xl text-gray-300 mb-4">
            Explore how cohesion of sufferings leads to a story which obtains a point of view over reality
          </p>
          <p className="text-gray-400 mb-6">
            This playground demonstrates three states: an integrated system with high
            coherence, fragmentation through information overload, and narrative
            reconstruction through acknowledged suffering. Through this network of
            sufferings, a narrative emerges that provides perspective and meaning.
          </p>
        </div>
      ),
    },
    {
      id: 'simulation',
      type: 'canvas' as const,
      content: <Viewer {...settings} />,
    },
    {
      id: 'outro',
      type: 'outro' as const,
      content: (
        <div className="mt-12 space-y-4">
          <p className="text-gray-400">
            The particles represent individual experiences or &ldquo;sufferings&rdquo; that,
            when connected, form a coherent narrative structure. The coherence score
            (Φ proxy) measures the system&apos;s narrative integration—its ability to
            maintain a unified story despite external pressures.
          </p>

          <p className="text-gray-400">
            In the <span className="text-teal-300">integrated state</span>, the system maintains
            high Φ through dense interconnections. Each suffering is contextualized within a
            larger narrative framework, creating meaning through relationships. The system can
            pursue long-term goals because its parts share a common story.
          </p>

          <p className="text-gray-400">
            <span className="text-amber-300">Fragmentation</span> occurs when the system is
            overwhelmed by high-frequency, low-meaning inputs. The narrative breaks down,
            connections dissolve, and particles move chaotically. Without a shared story,
            the system loses its ability to coordinate or plan—a form of induced teleophobia.
          </p>

          <p className="text-gray-400">
            During <span className="text-indigo-300">narrative reconstruction</span>, you manually
            weave new connections between sufferings. Each link represents an acknowledgment—a
            conscious integration of pain into meaning. As the network rebuilds, the system
            regains its capacity for coherent action, but the new story may differ from the
            original, shaped by which sufferings you choose to connect.
          </p>

          <p className="text-gray-400">
            This model explores how consciousness emerges from the integration of disparate
            experiences, how trauma can shatter that integration, and how healing involves
            the deliberate reconstruction of narrative coherence—not by forgetting suffering,
            but by weaving it into a story that can hold complexity.
          </p>
        </div>
      ),
    },
  ]

  return (
    <PlaygroundLayout
      title="Story-Suffering Coherence"
      subtitle="narrative emergence from suffering integration"
      sections={sections}
      settings={<Settings {...settings} />}
    />
  )
}