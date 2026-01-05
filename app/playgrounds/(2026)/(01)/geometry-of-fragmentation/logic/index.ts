import { Delaunay } from 'd3-delaunay';

// PRNG
export function mulberry32(seed: number) {
    let a = seed >>> 0;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Geometry utilities
const EPS = 1e-9;

export interface Point {
    x: number;
    y: number;
}

export type Polygon = Point[];

export const vAdd = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
export const vSub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
export const vMul = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
export const dot = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;
export const perp = (a: Point): Point => ({ x: -a.y, y: a.x });
export const len = (a: Point): number => Math.hypot(a.x, a.y);
export const norm = (a: Point): Point => {
    const l = len(a);
    if (l < EPS) return { x: 1, y: 0 };
    return { x: a.x / l, y: a.y / l };
};

export function polygonArea(poly: Polygon): number {
    let s = 0;
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i];
        const q = poly[(i + 1) % poly.length];
        s += p.x * q.y - q.x * p.y;
    }
    return 0.5 * s;
}

export function polygonCentroid(poly: Polygon): Point {
    const A = polygonArea(poly);
    if (Math.abs(A) < EPS) {
        const s = poly.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return { x: s.x / poly.length, y: s.y / poly.length };
    }
    let cx = 0, cy = 0;
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i];
        const q = poly[(i + 1) % poly.length];
        const cross = p.x * q.y - q.x * p.y;
        cx += (p.x + q.x) * cross;
        cy += (p.y + q.y) * cross;
    }
    const f = 1 / (6 * A);
    return { x: cx * f, y: cy * f };
}

function clipConvexPolygonHalfPlane(poly: Polygon, p0: Point, n: Point): Polygon {
    const out: Point[] = [];
    for (let i = 0; i < poly.length; i++) {
        const A = poly[i];
        const B = poly[(i + 1) % poly.length];
        const da = dot(vSub(A, p0), n);
        const db = dot(vSub(B, p0), n);
        const Ain = da >= -1e-12;
        const Bin = db >= -1e-12;

        if (Ain && Bin) {
            out.push(B);
        } else if (Ain && !Bin) {
            const t = da / (da - db + EPS);
            out.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t });
        } else if (!Ain && Bin) {
            const t = da / (da - db + EPS);
            out.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t });
            out.push(B);
        }
    }

    const cleaned: Point[] = [];
    for (const p of out) {
        const last = cleaned[cleaned.length - 1];
        if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 1e-10) cleaned.push(p);
    }
    if (cleaned.length >= 2) {
        const first = cleaned[0];
        const last = cleaned[cleaned.length - 1];
        if (Math.hypot(first.x - last.x, first.y - last.y) < 1e-10) cleaned.pop();
    }
    return cleaned;
}

function splitConvexPolygonByLine(poly: Polygon, linePoint: Point, lineDir: Point): [Polygon, Polygon] | null {
    const d = norm(lineDir);
    const n = perp(d);

    const left = clipConvexPolygonHalfPlane(poly, linePoint, n);
    const right = clipConvexPolygonHalfPlane(poly, linePoint, vMul(n, -1));

    if (left.length < 3 || right.length < 3) return null;

    const A1 = polygonArea(left);
    const A2 = polygonArea(right);
    const p1 = A1 < 0 ? [...left].reverse() : left;
    const p2 = A2 < 0 ? [...right].reverse() : right;
    return [p1, p2];
}

function projectRange(poly: Polygon, axis: Point): [number, number] {
    let mn = Infinity, mx = -Infinity;
    for (const p of poly) {
        const t = dot(p, axis);
        if (t < mn) mn = t;
        if (t > mx) mx = t;
    }
    return [mn, mx];
}

// Statistics
function quantizeKey(p: Point, q = 1e-3): string {
    const x = Math.round(p.x / q) * q;
    const y = Math.round(p.y / q) * q;
    return `${x.toFixed(3)},${y.toFixed(3)}`;
}

export interface MosaicStats {
    cells: number;
    vertices: number;
    avgSides: number;
    avgDegree: number;
    sidesHist: { k: string; count: number }[];
    degreeHist: { k: string; count: number }[];
}

export function computeStats(polys: Polygon[]): MosaicStats {
    const sides = polys.map((p) => p.length);
    const avgSides = sides.length ? sides.reduce((a, b) => a + b, 0) / sides.length : 0;

    const vertMap = new Map<string, Set<number>>();
    for (let i = 0; i < polys.length; i++) {
        for (const v of polys[i]) {
            const k = quantizeKey(v);
            if (!vertMap.has(k)) vertMap.set(k, new Set());
            vertMap.get(k)!.add(i);
        }
    }
    const degrees = Array.from(vertMap.values()).map((s) => s.size);
    const avgDegree = degrees.length ? degrees.reduce((a, b) => a + b, 0) / degrees.length : 0;

    const sidesCounts = new Map<number, number>();
    for (const s of sides) sidesCounts.set(s, (sidesCounts.get(s) || 0) + 1);

    const degreeCounts = new Map<number, number>();
    for (const d of degrees) degreeCounts.set(d, (degreeCounts.get(d) || 0) + 1);

    const sidesHist = Array.from(sidesCounts.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([k, v]) => ({ k: String(k), count: v }));

    const degreeHist = Array.from(degreeCounts.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([k, v]) => ({ k: String(k), count: v }));

    return { cells: polys.length, vertices: degrees.length, avgSides, avgDegree, sidesHist, degreeHist };
}

// Mosaic generators
export type GeneratorMode = 'random' | 'voronoi' | 'mixed';

export interface GeneratorParams {
    mode: GeneratorMode;
    splits: number;
    sites: number;
    seed: number;
    angleBias: number;
    minArea: number;
}

export interface HistoryPoint {
    step: number;
    avgSides: number;
    avgDegree: number;
    polys: Polygon[]; // Snapshot of polygons at this step
}

export interface GeneratorResult {
    polys: Polygon[];
    history: HistoryPoint[];
}

export function generateRandomSplits(params: {
    splits: number;
    seed: number;
    angleBias: number;
    minArea: number;
    storeEvery: number;
}): GeneratorResult {
    const rnd = mulberry32(params.seed);
    let polys: Polygon[] = [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }],
    ];
    const history: HistoryPoint[] = [];

    function choosePolyIndex(): number {
        const areas = polys.map((p) => Math.abs(polygonArea(p)));
        const total = areas.reduce((a, b) => a + b, 0);
        if (total < EPS) return Math.floor(rnd() * polys.length);
        let r = rnd() * total;
        for (let i = 0; i < areas.length; i++) {
            r -= areas[i];
            if (r <= 0) return i;
        }
        return areas.length - 1;
    }

    function biasedAngle(): number {
        const theta = rnd() * Math.PI;
        if (params.angleBias <= 0) return theta;
        const snaps = [0, Math.PI / 2];
        let nearest = 0, minD = Infinity;
        for (const s of snaps) {
            const d = Math.min(Math.abs(theta - s), Math.abs(theta - s - Math.PI), Math.abs(theta - s + Math.PI));
            if (d < minD) { minD = d; nearest = s; }
        }
        return theta * (1 - params.angleBias) + nearest * params.angleBias;
    }

    for (let k = 0; k < params.splits; k++) {
        const idx = choosePolyIndex();
        const poly = polys[idx];
        const area = Math.abs(polygonArea(poly));
        if (area < params.minArea) continue;

        const c = polygonCentroid(poly);
        let split: [Polygon, Polygon] | null = null;

        for (let tries = 0; tries < 6 && !split; tries++) {
            const th = biasedAngle();
            const dir = { x: Math.cos(th), y: Math.sin(th) };
            const n = perp(dir);
            const [mn, mx] = projectRange(poly, n);
            const t = mn + (mx - mn) * rnd();
            const cur = dot(c, n);
            const p0 = vAdd(c, vMul(n, t - cur));
            const candidate = splitConvexPolygonByLine(poly, p0, dir);
            if (!candidate) continue;
            const a1 = Math.abs(polygonArea(candidate[0]));
            const a2 = Math.abs(polygonArea(candidate[1]));
            if (a1 < params.minArea || a2 < params.minArea) continue;
            split = candidate;
        }

        if (!split) continue;
        polys.splice(idx, 1, split[0], split[1]);

        if (params.storeEvery > 0 && (k % params.storeEvery === 0 || k === params.splits - 1)) {
            const s = computeStats(polys);
            const snapshot = polys.map(p => p.map(pt => ({ ...pt })));
            history.push({ step: k + 1, avgSides: s.avgSides, avgDegree: s.avgDegree, polys: snapshot });
        }
    }

    // Add initial state at the beginning
    if (history.length === 0 || history[0].step > 0) {
        const initialPolys: Polygon[] = [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]];
        const s = computeStats(initialPolys);
        history.unshift({ step: 0, avgSides: s.avgSides, avgDegree: s.avgDegree, polys: initialPolys });
    }

    return { polys, history };
}

export function generateVoronoi(params: { sites: number; seed: number }): GeneratorResult {
    const rnd = mulberry32(params.seed);
    const pts: [number, number][] = [];
    for (let i = 0; i < params.sites; i++) {
        pts.push([rnd(), rnd()]);
    }
    const del = Delaunay.from(pts);
    const vor = del.voronoi([0, 0, 1, 1]);
    const polys: Polygon[] = [];
    for (let i = 0; i < pts.length; i++) {
        const cell = vor.cellPolygon(i);
        if (!cell || cell.length < 4) continue;
        const poly = cell.slice(0, -1).map(([x, y]) => ({ x, y }));
        const A = polygonArea(poly);
        polys.push(A < 0 ? [...poly].reverse() : poly);
    }
    const s = computeStats(polys);
    const snapshot = polys.map(p => p.map(pt => ({ ...pt })));
    return { polys, history: [{ step: 0, avgSides: s.avgSides, avgDegree: s.avgDegree, polys: snapshot }] };
}

export function generateMixed(params: {
    sites: number;
    splits: number;
    seed: number;
    angleBias: number;
    minArea: number;
    storeEvery: number;
}): GeneratorResult {
    const base = generateVoronoi({ sites: params.sites, seed: params.seed });
    const rnd = mulberry32(params.seed ^ 0x9e3779b9);
    let polys = base.polys;
    const s0 = computeStats(polys);
    const snapshot0 = polys.map(p => p.map(pt => ({ ...pt })));
    const history: HistoryPoint[] = [{ step: 0, avgSides: s0.avgSides, avgDegree: s0.avgDegree, polys: snapshot0 }];

    function choosePolyIndex(): number {
        const areas = polys.map((p) => Math.abs(polygonArea(p)));
        const total = areas.reduce((a, b) => a + b, 0);
        if (total < EPS) return Math.floor(rnd() * polys.length);
        let r = rnd() * total;
        for (let i = 0; i < areas.length; i++) {
            r -= areas[i];
            if (r <= 0) return i;
        }
        return areas.length - 1;
    }

    function biasedAngle(): number {
        const theta = rnd() * Math.PI;
        if (params.angleBias <= 0) return theta;
        const snaps = [0, Math.PI / 2];
        let nearest = 0, minD = Infinity;
        for (const s of snaps) {
            const d = Math.min(Math.abs(theta - s), Math.abs(theta - s - Math.PI), Math.abs(theta - s + Math.PI));
            if (d < minD) { minD = d; nearest = s; }
        }
        return theta * (1 - params.angleBias) + nearest * params.angleBias;
    }

    for (let k = 0; k < params.splits; k++) {
        const idx = choosePolyIndex();
        const poly = polys[idx];
        const area = Math.abs(polygonArea(poly));
        if (area < params.minArea) continue;

        const c = polygonCentroid(poly);
        const th = biasedAngle();
        const dir = { x: Math.cos(th), y: Math.sin(th) };
        const n = perp(dir);
        const [mn, mx] = projectRange(poly, n);
        const t = mn + (mx - mn) * rnd();
        const cur = dot(c, n);
        const p0 = vAdd(c, vMul(n, t - cur));

        const split = splitConvexPolygonByLine(poly, p0, dir);
        if (!split) continue;
        const a1 = Math.abs(polygonArea(split[0]));
        const a2 = Math.abs(polygonArea(split[1]));
        if (a1 < params.minArea || a2 < params.minArea) continue;
        polys.splice(idx, 1, split[0], split[1]);

        if (params.storeEvery > 0 && (k % params.storeEvery === 0 || k === params.splits - 1)) {
            const s = computeStats(polys);
            const snapshot = polys.map(p => p.map(pt => ({ ...pt })));
            history.push({ step: k + 1, avgSides: s.avgSides, avgDegree: s.avgDegree, polys: snapshot });
        }
    }

    return { polys, history };
}

export function generateMosaic(params: GeneratorParams & { storeEvery: number }): GeneratorResult {
    if (params.mode === 'voronoi') {
        return generateVoronoi({ sites: params.sites, seed: params.seed });
    }
    if (params.mode === 'mixed') {
        return generateMixed({
            sites: params.sites,
            splits: params.splits,
            seed: params.seed,
            angleBias: params.angleBias,
            minArea: params.minArea,
            storeEvery: params.storeEvery,
        });
    }
    return generateRandomSplits({
        splits: params.splits,
        seed: params.seed,
        angleBias: params.angleBias,
        minArea: params.minArea,
        storeEvery: params.storeEvery,
    });
}

// Reference attractors
export const ATTRACTORS = [
    { name: 'Square tiling (4,4)', avgSides: 4, avgDegree: 4 },
    { name: 'Voronoi-like (~6,~3)', avgSides: 6, avgDegree: 3 },
    { name: 'Triangle tiling (3,6)', avgSides: 3, avgDegree: 6 },
];
