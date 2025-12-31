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

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read> grid: array<GridCell>;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;
@group(0) @binding(3) var<storage, read_write> renderData: array<vec4<f32>>;

fn getGridIndex(pos: vec3<f32>) -> u32 {
    let gridPos = (pos + vec3<f32>(uniforms.cupRadius, uniforms.cupHeight * 0.5, uniforms.cupRadius)) /
                  vec3<f32>(uniforms.cupRadius * 2.0, uniforms.cupHeight, uniforms.cupRadius * 2.0) *
                  f32(uniforms.gridResolution);

    let x = u32(clamp(gridPos.x, 0.0, f32(uniforms.gridResolution - 1)));
    let y = u32(clamp(gridPos.y, 0.0, f32(uniforms.gridResolution - 1)));
    let z = u32(clamp(gridPos.z, 0.0, f32(uniforms.gridResolution - 1)));

    return x + y * uniforms.gridResolution + z * uniforms.gridResolution * uniforms.gridResolution;
}

fn applyCupBoundary(pos: vec3<f32>, vel: vec3<f32>) -> vec3<f32> {
    var newPos = pos;

    // Cup bottom boundary with bounce
    if (newPos.y < uniforms.cupCenter.y - uniforms.cupHeight * 0.5) {
        newPos.y = uniforms.cupCenter.y - uniforms.cupHeight * 0.5;
    }

    // Cup top boundary
    if (newPos.y > uniforms.cupCenter.y + uniforms.cupHeight * 0.5) {
        newPos.y = uniforms.cupCenter.y + uniforms.cupHeight * 0.5;
    }

    // Cup side boundaries (cylindrical)
    let dx = newPos.x - uniforms.cupCenter.x;
    let dz = newPos.z - uniforms.cupCenter.z;
    let radius = sqrt(dx * dx + dz * dz);

    if (radius > uniforms.cupRadius) {
        let scale = uniforms.cupRadius / radius;
        newPos.x = uniforms.cupCenter.x + dx * scale;
        newPos.z = uniforms.cupCenter.z + dz * scale;
    }

    return newPos;
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

    // Get data from nearest grid cell
    let gridPos = (pos + vec3<f32>(uniforms.cupRadius, uniforms.cupHeight * 0.5, uniforms.cupRadius)) /
                  vec3<f32>(uniforms.cupRadius * 2.0, uniforms.cupHeight, uniforms.cupRadius * 2.0) *
                  f32(uniforms.gridResolution);

    let x = u32(clamp(gridPos.x, 0.0, f32(uniforms.gridResolution - 1)));
    let y = u32(clamp(gridPos.y, 0.0, f32(uniforms.gridResolution - 1)));
    let z = u32(clamp(gridPos.z, 0.0, f32(uniforms.gridResolution - 1)));

    let gridIndex = x + y * uniforms.gridResolution + z * uniforms.gridResolution * uniforms.gridResolution;

    var newVel = vel;

    // Get data from grid cell
    let gridCell = grid[gridIndex];
    if (gridCell.mass > 0.0) {
        let gridVel = gridCell.velocity / gridCell.mass;
        newVel = mix(newVel, gridVel, 0.5); // Blend current and grid velocity
    }

    // Apply gravity (stronger)
    newVel += uniforms.gravity * uniforms.dt;

    // Apply damping to prevent particles from flying away
    let damping = 0.98;
    newVel *= damping;

    // Limit maximum velocity to prevent instability
    let maxVel = 2.0;
    let velMag = length(newVel);
    if (velMag > maxVel) {
        newVel = normalize(newVel) * maxVel;
    }

    // Update particle position
    let newPos = pos + newVel * uniforms.dt;

    // Apply boundary conditions
    let clampedPos = applyCupBoundary(newPos, newVel);

    // Apply velocity damping at boundaries
    var finalVel = newVel;

    // Bottom boundary bounce
    if (clampedPos.y <= uniforms.cupCenter.y - uniforms.cupHeight * 0.5 + 0.01) {
        finalVel.y = -finalVel.y * 0.3;
    }

    // Top boundary bounce
    if (clampedPos.y >= uniforms.cupCenter.y + uniforms.cupHeight * 0.5 - 0.01) {
        finalVel.y = -finalVel.y * 0.3;
    }

    // Side boundary bounce
    let dx = clampedPos.x - uniforms.cupCenter.x;
    let dz = clampedPos.z - uniforms.cupCenter.z;
    let radius = sqrt(dx * dx + dz * dz);
    if (radius >= uniforms.cupRadius - 0.01) {
        let normal = normalize(vec3<f32>(dx, 0.0, dz));
        let radialVel = dot(finalVel, normal);
        if (radialVel > 0.0) {
            finalVel = finalVel - radialVel * normal * 1.6;
        }
    }

    // Update particle data
    particles[particleIndex].position = clampedPos;
    particles[particleIndex].velocity = finalVel;

    // Update render data (position + particle type)
    renderData[particleIndex] = vec4<f32>(clampedPos, particleType);
}