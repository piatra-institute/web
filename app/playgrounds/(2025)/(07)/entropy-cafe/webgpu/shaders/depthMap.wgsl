// Depth map rendering for screen-space fluid

struct PosVel {
    position: vec3f,
    particle_type: f32,
    velocity: vec3f,
    _padding: f32,
}

struct RenderUniforms {
    texel_size: vec2f,
    sphere_size: f32,
    _pad0: f32,
    inv_projection_matrix: mat4x4f,
    projection_matrix: mat4x4f,
    view_matrix: mat4x4f,
    inv_view_matrix: mat4x4f,
    time: f32,
    stir_strength: f32,
}

@group(0) @binding(0) var<storage, read> posvel: array<PosVel>;
@group(0) @binding(1) var<uniform> uniforms: RenderUniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(1) view_center: vec3f,
    @location(2) particle_type: f32,
}

// Quad vertices for billboards
const quad_positions = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0),
);

@vertex
fn vs(@builtin(vertex_index) vertex_index: u32, @builtin(instance_index) instance_index: u32) -> VertexOutput {
    let particle = posvel[instance_index];
    let quad_pos = quad_positions[vertex_index];

    // Transform particle position to view space
    let world_pos = vec4f(particle.position, 1.0);
    let view_pos = uniforms.view_matrix * world_pos;

    // Billboard offset
    let offset = vec3f(quad_pos * uniforms.sphere_size, 0.0);
    let billboard_pos = view_pos.xyz + offset;

    // Project to clip space
    let clip_pos = uniforms.projection_matrix * vec4f(billboard_pos, 1.0);

    var output: VertexOutput;
    output.position = clip_pos;
    output.uv = quad_pos;
    output.view_center = view_pos.xyz;
    output.particle_type = particle.particle_type;

    return output;
}

@fragment
fn fs(input: VertexOutput) -> @location(0) f32 {
    // Calculate distance from center of sphere
    let dist_sq = dot(input.uv, input.uv);

    // Discard pixels outside sphere
    if (dist_sq > 1.0) {
        discard;
    }

    // Calculate sphere depth offset
    let sphere_depth = sqrt(1.0 - dist_sq) * uniforms.sphere_size;

    // Final depth in view space (negative z)
    let final_z = input.view_center.z + sphere_depth;

    return -final_z;
}
