/**
 * Pure mechanics for the life-like metamaterial lattice.
 *
 * The viewer integrates a 2D mass-spring network: every connection is a linear
 * (Hookean) spring with an optional nonlinear stiffening term and an auxetic
 * (negative-Poisson) stiffness modulation. These helpers extract that exact
 * physics so it can be unit-checked and calibrated independently of the canvas.
 *
 * Conventions match components/Viewer/index.tsx:
 *   - restLength is the unit-cell spacing (cellSize)
 *   - springForce = k_eff * (distance - restLength) / distance   (per-axis it is
 *     multiplied by the component dx or dy, giving the Hookean restoring force)
 *   - strain = |distance - restLength| / restLength
 *   - effective stiffness rises with stored strain when the lattice is auxetic
 */

export interface Vec2 {
    x: number;
    y: number;
}

/** Euclidean distance between two points. */
export function distance(a: Vec2, b: Vec2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Engineering strain of a spring stretched from restLength to currentLength.
 * Positive under tension, positive (by abs) under compression too, since the
 * viewer tracks magnitude only.
 */
export function strain(currentLength: number, restLength: number): number {
    if (restLength === 0) return 0;
    return Math.abs(currentLength - restLength) / restLength;
}

/**
 * Signed axial strain (tension positive, compression negative). Useful for the
 * auxetic sign convention.
 */
export function signedStrain(currentLength: number, restLength: number): number {
    if (restLength === 0) return 0;
    return (currentLength - restLength) / restLength;
}

/**
 * Auxetic effective stiffness. A lattice with negative Poisson's ratio stiffens
 * as it carries strain: k_eff = k0 * (1 + |nu| * |strain|) when nu < 0, and is
 * unchanged (k_eff = k0) for ordinary (nu >= 0) materials. This is the same
 * `effectiveStiffness` expression used in the viewer's force loop, where the
 * "auxeticity" slider holds the Poisson ratio nu.
 */
export function effectiveStiffness(baseStiffness: number, poissonRatio: number, currentStrain: number): number {
    const poissonEffect = poissonRatio < 0 ? Math.abs(poissonRatio) : 0;
    return baseStiffness * (1 + poissonEffect * Math.abs(currentStrain));
}

/**
 * Scalar Hookean spring force used by the viewer:
 *   F = k_eff * (distance - restLength) / distance
 * The (… / distance) factor turns this into a per-unit-vector coefficient that
 * is then multiplied by the dx, dy components, so it is positive (restoring,
 * pulling the node back toward its neighbour) under extension and negative under
 * compression.
 */
export function springForce(
    currentLength: number,
    restLength: number,
    baseStiffness: number,
    poissonRatio: number,
    storedStrain = 0,
): number {
    if (currentLength === 0) return 0;
    const kEff = effectiveStiffness(baseStiffness, poissonRatio, storedStrain);
    return (kEff * (currentLength - restLength)) / currentLength;
}

/**
 * Nonlinear stiffening factor applied to the spring force in the viewer:
 *   factor = 1 + nonlinearity * sin(distance * 0.1)
 * At zero nonlinearity the factor is exactly 1 (purely linear Hookean response).
 */
export function nonlinearFactor(currentLength: number, nonlinearity: number): number {
    return 1 + nonlinearity * Math.sin(currentLength * 0.1);
}

/**
 * Lateral (transverse) strain predicted by a Poisson ratio for a given axial
 * strain: epsilon_lateral = -nu * epsilon_axial. For an auxetic material
 * (nu < 0) a positive (tensile) axial strain gives a positive lateral strain,
 * i.e. the material expands sideways instead of necking in.
 */
export function lateralStrain(axialStrain: number, poissonRatio: number): number {
    return -poissonRatio * axialStrain;
}

/**
 * Kinetic-plus-elastic energy proxy reported per node by the viewer:
 *   E = 0.5 * (vx^2 + vy^2) + 0.5 * stress^2
 */
export function nodeEnergy(velocity: Vec2, stress: number): number {
    return 0.5 * (velocity.x * velocity.x + velocity.y * velocity.y) + 0.5 * stress * stress;
}
