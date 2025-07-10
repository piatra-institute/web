export type SystemState = 'harmony' | 'burnout' | 'weaving'

export interface Particle {
  id: number
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  radius: number
  color: string
}

export interface Connection {
  p1: Particle
  p2: Particle
}

export interface ParticleSystemConfig {
  particleCount: number
  particleRadius: number
  connectionDistance: number
  harmonySpeed: number
  burnoutSpeed: number
  weavingSpeed: number
  springStrength: number
}

export class ParticleSystem {
  particles: Particle[] = []
  connections: Connection[] = []
  userConnections: Connection[] = []
  currentState: SystemState = 'harmony'
  selectedParticle: Particle | null = null
  width: number
  height: number
  config: ParticleSystemConfig

  constructor(
    width: number,
    height: number,
    config: Partial<ParticleSystemConfig> = {}
  ) {
    this.width = width
    this.height = height
    this.config = {
      particleCount: 100,
      particleRadius: 3,
      connectionDistance: 100,
      harmonySpeed: 0.2,
      burnoutSpeed: 2.5,
      weavingSpeed: 0.5,
      springStrength: 0.0005,
      ...config,
    }
    this.init()
  }

  init() {
    this.particles = []
    this.connections = []
    this.userConnections = []
    this.selectedParticle = null

    const centerX = this.width / 2
    const centerY = this.height / 2
    const maxRadius = Math.min(this.width, this.height) * 0.3

    // Create particles in a circular distribution
    for (let i = 0; i < this.config.particleCount; i++) {
      const angle = (i / this.config.particleCount) * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * maxRadius
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      
      this.particles.push({
        id: i,
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: this.config.particleRadius,
        color: 'rgba(209, 250, 229, 0.7)', // teal-100
      })
    }

    // Create initial connections
    this.updateConnections()
    this.setState('harmony')
  }

  updateConnections() {
    this.connections = []
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dist = Math.hypot(
          this.particles[i].x - this.particles[j].x,
          this.particles[i].y - this.particles[j].y
        )
        if (dist < this.config.connectionDistance) {
          this.connections.push({ p1: this.particles[i], p2: this.particles[j] })
        }
      }
    }
  }

  setState(newState: SystemState) {
    this.currentState = newState

    this.particles.forEach((p) => {
      switch (newState) {
        case 'harmony':
          p.vx = (Math.random() - 0.5) * this.config.harmonySpeed
          p.vy = (Math.random() - 0.5) * this.config.harmonySpeed
          p.color = 'rgba(209, 250, 229, 0.7)' // teal-100
          break
        case 'burnout':
          p.vx = (Math.random() - 0.5) * this.config.burnoutSpeed
          p.vy = (Math.random() - 0.5) * this.config.burnoutSpeed
          p.color = 'rgba(253, 230, 138, 0.7)' // amber-200
          break
        case 'weaving':
          p.vx = (Math.random() - 0.5) * this.config.weavingSpeed
          p.vy = (Math.random() - 0.5) * this.config.weavingSpeed
          p.color = 'rgba(199, 210, 254, 0.7)' // indigo-200
          break
      }
    })
  }

  updateParticle(particle: Particle) {
    // Apply spring force for user-woven connections
    if (this.currentState === 'weaving') {
      this.userConnections.forEach((conn) => {
        if (conn.p1 === particle || conn.p2 === particle) {
          const other = conn.p1 === particle ? conn.p2 : conn.p1
          const dx = other.x - particle.x
          const dy = other.y - particle.y
          particle.vx += dx * this.config.springStrength
          particle.vy += dy * this.config.springStrength
        }
      })
    }

    particle.x += particle.vx
    particle.y += particle.vy

    // Damping to prevent chaotic explosion
    particle.vx *= 0.98
    particle.vy *= 0.98

    // Wall collision
    if (particle.x < particle.radius || particle.x > this.width - particle.radius) {
      particle.vx *= -1
    }
    if (particle.y < particle.radius || particle.y > this.height - particle.radius) {
      particle.vy *= -1
    }

    // Keep particles within bounds
    particle.x = Math.max(particle.radius, Math.min(this.width - particle.radius, particle.x))
    particle.y = Math.max(particle.radius, Math.min(this.height - particle.radius, particle.y))
  }

  update() {
    this.particles.forEach((p) => this.updateParticle(p))
    
    if (this.currentState === 'harmony') {
      this.updateConnections()
    }
  }

  getCoherenceScore(): number {
    let score = 0
    switch (this.currentState) {
      case 'harmony':
        // A proxy for initial high integration
        score = (this.connections.length / (this.config.particleCount * 5)) * 100
        break
      case 'burnout':
        score = 0
        break
      case 'weaving':
        // Score based on user-created narrative links
        score = (this.userConnections.length / (this.config.particleCount / 2)) * 100
        break
    }
    return Math.min(100, Math.round(score))
  }

  handleClick(x: number, y: number): void {
    if (this.currentState !== 'weaving') return

    let clickedParticle: Particle | null = null
    for (const p of this.particles) {
      const dist = Math.hypot(p.x - x, p.y - y)
      if (dist < p.radius + 10) {
        clickedParticle = p
        break
      }
    }

    if (clickedParticle) {
      if (!this.selectedParticle) {
        this.selectedParticle = clickedParticle
      } else {
        if (this.selectedParticle !== clickedParticle) {
          const exists = this.userConnections.some(
            (conn) =>
              (conn.p1 === this.selectedParticle && conn.p2 === clickedParticle) ||
              (conn.p1 === clickedParticle && conn.p2 === this.selectedParticle)
          )
          if (!exists) {
            this.userConnections.push({
              p1: this.selectedParticle,
              p2: clickedParticle,
            })
          }
        }
        this.selectedParticle = null
      }
    } else {
      this.selectedParticle = null
    }
  }

  resize(width: number, height: number) {
    this.width = width
    this.height = height
    this.init()
  }

  updateConfig(config: Partial<ParticleSystemConfig>) {
    this.config = { ...this.config, ...config }
    if (config.particleCount !== undefined || config.connectionDistance !== undefined) {
      this.init()
    }
  }
}