# Nested Observer Windows

## Abstract

The Nested Observer Windows (NOW) model, proposed by Justin Riddle and Jonathan Schooler (2024), frames consciousness as a hierarchy of "observer windows": systems that integrate information within bounded regions of space and time, nested across brain scales, terminating in a single apex window that corresponds to unified subjective experience. This playground turns the model's three signature mechanisms into an interactive multi-scale oscillator simulation. It is an illustration of the hypothesis, not a test of it, and this companion is explicit about where the toy is faithful to the published model and where it adds heuristic structure of its own.

## Background

The hard part of any theory of consciousness is binding: how the activity of many separate elements becomes one experience, and how that experience is structured at multiple scales at once. NOW answers with a fractal picture. Schooler's recurring metaphor is a mosaic photograph in which every pixel is itself a photograph, and each of those is again a mosaic. A window is a region that integrates what is inside it; windows nest inside larger windows; the largest is the apex, the thing we ordinarily call "I".

To make the picture mechanistic, NOW borrows three well-studied phenomena from the synchrony literature and assigns each a distinct role:

1. **Synchrony (zero phase lag)** binds the elements inside a single window. When oscillators lock to the same phase they act as one coherent unit.
2. **Coherence (non-zero phase lag)** lets peer windows at the same level communicate. A stable but lagged phase relationship carries information sideways without collapsing two windows into one.
3. **Cross-frequency coupling** carries information vertically between scales. A slow rhythm at a higher level modulates the amplitude of a faster rhythm at a lower level (phase-amplitude coupling).

These three are not invented by NOW. The Kuramoto model of coupled oscillators (1975) is the standard reduction behind synchrony; communication-through-coherence (Fries, 2005) is the lineage behind lagged peer coupling; phase-amplitude coupling (Canolty and Knight, 2010) is the vertical channel. NOW's contribution is to assign them a division of labour inside a nested hierarchy and to claim that an apex window emerges at the top.

## Model description

The simulation represents each window as a small set of phase oscillators on the unit circle. A state is a stack of levels; level 0 is the apex and holds a single window, while lower levels hold several windows each. Higher levels are given slower intrinsic frequencies, so the hierarchy spans a range of timescales.

Each integration step applies three updates and then reads out four numbers.

**Within-window synchrony.** Phases inside a window are pulled toward their circular mean. The degree of resulting alignment is measured by the Kuramoto order parameter:

> r = | (1/N) sum_j exp(i * theta_j) |

with r = 1 when all phases coincide and r = 0 when they are spread uniformly around the circle. This is the readout of how well a window has bound itself into a single observer.

**Peer coherence.** Window means at the same level are pulled toward a non-zero preferred lag rather than toward exact alignment. The lag is interpolated from the coherence control, so stronger coherence corresponds to a tighter, smaller preferred phase offset. This keeps lateral communication distinct from the zero-lag binding inside a window.

**Cross-frequency coupling.** For each parent-child pair of levels, the parent's mean phase defines an envelope that modulates a child amplitude term; the result is averaged into a single coupling scalar. This is a deliberately compressed summary of phase-amplitude coupling, chosen for legibility rather than spectral completeness.

**Report stability.** Finally the model forms one composite output:

> reportStability = clamp01( syncApex * (0.55 + 0.45 * bandwidth) * (0.6 + 0.4 * avgCoherence) )

The multiplicative form encodes the model's central qualitative claim: a stable unitary report needs all three mechanisms at once. If apex synchrony collapses to zero the report is zero no matter how good the bandwidth and coherence are; raising any one factor alone cannot rescue it.

## What the calibration checks

Because the live simulation seeds phases randomly and injects noise every step, no single run is reproducible, and there is no honest deterministic parameter-to-output map for the full stochastic field. The calibration therefore targets the deterministic core that everything else is built on, and reports exact agreement there.

It checks two laws:

- the **Kuramoto order parameter** at its analytic endpoints, where aligned phases give exactly 1 and evenly spread or antiphase configurations give exactly 0;
- the **report-stability law** at hand-worked operating points, including apex collapse (0), full saturation (1), a typical mid-range point, and the bandwidth-and-coherence floor.

Each predicted value is computed by the same functions the simulation uses, and every case matches its analytic target to four decimal places. The calibration is honest about scope: it verifies the formulas, not the empirical correctness of the theory.

## Limitations

The reduction to pure phase discards amplitude and waveform, so any phenomenon that lives in amplitude alone is invisible here. Synchrony is used as a direct proxy for integration, which is contested: highly synchronous states such as some seizures are associated with reduced rather than heightened consciousness. The cross-frequency coupling term is a single averaged scalar rather than a band-pair-specific spectrum, and the report-stability law is a hand-built heuristic with no empirical fit. The apex is unitary by construction, not because the dynamics force a single top-level integrator to appear.

Most importantly, the playground does not adjudicate between theories. NOW competes with global workspace theory, integrated information theory, and higher-order theories, all of which explain the same binding phenomena differently. Watching synchrony rise and report stability follow it does not show that the brain works this way; it shows what the NOW hypothesis looks like if it is taken at face value.

## References

- Riddle, J. and Schooler, J. W. (2024). Hierarchical consciousness: the Nested Observer Windows model. *Neuroscience of Consciousness*, 2024(1), niae010.
- Kuramoto, Y. (1975). Self-entrainment of a population of coupled non-linear oscillators. *International Symposium on Mathematical Problems in Theoretical Physics*.
- Fries, P. (2005). A mechanism for cognitive dynamics: neuronal communication through neuronal coherence. *Trends in Cognitive Sciences*, 9(10), 474-480.
- Canolty, R. T. and Knight, R. T. (2010). The functional role of cross-frequency coupling. *Trends in Cognitive Sciences*, 14(11), 506-515.
