// Shared constants and buffer layouts for WebGPU fluid simulation

export const numParticlesMax = 60000;
export const numCoffeeParticles = 40000;
export const numCreamParticles = 20000;

// Particle struct size: position(vec3f) + velocity(vec3f) + type(f32) + padding = 32 bytes
export const particleStructSize = 32;

// Render uniforms buffer layout
export const renderUniformsValues = new ArrayBuffer(288);
export const renderUniformsViews = {
    texel_size: new Float32Array(renderUniformsValues, 0, 2),
    sphere_size: new Float32Array(renderUniformsValues, 8, 1),
    // padding to 16-byte alignment
    inv_projection_matrix: new Float32Array(renderUniformsValues, 16, 16),
    projection_matrix: new Float32Array(renderUniformsValues, 80, 16),
    view_matrix: new Float32Array(renderUniformsValues, 144, 16),
    inv_view_matrix: new Float32Array(renderUniformsValues, 208, 16),
    time: new Float32Array(renderUniformsValues, 272, 1),
    stir_strength: new Float32Array(renderUniformsValues, 276, 1),
};

// Simulation constants
export const GLASS_RADIUS = 1.35;
export const GLASS_HEIGHT = 3.6;
export const PARTICLE_RADIUS = 0.06;

// Metrics grid
export const METRICS_GRID_SIZE = 32;
export const METRICS_SCALE = 10000;

// Density grid for pressure pass
export const DENSITY_GRID_SIZE = 24;

// Colors
export const COFFEE_COLOR = [0.24, 0.14, 0.08]; // Dark brown
export const CREAM_COLOR = [0.96, 0.94, 0.90]; // Off-white
