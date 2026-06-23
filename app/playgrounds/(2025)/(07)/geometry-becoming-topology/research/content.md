# Geometry Becoming Topology: What Survives When Distance Stops Mattering

## Abstract

Geometry asks how far. Topology asks what is connected. This playground puts both
on the same set of points and lets you watch one dissolve into the other: drag a
point and the distances change continuously, but the number of pieces and the
number of loops stay fixed. Those stubborn integers are topological invariants,
and the calibration computes them exactly.

## Two structures on the same points

A handful of points in the plane carries two very different kinds of structure:

- A **metric**: the exact distance between any two points. This is geometry. It is
  coordinate-dependent, every distance changes when you move a point.
- A **topology**: which points are joined, and what loops those joins form. This
  is connection only. It does not care where the points sit, just how they link.

The playground's central move is to throw away the first and keep the second, and
to make visible what is lost and what remains.

## Betti numbers

Topology is summarized by integers called Betti numbers. For a graph (points and
edges) the first two are all there is:

- **b0**, the number of connected components, how many separate pieces the figure
  is in. The calibration checks that two disjoint edges give b0 = 2.
- **b1**, the cycle rank, the number of independent loops, computed as
  edges minus vertices plus components. A triangle has b1 = 3 - 3 + 1 = 1, one
  loop; a square with a diagonal has b1 = 5 - 4 + 1 = 2, two loops. The
  calibration checks both.

The Euler characteristic ties them together: for a graph it is vertices minus
edges, and it equals b0 minus b1. For the triangle that is 3 - 3 = 0, matching
1 - 1. The calibration confirms this too.

## Deformation invariance

The point of calling these invariants is that they do not change under continuous
deformation. Stretch the triangle, bend its edges, slide its corners, and it still
has one loop. The calibration dramatizes the contrast directly: a metric distance
(the 3-4-5 example gives exactly 5) is a number that moves when points move, while
the loop count and component count are integers that do not. Geometry is fluid;
topology is rigid.

## Graphs, not surfaces

An honest scope note. This model works with graphs, one-dimensional complexes of
points and edges, so its Euler characteristic is vertices minus edges and its
"holes" are graph loops (b1). The famous surface story, where the Euler
characteristic is 2 - 2g and g counts the handles of a doughnut, needs faces, a
two-dimensional complex. The playground illustrates the geometry-to-topology idea
on graphs, where only b0 and b1 are defined; the surface and exotic-sphere
mentions in the interface are context, not computations.

## What it is

A hands-on illustration of one of the deepest moves in mathematics: deciding that
distance no longer matters and asking what is left. What is left is topology, and
the calibration shows it is exact, integer, and indifferent to how you push the
points around.

## References

- Standard introductions to graph homology and Betti numbers.
- Milnor, J. (1956). On manifolds homeomorphic to the 7-sphere. (Exotic spheres,
  mentioned as context.)
