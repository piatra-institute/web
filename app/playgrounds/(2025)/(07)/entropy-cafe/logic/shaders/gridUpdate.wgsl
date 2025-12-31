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

struct GridCell {
    mass: f32,
    velocity: vec3<f32>,
    force: vec3<f32>,
}

@group(0) @binding(0) var<storage, read_write> grid: array<GridCell>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

fn getGridIndex(pos: vec3<u32>) -> u32 {
    return pos.x + pos.y * uniforms.gridResolution + pos.z * uniforms.gridResolution * uniforms.gridResolution;
}

fn applyCupBoundary(pos: vec3<f32>, vel: vec3<f32>) -> vec3<f32> {
    var newVel = vel;

    // Cup bottom boundary
    if (pos.y < uniforms.cupCenter.y - uniforms.cupHeight * 0.5) {
        newVel.y = max(newVel.y, 0.0);
    }

    // Cup side boundaries (cylindrical)
    let dx = pos.x - uniforms.cupCenter.x;
    let dz = pos.z - uniforms.cupCenter.z;
    let radius = sqrt(dx * dx + dz * dz);

    if (radius > uniforms.cupRadius) {
        let normal = normalize(vec3<f32>(dx, 0.0, dz));
        let radialVel = dot(newVel, normal);
        if (radialVel > 0.0) {
            newVel = newVel - radialVel * normal;
        }
    }

    return newVel;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let gridIndex = global_id.x;
    let gridCount = uniforms.gridResolution * uniforms.gridResolution * uniforms.gridResolution;

    if (gridIndex >= gridCount) {
        return;
    }

    // Clear grid cell
    grid[gridIndex].mass = 0.0;
    grid[gridIndex].velocity = vec3<f32>(0.0);
    grid[gridIndex].force = vec3<f32>(0.0);

    // Convert 1D index to 3D grid coordinates
    let z = gridIndex / (uniforms.gridResolution * uniforms.gridResolution);
    let y = (gridIndex % (uniforms.gridResolution * uniforms.gridResolution)) / uniforms.gridResolution;
    let x = gridIndex % uniforms.gridResolution;

    // Calculate world position of this grid cell
    let h = 1.0 / f32(uniforms.gridResolution);
    let worldPos = (vec3<f32>(f32(x), f32(y), f32(z)) + 0.5) * h *
                   vec3<f32>(uniforms.cupRadius * 2.0, uniforms.cupHeight, uniforms.cupRadius * 2.0) -
                   vec3<f32>(uniforms.cupRadius, uniforms.cupHeight * 0.5, uniforms.cupRadius);

    // Apply gravity
    let gravityForce = uniforms.gravity * 0.1; // Scale down gravity for stability

    // Apply stirring force if enabled
    var stirringForce = vec3<f32>(0.0);
    if (uniforms.isStirring > 0.5) {
        let center = vec3<f32>(uniforms.cupCenter.x, uniforms.cupCenter.y, uniforms.cupCenter.z);
        let toCenter = center - worldPos;
        let distance = length(toCenter);

        if (distance > 0.1) {
            let tangent = normalize(cross(toCenter, vec3<f32>(0.0, 1.0, 0.0)));
            let stirringStrength = 2.0 * sin(uniforms.time * 3.0) * exp(-distance * 2.0);
            stirringForce = tangent * stirringStrength;
        }
    }

    // Store forces for later use in G2P
    grid[gridIndex].force = gravityForce + stirringForce;
}