// Compute entropy, mixedness, and complexity from grid counts

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

struct MetricsUniforms {
    grid_size: f32,
    num_particles: f32,
    glass_radius: f32,
    glass_height: f32,
}

@group(0) @binding(0) var<storage, read_write> counts: array<CellCount>;
@group(0) @binding(1) var<storage, read_write> metrics: Metrics;
@group(0) @binding(2) var<uniform> uniforms: MetricsUniforms;

const METRIC_SCALE: f32 = 10000.0;
const EPS: f32 = 0.00001;

fn concentrationAt(index: u32, fallback: f32) -> f32 {
    let cream = atomicLoad(&counts[index].cream);
    let coffee = atomicLoad(&counts[index].coffee);
    let total = cream + coffee;
    if (total == 0u) {
        return fallback;
    }
    return f32(cream) / f32(total);
}

@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) id: vec3u) {
    let idx = id.x;
    let grid_size = u32(uniforms.grid_size);
    let layer = grid_size * grid_size;
    let total_cells = grid_size * layer;
    if (idx >= total_cells) {
        return;
    }

    let cream = atomicLoad(&counts[idx].cream);
    let coffee = atomicLoad(&counts[idx].coffee);
    let total = cream + coffee;
    if (total == 0u) {
        return;
    }

    let c_raw = f32(cream) / f32(total);
    let c = clamp(c_raw, EPS, 1.0 - EPS);

    let entropy = -(c * log2(c) + (1.0 - c) * log2(1.0 - c));
    let mixedness = 1.0 - abs(2.0 * c - 1.0);

    let gz = idx / layer;
    let rem = idx - gz * layer;
    let gy = rem / grid_size;
    let gx = rem - gy * grid_size;

    var grad: f32 = 0.0;
    if (gx + 1u < grid_size) {
        let c_right = concentrationAt(idx + 1u, c);
        grad += abs(c - c_right);
    }
    if (gy + 1u < grid_size) {
        let c_up = concentrationAt(idx + grid_size, c);
        grad += abs(c - c_up);
    }
    if (gz + 1u < grid_size) {
        let c_front = concentrationAt(idx + layer, c);
        grad += abs(c - c_front);
    }

    let complexity = (grad / 3.0) * mixedness;
    let weight = f32(total);

    atomicAdd(&metrics.entropy, u32(entropy * weight * METRIC_SCALE));
    atomicAdd(&metrics.mixedness, u32(mixedness * weight * METRIC_SCALE));
    atomicAdd(&metrics.complexity, u32(complexity * weight * METRIC_SCALE));
}
