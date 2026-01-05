// Particle simulation compute shader for coffee/cream mixing

struct Particle {
    position: vec3f,
    particle_type: f32,  // 0 = coffee, 1 = cream
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

const PI: f32 = 3.14159265359;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3u) {
    let idx = global_id.x;
    if (idx >= uniforms.num_particles) {
        return;
    }

    var p = particles[idx];
    let dt = uniforms.dt;

    // Gravity - coffee sinks, cream floats
    let buoyancy = select(-0.5, 0.8, p.particle_type > 0.5);
    p.velocity.y += (uniforms.gravity + buoyancy) * dt;

    // Random diffusion (Brownian motion)
    let noise_scale = 0.02;
    let hash = fract(sin(f32(idx) * 12.9898 + uniforms.time * 0.1) * 43758.5453);
    let noise = vec3f(
        fract(sin(hash * 1.0) * 43758.5453) - 0.5,
        fract(sin(hash * 2.0) * 43758.5453) - 0.5,
        fract(sin(hash * 3.0) * 43758.5453) - 0.5
    ) * noise_scale;
    p.velocity += noise;

    // Stirring - vortex motion
    if (uniforms.stir_active > 0.5) {
        let pos_xz = vec2f(p.position.x, p.position.z);
        let r = length(pos_xz);
        let angle = atan2(p.position.z, p.position.x);
        let tangent = vec2f(-sin(angle), cos(angle));

        // Vortex strength varies with radius and height
        let height_factor = 1.0 - abs(p.position.y) / (uniforms.glass_height * 0.5);
        let radius_factor = r / uniforms.glass_radius;
        let vortex_strength = uniforms.stir_strength * height_factor * radius_factor;

        p.velocity.x += tangent.x * vortex_strength * dt;
        p.velocity.z += tangent.y * vortex_strength * dt;

        // Add some vertical turbulence
        p.velocity.y += (hash - 0.5) * uniforms.stir_strength * 0.3 * dt;
    }

    // Damping
    p.velocity *= 0.98;

    // Update position
    p.position += p.velocity * dt;

    // Cylindrical boundary collision
    let pos_xz = vec2f(p.position.x, p.position.z);
    let r = length(pos_xz);
    let max_r = uniforms.glass_radius - 0.05;

    if (r > max_r) {
        let norm_xz = normalize(pos_xz);
        p.position.x = norm_xz.x * max_r;
        p.position.z = norm_xz.y * max_r;

        // Reflect velocity
        let normal = vec3f(norm_xz.x, 0.0, norm_xz.y);
        let dot_vn = dot(p.velocity, normal);
        p.velocity -= 2.0 * dot_vn * normal;
        p.velocity *= 0.5;
    }

    // Top and bottom boundaries
    let min_y = -uniforms.glass_height * 0.5 + 0.05;
    let max_y = uniforms.glass_height * 0.5 - 0.05;

    if (p.position.y < min_y) {
        p.position.y = min_y;
        p.velocity.y = abs(p.velocity.y) * 0.3;
    }
    if (p.position.y > max_y) {
        p.position.y = max_y;
        p.velocity.y = -abs(p.velocity.y) * 0.3;
    }

    particles[idx] = p;
}
