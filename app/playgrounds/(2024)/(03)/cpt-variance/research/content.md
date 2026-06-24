# CPT Variance: Charge, Parity, and Time in the Discrete Symmetry Group

## Abstract

This playground visualises the three discrete spacetime symmetries of relativistic physics, charge conjugation (C), parity inversion (P), and time reversal (T), together with their combined operation CPT. The CPT theorem holds that any local, Lorentz-invariant quantum field theory with a Hermitian Hamiltonian must be invariant under CPT, even where the individual symmetries and their pairings are badly broken. The companion model reduces each operator to an exact linear involution on a toy particle state so that the group structure, and the invariance it protects, becomes something you can compute and check.

## Background

Three of the most consequential results in twentieth century physics concern symmetries that were once assumed exact and then found to fail.

Parity (P) inverts space through the origin. For decades it was taken for granted that the laws of physics do not distinguish left from right. In 1957 Wu and collaborators showed that the weak interaction violates parity maximally: the electrons emitted in cobalt-60 beta decay come out preferentially in one direction relative to the nuclear spin. Nature does have a handedness.

Charge conjugation (C) exchanges every particle for its antiparticle. The weak interaction violates C as well. The natural retreat was to the combined operation CP, the idea that a mirror-reflected world made of antimatter would behave like ours. In 1964 Christenson, Cronin, Fitch, and Turlay found that neutral kaons violate CP at the level of a few parts per thousand: the long-lived kaon decays to two pions, which CP conservation forbids.

Time reversal (T) flips the arrow of time, reversing momenta and spins. By the CPT theorem, CP violation implies T violation, and direct T violation has since been observed in the kaon and B-meson systems.

What survives all of this is CPT. The CPT theorem, proved by Luders and Pauli in the mid 1950s and given its rigorous axiomatic form by Jost, Streater, and Wightman, states that the product CPT is an exact symmetry of any theory built from local fields that respects special relativity and has a stable vacuum. The same structure also forces the spin-statistics connection: half-integer-spin fields anticommute, integer-spin fields commute.

## The Model

The visualisation acts on a deliberately minimal state. A particle is a position, a momentum, an electric charge, and a matter or antimatter label. The three operators are exact involutions on this state.

- **C** sends charge to minus charge and swaps matter for antimatter. Spacetime coordinates and momentum are untouched.
- **P** inverts the spatial coordinates through the origin, which also reverses the momentum direction of a polar vector. Charge and species are preserved.
- **T** reverses the momentum, leaving position, charge, and species unchanged.

Each operator applied twice is the identity, so the three generate a finite group. The combined operation, applied as C then P then T, flips charge and species, inverts position, and reverses momentum twice so that it returns to its starting value. For any reference state this gives an analytically known CPT image, which the calibration panel reproduces to machine precision.

The toy also defines a scalar quantity that CPT leaves unchanged: the product of charge and a species sign, plus the squared momentum, minus the squared position. Charge and species both flip together under CPT, so their product is preserved, while the kinematic magnitudes are individually invariant. This stands in for the physical statement that observable scalars do not change under the combined operation.

## A Caveat on the Violation Sliders

The C, P, and T sliders are presentation controls, not measured quantities. Real symmetry violations are quantified by specific observables: the kaon parameter epsilon, the Jarlskog invariant of the quark mixing matrix, asymmetries in decay rates. There is no experiment that sets a thirty percent parity violation. The sliders soften the individual symmetries for display while CPT stays distinguished, which is the honest physical content: individual symmetries can be tuned away, the combination cannot.

The matter-antimatter readout is similarly illustrative. The observed cosmic baryon asymmetry is about six parts in ten billion, and explaining it requires the three Sakharov conditions together: baryon-number violation, C and CP violation, and a departure from thermal equilibrium. A single linear CPT-violating term is not a viable mechanism. The model takes the asymmetry to be linear in a small parameter only to make the qualitative point that exact CPT forbids any asymmetry from the symmetry alone.

## What the Toy Captures and What It Omits

The model captures the group-theoretic skeleton: the involution property, the composition law, the existence of a protected invariant, and the separation between individually breakable symmetries and the protected combination. These are exact and checkable, and the calibration panel verifies each to zero error.

It omits the parts of the real theory that live in the field operators and the spinor phases. In full quantum field theory T is antiunitary, acting by complex conjugation, and P and T act on spinor components with nontrivial phases. Parity violation in the weak interaction is fundamentally about helicity: only left-handed neutrinos couple, a fact a spinless point particle cannot express. The toy therefore caricatures the mechanism of violation even while it correctly represents the algebra of the symmetries.

## Experimental Status

CPT is among the most precisely tested symmetries in physics. The fractional mass difference between the neutral kaon and its antiparticle is bounded to better than one part in 10^18, the strongest such limit in nature. Measurements of antihydrogen at CERN, comparing its 1S to 2S transition and its charge-to-mass ratio against ordinary hydrogen, have so far found no difference, consistent with exact CPT. Any reproducible violation would overturn the assumptions of locality or Lorentz invariance and would be a discovery of the first order.

## Limitations

This is a sandbox for the symmetry algebra, not a particle physics simulator. The state has no spin, no internal quantum numbers, and no dynamics beyond free drift. The violation sliders and the asymmetry readout have no direct empirical counterpart and are labelled as illustrative. The value of the model is that the group structure and the CPT invariance it protects are made exact, computable, and falsifiable in the narrow sense the calibration panel checks.

## References

- G. Luders, "On the equivalence of invariance under time reversal and under particle-antiparticle conjugation," 1954.
- W. Pauli, "Exclusion principle, Lorentz group and reflection of space-time and charge," 1955.
- C. S. Wu et al., "Experimental test of parity conservation in beta decay," Physical Review, 1957.
- J. H. Christenson, J. W. Cronin, V. L. Fitch, R. Turlay, "Evidence for the 2-pi decay of the K2-0 meson," Physical Review Letters, 1964.
- R. F. Streater and A. S. Wightman, PCT, Spin and Statistics, and All That, 1964.
- A. D. Sakharov, "Violation of CP invariance, C asymmetry, and baryon asymmetry of the universe," 1967.
- ALPHA Collaboration, antihydrogen 1S to 2S spectroscopy, Nature, 2018.
