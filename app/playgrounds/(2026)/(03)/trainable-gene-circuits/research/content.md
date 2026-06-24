# Trainable Gene Circuits

## Abstract

This playground asks a deliberately provocative question: in what sense can a gene regulatory network learn? It implements three small circuits as coupled nonlinear ordinary differential equations and drives each through a structured stimulation protocol. The associative circuit stores a trace of paired stimulation in a slow variable and later responds to a weak cue it would otherwise ignore. The toggle circuit commits to one of two stable states after a transient pulse. The repressilator stores state in a sustained oscillation. None of these circuits rewires its topology or descends a loss function. What changes is the trajectory: after stimulation the system occupies a different part of its state space, and that is the precise, modest sense in which Michael Levin and collaborators say gene networks can be trained.

## Background

The phrase "learning in a gene network" invites a category error. In machine learning, learning means adjusting parameters, the weights of a model, by gradient descent on an objective. A gene regulatory network has no obvious objective and no mechanism that resembles backpropagation. So when researchers in the Levin lab and adjacent groups describe transcriptional networks as exhibiting memory, habituation, sensitization, and even Pavlovian conditioning, they are using these words in a different sense.

The relevant sense comes from dynamical systems. A network of genes whose products activate and repress one another is a continuous dynamical system on expression space. Its long-term behaviour is organised by attractors: stable fixed points, limit cycles, and the basins that funnel trajectories toward them. A timed external stimulus can push the state across a separatrix into a new basin, or it can charge up a slow internal variable whose long relaxation time outlasts the stimulus. In both cases the network's future response to the same input has changed because of its past. That history dependence is what these authors call learning.

Two papers anchor the playground. Fernando, Liekens, Bingle and colleagues (2009) constructed a small gene circuit that reproduces associative conditioning: simultaneous presentation of two stimuli raises a slow weight-like variable, after which the second stimulus alone can trigger the response. Biswas, Manicka, Lobikin and Levin (2023, building on a 2021 study) screened dozens of published biochemical pathway models and found that a surprising fraction display memory: a persistent change in response after a conditioning stimulus, sometimes meeting formal criteria for habituation, sensitization, or associative learning. The common mathematical species across this work is coupled production-degradation ODEs with saturating Hill or sigmoid regulation.

## Model description

The playground integrates three genes, written A, B and C, with concentrations evolving according to

    dx_i/dt = basal_i + beta_i * regulation_i(x, u) - decay_i * x_i

for i in {A, B, C}. Here basal_i is leak production, beta_i is the maximal regulated production rate, decay_i is first-order degradation, and u = (u1, u2) are two external stimulus channels. The regulation term is a product of signed Hill factors, one per incoming edge.

### Hill regulation

Every regulatory edge is a Hill function. Activation by a regulator at concentration x with threshold K and coefficient n is

    f_act(x) = x^n / (K^n + x^n)

and repression is its complement

    f_rep(x) = K^n / (K^n + x^n).

These functions have exact landmarks the playground's calibration checks directly. At x = K each returns one half. As x goes to zero, activation goes to zero and repression goes to one. The coefficient n controls sharpness: small n gives a graded response, large n approaches a step. The model wraps each edge in a signed factor whose magnitude is the coupling weight w and whose sign chooses activation or repression; when w is zero the factor is exactly one, so a disconnected edge has no effect. That identity is also verified in calibration.

### Stimulation protocol

A single run passes through five phases: a quiet baseline, a training window in which both stimulus channels are presented, a washout with no stimulus, a probe window in which a single weak stimulus is applied, and a final relaxation. This protocol is what makes the difference between transient response and durable memory legible. A network that only reacts while a stimulus is present will be quiet during the probe; a network that learned during training will respond to the probe even though the probe alone, applied to a naive network, would do little.

### Three regimes

The associative preset makes gene C a slow variable: its decay rate is low, so it integrates co-stimulation during training and stays elevated through the washout. An elevated C gates the output gene A, so during the probe a weak cue is enough to drive A. Running the deterministic integrator, the trained network's mean probe response is about 1.65 times the response of an otherwise identical network that received no training. The conditioning is real within this regime, and it is a property of the slow-variable dynamics, not of any parameter update.

The toggle preset uses mutual repression between A and B together with self-activation. This topology has two stable fixed points: A high with B low, or B high with A low. A transient pulse during training tips the system toward one of them, and it remains there after the pulse ends. The final separation between A and B is large, which is the signature of bistable commitment rather than a shared intermediate state.

The repressilator preset arranges A, B and C in a three-gene repression cycle. With enough loop gain and a sharp enough Hill coefficient, this circuit has no stable fixed point and instead settles into a sustained oscillation. State is then stored not in a static level but in the phase and amplitude of the cycle.

### Integration

The equations are integrated with the classical fourth-order Runge-Kutta method at a fixed step. There is no stochastic term, so a given parameter set produces exactly one trajectory. This determinism is what allows the calibration panel to recompute conditioning gain, toggle commitment, and oscillation amplitude to machine precision rather than reporting a noisy estimate.

## Results

The calibration panel reports six checks. Three are exact analytic identities of the regulation functions: Hill activation and repression each equal one half at half-saturation, and a zero-weight edge contributes a factor of one. Three are deterministic outcomes of full simulation runs: the associative conditioning gain of roughly 1.65, the toggle commitment separation of roughly 1.74, and the repressilator oscillation amplitude of roughly 1.65. All six reproduce their recomputed targets with zero error, because each predicted value is recomputed by the same exported functions the live playground uses.

The substantive result is that the central prose claim survives measurement. The associative circuit does respond more strongly to a weak probe after training than without it, with no change to its equations. The mechanism is exactly the one the literature describes: a slow internal variable that outlasts the stimulus.

## Limitations

The honest scope of this model is narrow. It is three mean-field ODEs, not a tissue, and it omits the molecular noise, transcriptional bursting, spatial diffusion, and bioelectric coupling that Levin's fuller models include. The conditioning, commitment, and oscillation regimes each occupy a region of parameter space; weak or brief pulses leave the toggle uncommitted, and insufficient gain damps the oscillator to a fixed point. The slow variable is a caricature of a synaptic weight: reading it as a literal weight would predict additive accumulation and generalisation across cues that a three-node circuit does not provide. Most importantly, the word learning is used throughout in the dynamical-systems sense. The network never rewires and never optimises. Demonstrating that an ODE can show history-dependent response is not the same as demonstrating cognition, and the playground asserts the former only.

## References

- Fernando, C. T., Liekens, A. M. L., Bingle, L. E. H., Beck, C., Lenser, T., Stekel, D. J., Rowe, J. E. (2009). Molecular circuits for associative learning in single-celled organisms. Journal of the Royal Society Interface.
- Biswas, S., Manicka, S., Hoel, E., Levin, M. (2021, 2023). Gene regulatory networks exhibit several kinds of memory; pathway-level memory and effective interventions. PMC9820177, PMC6553590.
- Gardner, T. S., Cantor, C. R., Collins, J. J. (2000). Construction of a genetic toggle switch in Escherichia coli. Nature.
- Elowitz, M. B., Leibler, S. (2000). A synthetic oscillatory network of transcriptional regulators. Nature.
- Hill, A. V. (1910). The possible effects of the aggregation of the molecules of haemoglobin on its dissociation curves. Journal of Physiology.
- Alon, U. (2006). An Introduction to Systems Biology. Chapman and Hall.
