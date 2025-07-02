struct Uniforms {
    particleCount: u32,
    dt: f32,
    speed: f32,
    isStirring: u32,
    cupHeight: f32,
    cupRadiusTop: f32,
    cupRadiusBottom: f32,
    time: f32,
    gridSize: u32,
    smoothingRadius: f32,
    restDensity: f32,
    relaxation: f32,
}

struct Particle {
    position: vec3<f32>,
    type: f32, // 0 = coffee, 1 = cream
    velocity: vec3<f32>,
    pad1: f32,
    predictedPos: vec3<f32>,
    density: f32,
    lambda: f32,
    pad2: f32,
    pad3: f32,
    pad4: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(2) var<storage, read_write> spatialHash: array<u32>;
@group(0) @binding(3) var<storage, read_write> spatialOffsets: array<u32>;

const PI = 3.14159265359;
const GRAVITY = vec3<f32>(0.0, -9.81, 0.0);
const EPSILON = 0.0001;
const VISCOSITY = 0.01;
const VORTICITY_EPSILON = 0.0001;
const K_CORR = 0.1;
const N_CORR = 4.0;

// Poly6 kernel for density
fn poly6Kernel(r: f32, h: f32) -> f32 {
    if r > h { return 0.0; }
    let factor = 315.0 / (64.0 * PI * pow(h, 9.0));
    let diff = h * h - r * r;
    return factor * diff * diff * diff;
}

// Spiky kernel gradient for pressure
fn spikyGradient(r_vec: vec3<f32>, r: f32, h: f32) -> vec3<f32> {
    if r > h || r < EPSILON { return vec3<f32>(0.0); }
    let factor = -45.0 / (PI * pow(h, 6.0));
    let diff = h - r;
    return factor * diff * diff * r_vec / r;
}

// Viscosity kernel laplacian
fn viscosityLaplacian(r: f32, h: f32) -> f32 {
    if r > h { return 0.0; }
    let factor = 45.0 / (PI * pow(h, 6.0));
    return factor * (h - r);
}

// Get cup radius at height y
fn getCupRadius(y: f32) -> f32 {
    let t = clamp(y / uniforms.cupHeight, 0.0, 1.0);
    return mix(uniforms.cupRadiusBottom, uniforms.cupRadiusTop, t);
}

// Hash function for spatial grid
fn hashPosition(pos: vec3<f32>) -> u32 {
    let gridPos = vec3<u32>(pos / uniforms.smoothingRadius);
    return (gridPos.x * 73856093u ^ gridPos.y * 19349663u ^ gridPos.z * 83492791u) % uniforms.particleCount;
}

// Apply external forces and predict positions
@compute @workgroup_size(64)
fn applyForces(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    if i >= uniforms.particleCount { return; }
    
    var p = particles[i];
    
    // Apply gravity
    let force = GRAVITY;
    
    // Stirring force
    if uniforms.isStirring > 0u {
        let toCenter = vec3<f32>(-p.position.x, 0.0, -p.position.z);
        let tangent = normalize(vec3<f32>(-toCenter.z, 0.0, toCenter.x));
        p.velocity += tangent * 20.0 * uniforms.speed * uniforms.dt;
    }
    
    // Update velocity with external forces
    p.velocity += force * uniforms.dt;
    
    // Apply damping
    p.velocity *= 0.99;
    
    // Predict position
    p.predictedPos = p.position + p.velocity * uniforms.dt;
    
    particles[i] = p;
}

// Calculate density and lambda
@compute @workgroup_size(64)
fn calculateDensity(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    if i >= uniforms.particleCount { return; }
    
    var p = particles[i];
    var density = 0.0;
    var gradientSum = 0.0;
    var gradientSelf = vec3<f32>(0.0);
    
    // Calculate density using predicted positions
    for (var j = 0u; j < uniforms.particleCount; j++) {
        let neighbor = particles[j];
        let r = distance(p.predictedPos, neighbor.predictedPos);
        
        if r < uniforms.smoothingRadius {
            density += poly6Kernel(r, uniforms.smoothingRadius);
            
            if i != j {
                let gradient = spikyGradient(
                    p.predictedPos - neighbor.predictedPos,
                    r,
                    uniforms.smoothingRadius
                ) / uniforms.restDensity;
                
                gradientSum += dot(gradient, gradient);
                gradientSelf += gradient;
            }
        }
    }
    
    p.density = density;
    
    // Calculate lambda (pressure)
    let constraint = (density / uniforms.restDensity) - 1.0;
    gradientSum += dot(gradientSelf, gradientSelf);
    
    if abs(gradientSum) > EPSILON {
        p.lambda = -constraint / (gradientSum + uniforms.relaxation);
    } else {
        p.lambda = 0.0;
    }
    
    particles[i] = p;
}

// Calculate position corrections
@compute @workgroup_size(64)
fn calculateCorrections(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    if i >= uniforms.particleCount { return; }
    
    var p = particles[i];
    var correction = vec3<f32>(0.0);
    
    for (var j = 0u; j < uniforms.particleCount; j++) {
        if i == j { continue; }
        
        let neighbor = particles[j];
        let r_vec = p.predictedPos - neighbor.predictedPos;
        let r = length(r_vec);
        
        if r < uniforms.smoothingRadius && r > EPSILON {
            // Pressure correction
            let scorr = -K_CORR * pow(poly6Kernel(r, uniforms.smoothingRadius) / 
                poly6Kernel(0.2 * uniforms.smoothingRadius, uniforms.smoothingRadius), N_CORR);
            
            correction += (p.lambda + neighbor.lambda + scorr) * 
                spikyGradient(r_vec, r, uniforms.smoothingRadius) / uniforms.restDensity;
        }
    }
    
    p.predictedPos += correction;
    
    // Apply boundary constraints
    let cupRadius = getCupRadius(p.predictedPos.y) * 0.95;
    let r = sqrt(p.predictedPos.x * p.predictedPos.x + p.predictedPos.z * p.predictedPos.z);
    
    if r > cupRadius {
        let scale = cupRadius / r;
        p.predictedPos.x *= scale;
        p.predictedPos.z *= scale;
    }
    
    // Floor constraint with restitution
    if p.predictedPos.y < 0.1 {
        p.predictedPos.y = 0.1;
    }
    
    // Ceiling constraint
    if p.predictedPos.y > uniforms.cupHeight * 0.95 {
        p.predictedPos.y = uniforms.cupHeight * 0.95;
    }
    
    particles[i] = p;
}

// Update velocities and positions
@compute @workgroup_size(64)
fn updateVelocities(@builtin(global_invocation_id) id: vec3<u32>) {
    let i = id.x;
    if i >= uniforms.particleCount { return; }
    
    var p = particles[i];
    
    // Update velocity based on position change
    p.velocity = (p.predictedPos - p.position) / uniforms.dt;
    
    // Apply viscosity
    var viscosity = vec3<f32>(0.0);
    var viscWeight = 0.0;
    
    for (var j = 0u; j < uniforms.particleCount; j++) {
        if i == j { continue; }
        
        let neighbor = particles[j];
        let r = distance(p.predictedPos, neighbor.predictedPos);
        
        if r < uniforms.smoothingRadius {
            let w = viscosityLaplacian(r, uniforms.smoothingRadius);
            viscosity += (neighbor.velocity - p.velocity) * w;
            viscWeight += w;
        }
    }
    
    if viscWeight > 0.0 {
        p.velocity += VISCOSITY * viscosity / viscWeight;
    }
    
    // Update position
    p.position = p.predictedPos;
    
    particles[i] = p;
}

// Render particles as metaballs
struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) world_position: vec3<f32>,
    @location(1) color: vec3<f32>,
    @location(2) radius: f32,
}

@vertex
fn vs_main(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> VertexOutput {
    var output: VertexOutput;
    
    let particle = particles[instance_index];
    
    // Generate quad vertices
    let quad_vertices = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0,  1.0)
    );
    
    let vertex_pos = quad_vertices[vertex_index];
    
    // Billboard calculation
    let radius = 0.3;
    let world_pos = particle.position + vec3<f32>(vertex_pos * radius, 0.0);
    
    // Simple projection
    let view_pos = world_pos - vec3<f32>(0.0, 5.0, 15.0);
    output.clip_position = vec4<f32>(
        view_pos.x * 0.1,
        view_pos.y * 0.1,
        view_pos.z * 0.01 - 0.5,
        1.0
    );
    
    output.world_position = particle.position;
    output.radius = radius;
    
    // Color based on type
    if particle.type < 0.5 {
        output.color = vec3<f32>(0.42, 0.27, 0.14); // Coffee
    } else {
        output.color = vec3<f32>(0.96, 0.93, 0.88); // Cream
    }
    
    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
    // Metaball rendering
    let dist = length(input.world_position - input.world_position);
    let alpha = smoothstep(input.radius, 0.0, dist);
    
    return vec4<f32>(input.color, alpha * 0.9);
}