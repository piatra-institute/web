// Color map rendering - stores particle type for coffee/cream coloring

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

    let world_pos = vec4f(particle.position, 1.0);
    let view_pos = uniforms.view_matrix * world_pos;

    let offset = vec3f(quad_pos * uniforms.sphere_size, 0.0);
    let billboard_pos = view_pos.xyz + offset;

    let clip_pos = uniforms.projection_matrix * vec4f(billboard_pos, 1.0);

    var output: VertexOutput;
    output.position = clip_pos;
    output.uv = quad_pos;
    output.view_center = view_pos.xyz;
    output.particle_type = particle.particle_type;

    return output;
}

struct FragmentOutput {
    @location(0) color: vec4f,
}

@fragment
fn fs(input: VertexOutput) -> FragmentOutput {
    let dist_sq = dot(input.uv, input.uv);

    if (dist_sq > 1.0) {
        discard;
    }

    // Calculate soft edge falloff
    let edge = 1.0 - sqrt(dist_sq);
    let alpha = smoothstep(0.0, 0.3, edge);

    var output: FragmentOutput;
    // Store particle type in red channel, alpha for blending weight
    output.color = vec4f(input.particle_type, 0.0, 0.0, alpha);

    return output;
}
