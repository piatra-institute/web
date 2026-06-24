# Geometry of Fragmentation

## Abstract

When a solid breaks, the pieces look chaotic. Yet a 2020 result by Gábor Domokos, Douglas Jerolmack, Ferenc Kun, and János Török argues that the *average* shape of the fragments is not chaotic at all: across many natural settings, fracture mosaics drift toward a small set of statistical attractors set largely by geometry rather than by the detailed physics of the material. In two dimensions the dominant attractor is the quadrangle (mean four sides per cell); a second, the hexagon (mean six sides), shows up where the process is closer to a Voronoi tessellation. This companion describes what the playground actually computes, which of the paper's claims it reproduces exactly, and where it is only an approximation.

## Background

A fracture pattern can be abstracted as a **convex mosaic**: a tiling of the broken region by convex cells with no gaps and no overlaps. Two averages summarise such a mosaic:

- the mean number of sides per cell, written n;
- the mean number of cells meeting at a vertex (the mean vertex degree), written d.

This two-number projection is the heart of the framework. Most of the messy detail of a real fracture pattern is discarded, and what survives is a point in a low-dimensional (n, d) plane. The claim of the paper is that natural fragmentation processes do not scatter uniformly across that plane; they cluster near a few attractors.

In 3D the corresponding statement is the one that gives the work its slogan: random breakup averages toward the topology of a cube, about six faces and eight vertices. Hence "Plato's cube". The playground stays in two dimensions, where the analogous attractor is the quadrangle.

## What the playground computes

The playground is a seeded, stochastic generator with three modes, all reduced to the same (n, d) summary.

**Random splits.** Start from the unit square. Repeatedly pick a cell (weighted by area), choose a cut line through its centroid at a random angle, and bisect it into two convex pieces. An optional angle bias nudges cuts toward horizontal and vertical, producing more rectangular fragments. This is the generator that converges to the quadrangle attractor.

**Voronoi.** Scatter N seed points in the unit square, build the Voronoi diagram with d3-delaunay, and clip every cell to the square. Each site gives one cell. This generator sits near the hexagon attractor.

**Mixed.** Build a Voronoi base, then bisect its cells with the random-split rule. The phase point migrates between the two attractors, which is the visual point of the mode.

The statistics are computed by `computeStats`: it counts sides per polygon, snaps vertices onto a grid to find which cells share a vertex, and averages. The live readout also shows the Euler combination 1/n + 1/d.

## Results: what is reproduced exactly

The calibration panel verifies only the **deterministic geometric skeleton** of the generators, because the full simulation is stochastic and there is no honest closed form for a fuzzy ensemble average. Each of the following is computed by the same logic the live view uses, and matches the geometric ground truth to within numerical error:

| Property | Predicted | Expected |
| --- | --- | --- |
| Unit square area (shoelace) | 1 | 1 |
| Total area after 200 random splits | 1 | 1 |
| Cell count after 150 splits | 151 | 151 |
| Voronoi cells for 80 sites | 80 | 80 |
| Voronoi total area for 80 sites | 1 | 1 |
| Mean sides after 400 splits | 4 | 4 |

The first five are conservation laws: area is additive under partition, and a binary split turns one cell into two. The sixth is the substantive one. Iterated convex bisection drives the mean side count to exactly 4. The reason is simple bookkeeping: a straight cut through a convex cell adds one new edge to each of the two children, and the long-run population mean of a binary-split tree of convex polygons settles at four. This is the 2D quadrangle attractor, reproduced without tuning.

## Limitations and honest deviations

Two of the paper's headline relationships are reproduced only approximately, and the playground is explicit about why.

**The hexagon is below 6.** Poisson-Voronoi theory says the mean interior cell has exactly six sides. On the finite unit square the live value lands near 5.7 to 5.8, because boundary cells are clipped and have fewer sides. The attractor is correct; the finite patch pulls the measured mean down. A boundary-free (periodic or infinite) domain would recover 6.

**The Euler identity is a limit, not a law on screen.** For an infinite planar tiling, 1/n + 1/d = 1/2. On the finite square the vertex-degree count includes boundary vertices where few cells meet, so the measured combination sits noticeably above 1/2 (around 0.53 for the default Voronoi run). The identity is a property of the infinite limit, and the readout is a finite-size approximation of it, not a verification of it.

**Inverting statistics to recover process is speculative.** The appealing inverse claim, that you could measure fragment statistics at a field site and read off whether the rock cracked once, cracked repeatedly, or cooled, is under-constrained: different processes can land near the same (n, d) point. The playground presents this as a hypothesis from the source paper, not a calibrated map.

## References

- G. Domokos, D. J. Jerolmack, F. Kun, J. Török (2020). *Plato's cube and the natural geometry of fragmentation.* Proceedings of the National Academy of Sciences. https://www.pnas.org/doi/10.1073/pnas.2001037117
- J. Sokol (2020). *Scientists Uncover the Universal Geometry of Geology.* Quanta Magazine.
- B. Grünbaum, G. C. Shephard. *Tilings and Patterns.* (Background on planar mosaic classification and the Euler relation for tilings.)
