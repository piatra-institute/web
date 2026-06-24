# Morphologies of Stability

## Abstract

Stability is usually taught as a single idea: a system is stable if it returns to where it was after a small push. But the *shape* of that return differs profoundly across systems. This companion examines four canonical morphologies of stability, each a different answer to the question "what does it mean for a system to hold its form?" The playground implements all four as small noise-driven dynamical systems and exposes the quantities that classical stability theory predicts: relaxation rates, barrier heights, orbit radii, and convergence rates. The deterministic core of each model is calibrated against textbook results so that the visual intuition rests on verifiable arithmetic.

## Background

In the linear-stability paradigm, one linearizes a system near an equilibrium and inspects the eigenvalues of the Jacobian. If every eigenvalue has negative real part, perturbations decay and the equilibrium is asymptotically stable; if any has positive real part, the equilibrium is unstable. This criterion, due in modern form to Lyapunov (1892), is exact for hyperbolic fixed points by the Hartman-Grobman theorem, and it underlies the bulk of applied dynamics.

The criterion is powerful but narrow. It answers "is this *point* stable?" It does not, by itself, describe systems whose stable object is not a point at all: a periodic orbit, a basin among several, or a collective configuration of many interacting units. Each of these requires its own notion of stability, and each produces a recognizably different geometry of recovery. We call these geometries *morphologies of stability*.

## The four models

### 1. Point attractor

The simplest morphology. A scalar state relaxes toward a set point under a linear restoring force:

```
dx/dt = -k(x - x*) + noise
```

The fixed point is x*, where the deterministic drift vanishes. The Lyapunov function V = (1/2)k(x - x*)^2 decreases monotonically along noise-free trajectories, and the single eigenvalue of the linearization is -k, negative for all k > 0. Perturbations decay exponentially with time constant tau = 1/k. Stability here is *convergence to rest*: one equilibrium, one basin, global pull.

The calibration confirms two facts about this model. First, seeding the state exactly at x* and integrating leaves the error at zero, because f(x*) = 0. Second, a state released far from the target relaxes back to it. Both predictions are exact in the noise-free limit and reproduce to four decimal places.

### 2. Bistable switch

A particle in a double-well potential, with damping and noise:

```
V(x) = a(x^2 - 1)^2 + tilt * x
d^2x/dt^2 = -gamma (dx/dt) - dV/dx + noise
```

For tilt = 0 the potential has two equal minima at x = +1 and x = -1, separated by a barrier whose height is V(0) - V(1) = a. Each well is locally stable; the ridge at x = 0 is unstable. Small perturbations are absorbed within a well, but a perturbation large enough to clear the barrier flips the system into the other basin. Noise makes such flips stochastic, and the rate follows Kramers escape theory (1940):

```
rate proportional to exp(-2 dV / sigma^2)
```

where dV is the barrier height and sigma^2 the noise intensity. Stability here is *basin selection*: the system is stable in more than one way, and its identity is the choice of valley. The playground reports the barrier height directly from the potential (a = 1.3 for the default well depth), and the calibration verifies that a state placed in the right well stays there under noise-free dynamics.

### 3. Limit cycle

Not all stability is stillness. The supercritical Hopf normal form produces a stable *orbit* rather than a stable point:

```
dz/dt = (mu - |z|^2) z + i omega z + noise
```

written in the playground as a real two-dimensional system in (x, y). For mu <= 0 the only attractor is the origin, a stable spiral. As mu crosses zero the origin loses stability and a stable circular orbit of radius r* = sqrt(mu) appears. The radial Floquet exponent is -2mu, governing how fast a kicked trajectory returns to the orbit. Stability here is *rhythm*: the system never rests, yet its pattern of motion is self-restoring.

The calibration checks the two structural predictions of the Hopf bifurcation. Above threshold (mu = 0.64) the settled orbit radius matches sqrt(mu) = 0.8 to within the forward-Euler discretization residue of under one percent. Below threshold (mu = -0.3) the trajectory collapses onto the origin, confirming that no orbit exists when mu <= 0.

### 4. Consensus network

Stability can also be distributed across many units. The model uses DeGroot-style opinion dynamics with an external anchor:

```
dx_i/dt = c(xbar - x_i) + s(a - x_i) + noise
```

Each of the N agents is pulled toward the group mean xbar with coupling c and toward an anchor a with stubbornness s. The effective convergence rate is lambda = c(1 - 1/N) + s. When lambda > 0 the spread of opinions decays toward zero and the network reaches agreement. With s = 0 the dynamics conserve the mean (pure averaging), so the consensus value is the initial average; with s > 0 the anchor draws the consensus toward a. Stability here is *coordination*: the stable object is a collective configuration, not any single agent. The calibration confirms that, under positive coupling and stubbornness, the spread decays to zero.

## Results

| Morphology | Stable object | Stability criterion | Recovery geometry |
| --- | --- | --- | --- |
| Point attractor | A fixed point x* | eigenvalue -k < 0 | exponential decay, tau = 1/k |
| Bistable switch | One of two wells | barrier height a > 0 | flip requires clearing the barrier |
| Limit cycle | A periodic orbit | Floquet exponent -2mu < 0 | return to radius sqrt(mu) |
| Consensus network | A collective configuration | rate c(1 - 1/N) + s > 0 | spread decays to zero |

All five calibration cases reproduce their textbook targets within tolerance, with a worst-case error below one percent driven entirely by the explicit-Euler integration of the limit cycle.

## Limitations

The models are deliberately minimal, and several simplifications matter.

The noise is additive Gaussian white noise with a single intensity parameter. Real systems often have multiplicative (state-dependent) noise, heavy-tailed jumps, or temporal correlations, any of which can change the qualitative dynamics. The stability index shown in the panel is a heuristic ratio of restoring strength to disturbance, not a rigorous measure of basin stability; a proper basin-stability estimate (Menck et al., 2013) would require Monte Carlo sampling of initial conditions across the state space.

The limit-cycle radius carries a sub-one-percent bias because the live simulation integrates with forward Euler at a fixed step. A higher-order integrator would shrink this residue but would not change the structural conclusion that r* = sqrt(mu). Finally, the consensus model uses all-to-all mean-field coupling; real opinion dynamics involve network topology, bounded confidence, and contrarian agents, none of which are present here.

## The conceptual bridge

The reason these four models are worth placing side by side is philosophical as much as technical. "Becoming" becomes legible as entityhood precisely when a process can repeatedly recover its own form. A circle drawn on paper is a static shape; a droplet pulled round by surface tension is a self-stabilizing process that maintains its form through active correction. The four morphologies are four ways that "holding form" can be realized: relaxing to a point, selecting a basin, sustaining a rhythm, or coordinating across units. Each is a distinct geometry of persistence, and together they sketch how dynamics, not inertness, is what lets a thing remain itself.

## References

1. Lyapunov, A. M. (1892). *The General Problem of the Stability of Motion.*
2. Kramers, H. A. (1940). Brownian motion in a field of force and the diffusion model of chemical reactions. *Physica*, 7(4), 284 to 304.
3. Hopf, E. (1942). Abzweigung einer periodischen Lösung von einer stationären Lösung eines Differentialsystems.
4. DeGroot, M. H. (1974). Reaching a consensus. *Journal of the American Statistical Association*, 69(345), 118 to 121.
5. Guckenheimer, J., & Holmes, P. (1983). *Nonlinear Oscillations, Dynamical Systems, and Bifurcations of Vector Fields.* Springer.
6. Olfati-Saber, R., & Murray, R. M. (2004). Consensus problems in networks of agents. *IEEE Transactions on Automatic Control*, 49(9), 1520 to 1533.
7. Strogatz, S. H. (2015). *Nonlinear Dynamics and Chaos* (2nd ed.). CRC Press.
8. Menck, P. J., Heitzig, J., Marwan, N., & Kurths, J. (2013). How basin stability complements the linear-stability paradigm. *Nature Physics*, 9, 89 to 92.
