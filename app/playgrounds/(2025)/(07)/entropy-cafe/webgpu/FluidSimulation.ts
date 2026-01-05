// WebGPU Fluid Simulation for coffee/cream mixing

import simulateShader from './shaders/simulate.wgsl';
import copyPositionShader from './shaders/copyPosition.wgsl';

import {
    numParticlesMax,
    numCoffeeParticles,
    numCreamParticles,
    particleStructSize,
    GLASS_RADIUS,
    GLASS_HEIGHT,
} from './common';

export class FluidSimulation {
    device: GPUDevice;
    numParticles: number = 0;

    particleBuffer: GPUBuffer;
    posvelBuffer: GPUBuffer;
    simUniformBuffer: GPUBuffer;

    simulatePipeline: GPUComputePipeline;
    copyPositionPipeline: GPUComputePipeline;

    simulateBindGroup: GPUBindGroup;
    copyPositionBindGroup: GPUBindGroup;

    time: number = 0;
    stirActive: boolean = false;
    stirStrength: number = 5.0;

    constructor(device: GPUDevice, particleBuffer: GPUBuffer, posvelBuffer: GPUBuffer) {
        this.device = device;
        this.particleBuffer = particleBuffer;
        this.posvelBuffer = posvelBuffer;

        // Create uniform buffer for simulation
        this.simUniformBuffer = device.createBuffer({
            label: 'sim uniforms buffer',
            size: 32, // glass_radius, glass_height, dt, stir_strength, stir_active, gravity, time, num_particles
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // Create compute pipelines
        const simulateModule = device.createShaderModule({ code: simulateShader });
        const copyPositionModule = device.createShaderModule({ code: copyPositionShader });

        this.simulatePipeline = device.createComputePipeline({
            label: 'simulate pipeline',
            layout: 'auto',
            compute: { module: simulateModule },
        });

        this.copyPositionPipeline = device.createComputePipeline({
            label: 'copy position pipeline',
            layout: 'auto',
            compute: { module: copyPositionModule },
        });

        // Create bind groups
        this.simulateBindGroup = device.createBindGroup({
            layout: this.simulatePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: particleBuffer } },
                { binding: 1, resource: { buffer: this.simUniformBuffer } },
            ],
        });

        this.copyPositionBindGroup = device.createBindGroup({
            layout: this.copyPositionPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: particleBuffer } },
                { binding: 1, resource: { buffer: posvelBuffer } },
            ],
        });
    }

    initParticles() {
        const particles = new ArrayBuffer(particleStructSize * numParticlesMax);
        const view = new Float32Array(particles);

        let idx = 0;

        // Coffee particles at bottom (60% of glass)
        for (let i = 0; i < numCoffeeParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (GLASS_RADIUS - 0.2);
            const y = -GLASS_HEIGHT / 2 + 0.1 + Math.random() * GLASS_HEIGHT * 0.5;

            const offset = idx * 8; // 8 floats per particle
            view[offset + 0] = Math.cos(angle) * r; // position.x
            view[offset + 1] = y;                    // position.y
            view[offset + 2] = Math.sin(angle) * r; // position.z
            view[offset + 3] = 0.0;                  // particle_type (0 = coffee)
            view[offset + 4] = 0.0;                  // velocity.x
            view[offset + 5] = 0.0;                  // velocity.y
            view[offset + 6] = 0.0;                  // velocity.z
            view[offset + 7] = 0.0;                  // padding

            idx++;
        }

        // Cream particles at top (30% of glass)
        for (let i = 0; i < numCreamParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (GLASS_RADIUS - 0.25);
            const y = GLASS_HEIGHT * 0.1 + Math.random() * GLASS_HEIGHT * 0.35;

            const offset = idx * 8;
            view[offset + 0] = Math.cos(angle) * r;
            view[offset + 1] = y;
            view[offset + 2] = Math.sin(angle) * r;
            view[offset + 3] = 1.0;                  // particle_type (1 = cream)
            view[offset + 4] = 0.0;
            view[offset + 5] = 0.0;
            view[offset + 6] = 0.0;
            view[offset + 7] = 0.0;

            idx++;
        }

        this.numParticles = idx;
        this.device.queue.writeBuffer(this.particleBuffer, 0, particles, 0, particleStructSize * this.numParticles);
    }

    reset() {
        this.time = 0;
        this.initParticles();
    }

    setStirring(active: boolean) {
        this.stirActive = active;
    }

    stir() {
        // Single stir impulse - temporarily increase stir strength
        const tempStrength = this.stirStrength;
        this.stirStrength = 15.0;
        this.stirActive = true;

        setTimeout(() => {
            this.stirStrength = tempStrength;
            this.stirActive = false;
        }, 500);
    }

    execute(commandEncoder: GPUCommandEncoder, dt: number = 0.016) {
        this.time += dt;

        // Update uniforms
        const uniforms = new ArrayBuffer(32);
        const view = new Float32Array(uniforms);
        const uintView = new Uint32Array(uniforms);

        view[0] = GLASS_RADIUS;           // glass_radius
        view[1] = GLASS_HEIGHT;           // glass_height
        view[2] = dt * 60;                // dt (normalized to 60fps)
        view[3] = this.stirStrength;      // stir_strength
        view[4] = this.stirActive ? 1.0 : 0.0; // stir_active
        view[5] = -2.0;                   // gravity
        view[6] = this.time;              // time
        uintView[7] = this.numParticles;  // num_particles

        this.device.queue.writeBuffer(this.simUniformBuffer, 0, uniforms);

        const computePass = commandEncoder.beginComputePass();

        // Run simulation (multiple substeps for stability)
        for (let i = 0; i < 2; i++) {
            computePass.setBindGroup(0, this.simulateBindGroup);
            computePass.setPipeline(this.simulatePipeline);
            computePass.dispatchWorkgroups(Math.ceil(this.numParticles / 64));
        }

        // Copy positions for rendering
        computePass.setBindGroup(0, this.copyPositionBindGroup);
        computePass.setPipeline(this.copyPositionPipeline);
        computePass.dispatchWorkgroups(Math.ceil(this.numParticles / 64));

        computePass.end();
    }

    calculateEntropy(): { entropy: number; mixedness: number } {
        // This would ideally be done on GPU, but for simplicity we'll estimate
        // based on simulation time and stirring
        const baseEntropy = Math.min(1.0, this.time * 0.01);
        const stirBonus = this.stirActive ? 0.1 : 0;
        return {
            entropy: Math.min(1.0, baseEntropy + stirBonus),
            mixedness: Math.min(1.0, baseEntropy * 0.8 + stirBonus),
        };
    }
}
