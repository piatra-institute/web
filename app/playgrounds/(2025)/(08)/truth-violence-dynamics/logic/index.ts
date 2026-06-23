// The model behind the simulation: three coupled states evolving by an ODE that
// the playground integrates with RK4.
//   u  grievance / punitive support
//   t  truth-seeking capacity (in [0,1])
//   v  support for violence (in [0,1])
// driven by exogenous emotion E, disinformation M, and institutional
// transparency IT. These are pure functions; the playground integrates the same
// equations inline, and the calibration checks them.

export interface Params {
    alpha0: number; alpha1: number; alpha2: number; alpha3: number; alpha4: number; alpha5: number;
    eta: number; beta1: number; beta2: number; beta3: number;
    lambda: number; phi: number; psi: number;
}

export interface State { u: number; t: number; v: number; }

// one charted sample of the trajectory
export interface DataRow {
    time: number; u: number; t: number; v: number; E: number; M: number; IT: number; R: number;
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const clampNonNeg = (x: number) => (x < 0 ? 0 : x);

// saturating response of violence support to emotional drivers
export function saturate(E: number): number {
    const e = Math.max(0, E);
    return e / (1 + e);
}

export function derivatives(s: State, p: Params, E: number, M: number, IT: number) {
    const du =
        p.alpha0 + p.alpha1 * (1 - s.t) + p.alpha2 * M - p.alpha3 * s.u - p.alpha4 * s.v + p.alpha5 * s.v * s.u;
    const dt = s.t * (1 - s.t) * (p.eta + p.beta1 * IT - p.beta2 * s.u - p.beta3 * s.v);
    const dv = -p.lambda * s.v + p.phi * s.u * (1 - s.t) * saturate(E) + p.psi * Math.max(0, E);
    return { du, dt, dv };
}

export function rk4Step(s: State, p: Params, E: number, M: number, IT: number, dt: number): State {
    const k1 = derivatives(s, p, E, M, IT);
    const s1 = { u: s.u + (dt / 2) * k1.du, t: s.t + (dt / 2) * k1.dt, v: s.v + (dt / 2) * k1.dv };
    const k2 = derivatives(s1, p, E, M, IT);
    const s2 = { u: s.u + (dt / 2) * k2.du, t: s.t + (dt / 2) * k2.dt, v: s.v + (dt / 2) * k2.dv };
    const k3 = derivatives(s2, p, E, M, IT);
    const s3 = { u: s.u + dt * k3.du, t: s.t + dt * k3.dt, v: s.v + dt * k3.dv };
    const k4 = derivatives(s3, p, E, M, IT);
    return {
        u: clampNonNeg(s.u + (dt / 6) * (k1.du + 2 * k2.du + 2 * k3.du + k4.du)),
        t: clamp01(s.t + (dt / 6) * (k1.dt + 2 * k2.dt + 2 * k3.dt + k4.dt)),
        v: clamp01(s.v + (dt / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv)),
    };
}

export function simulate(s0: State, p: Params, E: number, M: number, IT: number, dt: number, steps: number): State {
    let s = s0;
    for (let i = 0; i < steps; i++) s = rk4Step(s, p, E, M, IT, dt);
    return s;
}

// With no emotional driver (E = 0) the violence source term vanishes, because
// saturate(0) = 0 and psi*0 = 0, so violence decays purely as v0 * exp(-lambda T).
export function violenceDecay(v0: number, lambda: number, T: number): number {
    return v0 * Math.exp(-lambda * T);
}
