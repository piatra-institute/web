// Particle simulation compute shader for coffee/cream mixing

struct Particle {
    position: vec3f,
    particle_type: f32,  // 0 = coffee, 1 = cream
    velocity: vec3f,
    _padding: f32,
}

struct SimUniforms {
    params0: vec4f, // glass_radius, glass_height, dt, stir_strength
    params1: vec4f, // stir_active, gravity, time, viscosity
    params2: vec4f, // diffusion, buoyancy, num_particles, padding
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: SimUniforms;

const PI: f32 = 3.14159265359;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3u) {
    let idx = global_id.x;
    let num_particles = u32(uniforms.params2.z);
    if (idx >= num_particles) {
        return;
    }

    var p = particles[idx];
    let glass_radius = uniforms.params0.x;
    let glass_height = uniforms.params0.y;
    let dt = uniforms.params0.z;
    let stir_strength = uniforms.params0.w;
    let stir_active = uniforms.params1.x;
    let gravity = uniforms.params1.y;
    let time = uniforms.params1.z;
    let viscosity = uniforms.params1.w;
    let diffusion = uniforms.params2.x;
    let buoyancy_strength = uniforms.params2.y;
    let is_cream = p.particle_type > 0.5;

    let pos_xz = vec2f(p.position.x, p.position.z);
    let r = length(pos_xz);
    let r_norm = clamp(r / glass_radius, 0.0, 1.0);
    let height_norm = clamp(abs(p.position.y) / (glass_height * 0.5), 0.0, 1.0);
    let height_factor = 1.0 - height_norm;
    let height_sign = select(-1.0, 1.0, p.position.y > 0.0);

    // Gravity - coffee sinks, cream floats
    let buoyancy = select(-buoyancy_strength * 1.15, buoyancy_strength * 1.0, is_cream);
    p.velocity.y += (gravity + buoyancy) * dt;

    // Soft vertical restoring force to keep volume distributed
    let rest_y = select(-0.18, 0.18, is_cream) * glass_height;
    let spring_strength = mix(2.2, 0.6, clamp(stir_active, 0.0, 1.0));
    let spring_factor = select(0.95, 0.55, is_cream);
    p.velocity.y += (rest_y - p.position.y) * spring_strength * spring_factor * dt;

    // Coffee fill band to prevent collapsing into a disk
    if (!is_cream) {
        let fill_top = 0.15 * glass_height;
        let fill_base = -0.48 * glass_height;
        let below_fill = clamp((fill_top - p.position.y) / (0.5 * glass_height), 0.0, 1.0);
        let above_fill = clamp((p.position.y - fill_top) / (0.5 * glass_height), 0.0, 1.0);
        let below_base = clamp((fill_base - p.position.y) / (0.1 * glass_height), 0.0, 1.0);
        p.velocity.y += below_fill * 1.6 * dt;
        p.velocity.y -= above_fill * 0.8 * dt;
        p.velocity.y += below_base * 2.6 * dt;
    }

    // Cream settling toward the coffee surface
    if (is_cream) {
        let cream_target = 0.12 * glass_height;
        let above = clamp((p.position.y - cream_target) / (0.35 * glass_height), 0.0, 1.0);
        p.velocity.y -= above * 1.2 * dt;
    }

    // Bottom cushion to prevent pile-up
    let bottom = -glass_height * 0.5 + 0.1;
    let bottom_push = clamp((bottom + 0.35 * glass_height - p.position.y) / (0.35 * glass_height), 0.0, 1.0);
    let bottom_factor = select(0.45, 0.55, is_cream);
    p.velocity.y += bottom_push * bottom_factor * dt;

    // Random diffusion (Brownian motion)
    let diffusion_scale = select(0.9, 0.45, is_cream);
    let noise_scale = diffusion * diffusion_scale * 0.02;
    let hash = fract(sin(f32(idx) * 12.9898 + time * 0.1) * 43758.5453);
    let noise = vec3f(
        fract(sin(hash * 1.0) * 43758.5453) - 0.5,
        fract(sin(hash * 2.0) * 43758.5453) - 0.5,
        fract(sin(hash * 3.0) * 43758.5453) - 0.5
    ) * noise_scale;
    p.velocity += noise;

    // Stirring - vortex motion
    if (r > 1e-4) {
        let tangent = vec2f(-pos_xz.y, pos_xz.x) / r;
        let radial = pos_xz / r;

        // Gentle baseline shear to encourage mixing at the interface
        let base_shear = 0.22;
        p.velocity.x += tangent.x * base_shear * height_sign * height_factor * dt;
        p.velocity.z += tangent.y * base_shear * height_sign * height_factor * dt;

        if (stir_active > 0.5) {
            // Faster core, slower edges
            let core = 1.0 - r_norm * r_norm;
            let vortex_strength = stir_strength * core * height_factor;

            p.velocity.x += tangent.x * vortex_strength * dt;
            p.velocity.z += tangent.y * vortex_strength * dt;

            // Secondary flow: inward at top, outward at bottom
            let secondary = -height_sign * (1.0 - r_norm) * stir_strength * 0.28;
            p.velocity.x += radial.x * secondary * dt;
            p.velocity.z += radial.y * secondary * dt;

            // Gentle vertical lift to form helical swirls
            p.velocity.y += (0.55 - r_norm) * stir_strength * 0.1 * height_factor * dt;
        }
    }

    // Viscous damping
    let viscosity_scale = select(1.0, 1.45, is_cream);
    let damping = clamp(1.0 - viscosity * viscosity_scale * dt, 0.0, 1.0);
    p.velocity *= damping;

    // Update position
    p.position += p.velocity * dt;

    // Cylindrical boundary collision
    let max_r = glass_radius - 0.05;

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
    let min_y = -glass_height * 0.5 + 0.05;
    let max_y = glass_height * 0.5 - 0.05;

    if (p.position.y < min_y) {
        p.position.y = min_y;
        p.velocity.y = abs(p.velocity.y) * 0.12;
    }
    if (p.position.y > max_y) {
        p.position.y = max_y;
        p.velocity.y = -abs(p.velocity.y) * 0.08;
        p.velocity.x *= 0.6;
        p.velocity.z *= 0.6;
    }

    particles[idx] = p;
}
