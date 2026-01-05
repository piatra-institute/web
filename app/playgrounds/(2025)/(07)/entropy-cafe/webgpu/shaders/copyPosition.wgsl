// Copy particle positions for rendering

struct Particle {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

struct PosVel {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> posvel: array<PosVel>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3u) {
    let idx = global_id.x;
    if (idx >= arrayLength(&particles)) {
        return;
    }

    let p = particles[idx];
    posvel[idx].position = p.position;
    posvel[idx].particle_type = p.particle_type;
    posvel[idx].velocity = p.velocity;
}
