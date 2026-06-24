# Coasellular Morphogenesis: the Coase Theorem as a Lens on Cellular Development

## Abstract

This companion sets out what the coasellular morphogenesis playground does and does not claim. The playground treats a developing tissue as a grid of cellular agents that bargain with their neighbours over shared-boundary states, moving value at a cost. The defensible thesis is narrow and structural: if cells are read as agents holding endowments, then local bargaining redistributes those endowments without destroying them (a conservation law), and bargaining is throttled by transaction costs. Both are exact properties of the model and mirror the two halves of Ronald Coase's argument. The broader reading, that biological development literally is an economy of self-interested cells, is offered as an interpretive frame, not a result.

## The Coase theorem in one paragraph

Ronald Coase made two connected points. In *The Nature of the Firm* (1937) he asked why firms exist at all if markets allocate resources efficiently, and answered that using the market is not free: there are costs to discovering prices, negotiating, and enforcing contracts. In *The Problem of Social Cost* (1960) he argued that when these transaction costs are zero and rights are well defined, parties will bargain their way to an efficient allocation no matter who holds the rights initially. The result that bears his name is therefore really two claims: a conservation-and-efficiency claim that holds when bargaining is free, and a friction claim that says positive transaction costs are exactly what make the initial allocation, and institutions, matter.

## From firms to cells

The bridge this playground walks across is the idea, developed in Michael Levin's work, that cells are competent agents pursuing goals in physiological and bioelectric state space rather than passive executors of a genetic program. If a cell has something like preferences over its own state and can influence its neighbours, then the language of bargaining, endowments, and cost becomes available. Coasellular morphogenesis takes that invitation literally as a modelling device: it asks what a tissue looks like when neighbouring cells negotiate over their shared boundaries and pay an energetic price to do so.

This is a metaphor with teeth, but it is still a metaphor. Mainstream developmental biology explains a great deal of spatial patterning with positional information, reaction-diffusion systems, and mechanochemical feedback, none of which require agents or bargaining. The economic framing earns its place only where it adds predictive or explanatory structure the mechanical accounts do not.

## What the playground models

The tissue is a grid of circles. Each circle is a cell; the points arranged around it are its endowment, integer values it can trade; each cell also carries an energy budget. Circles rotate at a fixed rate, a developmental clock that repeatedly brings interior points into the boundary cone where they face a neighbour. When a point on one circle and a point on the adjacent circle both sit in their shared boundary region, they form a transacting pair.

A transaction moves one unit of value from one cell to the other:

```
value_give  -= 1
value_take  += 1
```

and charges both cells for the privilege:

```
energy_give += cost
energy_take += cost
```

Two structural facts follow immediately, and both are checked exactly in the calibration panel.

First, **value is conserved**. Because every transaction subtracts from one point exactly what it adds to another, the total endowment summed over the whole grid never changes. Bargaining only reallocates. This is the conservation half of Coase: in the frictionless limit, trading moves value to where it is most useful without any net loss.

Second, **bargaining is not free**. Both cells in a pair have their energy moved by `cost` with the same sign, so each transaction spends `2 * cost` units of energy across the grid. The cumulative energy to clear every adjacent pair of an `r`-by-`c` grid is therefore `pairs * 2 * cost`, where `pairs = r*(c-1) + (r-1)*c`. This is the friction half of Coase: raising the transaction cost drains the cells' budgets faster and suppresses further negotiation, so the path development takes depends on how expensive bargaining is.

## Calibrating the structural claims

The live grid is stochastic: starting energies are random and the sign of each value adjustment is random. That noise means the model cannot be calibrated point for point, so the calibration panel verifies the invariants that hold for every random draw. A deterministic core, with the random draws removed, computes each predicted value:

- **Value conservation.** A fixed endowment is run through a sequence of transactions with mixed signs; the total before and after must match. It does, to the unit.
- **Neighbour-pair counts.** For a 3-by-3 grid the geometry forces twelve transacting pairs (six horizontal, six vertical); for the default 2-by-2 grid, four. Both are computed from the adjacency formula.
- **Transaction friction.** A single transaction at unit cost spends two energy units; clearing every pair of a 3-by-3 grid at cost two spends forty-eight. Both follow from the per-transaction friction by linearity.

Every predicted value is computed from the logic module rather than hardcoded, and each matches its Coasean target exactly.

## Limitations

The honest scope is small. The rotation is a scheduling device, not a claim that cells spin. Treating a cell as a self-interested agent is contested, and treating its neighbours as distributed memory is more speculative still. The grid is a single small stochastic run, not a fitted simulator of any organism, and the conservation and friction results, while exact, are properties of the chosen transaction rule rather than measurements of a tissue. What the playground supports is a qualitative claim: the two halves of the Coase theorem, costless reallocation and costly friction, have clean analogues in a model of cells bargaining over shared boundaries, and that analogy is worth taking seriously as a generator of hypotheses about development.

## References

- Coase, R. (1937). The Nature of the Firm. *Economica*.
- Coase, R. (1960). The Problem of Social Cost. *Journal of Law and Economics*.
- Williamson, O. (1985). *The Economic Institutions of Capitalism*.
- Levin, M. (2019 and later). Work on cells as competent agents and bioelectric pattern memory.
