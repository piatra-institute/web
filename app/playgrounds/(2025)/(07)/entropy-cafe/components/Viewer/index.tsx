'use client';

import {
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';

export interface ViewerRef {
    reset: () => void;
    stir: () => void;
}

interface ViewerProps {
    isStirring: boolean;
    onEntropyChange?: (entropy: number, mixedness: number) => void;
}

// Simulation shader - gentle fluid with wavy motion
const simulateShader = /* wgsl */`
struct Particle {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

struct SimUniforms {
    glass_radius: f32,
    glass_height: f32,
    dt: f32,
    stir_strength: f32,
    stir_active: f32,
    gravity: f32,
    time: f32,
    num_particles: u32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: SimUniforms;

// Hash function for randomness
fn hash(n: f32) -> f32 {
    return fract(sin(n) * 43758.5453123);
}

fn hash3(p: vec3f) -> f32 {
    return fract(sin(dot(p, vec3f(12.9898, 78.233, 45.164))) * 43758.5453);
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3u) {
    let idx = global_id.x;
    if (idx >= uniforms.num_particles) {
        return;
    }

    var p = particles[idx];
    let dt = uniforms.dt * 0.08; // Very slow simulation
    let t = uniforms.time * 0.3; // Slow time for gentle waves

    // Particle-specific phase for variation
    let phase = hash(f32(idx)) * 6.283;
    let phase2 = hash(f32(idx) * 2.0) * 6.283;
    let phase3 = hash(f32(idx) * 3.0) * 6.283;

    // Almost imperceptible ambient motion - very calm
    let wave_freq = 0.05;
    let wave_amp = 0.0003;
    let wave_x = sin(t * wave_freq + phase) * wave_amp;
    let wave_z = cos(t * wave_freq * 0.8 + phase2) * wave_amp;

    p.velocity.x += wave_x;
    p.velocity.z += wave_z;

    // Very subtle buoyancy - cream slightly up, coffee slightly down
    let buoyancy = select(-0.0008, 0.001, p.particle_type > 0.5);
    p.velocity.y += buoyancy;

    // Gentle return-to-rest force (keeps fluid from drifting)
    let rest_y = select(-0.25, 0.35, p.particle_type > 0.5) * uniforms.glass_height * 0.25;
    p.velocity.y += (rest_y - p.position.y) * 0.0003;

    // Stirring - vortex with differential rotation to mix fluids
    if (uniforms.stir_active > 0.5) {
        let r = length(vec2f(p.position.x, p.position.z));
        let angle = atan2(p.position.z, p.position.x);
        let tangent = vec2f(-sin(angle), cos(angle));

        // Center spins much faster than edges - creates actual mixing
        let r_norm = r / uniforms.glass_radius;
        let vortex_speed = 0.04 * (1.0 - r_norm * r_norm); // Quadratic falloff

        p.velocity.x += tangent.x * vortex_speed;
        p.velocity.z += tangent.y * vortex_speed;

        // Add slight inward pull at top, outward at bottom (secondary flow)
        let radial = normalize(vec2f(p.position.x, p.position.z));
        let height_norm = p.position.y / (uniforms.glass_height * 0.5);
        let secondary = -height_norm * 0.003 * r_norm;
        p.velocity.x += radial.x * secondary;
        p.velocity.z += radial.y * secondary;
    }

    // Very strong damping for ultra-smooth motion
    p.velocity *= 0.9;

    // Clamp velocity for stability
    let max_vel = 0.15;
    let vel_len = length(p.velocity);
    if (vel_len > max_vel) {
        p.velocity *= max_vel / vel_len;
    }

    p.position += p.velocity * dt;

    // Soft cylindrical boundary
    let r = length(vec2f(p.position.x, p.position.z));
    let max_r = uniforms.glass_radius - 0.12;
    if (r > max_r) {
        let norm = normalize(vec2f(p.position.x, p.position.z));
        let penetration = r - max_r;
        p.position.x -= norm.x * penetration;
        p.position.z -= norm.y * penetration;
        // Soft bounce
        let normal = vec3f(norm.x, 0.0, norm.y);
        let vn = dot(p.velocity, normal);
        if (vn > 0.0) {
            p.velocity -= normal * vn * 1.5;
        }
    }

    // Soft vertical boundaries
    let min_y = -uniforms.glass_height * 0.5 + 0.12;
    let max_y = uniforms.glass_height * 0.5 - 0.12;
    if (p.position.y < min_y) {
        p.position.y = min_y;
        p.velocity.y = abs(p.velocity.y) * 0.2;
    }
    if (p.position.y > max_y) {
        p.position.y = max_y;
        p.velocity.y = -abs(p.velocity.y) * 0.2;
    }

    particles[idx] = p;
}
`;

// Depth map shader - renders particles as spheres to depth buffer
const depthMapShader = /* wgsl */`
struct Particle {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

struct Uniforms {
    view: mat4x4f,
    proj: mat4x4f,
    inv_view: mat4x4f,
    inv_proj: mat4x4f,
    screen_size: vec2f,
    sphere_radius: f32,
    time: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(1) view_center: vec3f,
    @location(2) particle_type: f32,
}

const quad = array<vec2f, 6>(
    vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),
    vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1),
);

@vertex
fn vs_main(@builtin(vertex_index) vid: u32, @builtin(instance_index) iid: u32) -> VertexOutput {
    let p = particles[iid];
    let q = quad[vid];
    let view_pos = uniforms.view * vec4f(p.position, 1.0);
    let offset = vec3f(q * uniforms.sphere_radius, 0.0);
    let clip = uniforms.proj * vec4f(view_pos.xyz + offset, 1.0);

    var out: VertexOutput;
    out.position = clip;
    out.uv = q;
    out.view_center = view_pos.xyz;
    out.particle_type = p.particle_type;
    return out;
}

struct FragOutput {
    @location(0) depth: f32,
    @location(1) color: vec4f,
}

@fragment
fn fs_main(in: VertexOutput) -> FragOutput {
    let dist_sq = dot(in.uv, in.uv);
    if (dist_sq > 1.0) { discard; }

    let sphere_z = sqrt(1.0 - dist_sq) * uniforms.sphere_radius;
    let depth = -(in.view_center.z + sphere_z);

    var out: FragOutput;
    out.depth = depth;
    out.color = vec4f(in.particle_type, 0.0, 0.0, 1.0);
    return out;
}
`;

// Bilateral filter shader
const bilateralShader = /* wgsl */`
struct Uniforms {
    blur_dir: vec2f,
    texel_size: vec2f,
}

@group(0) @binding(0) var depth_tex: texture_2d<f32>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
}

const quad = array<vec2f, 6>(
    vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),
    vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1),
);

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VertexOutput {
    let pos = quad[vid];
    var out: VertexOutput;
    out.position = vec4f(pos, 0.0, 1.0);
    out.uv = pos * 0.5 + 0.5;
    out.uv.y = 1.0 - out.uv.y;
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) f32 {
    let iuv = vec2u(in.uv * vec2f(textureDimensions(depth_tex)));
    let center = textureLoad(depth_tex, iuv, 0).r;
    if (center <= 0.0 || center >= 1000.0) { return center; }

    var sum = 0.0;
    var wsum = 0.0;
    let filter_size = 20;

    for (var i = -filter_size; i <= filter_size; i++) {
        let offset = vec2i(vec2f(f32(i)) * uniforms.blur_dir);
        let sample_uv = vec2i(iuv) + offset;
        if (sample_uv.x < 0 || sample_uv.y < 0) { continue; }
        let s = textureLoad(depth_tex, vec2u(sample_uv), 0).r;
        if (s <= 0.0 || s >= 1000.0) { continue; }

        let spatial = exp(-f32(i * i) / 250.0);
        let range_w = exp(-(s - center) * (s - center) / 0.03);
        let w = spatial * range_w;
        sum += s * w;
        wsum += w;
    }

    return select(center, sum / wsum, wsum > 0.0);
}
`;

// Final composite shader
const compositeShader = /* wgsl */`
struct Uniforms {
    view: mat4x4f,
    proj: mat4x4f,
    inv_view: mat4x4f,
    inv_proj: mat4x4f,
    screen_size: vec2f,
    sphere_radius: f32,
    time: f32,
}

@group(0) @binding(0) var depth_tex: texture_2d<f32>;
@group(0) @binding(1) var color_tex: texture_2d<f32>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
}

const quad = array<vec2f, 6>(
    vec2f(-1, -1), vec2f(1, -1), vec2f(-1, 1),
    vec2f(-1, 1), vec2f(1, -1), vec2f(1, 1),
);

const COFFEE = vec3f(0.18, 0.10, 0.05);
const CREAM = vec3f(0.96, 0.94, 0.88);

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VertexOutput {
    let pos = quad[vid];
    var out: VertexOutput;
    out.position = vec4f(pos, 0.0, 1.0);
    out.uv = pos * 0.5 + 0.5;
    out.uv.y = 1.0 - out.uv.y;
    return out;
}

fn getViewPos(uv: vec2f, depth: f32) -> vec3f {
    var ndc = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0);
    ndc.z = -uniforms.proj[2].z + uniforms.proj[3].z / depth;
    let eye = uniforms.inv_proj * ndc;
    return eye.xyz / eye.w;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    let dim = vec2f(textureDimensions(depth_tex));
    let iuv = vec2u(in.uv * dim);
    let depth = textureLoad(depth_tex, iuv, 0).r;

    if (depth <= 0.0 || depth >= 1000.0) {
        return vec4f(0.0, 0.0, 0.0, 1.0);
    }

    let cream_amt = textureLoad(color_tex, iuv, 0).r;
    let base_color = mix(COFFEE, CREAM, cream_amt);

    // Calculate normal from depth
    let view_pos = getViewPos(in.uv, depth);
    let texel = 1.0 / dim;

    let d_r = textureLoad(depth_tex, vec2u(in.uv * dim + vec2f(1, 0)), 0).r;
    let d_u = textureLoad(depth_tex, vec2u(in.uv * dim + vec2f(0, 1)), 0).r;
    let d_l = textureLoad(depth_tex, vec2u(in.uv * dim - vec2f(1, 0)), 0).r;
    let d_d = textureLoad(depth_tex, vec2u(in.uv * dim - vec2f(0, 1)), 0).r;

    var ddx = getViewPos(in.uv + vec2f(texel.x, 0), select(depth, d_r, d_r > 0)) - view_pos;
    var ddy = getViewPos(in.uv + vec2f(0, texel.y), select(depth, d_u, d_u > 0)) - view_pos;
    let ddx2 = view_pos - getViewPos(in.uv - vec2f(texel.x, 0), select(depth, d_l, d_l > 0));
    let ddy2 = view_pos - getViewPos(in.uv - vec2f(0, texel.y), select(depth, d_d, d_d > 0));

    if (abs(ddx.z) > abs(ddx2.z)) { ddx = ddx2; }
    if (abs(ddy.z) > abs(ddy2.z)) { ddy = ddy2; }

    let normal = normalize(cross(ddy, ddx));

    // Soft lighting - reduced specular for smoother look
    let light_dir = normalize(vec3f(0.3, 1.0, 0.2));
    let view_dir = normalize(-view_pos);
    let half_vec = normalize(light_dir + view_dir);

    let diffuse = max(dot(normal, light_dir), 0.0) * 0.4 + 0.6;
    let spec_power = mix(60.0, 120.0, cream_amt);
    let specular = pow(max(dot(normal, half_vec), 0.0), spec_power) * mix(0.1, 0.2, cream_amt);

    // Subtle fresnel
    let fresnel = pow(1.0 - max(dot(normal, view_dir), 0.0), 5.0) * 0.15;

    var color = base_color * diffuse + vec3f(specular) + vec3f(fresnel);

    return vec4f(color, 1.0);
}
`;

// Glass shader
const glassShader = /* wgsl */`
struct Uniforms {
    view: mat4x4f,
    proj: mat4x4f,
    inv_view: mat4x4f,
    inv_proj: mat4x4f,
    screen_size: vec2f,
    sphere_radius: f32,
    time: f32,
}

struct GlassUniforms {
    radius: f32,
    height: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<uniform> glass: GlassUniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) world_pos: vec3f,
    @location(1) normal: vec3f,
}

const PI = 3.14159265359;
const SEGMENTS = 64u;

@vertex
fn vs_main(@builtin(vertex_index) vid: u32) -> VertexOutput {
    let seg = vid / 6u;
    let local = vid % 6u;

    let a0 = f32(seg) / f32(SEGMENTS) * 2.0 * PI;
    let a1 = f32(seg + 1u) / f32(SEGMENTS) * 2.0 * PI;
    let r = glass.radius;
    let h = glass.height * 0.5;

    let p0 = vec3f(cos(a0) * r, -h, sin(a0) * r);
    let p1 = vec3f(cos(a1) * r, -h, sin(a1) * r);
    let p2 = vec3f(cos(a0) * r, h, sin(a0) * r);
    let p3 = vec3f(cos(a1) * r, h, sin(a1) * r);

    var pos: vec3f;
    switch local {
        case 0u: { pos = p0; }
        case 1u: { pos = p1; }
        case 2u: { pos = p2; }
        case 3u: { pos = p2; }
        case 4u: { pos = p1; }
        default: { pos = p3; }
    }

    var out: VertexOutput;
    out.position = uniforms.proj * uniforms.view * vec4f(pos, 1.0);
    out.world_pos = pos;
    out.normal = normalize(vec3f(pos.x, 0.0, pos.z));
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    let cam_pos = uniforms.inv_view[3].xyz;
    let view_dir = normalize(cam_pos - in.world_pos);
    let fresnel = pow(1.0 - max(dot(in.normal, view_dir), 0.0), 3.0);
    let alpha = 0.06 + fresnel * 0.12;
    return vec4f(0.9, 0.95, 1.0, alpha);
}
`;

const GLASS_RADIUS = 1.5;
const GLASS_HEIGHT = 4.0;
const PARTICLE_RADIUS = 0.08;
const NUM_COFFEE = 40000;
const NUM_CREAM = 25000;
const PARTICLE_STRUCT_SIZE = 32; // 8 floats

const Viewer = forwardRef<ViewerRef, ViewerProps>(({
    isStirring,
    onEntropyChange,
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);

    const stateRef = useRef({
        device: null as GPUDevice | null,
        context: null as GPUCanvasContext | null,
        animFrame: null as number | null,
        isStirring: isStirring,
        time: 0,
        numParticles: 0,
        // Buffers
        particleBuffer: null as GPUBuffer | null,
        uniformBuffer: null as GPUBuffer | null,
        simUniformBuffer: null as GPUBuffer | null,
        glassUniformBuffer: null as GPUBuffer | null,
        filterUniformBufferX: null as GPUBuffer | null,
        filterUniformBufferY: null as GPUBuffer | null,
        // Pipelines
        simulatePipeline: null as GPUComputePipeline | null,
        depthPipeline: null as GPURenderPipeline | null,
        filterPipeline: null as GPURenderPipeline | null,
        compositePipeline: null as GPURenderPipeline | null,
        glassPipeline: null as GPURenderPipeline | null,
        // Bind groups
        simulateBindGroup: null as GPUBindGroup | null,
        depthBindGroup: null as GPUBindGroup | null,
        filterBindGroupX: null as GPUBindGroup | null,
        filterBindGroupY: null as GPUBindGroup | null,
        compositeBindGroup: null as GPUBindGroup | null,
        glassBindGroup: null as GPUBindGroup | null,
        // Textures
        depthTexture: null as GPUTexture | null,
        depthTextureView: null as GPUTextureView | null,
        tmpDepthTexture: null as GPUTexture | null,
        tmpDepthTextureView: null as GPUTextureView | null,
        colorTexture: null as GPUTexture | null,
        colorTextureView: null as GPUTextureView | null,
        depthStencilTexture: null as GPUTexture | null,
        depthStencilView: null as GPUTextureView | null,
        // Camera
        camera: { distance: 8, theta: Math.PI / 4, phi: Math.PI / 6 },
    });

    useEffect(() => {
        stateRef.current.isStirring = isStirring;
    }, [isStirring]);

    useImperativeHandle(ref, () => ({
        reset: () => { initParticles(); },
        stir: () => {
            stateRef.current.isStirring = true;
            setTimeout(() => { stateRef.current.isStirring = false; }, 800);
        },
    }), []);

    const initParticles = () => {
        const state = stateRef.current;
        if (!state.device || !state.particleBuffer) return;

        const total = NUM_COFFEE + NUM_CREAM;
        const data = new Float32Array(total * 8);
        let idx = 0;

        // Coffee fills bottom portion of glass (stable layer)
        for (let i = 0; i < NUM_COFFEE; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * (GLASS_RADIUS - 0.25);
            // Coffee from bottom to just below middle
            const y = -GLASS_HEIGHT * 0.35 + Math.random() * GLASS_HEIGHT * 0.5;
            const off = idx * 8;
            data[off] = Math.cos(angle) * r;
            data[off + 1] = y;
            data[off + 2] = Math.sin(angle) * r;
            data[off + 3] = 0; // coffee
            idx++;
        }

        // Cream floats on top (stable layer)
        for (let i = 0; i < NUM_CREAM; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * (GLASS_RADIUS - 0.25);
            // Cream from middle to top
            const y = GLASS_HEIGHT * 0.05 + Math.random() * GLASS_HEIGHT * 0.35;
            const off = idx * 8;
            data[off] = Math.cos(angle) * r;
            data[off + 1] = y;
            data[off + 2] = Math.sin(angle) * r;
            data[off + 3] = 1; // cream
            idx++;
        }

        state.numParticles = total;
        state.time = 0;
        state.device.queue.writeBuffer(state.particleBuffer, 0, data);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let cleanup: (() => void) | undefined;
        const state = stateRef.current;

        const init = async () => {
            try {
                if (!navigator.gpu) {
                    setError('WebGPU not supported');
                    return;
                }

                const adapter = await navigator.gpu.requestAdapter();
                if (!adapter) {
                    setError('No WebGPU adapter');
                    return;
                }

                const device = await adapter.requestDevice();
                state.device = device;

                const context = canvas.getContext('webgpu');
                if (!context) {
                    setError('No WebGPU context');
                    return;
                }
                state.context = context;

                const format = navigator.gpu.getPreferredCanvasFormat();
                context.configure({ device, format, alphaMode: 'premultiplied' });

                const dpr = Math.min(window.devicePixelRatio, 2);
                canvas.width = canvas.clientWidth * dpr;
                canvas.height = canvas.clientHeight * dpr;

                // Create buffers
                const maxParticles = NUM_COFFEE + NUM_CREAM;
                state.particleBuffer = device.createBuffer({
                    size: PARTICLE_STRUCT_SIZE * maxParticles,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
                });

                state.uniformBuffer = device.createBuffer({
                    size: 288, // matrices (4*64=256) + screen_size (8) + sphere_radius (4) + time (4) + padding
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                });

                state.simUniformBuffer = device.createBuffer({
                    size: 32,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                });

                state.glassUniformBuffer = device.createBuffer({
                    size: 8,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                });
                device.queue.writeBuffer(state.glassUniformBuffer, 0, new Float32Array([GLASS_RADIUS, GLASS_HEIGHT]));

                state.filterUniformBufferX = device.createBuffer({
                    size: 16,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                });
                state.filterUniformBufferY = device.createBuffer({
                    size: 16,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                });

                // Create textures
                state.depthTexture = device.createTexture({
                    size: [canvas.width, canvas.height],
                    format: 'r32float',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                });
                state.depthTextureView = state.depthTexture.createView();

                state.tmpDepthTexture = device.createTexture({
                    size: [canvas.width, canvas.height],
                    format: 'r32float',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                });
                state.tmpDepthTextureView = state.tmpDepthTexture.createView();

                state.colorTexture = device.createTexture({
                    size: [canvas.width, canvas.height],
                    format: 'rgba8unorm',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                });
                state.colorTextureView = state.colorTexture.createView();

                state.depthStencilTexture = device.createTexture({
                    size: [canvas.width, canvas.height],
                    format: 'depth24plus',
                    usage: GPUTextureUsage.RENDER_ATTACHMENT,
                });
                state.depthStencilView = state.depthStencilTexture.createView();

                // Create pipelines
                const simModule = device.createShaderModule({ code: simulateShader });
                state.simulatePipeline = device.createComputePipeline({
                    layout: 'auto',
                    compute: { module: simModule, entryPoint: 'main' },
                });

                const depthModule = device.createShaderModule({ code: depthMapShader });
                state.depthPipeline = device.createRenderPipeline({
                    layout: 'auto',
                    vertex: { module: depthModule, entryPoint: 'vs_main' },
                    fragment: {
                        module: depthModule,
                        entryPoint: 'fs_main',
                        targets: [
                            { format: 'r32float' },
                            { format: 'rgba8unorm' },
                        ],
                    },
                    primitive: { topology: 'triangle-list' },
                    depthStencil: {
                        format: 'depth24plus',
                        depthWriteEnabled: true,
                        depthCompare: 'less',
                    },
                });

                const filterModule = device.createShaderModule({ code: bilateralShader });
                state.filterPipeline = device.createRenderPipeline({
                    layout: 'auto',
                    vertex: { module: filterModule, entryPoint: 'vs_main' },
                    fragment: {
                        module: filterModule,
                        entryPoint: 'fs_main',
                        targets: [{ format: 'r32float' }],
                    },
                    primitive: { topology: 'triangle-list' },
                });

                const compositeModule = device.createShaderModule({ code: compositeShader });
                state.compositePipeline = device.createRenderPipeline({
                    layout: 'auto',
                    vertex: { module: compositeModule, entryPoint: 'vs_main' },
                    fragment: {
                        module: compositeModule,
                        entryPoint: 'fs_main',
                        targets: [{ format }],
                    },
                    primitive: { topology: 'triangle-list' },
                });

                const glassModule = device.createShaderModule({ code: glassShader });
                state.glassPipeline = device.createRenderPipeline({
                    layout: 'auto',
                    vertex: { module: glassModule, entryPoint: 'vs_main' },
                    fragment: {
                        module: glassModule,
                        entryPoint: 'fs_main',
                        targets: [{
                            format,
                            blend: {
                                color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
                                alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
                            },
                        }],
                    },
                    primitive: { topology: 'triangle-list', cullMode: 'none' },
                });

                // Create bind groups
                state.simulateBindGroup = device.createBindGroup({
                    layout: state.simulatePipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: { buffer: state.particleBuffer } },
                        { binding: 1, resource: { buffer: state.simUniformBuffer } },
                    ],
                });

                state.depthBindGroup = device.createBindGroup({
                    layout: state.depthPipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: { buffer: state.particleBuffer } },
                        { binding: 1, resource: { buffer: state.uniformBuffer } },
                    ],
                });

                state.filterBindGroupX = device.createBindGroup({
                    layout: state.filterPipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: state.depthTextureView },
                        { binding: 1, resource: { buffer: state.filterUniformBufferX } },
                    ],
                });

                state.filterBindGroupY = device.createBindGroup({
                    layout: state.filterPipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: state.tmpDepthTextureView },
                        { binding: 1, resource: { buffer: state.filterUniformBufferY } },
                    ],
                });

                state.compositeBindGroup = device.createBindGroup({
                    layout: state.compositePipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: state.depthTextureView },
                        { binding: 1, resource: state.colorTextureView },
                        { binding: 2, resource: { buffer: state.uniformBuffer } },
                    ],
                });

                state.glassBindGroup = device.createBindGroup({
                    layout: state.glassPipeline.getBindGroupLayout(0),
                    entries: [
                        { binding: 0, resource: { buffer: state.uniformBuffer } },
                        { binding: 1, resource: { buffer: state.glassUniformBuffer } },
                    ],
                });

                // Initialize particles
                initParticles();

                // Animation
                let lastTime = performance.now();
                let frameCount = 0;

                const frame = () => {
                    const now = performance.now();
                    const dt = Math.min((now - lastTime) / 1000, 0.05);
                    lastTime = now;
                    state.time += dt;

                    // Update camera
                    const cam = state.camera;
                    const cx = cam.distance * Math.sin(cam.theta) * Math.cos(cam.phi);
                    const cy = cam.distance * Math.sin(cam.phi);
                    const cz = cam.distance * Math.cos(cam.theta) * Math.cos(cam.phi);

                    const eye = [cx, cy, cz];
                    const target = [0, 0, 0];
                    const up = [0, 1, 0];

                    // View matrix (lookAt)
                    const zAxis = normalize(sub(eye, target));
                    const xAxis = normalize(cross(up, zAxis));
                    const yAxis = cross(zAxis, xAxis);

                    const view = new Float32Array([
                        xAxis[0], yAxis[0], zAxis[0], 0,
                        xAxis[1], yAxis[1], zAxis[1], 0,
                        xAxis[2], yAxis[2], zAxis[2], 0,
                        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
                    ]);

                    // Projection matrix
                    const aspect = canvas.width / canvas.height;
                    const fov = Math.PI / 4;
                    const near = 0.1, far = 100;
                    const f = 1 / Math.tan(fov / 2);
                    const proj = new Float32Array([
                        f / aspect, 0, 0, 0,
                        0, f, 0, 0,
                        0, 0, (far + near) / (near - far), -1,
                        0, 0, (2 * far * near) / (near - far), 0,
                    ]);

                    // Inverse matrices
                    const invView = invertMat4(view);
                    const invProj = invertMat4(proj);

                    // Write uniforms (272 bytes = 68 floats)
                    const uniformData = new Float32Array(72); // 288 bytes for alignment
                    uniformData.set(view, 0);      // 0-15
                    uniformData.set(proj, 16);     // 16-31
                    uniformData.set(invView, 32);  // 32-47
                    uniformData.set(invProj, 48);  // 48-63
                    uniformData[64] = canvas.width;
                    uniformData[65] = canvas.height;
                    uniformData[66] = PARTICLE_RADIUS;
                    uniformData[67] = state.time;
                    device.queue.writeBuffer(state.uniformBuffer!, 0, uniformData);

                    // Sim uniforms
                    const simData = new ArrayBuffer(32);
                    const simView = new Float32Array(simData);
                    const simUint = new Uint32Array(simData);
                    simView[0] = GLASS_RADIUS;
                    simView[1] = GLASS_HEIGHT;
                    simView[2] = dt * 60;
                    simView[3] = 6.0; // stir strength
                    simView[4] = state.isStirring ? 1 : 0;
                    simView[5] = -0.5; // reduced gravity for slower settling
                    simView[6] = state.time;
                    simUint[7] = state.numParticles;
                    device.queue.writeBuffer(state.simUniformBuffer!, 0, simData);

                    // Filter uniforms
                    const texelX = 1.0 / canvas.width;
                    const texelY = 1.0 / canvas.height;
                    device.queue.writeBuffer(state.filterUniformBufferX!, 0, new Float32Array([1, 0, texelX, texelY]));
                    device.queue.writeBuffer(state.filterUniformBufferY!, 0, new Float32Array([0, 1, texelX, texelY]));

                    const encoder = device.createCommandEncoder();

                    // Compute simulation
                    const computePass = encoder.beginComputePass();
                    computePass.setPipeline(state.simulatePipeline!);
                    computePass.setBindGroup(0, state.simulateBindGroup!);
                    computePass.dispatchWorkgroups(Math.ceil(state.numParticles / 64));
                    computePass.end();

                    // Render depth + color
                    const depthPass = encoder.beginRenderPass({
                        colorAttachments: [
                            {
                                view: state.depthTextureView!,
                                clearValue: { r: 10000, g: 0, b: 0, a: 1 },
                                loadOp: 'clear',
                                storeOp: 'store',
                            },
                            {
                                view: state.colorTextureView!,
                                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                                loadOp: 'clear',
                                storeOp: 'store',
                            },
                        ],
                        depthStencilAttachment: {
                            view: state.depthStencilView!,
                            depthClearValue: 1,
                            depthLoadOp: 'clear',
                            depthStoreOp: 'store',
                        },
                    });
                    depthPass.setPipeline(state.depthPipeline!);
                    depthPass.setBindGroup(0, state.depthBindGroup!);
                    depthPass.draw(6, state.numParticles);
                    depthPass.end();

                    // Bilateral filter for smooth surface
                    for (let i = 0; i < 5; i++) {
                        const filterPassX = encoder.beginRenderPass({
                            colorAttachments: [{
                                view: state.tmpDepthTextureView!,
                                loadOp: 'clear',
                                storeOp: 'store',
                                clearValue: { r: 10000, g: 0, b: 0, a: 1 },
                            }],
                        });
                        filterPassX.setPipeline(state.filterPipeline!);
                        filterPassX.setBindGroup(0, state.filterBindGroupX!);
                        filterPassX.draw(6);
                        filterPassX.end();

                        const filterPassY = encoder.beginRenderPass({
                            colorAttachments: [{
                                view: state.depthTextureView!,
                                loadOp: 'clear',
                                storeOp: 'store',
                                clearValue: { r: 10000, g: 0, b: 0, a: 1 },
                            }],
                        });
                        filterPassY.setPipeline(state.filterPipeline!);
                        filterPassY.setBindGroup(0, state.filterBindGroupY!);
                        filterPassY.draw(6);
                        filterPassY.end();
                    }

                    // Composite
                    const compositePass = encoder.beginRenderPass({
                        colorAttachments: [{
                            view: context.getCurrentTexture().createView(),
                            loadOp: 'clear',
                            storeOp: 'store',
                            clearValue: { r: 0, g: 0, b: 0, a: 1 },
                        }],
                    });
                    compositePass.setPipeline(state.compositePipeline!);
                    compositePass.setBindGroup(0, state.compositeBindGroup!);
                    compositePass.draw(6);

                    // Glass
                    compositePass.setPipeline(state.glassPipeline!);
                    compositePass.setBindGroup(0, state.glassBindGroup!);
                    compositePass.draw(6 * 64);
                    compositePass.end();

                    device.queue.submit([encoder.finish()]);

                    // Entropy callback
                    frameCount++;
                    if (frameCount % 30 === 0 && onEntropyChange) {
                        const e = Math.min(1, state.time * 0.02);
                        const m = Math.min(1, state.time * 0.015);
                        onEntropyChange(e, m);
                    }

                    state.animFrame = requestAnimationFrame(frame);
                };

                frame();

                // Mouse controls
                let dragging = false;
                let lastX = 0, lastY = 0;

                const onMouseDown = (e: MouseEvent) => {
                    dragging = true;
                    lastX = e.clientX;
                    lastY = e.clientY;
                };

                const onMouseMove = (e: MouseEvent) => {
                    if (!dragging) return;
                    const dx = e.clientX - lastX;
                    const dy = e.clientY - lastY;
                    lastX = e.clientX;
                    lastY = e.clientY;
                    state.camera.theta -= dx * 0.01;
                    state.camera.phi = Math.max(-1.4, Math.min(1.4, state.camera.phi + dy * 0.01));
                };

                const onMouseUp = () => { dragging = false; };

                const onWheel = (e: WheelEvent) => {
                    e.preventDefault();
                    state.camera.distance = Math.max(3, Math.min(15, state.camera.distance + e.deltaY * 0.01));
                };

                canvas.addEventListener('mousedown', onMouseDown);
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
                canvas.addEventListener('wheel', onWheel, { passive: false });

                cleanup = () => {
                    if (state.animFrame) cancelAnimationFrame(state.animFrame);
                    canvas.removeEventListener('mousedown', onMouseDown);
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                    canvas.removeEventListener('wheel', onWheel);
                    device.destroy();
                };

            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
        };

        init();
        return () => cleanup?.();
    }, [onEntropyChange]);

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center text-red-500 p-4">
                <div className="text-center">
                    <p className="font-bold mb-2">WebGPU Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return <canvas ref={canvasRef} className="w-full h-full" style={{ cursor: 'grab' }} />;
});

Viewer.displayName = 'Viewer';

export default Viewer;

// Math helpers
function sub(a: number[], b: number[]): number[] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: number[], b: number[]): number[] {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function dot(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v: number[]): number[] {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
}

function invertMat4(m: Float32Array): Float32Array {
    const out = new Float32Array(16);
    const a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3];
    const a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
    const a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11];
    const a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return out;
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}
