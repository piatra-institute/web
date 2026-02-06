// Clear metrics and grid counts

struct CellCount {
    coffee: atomic<u32>,
    cream: atomic<u32>,
}

struct Metrics {
    entropy: atomic<u32>,
    mixedness: atomic<u32>,
    complexity: atomic<u32>,
    kinetic: atomic<u32>,
    count: atomic<u32>,
    _pad: atomic<u32>,
}

@group(0) @binding(0) var<storage, read_write> counts: array<CellCount>;
@group(0) @binding(1) var<storage, read_write> metrics: Metrics;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let idx = id.x;
    if (idx < arrayLength(&counts)) {
        atomicStore(&counts[idx].coffee, 0u);
        atomicStore(&counts[idx].cream, 0u);
    }

    if (idx == 0u) {
        atomicStore(&metrics.entropy, 0u);
        atomicStore(&metrics.mixedness, 0u);
        atomicStore(&metrics.complexity, 0u);
        atomicStore(&metrics.kinetic, 0u);
        atomicStore(&metrics.count, 0u);
        atomicStore(&metrics._pad, 0u);
    }
}
