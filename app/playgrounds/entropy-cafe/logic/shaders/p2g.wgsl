struct Uniforms {
    dt: f32,
    time: f32,
    gridResolution: u32,
    particleVolume: f32,
    hardening: f32,
    E: f32,
    nu: f32,
    isStirring: f32,
    gravity: vec3<f32>,
    cupRadius: f32,
    cupHeight: f32,
    cupCenter: vec3<f32>,
}

struct Particle {
    position: vec3<f32>,
    velocity: vec3<f32>,
    mass: f32,
    particleType: f32,
}

struct GridCell {
    mass: f32,
    velocity: vec3<f32>,
    force: vec3<f32>,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> grid: array<GridCell>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

fn getGridIndex(pos: vec3<f32>) -> u32 {
    let gridPos = (pos + vec3<f32>(uniforms.cupRadius, uniforms.cupHeight * 0.5, uniforms.cupRadius)) /
                  vec3<f32>(uniforms.cupRadius * 2.0, uniforms.cupHeight, uniforms.cupRadius * 2.0) *
                  f32(uniforms.gridResolution);

    let x = u32(clamp(gridPos.x, 0.0, f32(uniforms.gridResolution - 1)));
    let y = u32(clamp(gridPos.y, 0.0, f32(uniforms.gridResolution - 1)));
    let z = u32(clamp(gridPos.z, 0.0, f32(uniforms.gridResolution - 1)));

    return x + y * uniforms.gridResolution + z * uniforms.gridResolution * uniforms.gridResolution;
}

fn quadraticKernel(d: f32, h: f32) -> f32 {
    let q = d / h;
    if (q < 1.0) {
        return 0.25 * (1.0 - q) * (1.0 - q);
    }
    return 0.0;
}

fn quadraticKernelGradient(d: f32, h: f32) -> f32 {
    let q = d / h;
    if (q < 1.0) {
        return -0.5 * (1.0 - q) / h;
    }
    return 0.0;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let particleIndex = global_id.x;
    if (particleIndex >= arrayLength(&particles)) {
        return;
    }

    let particle = particles[particleIndex];
    let pos = particle.position;
    let vel = particle.velocity;
    let mass = particle.mass;
    let particleType = particle.particleType;

        // Very simple force calculation
    let force = uniforms.gravity * mass; // Just gravity

        // Simple grid transfer - just transfer to the nearest grid cell
    let h = 1.0 / f32(uniforms.gridResolution);
    let gridPos = (pos + vec3<f32>(uniforms.cupRadius, uniforms.cupHeight * 0.5, uniforms.cupRadius)) /
                  vec3<f32>(uniforms.cupRadius * 2.0, uniforms.cupHeight, uniforms.cupRadius * 2.0) *
                  f32(uniforms.gridResolution);

    let x = u32(clamp(gridPos.x, 0.0, f32(uniforms.gridResolution - 1)));
    let y = u32(clamp(gridPos.y, 0.0, f32(uniforms.gridResolution - 1)));
    let z = u32(clamp(gridPos.z, 0.0, f32(uniforms.gridResolution - 1)));

    let gridIndex = x + y * uniforms.gridResolution + z * uniforms.gridResolution * uniforms.gridResolution;

    // Transfer particle data to grid
    grid[gridIndex].mass += mass;
    grid[gridIndex].velocity.x += mass * vel.x;
    grid[gridIndex].velocity.y += mass * vel.y;
    grid[gridIndex].velocity.z += mass * vel.z;
    grid[gridIndex].force.x += force.x;
    grid[gridIndex].force.y += force.y;
    grid[gridIndex].force.z += force.z;
}