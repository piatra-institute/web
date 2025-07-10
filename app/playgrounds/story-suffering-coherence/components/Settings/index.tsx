'use client'

import SliderInput from '@/components/SliderInput'
import Toggle from '@/components/Toggle'

interface SettingsProps {
  speed: number
  setSpeed: (value: number) => void
  particleCount: number
  setParticleCount: (value: number) => void
  connectionDistance: number
  setConnectionDistance: (value: number) => void
  springStrength: number
  setSpringStrength: (value: number) => void
  showConnections: boolean
  setShowConnections: (value: boolean) => void
  showMetrics: boolean
  setShowMetrics: (value: boolean) => void
}

export function Settings({
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
}: SettingsProps) {
  return (
    <div className="space-y-4">
      <SliderInput
        label="Animation Speed"
        value={speed}
        onChange={setSpeed}
        min={0.1}
        max={3}
        step={0.1}
      />

      <SliderInput
        label="Particle Count"
        value={particleCount}
        onChange={setParticleCount}
        min={20}
        max={200}
        step={10}
      />

      <SliderInput
        label="Connection Distance"
        value={connectionDistance}
        onChange={setConnectionDistance}
        min={50}
        max={200}
        step={10}
      />

      <SliderInput
        label="Spring Strength"
        value={springStrength}
        onChange={setSpringStrength}
        min={0.1}
        max={2}
        step={0.1}
      />

      <Toggle
        text="Show Connections"
        toggle={() => setShowConnections(!showConnections)}
        value={showConnections}
      />

      <Toggle
        text="Show Coherence Score"
        toggle={() => setShowMetrics(!showMetrics)}
        value={showMetrics}
      />
    </div>
  )
}