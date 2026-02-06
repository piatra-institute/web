// Bin particles into density grid

struct Particle {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

struct DensityUniforms {
    grid_size: f32,
    num_particles: f32,
    glass_radius: f32,
    glass_height: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> density: array<atomic<u32>>;
@group(0) @binding(2) var<uniform> uniforms: DensityUniforms;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let idx = id.x;
    let num_particles = u32(uniforms.num_particles);
    if (idx >= num_particles) {
        return;
    }

    let grid_size = u32(uniforms.grid_size);
    let p = particles[idx];

    let gx = clamp(u32((p.position.x / uniforms.glass_radius * 0.5 + 0.5) * f32(grid_size)), 0u, grid_size - 1u);
    let gy = clamp(u32((p.position.y / uniforms.glass_height + 0.5) * f32(grid_size)), 0u, grid_size - 1u);
    let gz = clamp(u32((p.position.z / uniforms.glass_radius * 0.5 + 0.5) * f32(grid_size)), 0u, grid_size - 1u);

    let layer = grid_size * grid_size;
    let cell_index = gx + gy * grid_size + gz * layer;

    atomicAdd(&density[cell_index], 1u);
}
