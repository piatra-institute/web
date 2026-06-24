# Expected Free Energy and the Active Inference Account of Behaviour

## Abstract

Active inference is a framework in which perception, learning, and action are all cast as the minimisation of a single quantity: free energy. For action selection, the relevant quantity is the *expected* free energy (EFE) of a policy, a forward-looking functional that scores candidate courses of action before they are taken. This companion explains what EFE is, how it decomposes into a goal-directed (pragmatic) part and an information-seeking (epistemic) part, how the playground estimates it by Monte Carlo sampling in a linear-Gaussian world, and where the analogy to real agents holds and where it does not.

## Background: the free energy principle

The free energy principle starts from a simple premise. A system that persists must keep itself within a bounded set of states. To do so, it must resist the dispersion of its states implied by the second law, which means it must, in effect, model the causes of its sensations and act to keep its sensations in expected, preferred ranges. Variational free energy is a tractable upper bound on surprise (the negative log evidence for the system's sensory data under its own model). Minimising it for fixed action approximates Bayesian inference about hidden causes; minimising it by changing action is the part that matters for behaviour.

The variational free energy looks backward at data already received. To choose what to do next, an agent needs a quantity defined over outcomes it has not yet observed. That quantity is expected free energy.

## Expected free energy

For a policy (a sequence of intended actions), the expected free energy is the free energy the agent expects to incur, averaged over the outcomes the policy is likely to produce. It admits a decomposition that is the conceptual heart of the framework:

- **Pragmatic value (risk).** The expected divergence between predicted outcomes and the agent's preferred outcomes. Preferences are encoded as a prior over outcomes, so this term is large when a policy is expected to lead somewhere the agent does not want to be. Minimising risk is goal-seeking.

- **Epistemic value (ambiguity / information gain).** The expected uncertainty about hidden states that will remain after observing. Minimising ambiguity drives the agent toward observations that are maximally informative about the state of the world. This is the term that makes active inference *explore* rather than merely exploit.

An agent minimising EFE therefore balances getting to preferred outcomes against reducing its uncertainty. Crucially, this exploratory drive is not bolted on as a separate reward bonus; it falls out of the same functional. Where a reinforcement-learning agent needs an explicit exploration term, the active-inference agent explores because resolving uncertainty lowers expected free energy.

## Policy selection

Given the expected free energy `G(pi)` of each policy `pi`, the agent forms a posterior over policies by a softmax of the negative expected free energies:

`P(pi) = sigma(-gamma G(pi))`

where `gamma` is a precision that controls how decisively the agent commits to the lowest-G policy. High precision concentrates probability on the single best policy; low precision spreads it out, producing more variable, exploratory behaviour. The softmax guarantees a normalised distribution over policies, a fact the playground's calibration checks exactly.

## The model in this playground

The playground works in a deliberately simple linear-Gaussian world so the quantities have closed forms:

- The hidden state follows a zero-drift random walk, `s_{t+1} = s_t + epsilon`, with Gaussian state noise.
- Observations are the state plus Gaussian observation noise, `o_t = s_t + eta`.
- The **risk** term is the summed squared deviation of observations from the goal state, weighted by a risk weight `lambda`. Under the zero-drift walk the expected observation equals the integrated state mean, which is zero, so the deterministic risk over a horizon `T` is `lambda * T * goal^2`.
- The **ambiguity** term is the differential entropy of the Gaussian observation channel, `0.5 log(2 pi e variance)`, accumulated over the horizon. For a unit-variance channel this is `0.5 log(2 pi e)` per step.

The expected free energy displayed on the canvas is the sum of these two, estimated by averaging over many sampled trajectories. Because it is a Monte Carlo estimate, its value fluctuates from run to run; the fluctuation shrinks as the sample count grows.

The canvas also contrasts EFE with a Kullback-Leibler divergence. This contrast is pedagogical: a bare KL term captures only divergence between distributions (the risk-like part), whereas EFE adds the ambiguity term that rewards information-seeking. Watching the two diverge as observation noise changes makes the epistemic contribution legible.

## What is exact and what is sampled

The playground separates two things that are easy to conflate:

1. **The sampled estimate.** The number on the canvas is stochastic and should be read as an estimate with sampling variance, not an exact value.

2. **The analytic core.** The information measures the estimator is built from are exact functions with known targets. The calibration panel verifies these directly:
   - `D_KL(p || p) = 0` for any belief `p` (Gibbs inequality).
   - The entropy of a uniform distribution over `n` outcomes is exactly `log(n)`.
   - A softmax over any logits sums to exactly `1`.
   - The differential entropy of a unit-variance Gaussian is `0.5 log(2 pi e)`.
   - A worked EFE example with a fixed horizon, risk weight, noise, and goal reproduces its hand-computed risk-plus-ambiguity value.

Calibrating only the deterministic core is the honest move: we do not pretend the noisy Monte Carlo output is a theorem, but we do guarantee that the mathematics underneath it is correct.

## Limitations

- The linear-Gaussian world is a caricature. Real perception is non-linear and non-Gaussian, and the closed forms used here would not survive heavy-tailed or multimodal statistics.
- The hidden-state dynamics have no control: the random walk is not yet steered by the actions whose EFE is being scored. The playground visualises the *scoring* of outcomes more than the full perception-action loop.
- Preferences are fixed as a narrow Gaussian about the goal. A richer model would learn the preference prior and the likelihood from experience.
- EFE is one functional among several proposed objectives (free energy of the expected future, generalised free energy, and others). The decomposition shown here is the most common but not the only formulation.

## References

- Friston, K., Rigoli, F., Ognibene, D., Mathys, C., Fitzgerald, T., and Pezzulo, G. (2015). Active inference and epistemic value. *Cognitive Neuroscience*, 6(4), 187 to 214.
- Friston, K., FitzGerald, T., Rigoli, F., Schwartenbeck, P., and Pezzulo, G. (2017). Active inference: a process theory. *Neural Computation*, 29(1), 1 to 49.
- Parr, T., Pezzulo, G., and Friston, K. (2022). *Active Inference: The Free Energy Principle in Mind, Brain, and Behavior*. MIT Press.
- Schwartenbeck, P., Passecker, J., Hauser, T. U., FitzGerald, T. H. B., Kronbichler, M., and Friston, K. (2019). Computational mechanisms of curiosity and goal-directed exploration. *eLife*, 8, e41703.
- Cover, T. M., and Thomas, J. A. (2006). *Elements of Information Theory*. Wiley.
