# Self-Sorted Arrays: Sorting as a Collective Behaviour

## Abstract

A sorting algorithm usually has a god's-eye view: a central procedure shuffles
passive values into order. This playground inverts that. Each element is an
autonomous cell that only sees its neighbours and decides for itself whether to
swap. Order emerges from the bottom up. The framing follows recent work treating
sorting algorithms as "agential material," and while the agency is a metaphor, the
order metrics underneath are exact, and the calibration pins them.

## Sorting without a sorter

In the usual telling, bubble sort or insertion sort is a recipe executed on inert
data. Here the data does the sorting. Each cell carries an algotype (bubble,
insertion, or selection), a swap policy, and a mutation strategy, and it acts only
on local comparisons with its neighbours. No cell can see the whole array. That
locality is the whole point: it asks whether global order can arise from purely
local, self-interested moves, the same question basal-cognition research asks of
cells in a developing body.

This connects to Zhang, Goldstein and Levin's striking result that even classical
sorting algorithms, reframed as populations of agents, show unexpected robustness:
they still sort when some elements are "broken," and they exhibit clustering and
delayed-gratification behaviours that the monolithic algorithm never displays.

## Measuring order

Two exact metrics quantify what is happening, and the calibration checks both
against hand-built arrays:

- **Sortedness**: the fraction of adjacent pairs already in increasing order. A
  fully ascending array of length n scores (n-1)/n (0.75 for length 4, 0.8 for
  length 5), and a reversed array scores 0.
- **Aggregation**: the fraction of adjacent pairs that share an algotype. This is
  a separate axis from value-sortedness, it measures whether like cells have
  clustered together. Uniform algotypes score high; alternating ones score 0.

The two axes can move independently: an array can become value-sorted while its
algotypes stay mixed, or cluster by algotype without being sorted. Watching both
is what makes the agential dynamics legible.

## A fix along the way

Bringing this playground up to standard surfaced a real bug: the sortedness metric
compared cell *objects* rather than their values, so it always returned zero. The
function's name and its aggregation sibling (which correctly compares algotypes)
made the intent unambiguous, so the comparison was fixed to use cell values. The
calibration now verifies the corrected metric.

## What it is

A conceptual sandbox for "sorting as agency," for exploring robustness,
clustering, mutation, and the gap between a centralized algorithm and a population
of local agents. It is not a sorting benchmark, and the cells are not literal
biological cells. The exact, checkable content is the order metrics; the
basal-cognition reading is the lens that makes them interesting.

## References

- Zhang, T., Goldstein, A., and Levin, M. (2023). Classical sorting algorithms as
  a model of morphogenesis: self-sorting arrays reveal unexpected competencies.
- Standard references on bubble, insertion, and selection sort.
