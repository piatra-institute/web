struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) particleType: f32,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec3<f32>,
}

@vertex
fn vertex(input: VertexInput) -> VertexOutput {
    let pos = input.position;
    let particleType = input.particleType;

    // Simple orthographic projection that ensures particles are visible
    // Map from world coordinates to NDC (Normalized Device Coordinates)
    let scale = 1.5; // Adjust this to zoom in/out
    let projectedPos = vec4<f32>(
        pos.x * scale,  // X coordinate
        pos.z * scale,  // Z coordinate (we're looking down from Y)
        pos.y * 0.5,    // Y coordinate as depth
        1.0
    );

    // Color based on particle type
    var color = vec3<f32>(0.8, 0.6, 0.4); // Default brown for coffee
    if (particleType > 0.5) {
        color = vec3<f32>(1.0, 1.0, 0.9); // Cream color
    }

    return VertexOutput(
        projectedPos,
        color
    );
}

@fragment
fn fragment(@location(0) color: vec3<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(color, 0.8);
}