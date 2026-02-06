// WebGPU Fluid Simulation for coffee/cream mixing

import simulateShader from './shaders/simulate.wgsl';
import copyPositionShader from './shaders/copyPosition.wgsl';
import densityClearShader from './shaders/densityClear.wgsl';
import densityBinShader from './shaders/densityBin.wgsl';
import densityPressureShader from './shaders/densityPressure.wgsl';

import {
    numParticlesMax,
    numCoffeeParticles,
    numCreamParticles,
    particleStructSize,
    GLASS_RADIUS,
    GLASS_HEIGHT,
    DENSITY_GRID_SIZE,
} from './common';

export class FluidSimulation {
    device: GPUDevice;
    numParticles: number = 0;
    numCream: number = 0;
    numCoffee: number = 0;

    particleBuffer: GPUBuffer;
    posvelBuffer: GPUBuffer;
    simUniformBuffer: GPUBuffer;
    densityUniformBuffer: GPUBuffer;
    pressureUniformBuffer: GPUBuffer;
    densityBuffer: GPUBuffer;

    simulatePipeline: GPUComputePipeline;
    copyPositionPipeline: GPUComputePipeline;
    densityClearPipeline: GPUComputePipeline;
    densityBinPipeline: GPUComputePipeline;
    densityPressurePipeline: GPUComputePipeline;

    simulateBindGroup: GPUBindGroup;
    copyPositionBindGroup: GPUBindGroup;
    densityClearBindGroup: GPUBindGroup;
    densityBinBindGroup: GPUBindGroup;
    densityPressureBindGroup: GPUBindGroup;

    time: number = 0;
    stirActive: boolean = false;
    stirStrength: number = 5.0;
    viscosity: number = 0.45;
    diffusion: number = 0.35;
    buoyancy: number = 0.7;
    pourRate: number = 0;
    pourAccumulator: number = 0;
    stirImpulseRemaining: number = 0;
    stirImpulseStrength: number = 10.0;
    pressureStrength: number = 0.8;
    restDensity: number = 3.2;

    constructor(device: GPUDevice, particleBuffer: GPUBuffer, posvelBuffer: GPUBuffer) {
        this.device = device;
        this.particleBuffer = particleBuffer;
        this.posvelBuffer = posvelBuffer;

        // Create uniform buffer for simulation
        this.simUniformBuffer = device.createBuffer({
            label: 'sim uniforms buffer',
            size: 48, // 3 vec4s
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.densityUniformBuffer = device.createBuffer({
            label: 'density uniforms buffer',
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.pressureUniformBuffer = device.createBuffer({
            label: 'pressure uniforms buffer',
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.densityBuffer = device.createBuffer({
            label: 'density buffer',
            size: DENSITY_GRID_SIZE * DENSITY_GRID_SIZE * DENSITY_GRID_SIZE * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        // Create compute pipelines
        const simulateModule = device.createShaderModule({ code: simulateShader });
        const copyPositionModule = device.createShaderModule({ code: copyPositionShader });
        const densityClearModule = device.createShaderModule({ code: densityClearShader });
        const densityBinModule = device.createShaderModule({ code: densityBinShader });
        const densityPressureModule = device.createShaderModule({ code: densityPressureShader });

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

        this.densityClearPipeline = device.createComputePipeline({
            label: 'density clear pipeline',
            layout: 'auto',
            compute: { module: densityClearModule },
        });

        this.densityBinPipeline = device.createComputePipeline({
            label: 'density bin pipeline',
            layout: 'auto',
            compute: { module: densityBinModule },
        });

        this.densityPressurePipeline = device.createComputePipeline({
            label: 'density pressure pipeline',
            layout: 'auto',
            compute: { module: densityPressureModule },
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

        this.densityClearBindGroup = device.createBindGroup({
            layout: this.densityClearPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.densityBuffer } },
            ],
        });

        this.densityBinBindGroup = device.createBindGroup({
            layout: this.densityBinPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: particleBuffer } },
                { binding: 1, resource: { buffer: this.densityBuffer } },
                { binding: 2, resource: { buffer: this.densityUniformBuffer } },
            ],
        });

        this.densityPressureBindGroup = device.createBindGroup({
            layout: this.densityPressurePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: particleBuffer } },
                { binding: 1, resource: { buffer: this.densityBuffer } },
                { binding: 2, resource: { buffer: this.pressureUniformBuffer } },
            ],
        });
    }

    initParticles() {
        const particles = new ArrayBuffer(particleStructSize * numParticlesMax);
        const view = new Float32Array(particles);

        let idx = 0;

        // Coffee particles fill most of the volume (80% of glass)
        for (let i = 0; i < numCoffeeParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (GLASS_RADIUS - 0.2);
            const y = -GLASS_HEIGHT / 2 + 0.05 + Math.random() * GLASS_HEIGHT * 0.8;

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

        this.numParticles = idx;
        this.numCoffee = idx;
        this.numCream = 0;
        this.device.queue.writeBuffer(this.particleBuffer, 0, particles, 0, particleStructSize * this.numParticles);
    }

    reset() {
        this.time = 0;
        this.pourAccumulator = 0;
        this.stirImpulseRemaining = 0;
        this.initParticles();
    }

    setStirring(active: boolean) {
        this.stirActive = active;
    }

    setStirStrength(strength: number) {
        this.stirStrength = strength;
    }

    setViscosity(viscosity: number) {
        this.viscosity = viscosity;
    }

    setDiffusion(diffusion: number) {
        this.diffusion = diffusion;
    }

    setBuoyancy(buoyancy: number) {
        this.buoyancy = buoyancy;
    }

    setPourRate(rate: number) {
        this.pourRate = rate;
    }

    stirOnce() {
        this.stirImpulseRemaining = 0.6;
        this.stirImpulseStrength = Math.max(this.stirStrength * 1.6, 10.0);
    }

    addCreamBurst(count: number) {
        const remaining = numCreamParticles - this.numCream;
        const spawnCount = Math.min(count, remaining);
        if (spawnCount <= 0) return;
        this.spawnCream(spawnCount);
    }

    private spawnCream(count: number) {
        const particles = new Float32Array(count * 8);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (GLASS_RADIUS * 0.22);
            const y = GLASS_HEIGHT * 0.22 + Math.random() * GLASS_HEIGHT * 0.12;

            const offset = i * 8;
            particles[offset + 0] = Math.cos(angle) * r;
            particles[offset + 1] = y;
            particles[offset + 2] = Math.sin(angle) * r;
            particles[offset + 3] = 1.0;
            particles[offset + 4] = 0.0;
            particles[offset + 5] = -0.18;
            particles[offset + 6] = 0.0;
            particles[offset + 7] = 0.0;
        }

        const byteOffset = this.numParticles * particleStructSize;
        this.device.queue.writeBuffer(this.particleBuffer, byteOffset, particles);
        this.numParticles += count;
        this.numCream += count;
    }

    private updatePour(dt: number) {
        if (this.pourRate <= 0 || this.numCream >= numCreamParticles) {
            return;
        }

        this.pourAccumulator += dt * this.pourRate;
        const spawnCount = Math.min(Math.floor(this.pourAccumulator), numCreamParticles - this.numCream);
        if (spawnCount <= 0) {
            return;
        }

        this.pourAccumulator -= spawnCount;
        this.spawnCream(spawnCount);
    }

    execute(commandEncoder: GPUCommandEncoder, dt: number = 0.016) {
        this.time += dt;
        this.updatePour(dt);
        if (this.stirImpulseRemaining > 0) {
            this.stirImpulseRemaining = Math.max(0, this.stirImpulseRemaining - dt);
        }

        const stirPulse = this.stirImpulseRemaining > 0 ? this.stirImpulseStrength : 0;
        const stirActive = this.stirActive || stirPulse > 0;
        const stirStrength = Math.max(this.stirStrength, stirPulse);

        // Update uniforms
        const uniforms = new Float32Array(12);
        uniforms[0] = GLASS_RADIUS;
        uniforms[1] = GLASS_HEIGHT;
        const substeps = 3;
        uniforms[2] = dt / substeps;
        uniforms[3] = stirStrength;
        uniforms[4] = stirActive ? 1.0 : 0.0;
        uniforms[5] = -0.9;
        uniforms[6] = this.time;
        uniforms[7] = this.viscosity;
        uniforms[8] = this.diffusion;
        uniforms[9] = this.buoyancy;
        uniforms[10] = this.numParticles;
        uniforms[11] = 0.0;

        this.device.queue.writeBuffer(this.simUniformBuffer, 0, uniforms);

        const densityUniforms = new Float32Array([
            DENSITY_GRID_SIZE,
            this.numParticles,
            GLASS_RADIUS,
            GLASS_HEIGHT,
        ]);
        this.device.queue.writeBuffer(this.densityUniformBuffer, 0, densityUniforms);

        const pressureUniforms = new Float32Array(8);
        pressureUniforms[0] = DENSITY_GRID_SIZE;
        pressureUniforms[1] = this.numParticles;
        pressureUniforms[2] = GLASS_RADIUS;
        pressureUniforms[3] = GLASS_HEIGHT;
        pressureUniforms[4] = dt;
        pressureUniforms[5] = this.pressureStrength;
        pressureUniforms[6] = this.restDensity;
        pressureUniforms[7] = 0.0;
        this.device.queue.writeBuffer(this.pressureUniformBuffer, 0, pressureUniforms);

        const computePass = commandEncoder.beginComputePass();

        // Density clear
        computePass.setPipeline(this.densityClearPipeline);
        computePass.setBindGroup(0, this.densityClearBindGroup);
        computePass.dispatchWorkgroups(Math.ceil((DENSITY_GRID_SIZE ** 3) / 256));

        // Density bin
        computePass.setPipeline(this.densityBinPipeline);
        computePass.setBindGroup(0, this.densityBinBindGroup);
        computePass.dispatchWorkgroups(Math.ceil(this.numParticles / 128));

        // Pressure pass
        computePass.setPipeline(this.densityPressurePipeline);
        computePass.setBindGroup(0, this.densityPressureBindGroup);
        computePass.dispatchWorkgroups(Math.ceil(this.numParticles / 128));

        // Run simulation (multiple substeps for stability)
        for (let i = 0; i < substeps; i++) {
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
}
