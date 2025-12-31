/**
 * Knot algorithms for the Unknot Studio playground
 *
 * Implements torus knot generation, connected sum construction,
 * and various knot diagnostics (crossing count, writhe, thickness, etc.)
 */

const TAU = Math.PI * 2;

// ============================================
// Types
// ============================================

export type Vec3 = { x: number; y: number; z: number };
export type Vec2 = { x: number; y: number };

export type KnotSpec = {
    p: number;
    q: number;
    mirror: boolean;
    R: number;
    r: number;
};

export type CrossingSummary = {
    count: number;
    writhe: number;
};

export type KnotDiagnostics = {
    length: number;
    thickness: number;
    ropelength: number;
    crossing: CrossingSummary;
};

// ============================================
// Math Helpers
// ============================================

export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const t = a % b;
        a = b;
        b = t;
    }
    return a;
}

export function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
}

export function add3(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub3(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function mul3(a: Vec3, s: number): Vec3 {
    return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function dot3(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function len3(a: Vec3): number {
    return Math.hypot(a.x, a.y, a.z);
}

export function dist3(a: Vec3, b: Vec3): number {
    return len3(sub3(a, b));
}

export function rotateXYZ(v: Vec3, rx: number, ry: number, rz: number): Vec3 {
    let x = v.x, y = v.y, z = v.z;

    // Rotate around X
    const cx = Math.cos(rx), sx = Math.sin(rx);
    {
        const y2 = y * cx - z * sx;
        const z2 = y * sx + z * cx;
        y = y2;
        z = z2;
    }

    // Rotate around Y
    const cy = Math.cos(ry), sy = Math.sin(ry);
    {
        const x2 = x * cy + z * sy;
        const z2 = -x * sy + z * cy;
        x = x2;
        z = z2;
    }

    // Rotate around Z
    const cz = Math.cos(rz), sz = Math.sin(rz);
    {
        const x2 = x * cz - y * sz;
        const y2 = x * sz + y * cz;
        x = x2;
        y = y2;
    }

    return { x, y, z };
}

export function centerAndScale(points: Vec3[], targetRadius = 1.0): Vec3[] {
    if (!points.length) return points;

    let c = { x: 0, y: 0, z: 0 };
    for (const p of points) c = add3(c, p);
    c = mul3(c, 1 / points.length);

    const centered = points.map((p) => sub3(p, c));
    let maxR = 0;
    for (const p of centered) maxR = Math.max(maxR, len3(p));
    const s = maxR > 0 ? targetRadius / maxR : 1;
    return centered.map((p) => mul3(p, s));
}

// ============================================
// Knot Geometry
// ============================================

export function torusKnotPoints(spec: KnotSpec, samples: number): Vec3[] {
    const { p, q, mirror, R, r } = spec;
    const pts: Vec3[] = [];

    for (let i = 0; i < samples; i++) {
        const t = (TAU * i) / samples;
        const ctq = Math.cos(q * t);
        const stq = Math.sin(q * t);
        const ctp = Math.cos(p * t);
        const stp = Math.sin(p * t);

        // Standard embedded torus knot
        const x = (R + r * ctq) * ctp;
        const y = (R + r * ctq) * stp;
        const z = r * stq;
        pts.push({ x, y: mirror ? -y : y, z });
    }

    return pts;
}

function reverseCurve(points: Vec3[]): Vec3[] {
    return [...points].reverse();
}

export function connectedSumApprox(
    a: Vec3[],
    b: Vec3[],
    opts?: { gap?: number; sep?: number; bridgeN?: number; flipB?: boolean }
): Vec3[] {
    const gap = opts?.gap ?? 12;
    const sep = opts?.sep ?? 2.3;
    const bridgeN = opts?.bridgeN ?? 80;
    const flipB = opts?.flipB ?? false;

    if (a.length < 10 || b.length < 10) return [];

    // Normalize each to radius 1, then separate in x
    const A = centerAndScale(a, 1.0).map((p) => add3(p, { x: -sep, y: 0, z: 0 }));
    let B = centerAndScale(b, 1.0);
    if (flipB) B = reverseCurve(B);
    B = B.map((p) => add3(p, { x: sep, y: 0, z: 0 }));

    // Pick cut locations: rightmost point of A, leftmost point of B
    let cutA = 0, cutB = 0;
    for (let i = 1; i < A.length; i++) if (A[i].x > A[cutA].x) cutA = i;
    for (let i = 1; i < B.length; i++) if (B[i].x < B[cutB].x) cutB = i;

    function openCurve(P: Vec3[], cut: number): { open: Vec3[]; start: Vec3; end: Vec3 } {
        const n = P.length;
        const startIdx = (cut + gap) % n;
        const endIdx = (cut - gap + n) % n;

        const open: Vec3[] = [];
        let i = startIdx;
        while (i !== endIdx) {
            open.push(P[i]);
            i = (i + 1) % n;
        }
        open.push(P[endIdx]);

        return { open, start: open[0], end: open[open.length - 1] };
    }

    const Ao = openCurve(A, cutA);
    const Bo = openCurve(B, cutB);

    // Two bridges: A.end -> B.start and B.end -> A.start
    function bezier3(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, n: number): Vec3[] {
        const pts: Vec3[] = [];
        for (let i = 1; i <= n; i++) {
            const t = i / (n + 1);
            const u = 1 - t;
            const b0 = u * u * u;
            const b1 = 3 * u * u * t;
            const b2 = 3 * u * t * t;
            const b3 = t * t * t;
            pts.push({
                x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
                y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
                z: b0 * p0.z + b1 * p1.z + b2 * p2.z + b3 * p3.z,
            });
        }
        return pts;
    }

    const nudge = 0.5; // small y-offset to keep bridges from overlapping

    const Aend = Ao.end;
    const Astart = Ao.start;
    const Bend = Bo.end;
    const Bstart = Bo.start;

    const bridge1 = bezier3(
        Aend,
        add3(Aend, { x: 0.6, y: nudge, z: 0 }),
        add3(Bstart, { x: -0.6, y: nudge, z: 0 }),
        Bstart,
        bridgeN
    );
    const bridge2 = bezier3(
        Bend,
        add3(Bend, { x: -0.6, y: -nudge, z: 0 }),
        add3(Astart, { x: 0.6, y: -nudge, z: 0 }),
        Astart,
        bridgeN
    );

    return [...Ao.open, ...bridge1, ...Bo.open, ...bridge2];
}

// ============================================
// Diagnostics
// ============================================

export function polylineLength(points: Vec3[]): number {
    let L = 0;
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b = points[(i + 1) % points.length];
        L += dist3(a, b);
    }
    return L;
}

export function approxThickness(points: Vec3[], stride = 3, excludeNeighborhood = 12): number {
    // Very rough: min distance between non-neighboring points
    if (points.length < 10) return 0;
    let minD = Infinity;
    const n = points.length;

    for (let i = 0; i < n; i += stride) {
        for (let j = i + excludeNeighborhood; j < n; j += stride) {
            // Avoid near wrap-around neighbors
            if (Math.abs(n - (j - i)) < excludeNeighborhood) continue;
            const d = dist3(points[i], points[j]);
            if (d < minD) minD = d;
        }
    }

    return minD === Infinity ? 0 : minD;
}

function segIntersect2D(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): { hit: boolean; ta?: number; tb?: number } {
    const dax = a2.x - a1.x;
    const day = a2.y - a1.y;
    const dbx = b2.x - b1.x;
    const dby = b2.y - b1.y;

    const det = dax * (-dby) - day * (-dbx);
    if (Math.abs(det) < 1e-9) return { hit: false };

    const cx = b1.x - a1.x;
    const cy = b1.y - a1.y;

    const ta = (cx * (-dby) - cy * (-dbx)) / det;
    const tb = (dax * cy - day * cx) / det;

    if (ta > 0 && ta < 1 && tb > 0 && tb < 1) return { hit: true, ta, tb };
    return { hit: false };
}

export function crossingSummaryFromProjection(
    points3: Vec3[],
    rx: number,
    ry: number,
    rz: number,
    downsampleTo = 350
): CrossingSummary {
    if (points3.length < 10) return { count: 0, writhe: 0 };

    // Downsample uniformly for O(n²) crossing scan
    const n = points3.length;
    const step = Math.max(1, Math.floor(n / downsampleTo));
    const pts: Vec3[] = [];
    for (let i = 0; i < n; i += step) pts.push(points3[i]);

    // Rotate and project to 2D
    const rot: Vec3[] = pts.map((p) => rotateXYZ(p, rx, ry, rz));
    const pts2: Vec2[] = rot.map((p) => ({ x: p.x, y: p.y }));

    const m = pts2.length;
    let count = 0;
    let writhe = 0;

    // Compare all non-adjacent segment pairs
    for (let i = 0; i < m; i++) {
        const i2 = (i + 1) % m;
        const a1 = pts2[i];
        const a2 = pts2[i2];
        const va = { x: a2.x - a1.x, y: a2.y - a1.y };

        for (let j = i + 2; j < m; j++) {
            const j2 = (j + 1) % m;
            // Skip adjacent or same segment and near wrap adjacency
            if (i === j || i2 === j || j2 === i) continue;
            if (i === 0 && j2 === m - 1) continue;

            const b1 = pts2[j];
            const b2 = pts2[j2];
            const vb = { x: b2.x - b1.x, y: b2.y - b1.y };

            const hit = segIntersect2D(a1, a2, b1, b2);
            if (!hit.hit) continue;

            count++;
            // Signed crossing (writhe) uses orientation of strands in the projection
            const det = va.x * vb.y - va.y * vb.x;
            writhe += det > 0 ? 1 : -1;
        }
    }

    // Each crossing is approximately double-counted; halve and round
    return {
        count: Math.round(count / 2),
        writhe: Math.round(writhe / 2),
    };
}

export function computeDiagnostics(
    curve: Vec3[],
    rx: number,
    ry: number,
    rz: number
): KnotDiagnostics {
    const length = polylineLength(curve);
    const thickness = approxThickness(curve, 4, 14);
    const ropelength = thickness > 0 ? length / thickness : NaN;
    const crossing = crossingSummaryFromProjection(curve, rx, ry, rz, 320);

    return { length, thickness, ropelength, crossing };
}

// ============================================
// Tighten (Smoothing + Repulsion)
// ============================================

export function smoothAndRepel(
    points: Vec3[],
    iters: number,
    stiffness: number,
    repel: number
): Vec3[] {
    const n = points.length;
    if (n < 10) return points;

    let P = points.map((p) => ({ ...p }));
    const neighbor = 1;
    const repelStride = 5;

    for (let iter = 0; iter < iters; iter++) {
        // Laplacian smoothing
        const next = P.map((p) => ({ ...p }));

        for (let i = 0; i < n; i++) {
            const prev = P[(i - neighbor + n) % n];
            const curr = P[i];
            const nextp = P[(i + neighbor) % n];
            const avg = mul3(add3(prev, nextp), 0.5);
            const delta = sub3(avg, curr);
            next[i] = add3(curr, mul3(delta, stiffness));
        }

        // Soft repulsion between far-apart samples
        for (let i = 0; i < n; i += repelStride) {
            for (let j = i + 20; j < n; j += repelStride) {
                if (Math.abs(n - (j - i)) < 20) continue;
                const d = sub3(next[i], next[j]);
                const r = len3(d);
                if (r < 1e-6) continue;
                const push = repel / (r * r);
                const u = mul3(d, push / r);
                next[i] = add3(next[i], u);
                next[j] = sub3(next[j], u);
            }
        }

        // Recenter and renormalize scale
        P = centerAndScale(next, 1.0);
    }

    return P;
}

// ============================================
// Knot Invariants (Closed-Form for Torus Knots)
// ============================================

export function torusUnknottingNumber(p: number, q: number): number | null {
    // Valid for coprime positive integers (torus knot; otherwise a link)
    if (p <= 0 || q <= 0) return null;
    if (gcd(p, q) !== 1) return null;
    return ((p - 1) * (q - 1)) / 2;
}

export function torusCrossingNumber(p: number, q: number): number | null {
    if (p <= 0 || q <= 0) return null;
    if (gcd(p, q) !== 1) return null;
    return Math.min((p - 1) * q, (q - 1) * p);
}

export function isBHCounterexample(a: KnotSpec, b: KnotSpec): boolean {
    // Brittenham-Hermiller (2025): (2,7) torus knot and its mirror
    const is27 = (k: KnotSpec) => k.p === 2 && k.q === 7;
    return is27(a) && is27(b) && a.mirror !== b.mirror;
}

// ============================================
// Formatting
// ============================================

export function fmt(n: number, digits = 3): string {
    if (!Number.isFinite(n)) return "—";
    return n.toFixed(digits);
}
