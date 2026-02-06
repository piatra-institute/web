// Apply pressure force from density grid

struct Particle {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

struct PressureUniforms {
    params0: vec4f, // grid_size, num_particles, glass_radius, glass_height
    params1: vec4f, // dt, pressure_strength, rest_density, padding
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> density: array<atomic<u32>>;
@group(0) @binding(2) var<uniform> uniforms: PressureUniforms;

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let idx = id.x;
    let num_particles = u32(uniforms.params0.y);
    if (idx >= num_particles) {
        return;
    }

    let grid_size = u32(uniforms.params0.x);
    let layer = grid_size * grid_size;
    let glass_radius = uniforms.params0.z;
    let glass_height = uniforms.params0.w;
    let dt = uniforms.params1.x;
    let pressure_strength = uniforms.params1.y;
    let rest_density = uniforms.params1.z;

    var p = particles[idx];

    let gx = clamp(u32((p.position.x / glass_radius * 0.5 + 0.5) * f32(grid_size)), 1u, grid_size - 2u);
    let gy = clamp(u32((p.position.y / glass_height + 0.5) * f32(grid_size)), 1u, grid_size - 2u);
    let gz = clamp(u32((p.position.z / glass_radius * 0.5 + 0.5) * f32(grid_size)), 1u, grid_size - 2u);

    let idx_center = gx + gy * grid_size + gz * layer;
    let idx_l = (gx - 1u) + gy * grid_size + gz * layer;
    let idx_r = (gx + 1u) + gy * grid_size + gz * layer;
    let idx_d = gx + (gy - 1u) * grid_size + gz * layer;
    let idx_u = gx + (gy + 1u) * grid_size + gz * layer;
    let idx_b = gx + gy * grid_size + (gz - 1u) * layer;
    let idx_f = gx + gy * grid_size + (gz + 1u) * layer;

    let d_center = f32(atomicLoad(&density[idx_center]));
    let d_l = f32(atomicLoad(&density[idx_l]));
    let d_r = f32(atomicLoad(&density[idx_r]));
    let d_d = f32(atomicLoad(&density[idx_d]));
    let d_u = f32(atomicLoad(&density[idx_u]));
    let d_b = f32(atomicLoad(&density[idx_b]));
    let d_f = f32(atomicLoad(&density[idx_f]));

    let grad = vec3f(d_r - d_l, d_u - d_d, d_f - d_b);
    let density_delta = max(0.0, d_center - rest_density);
    let pressure = pressure_strength * density_delta;

    let force = -grad * pressure * 0.02;
    p.velocity += force * dt;

    particles[idx] = p;
}
