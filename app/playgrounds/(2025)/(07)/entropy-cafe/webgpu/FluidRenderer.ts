// WebGPU Fluid Renderer with screen-space fluid rendering

import depthMapShader from './shaders/depthMap.wgsl';
import colorMapShader from './shaders/colorMap.wgsl';
import bilateralShader from './shaders/bilateral.wgsl';
import fluidShader from './shaders/fluid.wgsl';
import glassShader from './shaders/glass.wgsl';

import { GLASS_RADIUS, GLASS_HEIGHT, PARTICLE_RADIUS } from './common';

export class FluidRenderer {
    device: GPUDevice;
    canvas: HTMLCanvasElement;

    // Pipelines
    depthMapPipeline: GPURenderPipeline;
    colorMapPipeline: GPURenderPipeline;
    depthFilterPipeline: GPURenderPipeline;
    fluidPipeline: GPURenderPipeline;
    glassPipeline: GPURenderPipeline;

    // Textures
    depthMapTextureView: GPUTextureView;
    tmpDepthMapTextureView: GPUTextureView;
    colorMapTextureView: GPUTextureView;
    depthTestTextureView: GPUTextureView;

    // Bind groups
    depthMapBindGroup: GPUBindGroup;
    colorMapBindGroup: GPUBindGroup;
    depthFilterBindGroups: GPUBindGroup[];
    fluidBindGroup: GPUBindGroup;
    glassBindGroup: GPUBindGroup;

    // Buffers
    renderUniformBuffer: GPUBuffer;
    glassUniformBuffer: GPUBuffer;
    filterXUniformBuffer: GPUBuffer;
    filterYUniformBuffer: GPUBuffer;

    constructor(
        device: GPUDevice,
        canvas: HTMLCanvasElement,
        presentationFormat: GPUTextureFormat,
        posvelBuffer: GPUBuffer,
        renderUniformBuffer: GPUBuffer
    ) {
        this.device = device;
        this.canvas = canvas;
        this.renderUniformBuffer = renderUniformBuffer;

        const screenConstants = {
            screenHeight: canvas.height,
            screenWidth: canvas.width,
        };

        const filterConstants = {
            depth_threshold: PARTICLE_RADIUS * 10,
            max_filter_size: 30,
            projected_particle_constant: (10 * PARTICLE_RADIUS * 2 * 0.05 * (canvas.height / 2)) / Math.tan(Math.PI / 8),
        };

        // Create shader modules
        const depthMapModule = device.createShaderModule({ code: depthMapShader });
        const colorMapModule = device.createShaderModule({ code: colorMapShader });
        const bilateralModule = device.createShaderModule({ code: bilateralShader });
        const fluidModule = device.createShaderModule({ code: fluidShader });
        const glassModule = device.createShaderModule({ code: glassShader });

        // Create samplers
        const sampler = device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });

        // === PIPELINES ===

        // Depth map pipeline
        this.depthMapPipeline = device.createRenderPipeline({
            label: 'depth map pipeline',
            layout: 'auto',
            vertex: { module: depthMapModule },
            fragment: {
                module: depthMapModule,
                targets: [{ format: 'r32float' }],
            },
            primitive: { topology: 'triangle-list' },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth32float',
            },
        });

        // Color map pipeline
        this.colorMapPipeline = device.createRenderPipeline({
            label: 'color map pipeline',
            layout: 'auto',
            vertex: { module: colorMapModule },
            fragment: {
                module: colorMapModule,
                targets: [{
                    format: 'rgba8unorm',
                    blend: {
                        color: { operation: 'add', srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
                        alpha: { operation: 'add', srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
                    },
                }],
            },
            primitive: { topology: 'triangle-list' },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth32float',
            },
        });

        // Bilateral filter pipeline
        this.depthFilterPipeline = device.createRenderPipeline({
            label: 'bilateral filter pipeline',
            layout: 'auto',
            vertex: {
                module: bilateralModule,
                constants: screenConstants,
            },
            fragment: {
                module: bilateralModule,
                constants: { ...filterConstants, ...screenConstants },
                targets: [{ format: 'r32float' }],
            },
            primitive: { topology: 'triangle-list' },
        });

        // Fluid render pipeline
        this.fluidPipeline = device.createRenderPipeline({
            label: 'fluid pipeline',
            layout: 'auto',
            vertex: {
                module: fluidModule,
                constants: screenConstants,
            },
            fragment: {
                module: fluidModule,
                constants: screenConstants,
                targets: [{ format: presentationFormat }],
            },
            primitive: { topology: 'triangle-list' },
        });

        // Glass pipeline
        this.glassPipeline = device.createRenderPipeline({
            label: 'glass pipeline',
            layout: 'auto',
            vertex: { module: glassModule },
            fragment: {
                module: glassModule,
                targets: [{
                    format: presentationFormat,
                    blend: {
                        color: { operation: 'add', srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
                        alpha: { operation: 'add', srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
                    },
                }],
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'none',
            },
            depthStencil: {
                depthWriteEnabled: false,
                depthCompare: 'less',
                format: 'depth32float',
            },
        });

        // === TEXTURES ===

        const depthMapTexture = device.createTexture({
            label: 'depth map texture',
            size: [canvas.width, canvas.height, 1],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'r32float',
        });

        const tmpDepthMapTexture = device.createTexture({
            label: 'tmp depth map texture',
            size: [canvas.width, canvas.height, 1],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'r32float',
        });

        const colorMapTexture = device.createTexture({
            label: 'color map texture',
            size: [canvas.width, canvas.height, 1],
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
            format: 'rgba8unorm',
        });

        const depthTestTexture = device.createTexture({
            size: [canvas.width, canvas.height, 1],
            format: 'depth32float',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.depthMapTextureView = depthMapTexture.createView();
        this.tmpDepthMapTextureView = tmpDepthMapTexture.createView();
        this.colorMapTextureView = colorMapTexture.createView();
        this.depthTestTextureView = depthTestTexture.createView();

        // === BUFFERS ===

        this.glassUniformBuffer = device.createBuffer({
            label: 'glass uniforms buffer',
            size: 8, // glass_radius, glass_height
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const glassUniforms = new Float32Array([GLASS_RADIUS, GLASS_HEIGHT]);
        device.queue.writeBuffer(this.glassUniformBuffer, 0, glassUniforms);

        // Filter direction buffers
        this.filterXUniformBuffer = device.createBuffer({
            label: 'filter X uniform buffer',
            size: 8,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.filterYUniformBuffer = device.createBuffer({
            label: 'filter Y uniform buffer',
            size: 8,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(this.filterXUniformBuffer, 0, new Float32Array([1.0, 0.0]));
        device.queue.writeBuffer(this.filterYUniformBuffer, 0, new Float32Array([0.0, 1.0]));

        // === BIND GROUPS ===

        this.depthMapBindGroup = device.createBindGroup({
            layout: this.depthMapPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: posvelBuffer } },
                { binding: 1, resource: { buffer: renderUniformBuffer } },
            ],
        });

        this.colorMapBindGroup = device.createBindGroup({
            layout: this.colorMapPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: posvelBuffer } },
                { binding: 1, resource: { buffer: renderUniformBuffer } },
            ],
        });

        this.depthFilterBindGroups = [
            device.createBindGroup({
                layout: this.depthFilterPipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.depthMapTextureView },
                    { binding: 1, resource: { buffer: this.filterXUniformBuffer } },
                ],
            }),
            device.createBindGroup({
                layout: this.depthFilterPipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.tmpDepthMapTextureView },
                    { binding: 1, resource: { buffer: this.filterYUniformBuffer } },
                ],
            }),
        ];

        this.fluidBindGroup = device.createBindGroup({
            layout: this.fluidPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: this.depthMapTextureView },
                { binding: 2, resource: { buffer: renderUniformBuffer } },
                { binding: 3, resource: this.colorMapTextureView },
            ],
        });

        this.glassBindGroup = device.createBindGroup({
            layout: this.glassPipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: renderUniformBuffer } },
                { binding: 1, resource: { buffer: this.glassUniformBuffer } },
            ],
        });
    }

    execute(
        context: GPUCanvasContext,
        commandEncoder: GPUCommandEncoder,
        numParticles: number
    ) {
        // 1. Render depth map
        const depthMapPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: this.depthMapTextureView,
                clearValue: { r: 10000.0, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
            depthStencilAttachment: {
                view: this.depthTestTextureView,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        };

        const depthMapPass = commandEncoder.beginRenderPass(depthMapPassDescriptor);
        depthMapPass.setBindGroup(0, this.depthMapBindGroup);
        depthMapPass.setPipeline(this.depthMapPipeline);
        depthMapPass.draw(6, numParticles);
        depthMapPass.end();

        // 2. Render color map
        const colorMapPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: this.colorMapTextureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
            depthStencilAttachment: {
                view: this.depthTestTextureView,
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        };

        const colorMapPass = commandEncoder.beginRenderPass(colorMapPassDescriptor);
        colorMapPass.setBindGroup(0, this.colorMapBindGroup);
        colorMapPass.setPipeline(this.colorMapPipeline);
        colorMapPass.draw(6, numParticles);
        colorMapPass.end();

        // 3. Bilateral filter passes (smooth depth)
        for (let iter = 0; iter < 3; iter++) {
            // X pass
            const filterXPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: this.tmpDepthMapTextureView,
                    clearValue: { r: 10000.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            };
            const filterXPass = commandEncoder.beginRenderPass(filterXPassDescriptor);
            filterXPass.setBindGroup(0, this.depthFilterBindGroups[0]);
            filterXPass.setPipeline(this.depthFilterPipeline);
            filterXPass.draw(6);
            filterXPass.end();

            // Y pass
            const filterYPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: this.depthMapTextureView,
                    clearValue: { r: 10000.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            };
            const filterYPass = commandEncoder.beginRenderPass(filterYPassDescriptor);
            filterYPass.setBindGroup(0, this.depthFilterBindGroups[1]);
            filterYPass.setPipeline(this.depthFilterPipeline);
            filterYPass.draw(6);
            filterYPass.end();
        }

        // 4. Final fluid rendering
        const fluidPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        };

        const fluidPass = commandEncoder.beginRenderPass(fluidPassDescriptor);
        fluidPass.setBindGroup(0, this.fluidBindGroup);
        fluidPass.setPipeline(this.fluidPipeline);
        fluidPass.draw(6);
        fluidPass.end();

        // 5. Glass overlay
        const glassPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: 'load',
                storeOp: 'store',
            }],
            depthStencilAttachment: {
                view: this.depthTestTextureView,
                depthLoadOp: 'load',
                depthStoreOp: 'store',
            },
        };

        const glassPass = commandEncoder.beginRenderPass(glassPassDescriptor);
        glassPass.setBindGroup(0, this.glassBindGroup);
        glassPass.setPipeline(this.glassPipeline);
        glassPass.draw(6 * 64); // 64 segments * 6 vertices per quad
        glassPass.end();
    }
}
