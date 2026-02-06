import metricsClearShader from './shaders/metricsClear.wgsl';
import metricsBinShader from './shaders/metricsBin.wgsl';
import metricsCellShader from './shaders/metricsCell.wgsl';

import {
    GLASS_HEIGHT,
    GLASS_RADIUS,
    METRICS_GRID_SIZE,
    METRICS_SCALE,
} from './common';

export interface MetricsSample {
    entropy: number;
    mixedness: number;
    complexity: number;
    kinetic: number;
    count: number;
}

const METRICS_BUFFER_SIZE = 32;

export class MetricsComputer {
    private device: GPUDevice;
    private particleBuffer: GPUBuffer;

    private countsBuffer: GPUBuffer;
    private metricsBuffer: GPUBuffer;
    private metricsReadBuffer: GPUBuffer;
    private uniformBuffer: GPUBuffer;

    private clearPipeline: GPUComputePipeline;
    private binPipeline: GPUComputePipeline;
    private cellPipeline: GPUComputePipeline;

    private clearBindGroup: GPUBindGroup;
    private binBindGroup: GPUBindGroup;
    private cellBindGroup: GPUBindGroup;

    private readInFlight = false;

    constructor(device: GPUDevice, particleBuffer: GPUBuffer) {
        this.device = device;
        this.particleBuffer = particleBuffer;

        const cellCount = METRICS_GRID_SIZE * METRICS_GRID_SIZE * METRICS_GRID_SIZE;

        this.countsBuffer = device.createBuffer({
            label: 'metrics counts buffer',
            size: cellCount * 8,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.metricsBuffer = device.createBuffer({
            label: 'metrics buffer',
            size: METRICS_BUFFER_SIZE,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.metricsReadBuffer = device.createBuffer({
            label: 'metrics read buffer',
            size: METRICS_BUFFER_SIZE,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        this.uniformBuffer = device.createBuffer({
            label: 'metrics uniform buffer',
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const clearModule = device.createShaderModule({ code: metricsClearShader });
        const binModule = device.createShaderModule({ code: metricsBinShader });
        const cellModule = device.createShaderModule({ code: metricsCellShader });

        this.clearPipeline = device.createComputePipeline({
            label: 'metrics clear pipeline',
            layout: 'auto',
            compute: { module: clearModule },
        });

        this.binPipeline = device.createComputePipeline({
            label: 'metrics bin pipeline',
            layout: 'auto',
            compute: { module: binModule },
        });

        this.cellPipeline = device.createComputePipeline({
            label: 'metrics cell pipeline',
            layout: 'auto',
            compute: { module: cellModule },
        });

        this.clearBindGroup = device.createBindGroup({
            layout: this.clearPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.countsBuffer } },
                { binding: 1, resource: { buffer: this.metricsBuffer } },
            ],
        });

        this.binBindGroup = device.createBindGroup({
            layout: this.binPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer } },
                { binding: 1, resource: { buffer: this.countsBuffer } },
                { binding: 2, resource: { buffer: this.metricsBuffer } },
                { binding: 3, resource: { buffer: this.uniformBuffer } },
            ],
        });

        this.cellBindGroup = device.createBindGroup({
            layout: this.cellPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.countsBuffer } },
                { binding: 1, resource: { buffer: this.metricsBuffer } },
                { binding: 2, resource: { buffer: this.uniformBuffer } },
            ],
        });
    }

    encode(commandEncoder: GPUCommandEncoder, numParticles: number) {
        const uniforms = new Float32Array([
            METRICS_GRID_SIZE,
            numParticles,
            GLASS_RADIUS,
            GLASS_HEIGHT,
        ]);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, uniforms);

        const clearPass = commandEncoder.beginComputePass();
        clearPass.setPipeline(this.clearPipeline);
        clearPass.setBindGroup(0, this.clearBindGroup);
        clearPass.dispatchWorkgroups(Math.ceil((METRICS_GRID_SIZE ** 3) / 256));
        clearPass.end();

        const binPass = commandEncoder.beginComputePass();
        binPass.setPipeline(this.binPipeline);
        binPass.setBindGroup(0, this.binBindGroup);
        binPass.dispatchWorkgroups(Math.ceil(numParticles / 128));
        binPass.end();

        const cellPass = commandEncoder.beginComputePass();
        cellPass.setPipeline(this.cellPipeline);
        cellPass.setBindGroup(0, this.cellBindGroup);
        cellPass.dispatchWorkgroups(Math.ceil((METRICS_GRID_SIZE ** 3) / 128));
        cellPass.end();

        commandEncoder.copyBufferToBuffer(this.metricsBuffer, 0, this.metricsReadBuffer, 0, METRICS_BUFFER_SIZE);
    }

    async readMetrics(): Promise<MetricsSample | null> {
        if (this.readInFlight) {
            return null;
        }
        this.readInFlight = true;

        try {
            await this.metricsReadBuffer.mapAsync(GPUMapMode.READ);
            const data = new Uint32Array(this.metricsReadBuffer.getMappedRange());

            const entropySum = data[0];
            const mixednessSum = data[1];
            const complexitySum = data[2];
            const kineticSum = data[3];
            const count = data[4];

            const scale = METRICS_SCALE;
            const denom = Math.max(1, count) * scale;

            const entropy = entropySum / denom;
            const mixedness = mixednessSum / denom;
            const complexity = complexitySum / denom;
            const kinetic = kineticSum / denom;

            return {
                entropy,
                mixedness,
                complexity,
                kinetic,
                count,
            };
        } finally {
            this.metricsReadBuffer.unmap();
            this.readInFlight = false;
        }
    }
}
