# Hsp90 as a Capacitor for Morphological Evolution

## Abstract

Hsp90 is a molecular chaperone whose normal job is to fold and stabilize a large set of metastable client proteins, many of them signal transducers and regulators of development. In 1998 Suzanne Rutherford and Susan Lindquist proposed that this housekeeping role has a deep evolutionary consequence: by keeping mutated or otherwise marginal client proteins working, Hsp90 hides the phenotypic effects of genetic variation that organisms are silently carrying. When Hsp90 is overwhelmed, by heat, by other stress, or by pharmacological inhibition, that hidden variation is suddenly expressed. Hsp90 therefore behaves like a capacitor: it stores phenotypic potential and releases it under stress. This playground is a deliberately simple geometric model of that idea. It does not simulate protein folding; it visualizes the population-level consequence, the buffering and release of latent phenotypic variance.

## Background: canalization and cryptic variation

Canalization is the tendency of a developmental system to produce the same phenotype despite perturbation, whether genetic or environmental. C. H. Waddington introduced the idea in the 1940s with his image of the epigenetic landscape, where developmental trajectories run down canalized valleys and resist being knocked sideways. A canalized trait is robust; the same end state is reached from many starting conditions.

Robustness has a hidden cost and a hidden opportunity. Because canalization suppresses the phenotypic effect of underlying genetic differences, a population can accumulate genetic variation that is not visible to selection. This is called cryptic genetic variation. It is real variation in the genome, but it does not change the phenotype while the buffering system is intact. If the buffer fails, the cryptic variation surfaces all at once, and selection can then act on it. This is one proposed route by which environmental stress could accelerate evolution.

## The Rutherford and Lindquist result

Rutherford and Lindquist worked in Drosophila. They reduced Hsp90 function in two ways: with mutations in the Hsp83 gene that encodes Hsp90, and with the Hsp90 inhibitor geldanamycin. In both cases they saw a striking increase in morphological abnormalities, affecting eyes, wings, legs, and bristles, with the specific defect depending on the genetic background. Crucially, the abnormalities were heritable and could be enriched by selection, and once enriched some persisted even after Hsp90 function was restored. This is the signature of a capacitor: the variation was already present in the genome, masked, and the loss of buffering exposed it. Queitsch, Sangster, and Lindquist later showed a parallel result in the plant Arabidopsis thaliana, and Milton and colleagues extended the buffering picture to environmental as well as genetic variation.

There is honest debate about how general the effect is. Some of the released variation appears to be specifically tied to Hsp90 clients rather than being a generic readout of the entire cryptic genetic load, and the magnitude depends strongly on genetic background. The capacitor metaphor is well supported as a phenomenon; its quantitative reach is still discussed.

## The model in this playground

Each phenotype is a point in a three-dimensional trait space, with the canalized optimum at the origin. The displacement of a phenotype from the optimum has two sources. Genetic variation is anisotropic, concentrated on the first axis with per-axis scales of 1, 0.4, and 0.2 times sigma_G, encoding the idea that cryptic variation has a structured, low-dimensional direction. Environmental noise is isotropic with scale sigma_E. The latent vector (x, y, z) has radius r equal to the square root of x squared plus y squared plus z squared.

Hsp90 buffers each phenotype by a logistic factor:

    f(r) = 1 / (1 + exp(-k (r - (1 - C))))

The buffered phenotype is the latent vector scaled by f. The parameter k sets how sharply buffering switches on, and C, the capacity, sets the threshold radius (1 - C) at which f crosses one half. The behaviour is intentionally counter-intuitive at first glance: f grows with r. Phenotypes near the optimum (small r) have f near zero and are pulled hard toward the center, so their deviation is hidden. Phenotypes far past the threshold radius have f near one and pass through almost unchanged, so their deviation is expressed. Lowering capacity raises the threshold radius, pulling more of trait space into the masked region. Raising capacity lowers the threshold, letting more variation surface.

The single number that summarizes canalization is the variance ratio:

    ratio = E[r_buffered squared] / E[r_latent squared]

A ratio near zero means strong canalization, almost all latent variance is hidden. A ratio near one means the buffer is open and latent variation is fully expressed. The Settings panel reports the complementary quantity, hidden variance, equal to one minus the ratio, as a percentage.

## Deterministic core and calibration

The interactive Viewer estimates the variance ratio by Monte Carlo, sampling five hundred phenotypes per frame. For reproducible calibration the same physics is integrated deterministically over a fixed quadrature grid in the logic module, so the reported numbers do not depend on a random seed. The calibration panel checks the model against cases where the answer is known without fitting.

Two of the cases are structural limits. When capacity is one, the threshold radius is zero and the buffer is fully open, so hidden variance approaches zero. When a small latent cloud sits entirely inside a large threshold radius, the factor f is near zero for every phenotype and hidden variance approaches one hundred percent. The remaining cases are anchored to the biology: a heat-shock case where a transient drop in capacity lets part of the cryptic variation surface, an inhibitor case where strong genetic input pushes most phenotypes past the threshold so the bulk of variance escapes, and an environmental-noise case where isotropic developmental noise spreads phenotypes across the threshold so roughly half the variance is buffered.

## Limitations

This is a geometric caricature, not a folding simulator. The buffering function is a generic logistic curve chosen for legibility, not a measured chaperone rate law, and real chaperone load is governed by client-protein stability and abundance rather than by a single radial threshold. The phenotype is collapsed to an isotropic distance, which ignores trait correlations, epistasis, and threshold characters. The genetic and environmental contributions are bounded uniform draws rather than Gaussians, which changes the tails. The capacity parameter is an abstract dial, not a calibrated Hsp90 concentration. What the model is faithful to is the qualitative logic of the capacitor: a buffer with finite capacity that hides variation near a canalized optimum and releases it when the capacity is spent or the deviations grow too large to contain.

## References

- Rutherford, S. L. and Lindquist, S. (1998). Hsp90 as a capacitor for morphological evolution. Nature 396, 336 to 342.
- Queitsch, C., Sangster, T. A. and Lindquist, S. (2002). Hsp90 as a capacitor of phenotypic variation. Nature 417, 618 to 624.
- Milton, C. C., Ulane, C. M. and Rutherford, S. (2006). Control of canalization and evolvability by Hsp90. PLoS ONE 1, e75.
- Waddington, C. H. (1942). Canalization of development and the inheritance of acquired characters. Nature 150, 563 to 565.
- Wagner, G. P. and Altenberg, L. (1996). Complex adaptations and the evolution of evolvability. Evolution 50, 967 to 976.
