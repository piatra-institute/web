import * as THREE from 'three';

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    type: 'coffee' | 'cream';
}

export class ParticleSystem {
    private scene: THREE.Scene;
    private particles: Particle[] = [];
    private positions: Float32Array;
    private colors: Float32Array;
    private particleGeometry: THREE.BufferGeometry;
    private particleSystem: THREE.Points;
    private isPaused = false;
    private isStirring = false;
    private onMetricsUpdate?: (entropy: number, complexity: number) => void;
    private frameCounter = 0;

    private readonly PARTICLE_COUNT = 15000;
    private readonly cupHeight = 10;
    private readonly cupRadiusTop = 4;
    private readonly cupRadiusBottom = 3;
    private readonly coffeeColor = new THREE.Color(0x4a2c17);
    private readonly creamColor = new THREE.Color(0xf5e6d3);
    private readonly gridDivisions = 10;

    constructor(scene: THREE.Scene, onMetricsUpdate?: (entropy: number, complexity: number) => void) {
        this.scene = scene;
        this.onMetricsUpdate = onMetricsUpdate;

        this.positions = new Float32Array(this.PARTICLE_COUNT * 3);
        this.colors = new Float32Array(this.PARTICLE_COUNT * 3);
        this.particleGeometry = new THREE.BufferGeometry();

        // Load a circular texture for particles
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d')!;
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.NormalBlending,
            depthWrite: false,
            sizeAttenuation: true,
            map: texture,
        });

        this.particleSystem = new THREE.Points(this.particleGeometry, particleMaterial);
        // Don't offset the particle system itself, particles already have correct positions
        this.scene.add(this.particleSystem);

        this.reset();
    }

    private initParticle(index: number, type: 'coffee' | 'cream') {
        const pos = new THREE.Vector3();
        const yPos = type === 'coffee'
            ? Math.random() * this.cupHeight * 0.7
            : this.cupHeight * 0.8 + Math.random() * this.cupHeight * 0.15;
        
        const currentRadius = THREE.MathUtils.lerp(
            this.cupRadiusBottom,
            this.cupRadiusTop,
            yPos / this.cupHeight
        );

        const r = currentRadius * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;

        pos.x = r * Math.cos(theta);
        pos.y = yPos; // Particles should be positioned at actual cup height
        pos.z = r * Math.sin(theta);

        if (type === 'coffee') {
            this.coffeeColor.toArray(this.colors, index * 3);
        } else {
            this.creamColor.toArray(this.colors, index * 3);
        }

        pos.toArray(this.positions, index * 3);

        this.particles[index] = {
            position: pos,
            velocity: new THREE.Vector3(),
            type: type,
        };
    }

    reset() {
        this.particles = [];
        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            this.initParticle(i, 'coffee');
        }
        this.updateGeometry();
        this.isStirring = false;
        
        // Force initial metrics update
        if (this.onMetricsUpdate) {
            this.onMetricsUpdate(0, 0);
        }
    }

    addCream() {
        let creamAdded = 0;
        const targetCreamCount = 3000;
        const creamCenterX = (Math.random() - 0.5) * this.cupRadiusTop * 0.5;
        const creamCenterZ = (Math.random() - 0.5) * this.cupRadiusTop * 0.5;
        const creamRadius = 1.5;
        
        // Convert coffee particles at the top of the coffee to cream
        // Since coffee goes up to 0.7 * cupHeight, we'll convert particles near that level
        for (let i = 0; i < this.PARTICLE_COUNT && creamAdded < targetCreamCount; i++) {
            if (this.particles[i].type === 'coffee') {
                const p = this.particles[i];
                // Check if particle is near the top of the coffee (between 0.5 and 0.7 of cup height)
                if (p.position.y > this.cupHeight * 0.5 && p.position.y <= this.cupHeight * 0.7) {
                    const dx = p.position.x - creamCenterX;
                    const dz = p.position.z - creamCenterZ;
                    const distSq = dx * dx + dz * dz;
                    if (distSq < creamRadius * creamRadius) {
                        // Just change the type and color, keep position
                        p.type = 'cream';
                        this.creamColor.toArray(this.colors, i * 3);
                        // Move particle up slightly to simulate cream floating on top
                        p.position.y += 0.5;
                        p.position.toArray(this.positions, i * 3);
                        creamAdded++;
                    }
                }
            }
        }
        this.updateGeometry();
    }

    setPaused(paused: boolean) {
        this.isPaused = paused;
    }

    setStirring(stirring: boolean) {
        this.isStirring = stirring;
    }

    update() {
        if (!this.isPaused && this.particles.length > 0) {
            this.updateParticles();
            
            // Only update metrics every 10 frames to prevent performance issues
            this.frameCounter++;
            if (this.frameCounter % 10 === 0) {
                this.updateMetrics();
            }
        }
    }

    private updateParticles() {
        const stirForce = 0.05;
        const gravity = -0.0001;
        const diffusion = 0.002;

        for (let i = 0; i < this.PARTICLE_COUNT; i++) {
            const p = this.particles[i];

            // Apply gravity
            p.velocity.y += gravity;

            // Apply stirring force
            if (this.isStirring) {
                const angle = Math.atan2(p.position.z, p.position.x);
                const stirVec = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
                p.velocity.add(stirVec.multiplyScalar(stirForce));
            }

            // Apply diffusion (random motion)
            p.velocity.x += (Math.random() - 0.5) * diffusion;
            p.velocity.z += (Math.random() - 0.5) * diffusion;

            // Update position
            p.position.add(p.velocity);

            // Boundary checks (cup walls)
            const yNormalized = p.position.y / this.cupHeight;
            const currentRadius = THREE.MathUtils.lerp(
                this.cupRadiusBottom,
                this.cupRadiusTop,
                yNormalized
            );
            const posRadiusSq = p.position.x * p.position.x + p.position.z * p.position.z;

            if (posRadiusSq > currentRadius * currentRadius) {
                const normal = new THREE.Vector3(p.position.x, 0, p.position.z).normalize();
                p.velocity.reflect(normal).multiplyScalar(0.5);

                const correctedPos = new THREE.Vector3(p.position.x, 0, p.position.z)
                    .normalize()
                    .multiplyScalar(currentRadius);
                p.position.x = correctedPos.x;
                p.position.z = correctedPos.z;
            }

            // Boundary checks (top/bottom)
            const bottomY = 0;
            const topY = this.cupHeight;
            if (p.position.y < bottomY) {
                p.position.y = bottomY;
                p.velocity.y *= -0.1;
            }
            if (p.position.y > topY) {
                p.position.y = topY;
                p.velocity.y *= -0.1;
            }

            // Dampen velocity
            p.velocity.multiplyScalar(0.97);

            // Update buffer
            p.position.toArray(this.positions, i * 3);
        }

        this.particleGeometry.attributes.position!.needsUpdate = true;
    }

    private updateMetrics() {
        const gridCell = new THREE.Vector3(
            (this.cupRadiusTop * 2) / this.gridDivisions,
            this.cupHeight / this.gridDivisions,
            (this.cupRadiusTop * 2) / this.gridDivisions
        );

        const grid = new Map<string, { coffee: number; cream: number }>();

        for (const p of this.particles) {
            const i = Math.floor((p.position.x + this.cupRadiusTop) / gridCell.x);
            const j = Math.floor(p.position.y / gridCell.y);
            const k = Math.floor((p.position.z + this.cupRadiusTop) / gridCell.z);
            const key = `${i},${j},${k}`;

            if (!grid.has(key)) {
                grid.set(key, { coffee: 0, cream: 0 });
            }
            const cell = grid.get(key)!;
            if (p.type === 'coffee') {
                cell.coffee++;
            } else {
                cell.cream++;
            }
        }

        let totalEntropy = 0;
        let complexity = 0;
        let activeCells = 0;

        for (const cell of grid.values()) {
            if (cell.coffee > 0 && cell.cream > 0) {
                complexity++;
                const total = cell.coffee + cell.cream;
                const pCoffee = cell.coffee / total;
                const pCream = cell.cream / total;
                totalEntropy += -(pCoffee * Math.log(pCoffee) + pCream * Math.log(pCream));
                activeCells++;
            }
        }

        const avgEntropy = activeCells > 0 ? totalEntropy / activeCells : 0;

        if (this.onMetricsUpdate) {
            this.onMetricsUpdate(avgEntropy, complexity);
        }
    }

    private updateGeometry() {
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        this.particleGeometry.attributes.position!.needsUpdate = true;
        this.particleGeometry.attributes.color!.needsUpdate = true;
    }
}