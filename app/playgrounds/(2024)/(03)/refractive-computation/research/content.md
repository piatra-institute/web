# Refractive Computation

## Computing by bending: from light to grains

### Abstract

This playground sits at the meeting point of two ideas with a shared shape. The first is **analog optical computation**: the use of light, lenses, and refraction to perform mathematical operations physically, without a clock or a digital instruction stream. The second is **mechanical polycomputation**: the discovery that an evolved granular material can perform several Boolean logic operations at once, each on a different vibration frequency, inside a single physical body. The connective metaphor is refraction. A lens bends different wavelengths by different amounts; an evolved grain bends incoming vibration energy differently at different frequencies. In both cases one passive medium routes many channels of information at the same time, and the routing itself is the computation.

The live canvas animates the granular case. The deterministic core that this companion documents is small and exact: a contact force law, a frequency modulation factor, a NAND truth table, and a threshold readout. Everything else, including the random packing and the time integration, is visual scaffolding around that core.

### 1. Background: computing without arithmetic units

Most computers we use are digital and clocked. A signal is forced to one of two voltages, a global clock chops time into steps, and every operation is a deliberate manipulation of those discrete symbols. Analog computation works differently. It lets a physical quantity, a voltage, a current, a light field, an elastic displacement, vary continuously, and arranges the physics so that the quantity you want is computed as a side effect of the system reaching equilibrium or transmitting a wave.

Optics is one of the oldest analog substrates. A thin lens performs a two dimensional Fourier transform of the field in its front focal plane onto its back focal plane, for free, at the speed of light, across the whole image at once. Refraction is the underlying mechanism. Light slows in a denser medium, and Snell's law,

> n1 sin(theta1) = n2 sin(theta2),

fixes the bending angle at each interface. A graded index profile or a shaped surface turns that bending into a useful transform: focusing, correlation, edge detection, or matrix multiplication. The appeal is that the work is done by the medium, in parallel, with no per-pixel instructions.

### 2. The refraction metaphor, made precise

Refraction is wavelength dependent. The refractive index n is a function of frequency, so a prism fans white light into a spectrum because each color bends by a different angle. This is dispersion. The single physical fact, one medium, many frequencies, many bending angles, is exactly the structure that mechanical polycomputation exploits.

In the granular system the medium is a packing of grains rather than glass, and the signal is an elastic vibration rather than light. But the vibration still propagates differently at different frequencies, because the force chains that carry it through the packing have frequency dependent transmission. A single grain therefore plays a different role in two computations carried on two frequencies, just as a single point in a prism bends red and blue differently. That is why the playground is called refractive computation even though its substrate is mechanical: the organizing idea is one body routing many frequency channels at once.

### 3. The model the playground actually computes

The canvas seeds a random packing of grains inside a rectangular container. The seeding uses a packing fraction phi to fix the mean grain radius by area conservation,

> phi * A = N * pi * r^2  so  r = sqrt(phi * A / (N * pi)),

with phi near 0.64 used as a familiar close packing reference. Each grain is then jittered in size, and four grains are placed as inputs and one as the output.

Two facts make the system compute. First, contacts transmit force by a softened, square root contact law,

> F_normal = sqrt(overlap) * stiffness,  with no force when overlap is not positive.

This is a legibility-driven softening of the Hertzian 3/2 power law for elastic spheres; the playground is explicit that the exponent is an approximation. Second, each contact is modulated by a frequency dependent factor,

> factor(f, t) = 1 + 0.5 * sin(2 * pi * f * t),

bounded between 0.5 and 1.5. Two vibration channels at frequencies f1 and f2 drive the input grains, and because the modulation factor differs between the channels, the force chains that carry them differ too. The output grain reads one bit per channel by thresholding its displacement: the x displacement for channel one, the y displacement for channel two, with a magnitude above 0.1 counted as a logical 1.

The target gate is **NAND**, chosen because it is functionally complete. Sheffer showed in 1913 that every Boolean function can be written using NAND alone, so a material that robustly computes NAND is, in principle, a universal logic substrate. The output grain is scored correct when both channels report exactly the NAND of their inputs at the same time.

### 4. Results the deterministic core gives

Stripped of the random packing, the core is fully testable, and the calibration panel checks it:

- the contact law returns sqrt(0.25) * 1000 = 500 at a known overlap, and 0 with no contact;
- NAND of two high inputs is 0, the one low row that distinguishes the gate from a constant;
- a candidate gate matches all four NAND truth table rows;
- the packing geometry round trips: a radius derived from phi and N recovers N;
- and a correct multiplexed output is reported when both channels hit their NAND targets.

Each predicted value in that panel is recomputed from the logic module rather than written by hand, so the panel certifies the code, not a stored answer.

### 5. Where this connects to evolved materials

The deeper claim in the literature is that such gate performing packings can be **found by search**. Parsa, Bongard, Levin and colleagues evolved granular assemblies in which a single grain acts as several NAND gates at several frequencies at once, a phenomenon they call polycomputation. The genetic algorithm controls in this playground, generations and mutation rate, describe that offline search. They do not run on the live canvas, which animates one fixed packing; the playground is explicit about this so the visualization is not mistaken for the search itself.

The optical analogy returns here as a design target rather than a metaphor. Diffractive optical networks, fabricated as stacks of refracting and diffracting layers, are trained the way these packings are evolved: by optimizing a passive medium so that its natural response to an input field is the answer to a classification problem. In both the optical and the granular case, learning happens once, offline, and the trained medium then computes in a single physical pass.

### 6. Limitations

This is a sandbox, not a validated simulator. The contact exponent is softened away from the physical 3/2 law. The 0.1 displacement threshold and the x and y channel assignment are hand chosen, and a different readout can flip the reported gate. The packing fraction label borrows a 3D close packing number for a 2D disk packing, so the density label is approximate even though the geometry round trips exactly. Cascadability, the question of whether the noisy output of one mechanical gate can drive the input of the next without signal degradation, is the real engineering obstacle and is not addressed here. The functional completeness of NAND is a theorem about ideal gates and says nothing about a noisy physical one.

### References

- Sheffer, H. M. (1913). A set of five independent postulates for Boolean algebras, with application to logical constants. Establishes NAND as a sole sufficient operator.
- Hertz, H. (1882). On the contact of elastic solids. The 3/2 power contact law softened here.
- Parsa, A., Bongard, J., Levin, M. and colleagues. Work on universal mechanical polycomputation in evolved granular matter; frequency multiplexed NAND gates in a single assembly.
- Goodman, J. W. Introduction to Fourier Optics. The lens as an analog Fourier transformer and the optical roots of refractive computation.
- Lin, X. et al. (2018). All optical machine learning using diffractive deep neural networks. A trained, passive, refracting medium that computes in one pass.
