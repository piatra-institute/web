# The Quincunx: How Random Bounces Become a Bell Curve

## Abstract

The fracqunx is an interactive Galton board. Beads fall through a lattice of pegs
and pile up in bins, and the pile reliably forms a bell curve no matter how
random each individual bead's path is. This companion explains why: the bin a
bead lands in follows a binomial distribution, and the binomial approaches a
normal distribution as the number of rows grows. It also says where this board
deliberately departs from the textbook picture.

## The bean machine

Francis Galton built the original device in the 1870s and called it the quincunx,
after the five-dot pattern on dice; it is also known as the bean machine. A ball
dropped at the top hits a peg, bounces left or right, hits another peg in the
next row, and so on, until it falls into a bin at the bottom. Galton used it to
make a statistical idea visible: order emerging from many small, independent
random events.

## Why the histogram is a binomial

Idealize each peg as a fair coin flip: at every row the bead goes right with
probability p and left with probability 1 minus p, independently of every other
row. Over n rows the number of rightward steps, which fixes the bin the bead
lands in, is a sum of n independent yes/no trials. That is exactly a binomial
random variable:

> P(land in bin k) = C(n, k) * p^k * (1 - p)^(n - k)

with mean n*p and variance n*p*(1 - p). For a fair board (p = 1/2) the mean bin
is n/2 and the standard deviation is sqrt(n)/2. The calibration panel in the
playground checks these directly: it computes the mean, spread, and central mass
from the binomial formula and compares them to the closed-form values.

## Why it becomes a normal curve

A binomial built from many trials is well approximated by a normal (Gaussian)
curve with the same mean and variance. This is the de Moivre-Laplace theorem,
proved by Abraham de Moivre in 1733 and generalized by Laplace, and it is the
oldest case of the central limit theorem: the sum of many small independent
contributions tends to a normal distribution regardless of the details of each
contribution.

The playground makes the convergence concrete. About 68% of a normal sits within
one standard deviation of the mean. The calibration measures the same fraction
for the binomial with 16 rows and with 100 rows: the value starts a little high
because of discreteness and moves toward the normal 68% as rows are added. The
robust claim is the convergence, not an exact match at any finite number of rows.

## Where this board is not the textbook quincunx

Two honest caveats, both surfaced in the assumptions panel:

1. **Editable, adaptive pegs.** The clean bell curve assumes identical, unbiased
   pegs. This board lets you move pegs, bias them, and draw a target curve that
   the pegs adapt toward through a stress-sharing rule. Once you do that, the
   global distribution is a mixture, not a single binomial, and the board becomes
   a sandbox for departures from the ideal as much as a demonstration of it.

2. **Physics, not coin flips.** The beads are simulated rigid bodies with finite
   size, restitution, and bead-to-bead collisions, stepped in discrete time. That
   is an approximation of contact dynamics, not the abstract Bernoulli process,
   and when beads pile up or the adaptive pegs react, the simulated histogram can
   drift from the ideal binomial.

## The takeaway

Individual bead paths are unpredictable; the aggregate is not. That gap, between
microscopic randomness and macroscopic order, is the whole point of the quincunx,
and it is why Galton's machine remains one of the clearest physical pictures of
the central limit theorem.

## References

- Galton, F. (1889). Natural Inheritance. Macmillan. (Describes the quincunx.)
- de Moivre, A. (1733). Approximatio ad summam terminorum binomii. (The normal
  approximation to the binomial.)
- Standard probability texts on the binomial distribution and the de
  Moivre-Laplace central limit theorem.
