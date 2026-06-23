// The on-screen field visualization is illustrative (see assumptions). This
// module implements the one piece of real, checkable physics the playground is
// actually about: Noether's theorem, that a continuous symmetry implies a
// conserved quantity. The cleanest concrete instance is the simple harmonic
// oscillator. Its equations of motion are invariant under time translation when
// the parameters are constant, and the conserved quantity that symmetry implies
// is the energy. Break the symmetry (make the system explicitly time-dependent)
// and energy is no longer conserved. These are pure functions used by the
// calibration.

export interface OscState { x: number; v: number; }

// energy of a unit-mass harmonic oscillator: E = 1/2 v^2 + 1/2 omega^2 x^2
export function oscillatorEnergy(s: OscState, omega: number): number {
    return 0.5 * s.v * s.v + 0.5 * omega * omega * s.x * s.x;
}

// one symplectic (velocity-Verlet) step of x'' = -omega^2 x. Velocity-Verlet is
// used because it conserves energy to high accuracy over long runs, which is what
// lets us check Noether's theorem numerically.
export function verletStep(s: OscState, omega: number, dt: number): OscState {
    const a0 = -omega * omega * s.x;
    const x = s.x + s.v * dt + 0.5 * a0 * dt * dt;
    const a1 = -omega * omega * x;
    const v = s.v + 0.5 * (a0 + a1) * dt;
    return { x, v };
}

// integrate the time-translation-symmetric oscillator and return the relative
// energy drift over the run. Under the symmetry this is ~0 (energy conserved).
export function energyDriftSymmetric(s0: OscState, omega: number, dt: number, steps: number): number {
    const e0 = oscillatorEnergy(s0, omega);
    let s = s0;
    for (let i = 0; i < steps; i++) s = verletStep(s, omega, dt);
    const e1 = oscillatorEnergy(s, omega);
    return Math.abs(e1 - e0) / e0;
}

// break time-translation symmetry by ramping the stiffness in time
// (omega depends on t). Energy is then no longer conserved, so the drift is
// large: symmetry broken, conservation lost.
export function energyDriftBroken(s0: OscState, omega0: number, ramp: number, dt: number, steps: number): number {
    const e0 = oscillatorEnergy(s0, omega0);
    let s = s0;
    for (let i = 0; i < steps; i++) {
        const omega = omega0 * (1 + ramp * i * dt);
        s = verletStep(s, omega, dt);
    }
    // measure energy against the final (changed) stiffness
    const omegaFinal = omega0 * (1 + ramp * steps * dt);
    const e1 = oscillatorEnergy(s, omegaFinal);
    return Math.abs(e1 - e0) / e0;
}
