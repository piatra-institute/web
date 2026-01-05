// Glass container rendering shader

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

struct GlassUniforms {
    glass_radius: f32,
    glass_height: f32,
}

@group(0) @binding(0) var<uniform> render_uniforms: RenderUniforms;
@group(0) @binding(1) var<uniform> glass_uniforms: GlassUniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) world_pos: vec3f,
    @location(1) normal: vec3f,
}

const PI: f32 = 3.14159265359;
const SEGMENTS: u32 = 64u;

@vertex
fn vs(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    // Generate cylinder vertices
    let segment = vertex_index / 6u;
    let local_idx = vertex_index % 6u;

    let angle0 = f32(segment) / f32(SEGMENTS) * 2.0 * PI;
    let angle1 = f32(segment + 1u) / f32(SEGMENTS) * 2.0 * PI;

    let r = glass_uniforms.glass_radius;
    let h = glass_uniforms.glass_height * 0.5;

    // Quad corners for this segment
    let p0 = vec3f(cos(angle0) * r, -h, sin(angle0) * r);
    let p1 = vec3f(cos(angle1) * r, -h, sin(angle1) * r);
    let p2 = vec3f(cos(angle0) * r, h, sin(angle0) * r);
    let p3 = vec3f(cos(angle1) * r, h, sin(angle1) * r);

    // Triangle indices: 0,1,2  2,1,3
    var pos: vec3f;
    var normal: vec3f;

    switch local_idx {
        case 0u: { pos = p0; }
        case 1u: { pos = p1; }
        case 2u: { pos = p2; }
        case 3u: { pos = p2; }
        case 4u: { pos = p1; }
        case 5u: { pos = p3; }
        default: { pos = p0; }
    }

    normal = normalize(vec3f(pos.x, 0.0, pos.z));

    let view_pos = render_uniforms.view_matrix * vec4f(pos, 1.0);
    let clip_pos = render_uniforms.projection_matrix * view_pos;

    var output: VertexOutput;
    output.position = clip_pos;
    output.world_pos = pos;
    output.normal = normal;

    return output;
}

@fragment
fn fs(input: VertexOutput) -> @location(0) vec4f {
    let normal = normalize(input.normal);

    // View direction
    let camera_pos = render_uniforms.inv_view_matrix[3].xyz;
    let view_dir = normalize(camera_pos - input.world_pos);

    // Fresnel effect for glass
    let fresnel = pow(1.0 - max(0.0, dot(normal, view_dir)), 3.0);

    // Glass color with rim highlight
    let glass_color = vec3f(0.9, 0.95, 1.0);
    let alpha = 0.08 + fresnel * 0.15;

    // Subtle rim lighting
    let rim = pow(1.0 - max(0.0, dot(normal, view_dir)), 4.0) * 0.3;

    let final_color = glass_color + vec3f(rim);

    return vec4f(final_color, alpha);
}
