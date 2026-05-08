import { LATTICE_SIZE, NUM_PATCHES, PATCH_WIDTH } from './index';

/**
 * Coarsen the lattice into NUM_PATCHES patches by computing the mean of each
 * contiguous PATCH_WIDTH window. The patches form the vertices of a cyclic
 * graph; restriction maps live on edges between adjacent patches.
 */
export function patchSummary(u: Float32Array): number[] {
    const out: number[] = [];
    for (let p = 0; p < NUM_PATCHES; p++) {
        let s = 0;
        for (let i = 0; i < PATCH_WIDTH; i++) {
            s += u[p * PATCH_WIDTH + i];
        }
        out.push(s / PATCH_WIDTH);
    }
    return out;
}

/**
 * Build the sheaf Laplacian over a 1D cellular sheaf with NUM_PATCHES vertex
 * stalks of dim 1 connected in a cycle. Restriction-map weights c_{p,q} encode
 * how strongly two adjacent patches must agree:
 *
 *   c_{p,q} = exp(-β |patch_p - patch_q|)
 *
 * High β + smooth field → strong restriction → tight gluing → large spectral
 * gap. Heterogeneous field → weak restriction → small gap → many almost-global
 * sections.
 */
export function sheafLaplacian(patches: number[], beta = 5): number[][] {
    const n = patches.length;
    const L: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0));
    for (let p = 0; p < n; p++) {
        const q = (p + 1) % n;
        const w = Math.exp(-beta * Math.abs(patches[p] - patches[q]));
        const c = w * w;
        L[p][p] += c;
        L[q][q] += c;
        L[p][q] -= c;
        L[q][p] -= c;
    }
    return L;
}

/**
 * Cyclic Jacobi eigendecomposition for a small symmetric matrix. Returns
 * eigenvalues sorted ascending. Adequate for n ≤ 32.
 */
export function symmetricEigenvalues(M: number[][], maxIter = 60, tol = 1e-9): number[] {
    const n = M.length;
    const A = M.map((row) => [...row]);
    for (let iter = 0; iter < maxIter; iter++) {
        let p = 0, q = 1;
        let maxOff = Math.abs(A[0][1]);
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const a = Math.abs(A[i][j]);
                if (a > maxOff) {
                    maxOff = a;
                    p = i;
                    q = j;
                }
            }
        }
        if (maxOff < tol) break;
        const phi = 0.5 * Math.atan2(2 * A[p][q], A[q][q] - A[p][p]);
        const c = Math.cos(phi);
        const s = Math.sin(phi);
        const App = A[p][p];
        const Aqq = A[q][q];
        const Apq = A[p][q];
        A[p][p] = c * c * App - 2 * s * c * Apq + s * s * Aqq;
        A[q][q] = s * s * App + 2 * s * c * Apq + c * c * Aqq;
        A[p][q] = 0;
        A[q][p] = 0;
        for (let i = 0; i < n; i++) {
            if (i !== p && i !== q) {
                const Aip = A[i][p];
                const Aiq = A[i][q];
                A[i][p] = c * Aip - s * Aiq;
                A[p][i] = A[i][p];
                A[i][q] = s * Aip + c * Aiq;
                A[q][i] = A[i][q];
            }
        }
    }
    const eigs = new Array<number>(n);
    for (let i = 0; i < n; i++) eigs[i] = A[i][i];
    return eigs.sort((a, b) => a - b);
}

export interface SpectrumStats {
    eigenvalues: number[];
    kernelDim: number;
    spectralGap: number;
}

/**
 * Decompose a list of sorted eigenvalues into a kernel (eigenvalues below
 * `kernelTol`) and a spectral gap (the smallest non-kernel eigenvalue).
 * For a connected weighted cycle the kernel always contains the constant
 * eigenvector, so kernelDim ≥ 1.
 */
export function spectrumStats(eigs: number[], kernelTol = 0.06): SpectrumStats {
    const kernel: number[] = [];
    const rest: number[] = [];
    for (const e of eigs) {
        if (Math.abs(e) < kernelTol) kernel.push(e);
        else rest.push(e);
    }
    const spectralGap = rest.length > 0 ? rest[0] : 0;
    return {
        eigenvalues: eigs,
        kernelDim: Math.max(1, kernel.length),
        spectralGap,
    };
}
