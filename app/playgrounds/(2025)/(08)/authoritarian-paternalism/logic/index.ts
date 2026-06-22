// The model behind the simulation. Citizens with heterogeneous preferences theta
// support the regime with probability sigma(lambda * dU), a logit (random-utility)
// choice, where the utility gap is
//   dU = a*g - d*r + b*Order + c*theta*F - kappa*k + noise.
// Two regime states follow linear AR(1) recurrences with closed-form steady
// states, which the calibration checks the simulation converges to. These are
// pure functions; the Viewer implements the same equations inline.

export function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
}

// paternal signaling F: built by propaganda p, decays at rate (1 - rho)
export function nextF(F: number, rho: number, eta: number, p: number): number {
    return rho * F + eta * p;
}

// order: built by repression r, erodes at rate (1 - phi)
export function nextOrder(O: number, phi: number, psi: number, r: number): number {
    return phi * O + psi * r;
}

// closed-form steady states of the linear recurrences (require |rho|, |phi| < 1)
export function steadyF(rho: number, eta: number, p: number): number {
    return (eta * p) / (1 - rho);
}
export function steadyOrder(phi: number, psi: number, r: number): number {
    return (psi * r) / (1 - phi);
}

export function iterateF(F0: number, rho: number, eta: number, p: number, T: number): number {
    let F = F0;
    for (let t = 0; t < T; t++) F = nextF(F, rho, eta, p);
    return F;
}
export function iterateOrder(O0: number, phi: number, psi: number, r: number, T: number): number {
    let O = O0;
    for (let t = 0; t < T; t++) O = nextOrder(O, phi, psi, r);
    return O;
}

// fraction of cross-sectional utility variance driven by preference
// heterogeneity rather than idiosyncratic noise
export function varShare(c: number, F: number, sdTheta: number, sigmaEps: number): number {
    const v = c * c * F * F * sdTheta * sdTheta;
    return v / (v + sigmaEps * sigmaEps);
}
