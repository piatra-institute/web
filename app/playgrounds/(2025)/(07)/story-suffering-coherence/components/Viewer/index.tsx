'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import PlaygroundViewer from '@/components/PlaygroundViewer'
import Button from '@/components/Button'
import { ParticleSystem, SystemState } from '../../logic'

interface ViewerProps {
  speed: number
  particleCount: number
  connectionDistance: number
  springStrength: number
  showConnections: boolean
  showMetrics: boolean
}

export function Viewer({
  speed,
  particleCount,
  connectionDistance,
  springStrength,
  showConnections,
  showMetrics,
}: ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const systemRef = useRef<ParticleSystem | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [currentState, setCurrentState] = useState<SystemState>('harmony')
  const [coherenceScore, setCoherenceScore] = useState(0)

  const getBackgroundColor = (state: SystemState) => {
    switch (state) {
      case 'harmony':
        return '#111827' // gray-900
      case 'burnout':
        return '#431407' // red-950
      case 'weaving':
        return '#312e81' // indigo-900
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const system = systemRef.current
    if (!canvas || !ctx || !system) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections
    if (showConnections && currentState === 'harmony') {
      system.connections.forEach((conn) => {
        ctx.beginPath()
        ctx.moveTo(conn.p1.x, conn.p1.y)
        ctx.lineTo(conn.p2.x, conn.p2.y)
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.1)' // teal-400
        ctx.lineWidth = 1
        ctx.stroke()
      })
    }

    // Draw user connections
    system.userConnections.forEach((conn) => {
      ctx.beginPath()
      ctx.moveTo(conn.p1.x, conn.p1.y)
      ctx.lineTo(conn.p2.x, conn.p2.y)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    })

    // Draw particles
    system.particles.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    })

    // Draw selected particle highlight
    if (system.selectedParticle) {
      ctx.beginPath()
      ctx.arc(
        system.selectedParticle.x,
        system.selectedParticle.y,
        system.selectedParticle.radius + 5,
        0,
        Math.PI * 2
      )
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [currentState, showConnections])

  const animate = useCallback(() => {
    const system = systemRef.current
    if (!system) return

    system.update()
    setCoherenceScore(system.getCoherenceScore())
    draw()

    animationRef.current = requestAnimationFrame(animate)
  }, [draw])

  const handleStateChange = useCallback((newState: SystemState) => {
    const system = systemRef.current
    if (!system) return

    system.setState(newState)
    setCurrentState(newState)

    // Update canvas background color
    if (canvasRef.current) {
      canvasRef.current.style.backgroundColor = getBackgroundColor(newState)
    }
  }, [])

  const handleReset = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    systemRef.current = new ParticleSystem(canvas.width, canvas.height, {
      particleCount,
      connectionDistance,
      springStrength: springStrength * 0.001,
    })
    handleStateChange('harmony')
  }, [particleCount, connectionDistance, springStrength, handleStateChange])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const system = systemRef.current
    if (!canvas || !system) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    system.handleClick(x, y)
  }, [])

  // Initialize system
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      if (!systemRef.current) {
        systemRef.current = new ParticleSystem(canvas.width, canvas.height, {
          particleCount,
          connectionDistance,
          springStrength: springStrength * 0.001,
        })
      } else {
        systemRef.current.resize(canvas.width, canvas.height)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Set initial background color
    canvas.style.backgroundColor = getBackgroundColor('harmony')
    canvas.style.transition = 'background-color 0.8s ease'

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [particleCount, connectionDistance, springStrength])

  // Update system config when props change
  useEffect(() => {
    if (systemRef.current) {
      systemRef.current.updateConfig({
        particleCount,
        connectionDistance,
        springStrength: springStrength * 0.001,
      })
    }
  }, [particleCount, connectionDistance, springStrength])

  // Start/stop animation
  useEffect(() => {
    if (speed > 0) {
      animate()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [speed, animate])

  return (
    <PlaygroundViewer>
      <div className="relative w-full h-full" style={{ minHeight: '100vh' }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-crosshair"
        />

        {/* UI Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-black/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            {/* Score Display */}
            {showMetrics && (
              <div
                className={`mb-4 transition-opacity duration-800 ${
                  currentState === 'burnout' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <h2 className="text-lg font-semibold text-white">
                  Coherence Score (Φ proxy):{' '}
                  <span className="font-bold text-xl">{coherenceScore}</span>
                </h2>
                <p className="text-xs text-gray-400">
                  A measure of the system&apos;s narrative integration.
                </p>
              </div>
            )}

            {/* Stage Controls */}
            <div className="space-y-4">
              {currentState === 'harmony' && (
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-teal-300 mb-2">
                    State 1: Integrated System
                  </h1>
                  <p className="text-sm sm:text-base mb-4 text-gray-200">
                    The system exhibits high integrated information (Φ). Its components
                    form a collective intelligence with a large &ldquo;cognitive light cone,&rdquo;
                    allowing it to pursue complex, long-term goals.
                  </p>
                  <Button
                    label="Induce Information Overload"
                    onClick={() => handleStateChange('burnout')}
                  />
                </div>
              )}

              {currentState === 'burnout' && (
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-amber-300 mb-2">
                    State 2: System Fragmentation
                  </h1>
                  <p className="text-sm sm:text-base mb-4 text-gray-200">
                    High-frequency, low-meaning data shatters the network. The cognitive
                    cone collapses; the system can only process local, immediate stimuli.
                  </p>
                  <Button
                    label="Initiate Narrative Reconstruction"
                    onClick={() => handleStateChange('weaving')}
                  />
                </div>
              )}

              {currentState === 'weaving' && (
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-indigo-300 mb-2">
                    State 3: Narrative Reconstruction
                  </h1>
                  <p className="text-sm sm:text-base mb-4 text-gray-200">
                    Acknowledge error signals (suffering) to rebuild. Click two particles
                    to form a narrative link, increasing the system&apos;s computational
                    boundary.
                  </p>
                  <Button
                    label="Reset System"
                    onClick={handleReset}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PlaygroundViewer>
  )
}