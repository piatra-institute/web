// Clear density grid

@group(0) @binding(0) var<storage, read_write> density: array<atomic<u32>>;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let idx = id.x;
    if (idx < arrayLength(&density)) {
        atomicStore(&density[idx], 0u);
    }
}
