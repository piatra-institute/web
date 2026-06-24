# Kernel Smoothing, Density Estimation, and the Hidden Average Inside Attention

## Abstract

Kernel smoothing is one of the oldest and most reusable ideas in statistics: to estimate a quantity at a point, take a weighted average of nearby observations, where the weights fall off with distance according to a kernel. The same construction produces kernel density estimation when there is no response variable, Nadaraya-Watson regression when there is, and, read structurally, the attention mechanism that powers modern transformers. This companion sets out the exact definitions the playground depends on, the bias-variance tradeoff that governs the only parameter that really matters, and the precise sense in which attention is and is not a kernel smoother.

## What a kernel is

A kernel is a weighting function `K(u)` with three defining properties: it is non-negative, it is symmetric so that `K(-u) = K(u)`, and it integrates to one over the real line. The last condition is what makes a kernel a probability density rather than an arbitrary bump. Two kernels appear repeatedly.

The Gaussian kernel is the standard normal density, `K(u) = (1 / sqrt(2 pi)) exp(-u^2 / 2)`. Its peak value at the origin is `1 / sqrt(2 pi)`, approximately 0.3989, and it has infinite support: every observation contributes some weight, however small.

The Epanechnikov kernel is `K(u) = 0.75 (1 - u^2)` for `|u| <= 1` and zero outside. It has compact support, so distant points contribute nothing, and it is asymptotically optimal: among all kernels it minimizes the mean integrated squared error of the resulting estimate. The catch is that its advantage over other reasonable kernels is only a few percent, which is the central practical fact about kernel choice.

The playground's calibration panel checks these properties directly. It confirms the Gaussian peak equals `1 / sqrt(2 pi)`, that both kernels integrate numerically to one, and that each is an even function. These are not empirical fits; they are closed-form identities the code must reproduce exactly.

## From kernels to estimates

Kernel density estimation places a scaled kernel at every observation and sums them. With `n` samples and bandwidth `h`, the estimated density at a point `x` is the average of `(1 / h) K((x - x_i) / h)` over the sample. The result is a smooth curve whose roughness is controlled entirely by `h`.

Nadaraya-Watson regression extends this to the case where each location `x_i` carries a response `y_i`. The estimate at a query `x_q` is the kernel-weighted average

```
yHat(x_q) = sum_i alpha_i y_i,   alpha_i = K(x_q, x_i) / sum_j K(x_q, x_j).
```

Because the weights `alpha_i` are normalized to sum to one, the estimator is a genuine average. One consequence is exact and worth stating: if every response equals the same constant, the prediction equals that constant at every query, for any bandwidth and any kernel. This partition-of-unity property is the cleanest invariant the playground exposes, and the calibration panel verifies it to machine precision.

## The bandwidth tradeoff

Kernel shape is a second-order concern. The bandwidth is everything. A small bandwidth makes the weighted average local: the estimate follows the data closely, with low bias but high variance, and the curve wiggles. A large bandwidth averages over a wide neighbourhood: variance drops but the estimate is biased toward a flat global mean, washing out real structure. This is the bias-variance tradeoff in its most transparent form.

The optimal bandwidth balances squared bias against variance. For a fixed kernel and a smooth target, minimizing the asymptotic mean integrated squared error gives an optimal bandwidth that shrinks as roughly `n^(-1/5)`, slowly enough that large samples still need visibly nonzero smoothing. Practical selectors, plug-in rules and cross-validation, estimate this optimum from the data, but they rest on smoothness assumptions that discontinuities and heavy tails can violate.

Kernel smoothing also suffers near the edges of the data, where the local neighbourhood becomes one-sided and the average is pulled inward. Local-linear regression, which fits a line rather than a constant in each neighbourhood, removes much of this boundary bias and is the standard refinement. The playground uses the local-constant Nadaraya-Watson form for legibility and does not correct the boundary.

## Attention as a learned kernel

Scaled dot-product attention computes, for a query `q` and keys `k_i`, weights `softmax(q . k_i / sqrt(d_k))` and returns the weighted sum of values `v_i`. Line up the pieces: the query is the evaluation point, the keys are sample locations, the values are responses, the softmax produces normalized non-negative weights that sum to one, and the temperature `sqrt(d_k)` plays the role of a bandwidth that sharpens or flattens the weighting. Under this reading attention is a Nadaraya-Watson smoother whose kernel is learned through the query, key, and value projections.

The analogy is genuinely productive and it has limits. A classical kernel is symmetric and translation-invariant: `K(x_q, x_i)` depends only on the distance between the points. The softmax-dot weight is neither. It is not symmetric in query and key, it need not integrate to a fixed mass over key space, and the learned projections make the geometry non-stationary, different in different regions. So attention is a kernel-weighted average, which is exact, but it is not a kernel smoother in the strict density-estimation sense, which is why the playground keeps that correspondence marked as contested rather than established. The softmax-dot kernel in the controls is included precisely so the difference from a symmetric Gaussian is visible: it prefers points whose dot product with the query is large, biasing toward keys aligned with the query rather than merely close to it.

## What the playground shows

The sandbox lets you place one-dimensional points, move a query, and watch three coupled views: the kernel shape centred on the query, the data with the resulting prediction, and the bar chart of normalized weights. Shrinking the Gaussian bandwidth makes the weights collapse onto the nearest point; widening it spreads them toward a flat average. Switching to the softmax-dot kernel and lowering the temperature makes the weights peaky in the manner of attention focusing on a few keys. The calibration panel underneath certifies that, whatever the controls do, the underlying kernels remain proper symmetric densities and the estimator remains a true average.

## References

- Nadaraya, E. A. (1964). On estimating regression. Theory of Probability and Its Applications.
- Watson, G. S. (1964). Smooth regression analysis. Sankhya.
- Epanechnikov, V. A. (1969). Non-parametric estimation of a multivariate probability density. Theory of Probability and Its Applications.
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis.
- Wand, M. P., and Jones, M. C. (1995). Kernel Smoothing.
- Fan, J., and Gijbels, I. (1996). Local Polynomial Modelling and Its Applications.
- Hastie, T., Tibshirani, R., and Friedman, J. (2009). The Elements of Statistical Learning.
- Vaswani, A., et al. (2017). Attention Is All You Need. NeurIPS.
- Tsai, Y.-H. H., et al. (2019). Transformer Dissection: A Unified Understanding of Transformer's Attention via the Lens of Kernel. EMNLP.
