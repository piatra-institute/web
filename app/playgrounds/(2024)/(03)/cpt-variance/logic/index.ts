/**
 * Pure model for the CPT variance playground.
 *
 * A particle state is the minimal object the discrete symmetries act on: a
 * position, a momentum (velocity), a charge, and a matter / antimatter label.
 * Charge conjugation (C), parity inversion (P) and time reversal (T) are the
 * exact linear involutions used by the Viewer; their composition CPT is the
 * combined operation the CPT theorem says leaves relativistic quantum field
 * theory invariant.
 *
 * The "violation" sliders are a transparent toy: each individual symmetry can
 * be softened, but CPT itself is the protected quantity. The matter-antimatter
 * asymmetry is the same linear readout the bar chart draws.
 */


export type Species = 'matter' | 'antimatter';


export interface ParticleState {
    /** position in the plane */
    x: number;
    y: number;
    /** momentum / velocity components */
    vx: number;
    vy: number;
    /** electric charge, in units of e */
    charge: number;
    /** matter or antimatter label */
    species: Species;
}


/**
 * Charge conjugation C.
 *
 * Flips the sign of all internal charges and swaps a particle for its
 * antiparticle. Spacetime coordinates and momenta are untouched. C is an
 * involution: applying it twice returns the original particle.
 */
export function conjugateC(s: ParticleState): ParticleState {
    return {
        ...s,
        charge: -s.charge,
        species: s.species === 'matter' ? 'antimatter' : 'matter',
    };
}


/**
 * Parity inversion P.
 *
 * Inverts the spatial coordinates through the origin, x -> -x, which also
 * reverses the momentum direction (a polar vector). Charge and species are
 * preserved. P is an involution.
 */
export function parityP(s: ParticleState): ParticleState {
    return {
        ...s,
        x: -s.x,
        y: -s.y,
        vx: -s.vx,
        vy: -s.vy,
    };
}


/**
 * Time reversal T.
 *
 * Reverses the arrow of time, which flips momenta (v -> -v) while leaving
 * positions, charge and species unchanged. T is an involution at the level of
 * this classical state.
 */
export function timeReversalT(s: ParticleState): ParticleState {
    return {
        ...s,
        vx: -s.vx,
        vy: -s.vy,
    };
}


/**
 * Combined CPT transformation, applied in the order C then P then T.
 *
 * Net effect on this state: charge flips, species flips, position inverts, and
 * the momentum is reversed twice (once by P, once by T) so it returns to its
 * original value.
 */
export function applyCPT(s: ParticleState): ParticleState {
    return timeReversalT(parityP(conjugateC(s)));
}


/** Euclidean distance between two states over the full (x, y, vx, vy) tuple. */
export function stateDistance(a: ParticleState, b: ParticleState): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    return Math.sqrt(dx * dx + dy * dy + dvx * dvx + dvy * dvy);
}


/** True when two states share position, momentum, charge and species. */
export function statesEqual(a: ParticleState, b: ParticleState): boolean {
    return (
        stateDistance(a, b) < 1e-9 &&
        a.charge === b.charge &&
        a.species === b.species
    );
}


/**
 * A scalar CPT invariant for a state.
 *
 * Under CPT, charge and species both flip sign while the squared momentum and
 * the squared position are unchanged. The product (charge * speciesSign) is
 * therefore preserved together with the kinematic magnitudes, so this combined
 * quantity is a genuine CPT scalar for the toy state.
 */
export function cptInvariant(s: ParticleState): number {
    const speciesSign = s.species === 'matter' ? 1 : -1;
    const p2 = s.vx * s.vx + s.vy * s.vy;
    const r2 = s.x * s.x + s.y * s.y;
    return (s.charge * speciesSign) + p2 - r2;
}


/**
 * Matter-antimatter asymmetry produced by a CPT-violating parameter.
 *
 * Mirrors the Viewer's bar chart: matter fraction = 0.5 + 5 * eps, antimatter
 * fraction = 0.5 - 5 * eps, so the asymmetry Delta = matter - antimatter is
 * exactly 10 * eps. At eps = 0 (exact CPT) the asymmetry vanishes.
 */
export function matterAntimatterAsymmetry(cptViolation: number): number {
    const matter = 0.5 + cptViolation * 5;
    const antimatter = 0.5 - cptViolation * 5;
    return matter - antimatter;
}


/** A neutral, asymmetric reference state used by calibration and tests. */
export function referenceState(): ParticleState {
    return {
        x: 3,
        y: -2,
        vx: 1.5,
        vy: -0.5,
        charge: 1,
        species: 'matter',
    };
}
