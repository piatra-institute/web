# Neural Cellular Automata

## Abstract

A neural cellular automaton (neural CA) replaces the hand-written lookup table of a classical cellular automaton with a small neural network shared by every cell. Each cell repeatedly reads the states of its immediate neighbours, runs them through the same little network, and writes back a new state. From this purely local rule, global structure can grow, persist, and even repair itself. This companion sets out what the playground actually computes, where it sits relative to the published literature, and which of its claims are solid versus suggestive.

## Background: from lookup tables to learned rules

A cellular automaton is a grid of cells, a finite set of states, a neighbourhood, and an update rule that maps a cell's neighbourhood to its next state. Conway's Game of Life and Wolfram's elementary rules are the canonical examples: the rule is a fixed table, and all the richness comes from iterating it. The surprising lesson of that tradition, set out at length in Wolfram's *A New Kind of Science* (2002), is that extremely simple local rules can generate unbounded apparent complexity.

A neural cellular automaton keeps the grid, the neighbourhood, and the iteration, but makes the rule a function with parameters. Instead of a table, each cell applies a small network:

- gather the neighbourhood (here the nine-cell Moore block: the cell plus its eight surrounding cells),
- pass those values through one or more dense layers (a weighted sum plus a bias, followed by a nonlinearity),
- read off a new state from the network's output.

Because the rule now has weights, it can in principle be *learned* rather than designed. Two broad strategies appear in the literature, and they matter for reading this playground honestly.

## Two ways a neural CA can learn

**Trained, goal-directed CA.** The most influential modern example is Mordvintsev, Randazzo, Niklasson, and Levin's *Growing Neural Cellular Automata* (Distill, 2020). There, each cell holds a continuous state vector; perception is a fixed Sobel-and-identity convolution over the neighbourhood; and a small two-layer network maps the perceived vector to a residual update. Crucially, the whole rule is trained end-to-end by backpropagation through many update steps so that the grid grows a *specific target image* from a single seed. A stochastic update mask (only some cells fire each step) and an alive-masking step (cells stay dead until a neighbour's alpha channel is high enough) make growth asynchronous and bounded. A striking result of that work is robust regeneration: a CA trained only to grow a shape will also regrow it after damage, without ever being shown damage during training.

**Self-organising, local-learning CA.** A different lineage keeps the rule local and lets it change by a local plasticity rule, with no global target and no backpropagation. The classic local rule is Hebbian: connections between co-active units strengthen ("cells that fire together wire together," after Hebb's 1949 *Organization of Behavior*). Here there is no objective function to descend; order, if it appears, is an emergent property of the local rule, not a fitted outcome.

This playground sits in the **second** lineage. Its cells learn by a local Hebbian update with weight clipping, optionally perturbed by random mutation. It is therefore a model of *self-organisation*, not a model of *training a CA to draw a picture*. That distinction is the single most important thing to keep straight when interpreting it.

## What this model actually computes

The per-cell update in the playground is deliberately transparent:

1. **Perception.** Each cell collects the binary states of its nine Moore neighbours on a toroidal (wrap-around) grid. Unlike the Growing-NCA Sobel perception, this is the raw neighbour vector.
2. **Forward pass.** The vector flows through a stack of dense layers. For layer `l` and neuron `n`, the pre-activation is `bias[n] + sum_i activation[i] * weight[l][n][i]`, and the activation is one of sigmoid, tanh, ReLU, or leaky ReLU.
3. **State rule.** The first output channel is thresholded at 0.5: above it the cell is alive (state 1), below it dead (state 0). This keeps the visible automaton in the classical discrete regime even though the internal activations are continuous.
4. **Plasticity.** In Hebbian mode, each weight is nudged by `rate * output * input` and clipped to a bounded range, so correlated activity strengthens connections. An optional mutation mask randomly perturbs weights and biases.
5. **Readout.** A descriptive fitness (complexity, stability, oscillation, or diversity) summarises the current grid. It is reported, not optimised: nothing in the dynamics is driven to increase it.

The only stochastic ingredients are the random initial weights and the random mutation mask. Everything between a fixed neighbourhood and a fixed weight set is deterministic, which is why the calibration suite can pin the forward pass to hand-computed values.

## Calibration: pinning the deterministic core

Because the update arithmetic is deterministic, it can be checked exactly. The calibration panel does not try to validate the emergent global behaviour (which is genuinely stochastic and run-dependent). Instead it pins the building blocks:

- **sigmoid(0) = 0.5.** The logistic nonlinearity at zero pre-activation sits at its midpoint.
- **tanh identity layer at x = 1 = 0.7616.** A single tanh neuron with unit weight and zero bias passes the input through, giving tanh(1).
- **ReLU clips a negative drive to 0.** A ReLU neuron with negative pre-activation outputs exactly zero, the dead half-plane.
- **alive threshold under saturation gives state 1.** Nine living neighbours through one sigmoid neuron with unit weights drive the first channel above 0.999, so the centre cell stays alive.
- **complexity density 4/8 = 0.5.** A live centre cell with four matching and four differing neighbours contributes a complexity density of one half.

Each predicted value is produced by the same `activate`, `forwardPass`, `stateFromOutput`, and `complexityDensity` functions the live grid uses, so the suite is a genuine test of the running code, not a restatement of constants. All five reproduce at zero error.

## Results and behaviours to look for

Running the grid, several qualitative regimes appear depending on the activation function, depth, and learning rate:

- **Saturating regimes (sigmoid, tanh).** Bounded outputs tend to push the grid toward stable or slowly drifting configurations; the complexity readout settles.
- **Rectifying regimes (ReLU, leaky ReLU).** Unbounded positive drive can let activity grow and produce sharper, more volatile texture.
- **Hebbian drift.** With plasticity on, correlated regions reinforce themselves, so locally coherent patches can emerge and compete; with mutation on, the rule wanders and never fully freezes.

These are observations about a single stochastic run, not statistical claims. Re-seeding changes the details.

## Limitations

This is a sandbox, and it is honest about its scope:

- The visible state is hard-thresholded to binary, discarding the graded information that lets continuous Growing-NCA regenerate fine images.
- Learning is local and goal-free, so there is no guarantee of convergence to any useful morphology; "order emerges" is a hope the dynamics may or may not realise on a given seed.
- The fitness functions are descriptive readouts; "selection pressure" is a label, not an implemented population-level evolutionary loop.
- The morphogenesis framing is an analogy. The model omits chemistry, mechanics, and gene regulation, and shares only the structural idea that local computation can produce global form.
- Everything on screen is one run with one random initialisation; nothing statistical should be read off it.

## Relation to morphogenesis

The deeper motivation, shared with the Growing-NCA work and with Turing's 1952 account of morphogenesis, is that biological form is built by cells following local rules with access only to their neighbourhood, yet the result is robust, reproducible global structure that can repair damage. Neural CA make that idea concrete and manipulable: a single learned local rule, iterated, can grow and maintain a pattern. The playground lets you feel the mechanism. It does not claim to be a tissue.

## References

- Mordvintsev, Randazzo, Niklasson, Levin (2020). *Growing Neural Cellular Automata.* Distill.
- Randazzo, Mordvintsev, Niklasson, Levin, Greydanus (2020). *Self-classifying MNIST Digits.* Distill.
- Turing, A. M. (1952). *The Chemical Basis of Morphogenesis.* Philosophical Transactions of the Royal Society B.
- Hebb, D. O. (1949). *The Organization of Behavior.*
- Wolfram, S. (2002). *A New Kind of Science.*
- Mitchell, Crutchfield, Das (1996). *Evolving cellular automata with genetic algorithms.*
