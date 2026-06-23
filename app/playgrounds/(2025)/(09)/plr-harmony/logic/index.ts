// Neo-Riemannian harmony. The 24 major and minor triads are connected by three
// parsimonious transformations, each moving a single voice by a semitone or two
// while holding the other two notes fixed:
//   P (parallel): swap major/minor on the same root (C major <-> C minor)
//   L (leading-tone exchange): C major <-> E minor
//   R (relative): C major <-> A minor
// Each is an involution (its own inverse), and together they generate the
// dihedral group of order 24 acting simply transitively on the triads. These are
// the exact transforms; the Viewer uses the same ones. Pure functions used by the
// calibration.

export type Quality = 'M' | 'm';
export interface Triad { root: number; q: Quality; }

export function mod12(n: number): number {
    return ((n % 12) + 12) % 12;
}

// the three pitch classes of a triad (root, third, fifth)
export function triadPcs(t: Triad): number[] {
    const r = t.root;
    return t.q === 'M' ? [r, mod12(r + 4), mod12(r + 7)] : [r, mod12(r + 3), mod12(r + 7)];
}

export function triadEquals(a: Triad, b: Triad): boolean {
    return a.root === b.root && a.q === b.q;
}

export function P(t: Triad): Triad {
    return { root: t.root, q: t.q === 'M' ? 'm' : 'M' };
}

export function L(t: Triad): Triad {
    return t.q === 'M' ? { root: mod12(t.root + 4), q: 'm' } : { root: mod12(t.root - 4), q: 'M' };
}

export function R(t: Triad): Triad {
    return t.q === 'M' ? { root: mod12(t.root - 3), q: 'm' } : { root: mod12(t.root + 3), q: 'M' };
}

// number of pitch classes two triads share (the parsimony of the voice leading)
export function sharedPcs(a: Triad, b: Triad): number {
    const pb = new Set(triadPcs(b));
    return triadPcs(a).filter((pc) => pb.has(pc)).length;
}
