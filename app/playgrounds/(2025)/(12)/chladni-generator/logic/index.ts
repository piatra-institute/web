/**
 * Chladni Pattern Generator
 * -------------------------
 * Standing wave patterns on vibrating plates.
 * Named after Ernst Chladni (1756-1827) who first documented these patterns.
 *
 * For a rectangular plate with free edges, the displacement is:
 *   z(x,y,t) = A·cos(ωt)·[cos(mπx/L)·cos(nπy/W) ± cos(mπx/W)·cos(nπy/L)]
 *
 * Nodal lines appear where z = 0 for all time.
 * Sand particles migrate to these nodal lines (regions of minimal vibration).
 *
 * Mode numbers (m,n) determine the spatial pattern complexity.
 * The eigenfrequency ω_mn ∝ √((m/L)² + (n/W)²).
 */

export type ShapeType = 'circle' | 'square' | 'rectangle' | 'ring';

export const clamp = (x: number, lo: number, hi: number): number =>
    x < lo ? lo : x > hi ? hi : x;

export const clamp01 = (x: number): number => clamp(x, 0, 1);

/**
 * Build boundary mask for the plate geometry.
 */
export function buildMask(
    w: number,
    h: number,
    shape: ShapeType,
    ringInner: number = 0.4
): Uint8Array {
    const mask = new Uint8Array(w * h);
    const cx = (w - 1) / 2;
    const cy = (h - 1) / 2;
    const sx = 2 / (w - 1);
    const sy = 2 / (h - 1);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const nx = (x - cx) * sx;
            const ny = (y - cy) * sy;

            let inside = true;
            if (shape === 'square') {
                inside = Math.abs(nx) <= 0.95 && Math.abs(ny) <= 0.95;
            } else if (shape === 'rectangle') {
                inside = Math.abs(nx) <= 0.95 && Math.abs(ny) <= 0.7;
            } else if (shape === 'circle') {
                const r = Math.sqrt(nx * nx + ny * ny);
                inside = r <= 0.95;
            } else if (shape === 'ring') {
                const r = Math.sqrt(nx * nx + ny * ny);
                inside = r <= 0.95 && r >= ringInner;
            }

            mask[y * w + x] = inside ? 1 : 0;
        }
    }

    return mask;
}

/**
 * Eigenfrequency approximation for rectangular membrane modes.
 * ω_mn ∝ √((m/a)² + (n/b)²)
 */
export function modeFrequency(m: number, n: number, aspectRatio: number = 1): number {
    return Math.sqrt(m * m + (n * n) / (aspectRatio * aspectRatio));
}

/**
 * Build Chladni pattern for given mode numbers (m, n).
 * For a square plate with free edges:
 *   cos(mπx)·cos(nπy) ± cos(nπx)·cos(mπy)
 *
 * symmetric=true uses + (symmetric mode)
 * symmetric=false uses - (antisymmetric mode)
 */
export function buildChladniMode(
    w: number,
    h: number,
    m: number,
    n: number,
    mask: Uint8Array,
    symmetric: boolean = true
): Float32Array {
    const out = new Float32Array(w * h);

    for (let y = 0; y < h; y++) {
        const ny = y / (h - 1);
        for (let x = 0; x < w; x++) {
            const nx = x / (w - 1);
            const i = y * w + x;

            if (!mask[i]) {
                out[i] = 0;
                continue;
            }

            const term1 = Math.cos(m * Math.PI * nx) * Math.cos(n * Math.PI * ny);
            const term2 = Math.cos(n * Math.PI * nx) * Math.cos(m * Math.PI * ny);

            out[i] = symmetric ? term1 + term2 : term1 - term2;
        }
    }

    return out;
}

/**
 * Compute the amplitude envelope by combining mode patterns.
 * Optional second mode allows for superposition effects.
 */
export function computeAmplitude(
    amp: Float32Array,
    mode1: Float32Array,
    mode2: Float32Array | null,
    mask: Uint8Array,
    a1: number,
    a2: number
): void {
    for (let i = 0; i < amp.length; i++) {
        if (!mask[i]) {
            amp[i] = 0;
            continue;
        }
        let val = a1 * mode1[i];
        if (mode2) {
            val += a2 * mode2[i];
        }
        amp[i] = Math.abs(val);
    }

    // Normalize to [0, 1]
    let maxAmp = 0;
    for (let i = 0; i < amp.length; i++) {
        if (amp[i] > maxAmp) maxAmp = amp[i];
    }
    if (maxAmp > 1e-12) {
        const inv = 1 / maxAmp;
        for (let i = 0; i < amp.length; i++) {
            amp[i] *= inv;
        }
    }
}

/**
 * Seeded noise for sand initialization.
 * Linear congruential generator for reproducibility.
 */
export function seededNoise(w: number, h: number, seed: number = 1337): Float32Array {
    let s = seed >>> 0;
    const rnd = () => {
        s = (1664525 * s + 1013904223) >>> 0;
        return (s & 0xffffff) / 0x1000000;
    };
    const a = new Float32Array(w * h);
    for (let i = 0; i < a.length; i++) a[i] = rnd();
    return a;
}

/**
 * 4-neighbor Laplacian for sand diffusion.
 */
export function laplacian4(
    src: Float32Array,
    dst: Float32Array,
    w: number,
    h: number,
    mask: Uint8Array
): void {
    for (let y = 0; y < h; y++) {
        const y0 = y * w;
        for (let x = 0; x < w; x++) {
            const i = y0 + x;
            if (!mask[i]) {
                dst[i] = 0;
                continue;
            }
            const c = src[i];
            const n = y > 0 && mask[i - w] ? src[i - w] : c;
            const s = y + 1 < h && mask[i + w] ? src[i + w] : c;
            const wv = x > 0 && mask[i - 1] ? src[i - 1] : c;
            const e = x + 1 < w && mask[i + 1] ? src[i + 1] : c;
            dst[i] = n + s + wv + e - 4 * c;
        }
    }
}

/**
 * Sand simulation step.
 * Particles migrate from high-amplitude to low-amplitude regions (nodal lines).
 * This simulates how physical sand accumulates at nodes when a plate vibrates.
 */
export function stepSand(
    sand: Float32Array,
    sandTmp: Float32Array,
    amplitude: Float32Array,
    lap: Float32Array,
    mask: Uint8Array,
    w: number,
    h: number,
    moveRate: number,
    diffusion: number
): void {
    sandTmp.set(sand);

    // Diffusion step
    if (diffusion > 0) {
        laplacian4(sandTmp, lap, w, h, mask);
        for (let i = 0; i < sand.length; i++) {
            if (!mask[i]) continue;
            sand[i] = sandTmp[i] + diffusion * lap[i];
        }
        sandTmp.set(sand);
    }

    // Migration step: move sand toward lower amplitude
    for (let y = 1; y < h - 1; y++) {
        const row = y * w;
        for (let x = 1; x < w - 1; x++) {
            const i = row + x;
            if (!mask[i]) continue;

            const mass = sandTmp[i];
            if (mass <= 1e-6) continue;

            const a0 = amplitude[i];
            let bestI = i;
            let bestA = a0;

            // Check 4 neighbors for lower amplitude
            const neighbors = [i - w, i + w, i - 1, i + 1];
            for (const ni of neighbors) {
                if (mask[ni] && amplitude[ni] < bestA) {
                    bestA = amplitude[ni];
                    bestI = ni;
                }
            }

            if (bestI !== i) {
                const gradient = a0 - bestA;
                const flow = moveRate * mass * clamp01(gradient * 3);
                sand[i] -= flow;
                sand[bestI] += flow;
            }
        }
    }

    // Normalize to conserve total sand mass
    let sum = 0, cnt = 0;
    for (let i = 0; i < sand.length; i++) {
        if (!mask[i]) continue;
        sum += sand[i];
        cnt++;
    }
    const mean = cnt ? sum / cnt : 1;
    const inv = mean > 1e-9 ? 1 / mean : 1;
    for (let i = 0; i < sand.length; i++) {
        sand[i] = mask[i] ? sand[i] * inv : 0;
    }
}

/**
 * Classic Chladni presets based on historical observations.
 * Mode numbers (m,n) represent half-wavelengths in each direction.
 */
export interface ChladniPreset {
    name: string;
    m: number;
    n: number;
    shape: ShapeType;
    symmetric: boolean;
    description: string;
}

export const CHLADNI_PRESETS: ChladniPreset[] = [
    { name: '(1,1)', m: 1, n: 1, shape: 'square', symmetric: true, description: 'Fundamental mode - single diagonal node' },
    { name: '(2,1)', m: 2, n: 1, shape: 'square', symmetric: true, description: 'First overtone - cross pattern' },
    { name: '(2,2)', m: 2, n: 2, shape: 'square', symmetric: true, description: 'Four-quadrant division' },
    { name: '(3,1)', m: 3, n: 1, shape: 'square', symmetric: true, description: 'Three-fold horizontal' },
    { name: '(3,2)', m: 3, n: 2, shape: 'square', symmetric: false, description: 'Asymmetric variant' },
    { name: '(3,3)', m: 3, n: 3, shape: 'square', symmetric: true, description: 'Nine-region grid' },
    { name: '(4,2)', m: 4, n: 2, shape: 'square', symmetric: true, description: 'Higher complexity' },
    { name: '(4,3)', m: 4, n: 3, shape: 'square', symmetric: false, description: 'Intricate asymmetric' },
    { name: '(5,2)', m: 5, n: 2, shape: 'square', symmetric: true, description: 'Fine structure' },
    { name: '(5,4)', m: 5, n: 4, shape: 'square', symmetric: false, description: 'Dense nodal network' },
    { name: '(6,3)', m: 6, n: 3, shape: 'square', symmetric: true, description: 'Complex symmetric' },
    { name: '(2,1) circle', m: 2, n: 1, shape: 'circle', symmetric: true, description: 'Circular plate fundamental' },
    { name: '(3,2) circle', m: 3, n: 2, shape: 'circle', symmetric: true, description: 'Circular higher mode' },
    { name: '(4,1) circle', m: 4, n: 1, shape: 'circle', symmetric: true, description: 'Circular radial pattern' },
    { name: '(3,2) ring', m: 3, n: 2, shape: 'ring', symmetric: true, description: 'Annular plate mode' },
];
