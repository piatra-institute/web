/// <reference types="@webgpu/types" />

// MLS-MPM shader imports
import p2gShader from './shaders/p2g.wgsl';
import gridUpdateShader from './shaders/gridUpdate.wgsl';
import g2pShader from './shaders/g2p.wgsl';
import renderShader from './shaders/render.wgsl';

export interface FluidParticle {
    position: [number, number, number];
    velocity: [number, number, number];
    mass: number;
    particleType: number; // 0 = coffee, 1 = cream
}

export interface SimulationMetrics {
    entropy: number;
    complexity: number;
    coffeeParticles: number;
    creamParticles: number;
    mixedness: number;
}

export class CoffeeCupFluidSimulation {
    private device: GPUDevice | null = null;
    private context: GPUCanvasContext | null = null;
    private format: GPUTextureFormat = 'bgra8unorm';

    // Simulation parameters
    private numParticles = 4000;
    private gridResolution = 64;
    private dt = 0.002; // Smaller time step for better stability
    private gravity = [0, -2.0, 0]; // Reduced gravity for more stable simulation

    // Cup parameters
    private cupRadius = 0.5;
    private cupHeight = 0.6;
    private cupCenter = [0, 0, 0];

    // Material properties
    private particleMass = 1.0;
    private particleVolume = 0.1;
    private hardening = 10.0;
    private E = 1.4e5; // Young's modulus
    private nu = 0.2; // Poisson's ratio

    // Buffers
    private particleBuffer: GPUBuffer | null = null;
    private gridBuffer: GPUBuffer | null = null;
    private uniformBuffer: GPUBuffer | null = null;
    private renderBuffer: GPUBuffer | null = null;

    // Pipelines
    private p2gPipeline: GPUComputePipeline | null = null;
    private gridUpdatePipeline: GPUComputePipeline | null = null;
    private g2pPipeline: GPUComputePipeline | null = null;
    private renderPipeline: GPURenderPipeline | null = null;

    // Bind groups
    private p2gBindGroup: GPUBindGroup | null = null;
    private gridUpdateBindGroup: GPUBindGroup | null = null;
    private g2pBindGroup: GPUBindGroup | null = null;
    private renderBindGroup: GPUBindGroup | null = null;

    // State
    private isPaused = false;
    private isStirring = false;
    private speed = 1.0;
    private time = 0;
    private frameCount = 0;

    // Metrics
    private onMetricsUpdate?: (entropy: number, complexity: number) => void;
    private metricsHistory: SimulationMetrics[] = [];

    constructor(onMetricsUpdate?: (entropy: number, complexity: number) => void) {
        this.onMetricsUpdate = onMetricsUpdate;
    }

    async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
        try {
            if (!navigator.gpu) {
                console.error('WebGPU not supported');
                return false;
            }

            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                console.error('No adapter found');
                return false;
            }

            this.device = await adapter.requestDevice();
            this.context = canvas.getContext('webgpu');

            if (!this.context) {
                console.error('No context');
                return false;
            }

            this.format = navigator.gpu.getPreferredCanvasFormat();

            this.context.configure({
                device: this.device,
                format: this.format,
                alphaMode: 'premultiplied',
            });

            await this.createBuffers();
            await this.createPipelines();
            this.initializeParticles();

            console.log('MLS-MPM Coffee Cup Fluid Simulation initialized');
            return true;
        } catch (error) {
            console.error('WebGPU initialization failed:', error);
            return false;
        }
    }

    private async createBuffers() {
        if (!this.device) return;

        // Particle buffer: position(12) + velocity(12) + mass(4) + type(4) = 32 bytes
        const particleSize = 32;
        this.particleBuffer = this.device.createBuffer({
            size: particleSize * this.numParticles,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });

        // Grid buffer: mass(4) + velocity(12) + force(12) = 28 bytes per grid cell
        const gridSize = 28;
        const gridCount = this.gridResolution * this.gridResolution * this.gridResolution;
        this.gridBuffer = this.device.createBuffer({
            size: gridSize * gridCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        // Uniform buffer for simulation parameters
        this.uniformBuffer = this.device.createBuffer({
            size: 256,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // Render buffer for vertex data (position + type for color)
        this.renderBuffer = this.device.createBuffer({
            size: 16 * this.numParticles, // 4 floats per vertex (position + type)
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC,
        });
    }

        private async createPipelines() {
        if (!this.device) return;

        try {
            // P2G (Particle to Grid) pipeline
            this.p2gPipeline = this.device.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: this.device.createShaderModule({
                        code: p2gShader,
                    }),
                    entryPoint: 'main',
                },
            });

            // Grid Update pipeline
            this.gridUpdatePipeline = this.device.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: this.device.createShaderModule({
                        code: gridUpdateShader,
                    }),
                    entryPoint: 'main',
                },
            });

            // G2P (Grid to Particle) pipeline
            this.g2pPipeline = this.device.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: this.device.createShaderModule({
                        code: g2pShader,
                    }),
                    entryPoint: 'main',
                },
            });

            // Render pipeline
            this.renderPipeline = this.device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                    module: this.device.createShaderModule({
                        code: renderShader,
                    }),
                    entryPoint: 'vertex',
                    buffers: [{
                        arrayStride: 16, // 4 floats for position + type
                        attributes: [{
                            format: 'float32x3',
                            offset: 0,
                            shaderLocation: 0,
                        }, {
                            format: 'float32',
                            offset: 12,
                            shaderLocation: 1,
                        }],
                    }],
                },
                fragment: {
                    module: this.device.createShaderModule({
                        code: renderShader,
                    }),
                    entryPoint: 'fragment',
                    targets: [{
                        format: this.format,
                    }],
                },
                primitive: {
                    topology: 'point-list',
                },
            });

            // Create bind groups after all pipelines are created
            this.createBindGroups();
        } catch (error) {
            console.error('Error creating pipelines:', error);
            throw error;
        }
    }

    private createBindGroups() {
        if (!this.device) return;

        // P2G bind group
        this.p2gBindGroup = this.device.createBindGroup({
            layout: this.p2gPipeline!.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer! } },
                { binding: 1, resource: { buffer: this.gridBuffer! } },
                { binding: 2, resource: { buffer: this.uniformBuffer! } },
            ],
        });

        // Grid Update bind group
        this.gridUpdateBindGroup = this.device.createBindGroup({
            layout: this.gridUpdatePipeline!.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.gridBuffer! } },
                { binding: 1, resource: { buffer: this.uniformBuffer! } },
            ],
        });

        // G2P bind group
        this.g2pBindGroup = this.device.createBindGroup({
            layout: this.g2pPipeline!.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer! } },
                { binding: 1, resource: { buffer: this.gridBuffer! } },
                { binding: 2, resource: { buffer: this.uniformBuffer! } },
                { binding: 3, resource: { buffer: this.renderBuffer! } },
            ],
        });

        // Render pipeline doesn't use bind groups
    }

    // Render pipeline doesn't use bind groups

    private initializeParticles() {
        if (!this.device) return;

        const particles = new Float32Array(this.numParticles * 8); // 8 floats per particle
        let particleIndex = 0;

        // Initialize coffee particles at the bottom of the cup
        const coffeeParticles = Math.floor(this.numParticles * 0.7);
        for (let i = 0; i < coffeeParticles; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * this.cupRadius * 0.6;
            const height = Math.random() * this.cupHeight * 0.2;

            // Position - make sure particles are visible
            particles[particleIndex++] = this.cupCenter[0] + radius * Math.cos(angle);
            particles[particleIndex++] = this.cupCenter[1] - this.cupHeight * 0.3 + height;
            particles[particleIndex++] = this.cupCenter[2] + radius * Math.sin(angle);

            // Velocity
            particles[particleIndex++] = 0;
            particles[particleIndex++] = 0;
            particles[particleIndex++] = 0;



            // Mass and type
            particles[particleIndex++] = this.particleMass;
            particles[particleIndex++] = 0; // Coffee type
        }

        // Initialize cream particles at the top
        const creamParticles = this.numParticles - coffeeParticles;
        for (let i = 0; i < creamParticles; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * this.cupRadius * 0.4;
            const height = Math.random() * this.cupHeight * 0.15;

            // Position - cream at the top
            particles[particleIndex++] = this.cupCenter[0] + radius * Math.cos(angle);
            particles[particleIndex++] = this.cupCenter[1] + this.cupHeight * 0.1 + height;
            particles[particleIndex++] = this.cupCenter[2] + radius * Math.sin(angle);

            // Velocity
            particles[particleIndex++] = 0;
            particles[particleIndex++] = 0;
            particles[particleIndex++] = 0;



            // Mass and type
            particles[particleIndex++] = this.particleMass;
            particles[particleIndex++] = 1; // Cream type
        }

        this.device.queue.writeBuffer(this.particleBuffer!, 0, particles);
    }

    update() {
        if (!this.device || !this.context || this.isPaused) return;

        // Check if all required resources are available
        if (!this.particleBuffer || !this.gridBuffer || !this.uniformBuffer ||
            !this.renderBuffer || !this.p2gPipeline || !this.gridUpdatePipeline ||
            !this.g2pPipeline || !this.renderPipeline || !this.p2gBindGroup ||
            !this.gridUpdateBindGroup || !this.g2pBindGroup) {
            console.warn('Some WebGPU resources are not initialized, skipping update');
            return;
        }

        const dt = this.dt * this.speed;
        this.time += dt;
        this.frameCount++;

        // Update uniform buffer with current time and parameters
        const uniformData = new Float32Array(64);
        uniformData[0] = dt;
        uniformData[1] = this.time;
        uniformData[2] = this.gridResolution;
        uniformData[3] = this.particleVolume;
        uniformData[4] = this.hardening;
        uniformData[5] = this.E;
        uniformData[6] = this.nu;
        uniformData[7] = this.isStirring ? 1.0 : 0.0;
        uniformData[8] = this.gravity[0];
        uniformData[9] = this.gravity[1];
        uniformData[10] = this.gravity[2];
        uniformData[11] = this.cupRadius;
        uniformData[12] = this.cupHeight;
        uniformData[13] = this.cupCenter[0];
        uniformData[14] = this.cupCenter[1];
        uniformData[15] = this.cupCenter[2];

        this.device.queue.writeBuffer(this.uniformBuffer!, 0, uniformData);

        // Debug: Log first few particle positions every 60 frames
        if (this.frameCount % 60 === 0) {
            console.log('Frame:', this.frameCount, 'Time:', this.time.toFixed(3));
        }

        try {
            const commandEncoder = this.device.createCommandEncoder();

        // Clear grid
        const clearPass = commandEncoder.beginComputePass();
        clearPass.setPipeline(this.gridUpdatePipeline!);
        clearPass.setBindGroup(0, this.gridUpdateBindGroup!);
        clearPass.dispatchWorkgroups(Math.ceil(this.gridResolution * this.gridResolution * this.gridResolution / 64));
        clearPass.end();

        // P2G transfer
        const p2gPass = commandEncoder.beginComputePass();
        p2gPass.setPipeline(this.p2gPipeline!);
        p2gPass.setBindGroup(0, this.p2gBindGroup!);
        p2gPass.dispatchWorkgroups(Math.ceil(this.numParticles / 64));
        p2gPass.end();

        // G2P transfer
        const g2pPass = commandEncoder.beginComputePass();
        g2pPass.setPipeline(this.g2pPipeline!);
        g2pPass.setBindGroup(0, this.g2pBindGroup!);
        g2pPass.dispatchWorkgroups(Math.ceil(this.numParticles / 64));
        g2pPass.end();

        // Render
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });

        renderPass.setPipeline(this.renderPipeline!);
        renderPass.setVertexBuffer(0, this.renderBuffer!);
        renderPass.draw(this.numParticles);
        renderPass.end();

            this.device.queue.submit([commandEncoder.finish()]);

            // Calculate metrics every 30 frames
            if (this.frameCount % 30 === 0) {
                this.calculateMetrics();
            }
        } catch (error) {
            console.error('Error in WebGPU update:', error);
        }
    }

    private async calculateMetrics() {
        if (!this.device || !this.onMetricsUpdate) return;

        try {
            // Read particle data for metrics calculation
            const readbackBuffer = this.device.createBuffer({
                size: this.numParticles * 32,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });

            const commandEncoder = this.device.createCommandEncoder();
            commandEncoder.copyBufferToBuffer(this.particleBuffer!, 0, readbackBuffer, 0, this.numParticles * 32);
            this.device.queue.submit([commandEncoder.finish()]);

            await readbackBuffer.mapAsync(GPUMapMode.READ);
            const particleData = new Float32Array(readbackBuffer.getMappedRange());
            readbackBuffer.unmap();

            // Calculate metrics
            let coffeeParticles = 0;
            let creamParticles = 0;
            let totalVelocity = 0;
            let mixedness = 0;

            for (let i = 0; i < this.numParticles; i++) {
                const baseIndex = i * 8;
                const type = particleData[baseIndex + 7];
                const vx = particleData[baseIndex + 3];
                const vy = particleData[baseIndex + 4];
                const vz = particleData[baseIndex + 5];
                const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz);

                if (type === 0) {
                    coffeeParticles++;
                } else {
                    creamParticles++;
                }

                totalVelocity += velocity;
            }

            // Calculate mixedness based on spatial distribution
            const coffeePositions: [number, number, number][] = [];
            const creamPositions: [number, number, number][] = [];

            for (let i = 0; i < this.numParticles; i++) {
                const baseIndex = i * 8;
                const type = particleData[baseIndex + 7];
                const pos: [number, number, number] = [
                    particleData[baseIndex],
                    particleData[baseIndex + 1],
                    particleData[baseIndex + 2]
                ];

                if (type === 0) {
                    coffeePositions.push(pos);
                } else {
                    creamPositions.push(pos);
                }
            }

            // Calculate average distance between coffee and cream particles
            let totalDistance = 0;
            let count = 0;
            for (const coffeePos of coffeePositions) {
                for (const creamPos of creamPositions) {
                    const dx = coffeePos[0] - creamPos[0];
                    const dy = coffeePos[1] - creamPos[1];
                    const dz = coffeePos[2] - creamPos[2];
                    totalDistance += Math.sqrt(dx * dx + dy * dy + dz * dz);
                    count++;
                }
            }

            mixedness = count > 0 ? totalDistance / count : 0;

            // Calculate entropy and complexity with safety checks
            const avgVelocity = this.numParticles > 0 ? totalVelocity / this.numParticles : 0;
            const safeMixedness = Math.max(mixedness, 0.001); // Prevent log(0)

            const entropy = Math.log(safeMixedness + 1) * avgVelocity;
            const complexity = safeMixedness * avgVelocity;

            // Ensure values are finite numbers
            const safeEntropy = isFinite(entropy) ? entropy : 0;
            const safeComplexity = isFinite(complexity) ? complexity : 0;

            this.onMetricsUpdate(safeEntropy, safeComplexity);

        } catch (error) {
            console.error('Error calculating metrics:', error);
        }
    }

    async addCream() {
        if (!this.device) return;

        // Read current particles
        const readbackBuffer = this.device.createBuffer({
            size: this.numParticles * 32,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(this.particleBuffer!, 0, readbackBuffer, 0, this.numParticles * 32);
        this.device.queue.submit([commandEncoder.finish()]);

        await readbackBuffer.mapAsync(GPUMapMode.READ);
        const particleData = new Float32Array(readbackBuffer.getMappedRange());
        // Copy the data before unmapping to avoid ArrayBuffer detachment
        const particleDataCopy = new Float32Array(particleData);
        readbackBuffer.unmap();

        // Add cream particles at the top
        const creamToAdd = 500;
        const newParticles = new Float32Array((this.numParticles + creamToAdd) * 8);

        // Copy existing particles
        newParticles.set(particleDataCopy);

        // Add new cream particles
        for (let i = 0; i < creamToAdd; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * this.cupRadius * 0.5;
            const height = Math.random() * this.cupHeight * 0.1;

            const baseIndex = (this.numParticles + i) * 8;

            // Position
            newParticles[baseIndex] = this.cupCenter[0] + radius * Math.cos(angle);
            newParticles[baseIndex + 1] = this.cupCenter[1] + this.cupHeight * 0.3 + height;
            newParticles[baseIndex + 2] = this.cupCenter[2] + radius * Math.sin(angle);

            // Velocity
            newParticles[baseIndex + 3] = 0;
            newParticles[baseIndex + 4] = 0;
            newParticles[baseIndex + 5] = 0;

            // Mass and type
            newParticles[baseIndex + 6] = this.particleMass;
            newParticles[baseIndex + 7] = 1; // Cream type
        }

        // Create new buffer with more particles
        this.numParticles += creamToAdd;
        const newParticleBuffer = this.device.createBuffer({
            size: this.numParticles * 32,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });

        this.device.queue.writeBuffer(newParticleBuffer, 0, newParticles);

        // Update render buffer
        const newRenderBuffer = this.device.createBuffer({
            size: 16 * this.numParticles,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_SRC,
        });

        // Dispose old buffers
        this.particleBuffer!.destroy();
        this.renderBuffer!.destroy();

        // Update references
        this.particleBuffer = newParticleBuffer;
        this.renderBuffer = newRenderBuffer;

        // Recreate bind groups
        this.createBindGroups();
    }

    reset() {
        this.initializeParticles();
        this.time = 0;
        this.frameCount = 0;
    }

    setPaused(paused: boolean) {
        this.isPaused = paused;
    }

    setStirring(stirring: boolean) {
        this.isStirring = stirring;
    }

    setSpeed(speed: number) {
        this.speed = speed;
    }

    dispose() {
        if (this.particleBuffer) this.particleBuffer.destroy();
        if (this.gridBuffer) this.gridBuffer.destroy();
        if (this.uniformBuffer) this.uniformBuffer.destroy();
        if (this.renderBuffer) this.renderBuffer.destroy();
    }
}