# Activation Functions: A Research Companion

## Abstract

An activation function is the small nonlinearity placed after each affine layer in a neural network. Without it, a stack of linear layers collapses into a single linear map and the network can represent only linear functions of its input. The activation is therefore the source of a network's expressive power. This companion surveys the families implemented in the lab, explains why the choice matters for gradient flow, and traces the line of reasoning that led the field from the saturating sigmoid through ReLU to the smooth gated activations (GELU, Swish) that dominate modern transformers.

## Why nonlinearity is necessary

A layer computes `y = W x + b`, an affine map. Composing two affine maps gives another affine map, so a network of any depth built only from affine layers is equivalent to a single affine layer. The universal approximation results require a nonlinear activation between layers; with one, a sufficiently wide network can approximate any continuous function on a compact domain. The activation is the ingredient that turns a deep stack into a function approximator rather than a glorified matrix multiply.

Two properties of an activation matter for training:

- **Its output range and curvature** shape the forward signal.
- **Its derivative** controls the backward signal, because backpropagation multiplies the gradient by the activation's derivative at every layer it passes through.

The second point is the heart of the activation story.

## The vanishing gradient problem

Backpropagation computes the gradient of the loss with respect to an early parameter by multiplying together the derivatives of every layer between that parameter and the loss. If each of those derivatives is smaller than 1 in magnitude, their product shrinks geometrically with depth. After enough layers the gradient reaching the early parameters is effectively zero, and those parameters stop learning. This is the vanishing gradient problem.

The classic saturating activations make this worse. The logistic sigmoid

```
sigmoid(x) = 1 / (1 + e^(-x))
```

has derivative `sigmoid(x) (1 - sigmoid(x))`, which peaks at only 0.25 at the origin and decays toward zero as the input grows in either direction. A deep sigmoid network multiplies many factors of at most 0.25, and the gradient collapses. The hyperbolic tangent

```
tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))
```

is better centred (it is odd, with tanh(0) = 0, so it does not push activations off toward a positive mean), and its derivative reaches 1 at the origin. But tanh still saturates: for large magnitude input its derivative also goes to zero. Both functions flatten in their tails, and a flat region means a near-zero derivative, which means a vanishing contribution to the gradient.

## Why ReLU

The rectified linear unit

```
ReLU(x) = max(0, x)
```

changed deep learning practice because of what it does to gradients. For any positive input its derivative is exactly 1, so it neither shrinks nor grows the backward signal: gradients can flow through long chains of active ReLU units without geometric decay. ReLU is also cheap (a single comparison) and induces sparsity, since on average about half its units output zero.

ReLU's weakness is the mirror image of its strength. For negative input its output is zero and its derivative is zero, so a unit whose input is reliably negative receives no gradient and never recovers. This is the **dying ReLU** problem: a fraction of units can become permanently inactive. The leaky and parametric variants address it by giving the negative branch a small nonzero slope:

```
LeakyReLU(x) = max(0, x) + alpha * min(0, x)
```

with `alpha` a small fixed constant (LeakyReLU) or a learned parameter (PReLU). The exponential linear unit (ELU) and its scaled, self-normalising cousin (SELU) replace the negative branch with a smooth saturating exponential, pushing the mean activation toward zero while keeping a bounded negative response.

## Smooth, self-gated activations

Modern architectures, transformers in particular, largely moved past ReLU to smooth activations that gate the input by a function of itself. Two dominate.

**Swish / SiLU** multiplies the input by a sigmoid of the input:

```
Swish(x) = x * sigmoid(beta * x)
```

With `beta = 1` this is the sigmoid linear unit (SiLU). The function is smooth everywhere, non-monotonic (it dips slightly below zero for moderately negative input before returning to zero), and was found by an automated search over candidate activations to improve accuracy on several benchmarks.

**GELU** (Gaussian error linear unit) weights the input by the probability that a standard normal variable is below it:

```
GELU(x) = x * Phi(x)
```

where `Phi` is the standard normal cumulative distribution function. Because `Phi` is expensive, two approximations are common. The tanh approximation

```
GELU(x) ~ 0.5 x (1 + tanh(sqrt(2 / pi) (x + 0.044715 x^3)))
```

and the sigmoid approximation `GELU(x) ~ x * sigmoid(1.702 x)`. GELU passes through the origin (GELU(0) = 0), is smooth, and like Swish is mildly non-monotonic. It is the default activation in BERT, GPT-family models, and most vision transformers.

The intuition for why smooth gated activations help: they keep a small but nonzero gradient for negative input, avoiding the hard dead zone of ReLU, while still suppressing large negative responses. They are differentiable everywhere, which removes the kink that ReLU has at the origin, and the gating gives the network a soft, input-dependent switch rather than a hard threshold.

## Bounded and specialised families

Beyond the main line, the lab includes several other families worth naming.

- **Bounded** activations (tanh, softsign, arctan, hard tanh) constrain the output to a fixed range and are still useful in recurrent gates and as squashing functions.
- **Soft** activations (softplus, the smooth `log(1 + e^x)` relative of ReLU) are everywhere differentiable.
- **Hard** variants (hard sigmoid, hard swish) replace expensive exponentials with piecewise-linear approximations for efficiency on mobile hardware.
- **Oscillating and periodic** activations (sine, sinc, the snake function `x + sin^2(a x) / a`) help networks represent periodic signals and coordinate fields.

Softmax sits apart from all of these. It is not a pointwise activation but a normalisation over a vector of logits, producing a probability distribution that sums to 1. In the two-class case it reduces exactly to the logistic sigmoid, which is the form the lab plots as Softmax1D.

## How the lab tests itself

The calibration panel checks the implementation against facts that admit no opinion:

- `sigmoid(0) = 0.5`, the logistic midpoint.
- `tanh(2) + tanh(-2) = 0`, the odd symmetry of tanh.
- `ReLU(-3) = 0`, the dead negative region.
- The central-difference derivative of sigmoid at the origin recovers `0.25`, the analytic peak slope.
- A two-class softmax normalises: `softmax1d(x) + softmax1d(-x) = 1`.

Each predicted value is produced by calling the same functions the plots use, so the panel catches any drift between the displayed curves and their mathematical definitions.

## Limitations

The lab is a one-dimensional shape explorer. It shows what each activation does to a single scalar input and to that input's derivative. It does not train networks, so it cannot tell you which activation will win on your task; the assumptions panel marks that question contested for good reason, because the answer depends on architecture, depth, normalisation, and initialisation. The vanishing-gradient narrative is a heuristic about derivative magnitude, not a guarantee, and modern residual connections and normalisation layers change how severely it bites. Read the curves as a map of the design space, not as a ranking.

## References

- V. Nair and G. Hinton (2010). Rectified linear units improve restricted Boltzmann machines.
- X. Glorot and Y. Bengio (2010). Understanding the difficulty of training deep feedforward neural networks.
- K. He, X. Zhang, S. Ren, J. Sun (2015). Delving deep into rectifiers (PReLU and rectifier initialisation). arXiv:1502.01852.
- D.-A. Clevert, T. Unterthiner, S. Hochreiter (2015). Fast and accurate deep network learning by exponential linear units (ELUs). arXiv:1511.07289.
- D. Hendrycks and K. Gimpel (2016). Gaussian error linear units (GELUs). arXiv:1606.08415.
- P. Ramachandran, B. Zoph, Q. Le (2017). Searching for activation functions (Swish). arXiv:1710.05941.
- G. Klambauer, T. Unterthiner, A. Mayr, S. Hochreiter (2017). Self-normalizing neural networks (SELU). arXiv:1706.02515.
