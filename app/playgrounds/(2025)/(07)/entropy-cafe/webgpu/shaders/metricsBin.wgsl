// Bin particles into grid counts + accumulate kinetic energy

struct Particle {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

struct CellCount {
    coffee: atomic<u32>,
    cream: atomic<u32>,
}

struct Metrics {
    entropy: atomic<u32>,
    mixedness: atomic<u32>,
    complexity: atomic<u32>,
    kinetic: atomic<u32>,
    count: atomic<u32>,
    _pad: atomic<u32>,
}

struct MetricsUniforms {
    grid_size: f32,
    num_particles: f32,
    glass_radius: f32,
    glass_height: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> counts: array<CellCount>;
@group(0) @binding(2) var<storage, read_write> metrics: Metrics;
@group(0) @binding(3) var<uniform> uniforms: MetricsUniforms;

const METRIC_SCALE: f32 = 10000.0;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let idx = id.x;
    let num_particles = u32(uniforms.num_particles);
    if (idx >= num_particles) {
        return;
    }

    let p = particles[idx];
    let grid_size = u32(uniforms.grid_size);

    let gx = clamp(u32((p.position.x / uniforms.glass_radius * 0.5 + 0.5) * f32(grid_size)), 0u, grid_size - 1u);
    let gy = clamp(u32((p.position.y / uniforms.glass_height + 0.5) * f32(grid_size)), 0u, grid_size - 1u);
    let gz = clamp(u32((p.position.z / uniforms.glass_radius * 0.5 + 0.5) * f32(grid_size)), 0u, grid_size - 1u);

    let layer = grid_size * grid_size;
    let cell_index = gx + gy * grid_size + gz * layer;

    if (p.particle_type > 0.5) {
        atomicAdd(&counts[cell_index].cream, 1u);
    } else {
        atomicAdd(&counts[cell_index].coffee, 1u);
    }

    let vel2 = dot(p.velocity, p.velocity);
    atomicAdd(&metrics.kinetic, u32(vel2 * METRIC_SCALE));
    atomicAdd(&metrics.count, 1u);
}
