# Chladni Figures: Nodal Lines of a Vibrating Plate

## Abstract

When a rigid plate is driven into resonance, fine particles scattered on its surface migrate away from the regions of strong motion and settle along the curves that stay still. These curves are the nodal lines of the plate's standing wave, and the patterns they trace are called Chladni figures. This companion describes the physics behind the figures, the closed-form mode functions used in the playground, the difference between the idealized model and a real plate, and the often-misunderstood mechanism by which the sand actually moves.

## Background

Ernst Florens Friedrich Chladni (1756 to 1827) made the figures famous. By drawing a violin bow across the edge of a metal plate sprinkled with sand, he excited a resonance and watched the grains assemble into geometric patterns. His 1787 book, *Entdeckungen ueber die Theorie des Klanges* (Discoveries in the Theory of Sound), catalogued these patterns and is often taken as a founding document of experimental acoustics. The figures are not Chladni's invention alone: Robert Hooke had observed similar patterns with a glass plate and flour decades earlier, but Chladni systematized them.

The phenomenon mattered far beyond a parlor demonstration. When Chladni presented the figures in Paris in 1809, Napoleon endowed a prize through the Institut de France for a mathematical theory of the vibrating elastic surface. Sophie Germain, working largely outside the academy, pursued the problem across three submissions and was awarded the prize in 1816. Her work, refined later by others, fed into the modern fourth-order plate equation. The full Kirchhoff-Love theory of thin plates was not settled until the middle of the nineteenth century.

## The mode functions

A thin, flat, uniform plate has natural modes of vibration. Each mode is a fixed spatial shape that oscillates in time at a single frequency. The nodal lines of a mode are the points that do not move at all, where the modal shape crosses zero.

For an ideal square plate with free edges, the modes are well approximated by separable products of cosines. A product like

    cos(m pi x) cos(n pi y)

with x and y running over the unit square has m and n counting the number of half-wavelengths along each axis. A square plate has a symmetry: swapping x and y must leave the physical situation unchanged. This makes the pair (m, n) and (n, m) degenerate, sharing the same frequency. Degenerate modes can be combined freely, and the two natural combinations are the symmetric and antisymmetric sums:

    S(x, y) = cos(m pi x) cos(n pi y) +/- cos(n pi x) cos(m pi y)

The plus sign gives a pattern that is symmetric under reflection across the main diagonal; the minus sign gives one that is antisymmetric. These two signs produce genuinely different nodal geometries from the same pair of mode numbers, which is why the playground exposes the sign as a control. This is exactly the function evaluated per pixel in the Viewer and re-exported as a pure `chladni(x, y, m, n, symmetric)` for the calibration checks.

A few facts about S follow directly from the form and are used as analytic calibration anchors:

- At a free corner such as (0, 0), every cosine equals 1, so the symmetric mode equals 2, its maximum.
- For the antisymmetric (minus) combination, the two terms are identical on the line x = y, so S vanishes along the entire main diagonal.
- The fundamental symmetric (1, 1) mode has cos(pi/2) = 0 at the center, placing a node at the middle of the plate.
- Swapping (m, n) merely permutes the two terms of the symmetric sum, so the symmetric mode is invariant under m to n exchange.

## Nodal lines and resonance

Each mode (m, n) has a characteristic eigenfrequency that rises with the mode numbers, roughly as the square root of (m squared plus n squared) for a square plate. When the bow or driver supplies energy at a frequency close to one of these eigenfrequencies, that mode resonates strongly and dominates the plate's motion. The nodal lines of the dominant mode are then where the surface is quiet, and that is where the sand ends up. Because each mode has a distinct nodal network, the figure is effectively a fingerprint of which mode is ringing.

Real plates often ring in more than one mode at once, especially near close-spaced frequencies. In the linear, small-amplitude regime the response is just the sum of the individual modes, and the playground models this as `|a1 * mode1 + a2 * mode2|`. The combined nodal set is where the summed amplitude is small, which is generally more intricate than either mode alone.

## How the sand actually moves

A common but incorrect story is that the sand simply slides downhill into grooves. The real mechanism, first analyzed carefully by Michael Faraday in 1831, is that the vertical acceleration of the plate at the antinodes (the regions of maximum motion) repeatedly tosses grains into the air. Each toss lands a grain a little closer to a node, where the acceleration is too weak to launch it again. Over many cycles the grains accumulate at the nodes. The playground captures this only qualitatively, as a mass-conserving drift of sand from high-amplitude to lower-amplitude neighbors plus a little diffusion. It is a phenomenological transport rule, not a derivation from the bouncing dynamics.

Faraday also noted a striking exception. Very fine powder, such as lycopodium spores, collects not at the nodes but at the antinodes. The reason is that fine particles are carried by the acoustic streaming of the air set in motion by the plate rather than by the bouncing that governs coarse sand. The gradient-descent rule in the playground describes coarse sand and would predict the opposite of what fine powder does, which is one of the honest limits flagged in the assumptions panel.

## Limitations of the model

The model is deliberately idealized, and several gaps are worth naming.

- **Ideal plate.** The cosine modes assume uniform thickness, a homogeneous isotropic material, no internal damping, and perfectly free edges. Real plates are clamped or supported, have material variation, and lose energy, all of which shift and distort the modes.
- **Non-square shapes are approximated.** The circle, rectangle, and ring in the playground reuse the square cosine field clipped by a boundary mask. A true circular plate has Bessel-function radial modes with concentric and radial nodal circles, a different spectrum that masking cannot reproduce. The masked shapes are a visual stand-in, not the correct eigenproblem.
- **Linear superposition only.** Adding two modes assumes a linear response. At large drive amplitude, plates show nonlinear mode coupling and hysteresis that this sum cannot capture.
- **Thresholded nodes.** Nodal lines are rendered as a band where the amplitude is below a small threshold, which approximates a finite physical width rather than the mathematical zero set.

## References

- E. F. F. Chladni, *Entdeckungen ueber die Theorie des Klanges*, 1787.
- M. Faraday, "On a peculiar class of acoustical figures, and on certain forms assumed by groups of particles upon vibrating elastic surfaces," *Philosophical Transactions of the Royal Society*, 1831.
- Lord Rayleigh (J. W. Strutt), *The Theory of Sound*, 1877.
- S. Germain, *Recherches sur la theorie des surfaces elastiques*, 1821.
- A. W. Leissa, *Vibration of Plates*, NASA SP-160, 1969.
