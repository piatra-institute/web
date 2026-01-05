// Bilateral filter for smoothing depth map

struct FilterUniforms {
    blur_dir: vec2f,
}

@group(0) @binding(0) var depth_texture: texture_2d<f32>;
@group(0) @binding(1) var<uniform> uniforms: FilterUniforms;

override depth_threshold: f32 = 0.1;
override max_filter_size: i32 = 50;
override projected_particle_constant: f32 = 100.0;

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

@fragment
fn fs(input: VertexOutput) -> @location(0) f32 {
    let center_depth = textureLoad(depth_texture, vec2u(input.iuv), 0).r;

    if (center_depth <= 0.0 || center_depth >= 1e4) {
        return center_depth;
    }

    // Calculate filter size based on depth
    let filter_size = min(max_filter_size, i32(projected_particle_constant / center_depth));

    var sum: f32 = 0.0;
    var wsum: f32 = 0.0;

    let sigma_space = f32(filter_size) * 0.5;
    let sigma_depth = depth_threshold;

    for (var i = -filter_size; i <= filter_size; i++) {
        let offset = vec2f(f32(i)) * uniforms.blur_dir;
        let sample_uv = vec2u(input.iuv + offset);
        let sample_depth = textureLoad(depth_texture, sample_uv, 0).r;

        if (sample_depth <= 0.0 || sample_depth >= 1e4) {
            continue;
        }

        // Spatial weight (Gaussian)
        let spatial_weight = exp(-f32(i * i) / (2.0 * sigma_space * sigma_space));

        // Range weight (depth similarity)
        let depth_diff = abs(sample_depth - center_depth);
        let range_weight = exp(-depth_diff * depth_diff / (2.0 * sigma_depth * sigma_depth));

        let weight = spatial_weight * range_weight;
        sum += sample_depth * weight;
        wsum += weight;
    }

    if (wsum > 0.0) {
        return sum / wsum;
    }

    return center_depth;
}
