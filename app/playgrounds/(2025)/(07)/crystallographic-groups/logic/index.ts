/**
 * Exact group-theoretic properties of the 17 wallpaper (plane crystallographic)
 * groups, derived directly from the motif construction in
 * components/Wallpaper2D/index.tsx.
 *
 * Each group's canvas routine builds an orbit of the base motif under the
 * point group of the cell: a list of (rotation angle, reflection flag) copies,
 * optionally on a centred or hexagonal lattice. The properties below read off
 * that exact, finite construction. Nothing here is fitted or stochastic: the
 * 17 groups are a closed mathematical classification (Fedorov 1891), and the
 * integers (point-group order, highest rotation order, mirror count) are exact.
 */

export type WallpaperGroupId =
    | 'p1' | 'p2' | 'pm' | 'pg' | 'cm'
    | 'pmm' | 'pmg' | 'pgg' | 'cmm'
    | 'p4' | 'p4m' | 'p4g'
    | 'p3' | 'p3m1' | 'p31m'
    | 'p6' | 'p6m';

export type LatticeType = 'oblique' | 'rectangular' | 'centred-rectangular' | 'square' | 'hexagonal';

export interface WallpaperGroupSpec {
    id: WallpaperGroupId;
    /** Order of the point group: number of distinct copies of the motif per lattice point. */
    pointGroupOrder: number;
    /** Highest order of rotational symmetry present (1, 2, 3, 4, or 6). */
    rotationOrder: 1 | 2 | 3 | 4 | 6;
    /** Whether the group contains a mirror reflection. */
    hasReflection: boolean;
    /** Whether the group contains a glide reflection. */
    hasGlide: boolean;
    /** Bravais lattice class the cell sits on. */
    lattice: LatticeType;
}

/**
 * The closed set of 17 plane groups. Order matches the navigation order in the
 * playground (wallpaperGroups). Point-group orders and rotation orders are the
 * standard crystallographic values and coincide with the motif-copy counts the
 * canvas draws.
 */
export const WALLPAPER_GROUPS: WallpaperGroupSpec[] = [
    { id: 'p1',   pointGroupOrder: 1,  rotationOrder: 1, hasReflection: false, hasGlide: false, lattice: 'oblique' },
    { id: 'p2',   pointGroupOrder: 2,  rotationOrder: 2, hasReflection: false, hasGlide: false, lattice: 'oblique' },
    { id: 'pm',   pointGroupOrder: 2,  rotationOrder: 1, hasReflection: true,  hasGlide: false, lattice: 'rectangular' },
    { id: 'pg',   pointGroupOrder: 2,  rotationOrder: 1, hasReflection: false, hasGlide: true,  lattice: 'rectangular' },
    { id: 'cm',   pointGroupOrder: 2,  rotationOrder: 1, hasReflection: true,  hasGlide: true,  lattice: 'centred-rectangular' },
    { id: 'pmm',  pointGroupOrder: 4,  rotationOrder: 2, hasReflection: true,  hasGlide: false, lattice: 'rectangular' },
    { id: 'pmg',  pointGroupOrder: 4,  rotationOrder: 2, hasReflection: true,  hasGlide: true,  lattice: 'rectangular' },
    { id: 'pgg',  pointGroupOrder: 4,  rotationOrder: 2, hasReflection: false, hasGlide: true,  lattice: 'rectangular' },
    { id: 'cmm',  pointGroupOrder: 4,  rotationOrder: 2, hasReflection: true,  hasGlide: true,  lattice: 'centred-rectangular' },
    { id: 'p4',   pointGroupOrder: 4,  rotationOrder: 4, hasReflection: false, hasGlide: false, lattice: 'square' },
    { id: 'p4m',  pointGroupOrder: 8,  rotationOrder: 4, hasReflection: true,  hasGlide: true,  lattice: 'square' },
    { id: 'p4g',  pointGroupOrder: 8,  rotationOrder: 4, hasReflection: true,  hasGlide: true,  lattice: 'square' },
    { id: 'p3',   pointGroupOrder: 3,  rotationOrder: 3, hasReflection: false, hasGlide: false, lattice: 'hexagonal' },
    { id: 'p3m1', pointGroupOrder: 6,  rotationOrder: 3, hasReflection: true,  hasGlide: true,  lattice: 'hexagonal' },
    { id: 'p31m', pointGroupOrder: 6,  rotationOrder: 3, hasReflection: true,  hasGlide: true,  lattice: 'hexagonal' },
    { id: 'p6',   pointGroupOrder: 6,  rotationOrder: 6, hasReflection: false, hasGlide: false, lattice: 'hexagonal' },
    { id: 'p6m',  pointGroupOrder: 12, rotationOrder: 6, hasReflection: true,  hasGlide: true,  lattice: 'hexagonal' },
];

const BY_ID: Record<string, WallpaperGroupSpec> = Object.fromEntries(
    WALLPAPER_GROUPS.map((g) => [g.id, g]),
);

/** Total number of distinct wallpaper groups (a closed classification): 17. */
export const WALLPAPER_GROUP_COUNT = WALLPAPER_GROUPS.length;

export function getGroup(id: string): WallpaperGroupSpec {
    const g = BY_ID[id];
    if (!g) throw new Error(`unknown wallpaper group: ${id}`);
    return g;
}

/** Highest order of rotational symmetry of a named group. */
export function rotationOrder(id: string): number {
    return getGroup(id).rotationOrder;
}

/** Order of the point group (number of motif copies per cell). */
export function pointGroupOrder(id: string): number {
    return getGroup(id).pointGroupOrder;
}

/** Whether the group contains at least one mirror line. */
export function hasReflection(id: string): boolean {
    return getGroup(id).hasReflection;
}

/** Whether the group contains a glide reflection. */
export function hasGlide(id: string): boolean {
    return getGroup(id).hasGlide;
}

/** Bravais lattice class of the group. */
export function latticeType(id: string): LatticeType {
    return getGroup(id).lattice;
}

/**
 * The crystallographic restriction theorem: in the plane only rotation orders
 * 1, 2, 3, 4, 6 can occur. This returns whether a candidate order is allowed.
 */
export function isCrystallographicRotation(n: number): boolean {
    return n === 1 || n === 2 || n === 3 || n === 4 || n === 6;
}

/** Distinct rotation orders that actually occur across the 17 groups. */
export function distinctRotationOrders(): number[] {
    return Array.from(new Set(WALLPAPER_GROUPS.map((g) => g.rotationOrder))).sort((a, b) => a - b);
}

/** Number of groups that contain a reflection. */
export function reflectionGroupCount(): number {
    return WALLPAPER_GROUPS.filter((g) => g.hasReflection).length;
}
