# The 17 Wallpaper Groups

## Abstract

A wallpaper group is the symmetry group of a two-dimensional pattern that repeats in two independent directions. There are exactly seventeen of them. This companion explains what that statement means, why the number is seventeen and not some other number, how each group is built, and how the playground renders all seventeen by drawing a single motif and its orbit under the cell's point group. It also marks clearly where the idealised mathematics ends and the rendering convenience begins.

## What a wallpaper group is

Fix the flat Euclidean plane. A symmetry of a pattern is a rigid motion (an isometry) that maps the pattern exactly onto itself: a translation, a rotation, a reflection, or a glide reflection (a reflection followed by a translation along the mirror line). The set of all such motions for a given pattern forms a group under composition.

A wallpaper group is such a group when two conditions hold:

1. **Discreteness.** The translations form a lattice of rank two, so the pattern genuinely tiles the plane in two independent directions and there is a smallest nonzero translation.
2. **Cocompactness.** A single bounded region, the fundamental domain, tiles the whole plane under the group.

Groups that fail the first condition (a frieze, with translations in only one direction) or that have no lattice at all (a quasiperiodic pattern) are not wallpaper groups.

## Why exactly seventeen

The count of seventeen is a theorem, not an empirical tally. Two ingredients pin it down.

### The crystallographic restriction

If a pattern has a translation lattice and an n-fold rotation, then n is forced to be 1, 2, 3, 4, or 6. The reason is short. A rotation by 2 pi / n must map the lattice to itself, so in a lattice basis it is represented by an integer matrix. The trace of that matrix is an integer, and the trace of a rotation by angle theta is 2 cos(theta). Therefore 2 cos(2 pi / n) must be an integer. Checking the candidates leaves only n in {1, 2, 3, 4, 6}; in particular 5-fold and 7-fold rotations are impossible in a periodic plane pattern. (Quasicrystals show apparent 5-fold symmetry precisely because they are not periodic.)

### Enumerating the combinations

Given the five allowed rotation orders, one then asks which combinations of rotations, reflections, and glide reflections are compatible with a lattice, counting two patterns as the same group when one can be carried to the other by an affine change of coordinates. Working through the cases yields exactly seventeen distinct groups. Evgraf Fedorov proved this in 1891; George Pólya and Paul Niggli rederived it independently in 1924.

## The seventeen groups, by point group

Each wallpaper group has an associated **point group**: the finite group obtained by forgetting the translations and keeping only the rotations and reflections about a fixed point. The order of the point group equals the number of copies of the motif the playground draws around each lattice point. Grouped by their highest rotation order:

| highest rotation | groups | notes |
| --- | --- | --- |
| 1 (none) | p1, pm, pg, cm | p1 is translations only; pm has a mirror, pg a glide, cm a centred mirror |
| 2 | p2, pmm, pmg, pgg, cmm | half-turn centres, with various mirror and glide combinations |
| 3 | p3, p3m1, p31m | the two mirror variants differ in whether mirrors pass through the rotation centres |
| 4 | p4, p4m, p4g | square lattice; p4m and p4g have point group of order 8 |
| 6 | p6, p6m | hexagonal lattice; p6m has the largest point group, order 12 |

The orbifold and IUC (International Union of Crystallography) notations both name these groups; the short IUC symbols (p1, p2, pm, and so on) are the ones used here. The leading letter p or c records whether the lattice is primitive or centred.

## How the playground builds each pattern

The renderer realises the standard orbit construction. It places one motif, the letter R, then for each lattice point it draws the orbit of that motif under the cell point group. Concretely, each group supplies a list of (rotation angle, reflection flag) pairs:

- **p1** draws a single copy: translations only.
- **p2** adds a copy rotated by 180 degrees: a half-turn centre.
- **pm** adds a mirrored copy: a reflection.
- **pg** adds a mirrored copy offset by half a cell: a glide.
- **cm** and **cmm** also drop every other lattice point, realising the centred lattice.
- **p4** draws four copies at 0, 90, 180, 270 degrees; **p4m** doubles these with mirrors to eight.
- **p3, p6** and their mirror variants switch to a hexagonal lattice through the shear x = i a + j a / 2, then draw 3-fold or 6-fold orbits.

Because the drawn orbit size equals the point-group order, the rendered tiling carries exactly the symmetry group its label claims. The logic module reads these same facts back out as exact integers, which the calibration panel checks against the textbook values.

## Higher dimensions

The same questions in higher dimensions give larger but still finite counts:

- In **three dimensions** there are 230 space groups (Fedorov 1890, Schönflies 1891, Barlow 1894), the backbone of X-ray crystallography.
- In **four dimensions** there are 4783 groups (4894 counting enantiomorphic pairs), enumerated by Brown, Bülow, Neubüser, Wondratschek, and Zassenhaus in 1978.

Bieberbach's theorems guarantee that in every dimension the number of crystallographic groups is finite. The playground's 3D and 4D tabs visualise representatives of these families, with the 4D viewer using stereographic projection, hyperplane slicing, and 4D rotation to make the structure visible.

## Limitations

The seventeen-group theorem is exact, but the visualisation makes simplifications worth stating plainly.

- **Curvature.** The classification is for the flat plane. On the sphere or the hyperbolic plane the crystallographic restriction changes and the count is different (infinite, in the hyperbolic case).
- **Glides are sampled, not continuous.** A glide is drawn as a reflected motif shifted by half a cell; the true glide is a continuous reflection-plus-translation, and the discrete offset is a legibility choice.
- **Fixed cell geometry.** Each group is shown with one fixed lattice shape. In reality, continuously deforming the cell can move a pattern from one group to another; the playground shows a single representative per group.
- **Single colour.** Only ordinary (uncoloured) symmetry is modelled. Allowing a colour permutation with each isometry expands the seventeen into the 46 two-colour plane groups, which the single-colour motif cannot express.

## References

- E. S. Fedorov, *Symmetry of regular systems of figures* (1891): the first proof that there are seventeen plane groups.
- G. Pólya, *Über die Analogie der Kristallsymmetrie in der Ebene* (Zeitschrift für Kristallographie, 1924).
- H. S. M. Coxeter and W. O. J. Moser, *Generators and Relations for Discrete Groups* (Springer): generators, relations, and notation for the plane and space groups.
- T. Hahn (ed.), *International Tables for Crystallography, Volume A*: the standard reference for plane and space group symbols and operations.
- H. Brown, R. Bülow, J. Neubüser, H. Wondratschek, H. Zassenhaus, *Crystallographic Groups of Four-Dimensional Space* (1978).
