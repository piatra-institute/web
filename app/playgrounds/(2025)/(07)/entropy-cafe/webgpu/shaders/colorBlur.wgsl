// Separable blur for color map

struct BlurUniforms {
    blur_dir: vec2f,
}

@group(0) @binding(0) var input_tex: texture_2d<f32>;
@group(0) @binding(1) var input_sampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: BlurUniforms;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
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

@vertex
fn vs(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    let pos = positions[vertex_index];

    var output: VertexOutput;
    output.position = vec4f(pos, 0.0, 1.0);
    output.uv = pos * 0.5 + 0.5;
    output.uv.y = 1.0 - output.uv.y;
    return output;
}

@fragment
fn fs(input: VertexOutput) -> @location(0) vec4f {
    let texel = vec2f(1.0 / screenWidth, 1.0 / screenHeight);
    let dir = uniforms.blur_dir * texel;

    var color = textureSample(input_tex, input_sampler, input.uv) * 0.36;
    color += textureSample(input_tex, input_sampler, input.uv + dir) * 0.24;
    color += textureSample(input_tex, input_sampler, input.uv - dir) * 0.24;
    color += textureSample(input_tex, input_sampler, input.uv + dir * 2.0) * 0.08;
    color += textureSample(input_tex, input_sampler, input.uv - dir * 2.0) * 0.08;

    return color;
}
