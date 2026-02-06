// Final fluid rendering shader with coffee/cream coloring

@group(0) @binding(0) var depth_texture: texture_2d<f32>;
@group(0) @binding(1) var<uniform> uniforms: RenderUniforms;
@group(0) @binding(2) var color_texture: texture_2d<f32>;

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

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(1) iuv: vec2f,
}

override screenWidth: f32 = 800.0;
override screenHeight: f32 = 600.0;

const positions = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0),
);

// Coffee and cream colors
const COFFEE_COLOR = vec3f(0.24, 0.14, 0.08);
const CREAM_COLOR = vec3f(0.96, 0.94, 0.90);

@vertex
fn vs(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    let pos = positions[vertex_index];

    var output: VertexOutput;
    output.position = vec4f(pos, 0.0, 1.0);
    output.uv = pos * 0.5 + 0.5;
    output.uv.y = 1.0 - output.uv.y;
    output.iuv = output.uv * vec2f(screenWidth, screenHeight);

    return output;
}

fn computeViewPosFromUVDepth(tex_coord: vec2f, depth: f32) -> vec3f {
    var ndc = vec4f(tex_coord.x * 2.0 - 1.0, 1.0 - 2.0 * tex_coord.y, 0.0, 1.0);
    ndc.z = -uniforms.projection_matrix[2].z + uniforms.projection_matrix[3].z / depth;
    ndc.w = 1.0;

    var eye_pos = uniforms.inv_projection_matrix * ndc;
    return eye_pos.xyz / eye_pos.w;
}

fn getViewPosFromTexCoord(tex_coord: vec2f, iuv: vec2f) -> vec3f {
    let depth = abs(textureLoad(depth_texture, vec2u(iuv), 0).x);
    return computeViewPosFromUVDepth(tex_coord, depth);
}

@fragment
fn fs(input: VertexOutput) -> @location(0) vec4f {
    let depth = abs(textureLoad(depth_texture, vec2u(input.iuv), 0).r);

    // Background color (black for the playground)
    let bgColor = vec3f(0.0, 0.0, 0.0);

    if (depth >= 1e4 || depth <= 0.0) {
        return vec4f(bgColor, 1.0);
    }

    // Get particle type (coffee vs cream blend)
    let color_sample = textureLoad(color_texture, vec2u(input.iuv), 0);
    var cream_amount = select(0.0, color_sample.r / max(color_sample.a, 0.0001), color_sample.a > 0.0);
    cream_amount = clamp(cream_amount, 0.0, 1.0);

    // Interpolate between coffee and cream colors
    let base_color = mix(COFFEE_COLOR, CREAM_COLOR, cream_amount);

    // Calculate view position and normal from depth
    let viewPos = computeViewPosFromUVDepth(input.uv, depth);

    let ddx = getViewPosFromTexCoord(input.uv + vec2f(uniforms.texel_size.x, 0.0), input.iuv + vec2f(1.0, 0.0)) - viewPos;
    let ddy = getViewPosFromTexCoord(input.uv + vec2f(0.0, uniforms.texel_size.y), input.iuv + vec2f(0.0, 1.0)) - viewPos;
    let ddx2 = viewPos - getViewPosFromTexCoord(input.uv + vec2f(-uniforms.texel_size.x, 0.0), input.iuv + vec2f(-1.0, 0.0));
    let ddy2 = viewPos - getViewPosFromTexCoord(input.uv + vec2f(0.0, -uniforms.texel_size.y), input.iuv + vec2f(0.0, -1.0));

    var dx = ddx;
    var dy = ddy;
    if (abs(ddx.z) > abs(ddx2.z)) { dx = ddx2; }
    if (abs(ddy.z) > abs(ddy2.z)) { dy = ddy2; }

    let normal = -normalize(cross(dx, dy));

    // Lighting
    let rayDir = normalize(viewPos);
    let lightDir = normalize((uniforms.view_matrix * vec4f(1.0, 1.0, -1.0, 0.0)).xyz);
    let H = normalize(lightDir - rayDir);

    // Specular (less for coffee, more for cream)
    let specular_strength = mix(0.3, 0.6, cream_amount);
    let specular = pow(max(0.0, dot(H, normal)), 60.0) * specular_strength;

    // Diffuse
    let diffuse = max(0.0, dot(lightDir, normal)) * 0.8 + 0.2;

    // Fresnel effect (subtle)
    let F0 = 0.04;
    let fresnel = F0 + (1.0 - F0) * pow(1.0 - max(0.0, dot(normal, -rayDir)), 5.0);

    // Rim lighting for depth
    let rim = pow(1.0 - max(0.0, dot(normal, -rayDir)), 3.0) * 0.2;

    // Final color composition
    var finalColor = base_color * diffuse;
    finalColor += vec3f(specular);
    finalColor += vec3f(rim) * mix(vec3f(0.3, 0.2, 0.1), vec3f(1.0, 0.98, 0.95), cream_amount);

    // Subtle reflection
    finalColor = mix(finalColor, vec3f(0.8), fresnel * 0.3);

    return vec4f(finalColor, 1.0);
}
