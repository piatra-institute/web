# Placebo and Nocebo as Precision-Weighted Expectation

## Abstract

Placebo analgesia and nocebo hyperalgesia are not artifacts to be subtracted away in a clinical trial; they are measurable, mechanistic phenomena in which a person's expectation about a treatment changes the pain they actually feel. This companion sets out the predictive-coding and Bayesian framing the playground implements, the pharmacology of the analgesic and hyperalgesic pathways it represents, and the boundaries of a deliberately small static model. The central object is a precision weight that decides how much top-down prediction and how much bottom-up nociceptive evidence each contributes to perceived pain.

## Background

A placebo is an inert treatment, and the placebo effect is the change in a clinical outcome that follows giving one. In pain, the most robust placebo effect is analgesia: a sham analgesic, accompanied by verbal suggestion or a history of conditioning, reduces reported and physiologically indexed pain. Its mirror image is the nocebo effect, in which negative expectation (a warning of side effects, a frightening context) increases pain. These are expectation effects, and they are large enough that the same physical stimulus can be rated very differently depending on what the person believes is about to happen.

Two strands of evidence anchor the mechanism. The first is pharmacological. Levine, Gordon and Fields showed in 1978 that the opioid antagonist naloxone reverses placebo analgesia, implicating endogenous opioids. Later work (Benedetti and colleagues) showed a second, conditioning-dependent analgesic component that is insensitive to naloxone but blocked by the cannabinoid CB1 antagonist rimonabant. On the nocebo side, hyperalgesia driven by anxious anticipation is reduced by the cholecystokinin antagonist proglumide, implicating CCK as a pain-facilitating signal. The second strand is computational: imaging and modelling work recasts these effects as Bayesian inference, where expectation is a prior and nociception is the likelihood.

## The Bayesian / predictive-coding model

In a predictive-coding account, the brain does not read pain off the periphery. It infers the most probable cause of its sensory input by combining a top-down prediction with bottom-up evidence, each weighted by its precision (its inverse variance, a measure of reliability). If the prediction is precise and the sensory signal is noisy, perception is pulled toward the prediction; if the sensory signal is precise, it dominates.

The playground makes this weighting explicit. Let the prior precision be the confidence in top-down expectation and the sensory precision be the reliability of nociceptive input. The prior weight is

    w = Pi_p / (Pi_p + Pi_y)

so that w near 1 means top-down control (strong placebo and nocebo susceptibility) and w near 0 means bottom-up control (the actual stimulus wins). Attention to the painful stimulus is modelled as a multiplicative gain on sensory precision, Pi_y becomes Pi_y x (1 + attention), which moves w toward 0 and shrinks expectation effects. This captures the everyday observation that distraction is analgesic and that vigilant attention to a wound makes it hurt more, while also explaining why placebo responses vary between people and conditions: they track how much relative precision the prior carries.

## Pathways and pharmacology

The model routes the precision-weighted expectation through three pathways, indexed by a single cue-drug similarity axis that runs from a strong nocebo-like cue at minus one, through a neutral context at zero, to a strong drug-like cue at plus one.

Positive (drug-like) cues drive analgesia through two parallel branches. The first is a mu-opioid branch whose strength is reduced by naloxone, standing in for endogenous opioid release. The second is a CB1 cannabinoid branch that is gated by a conditioning parameter and reduced by rimonabant, standing in for the learned, opioid-independent component. Negative (nocebo-like) cues drive hyperalgesia through a CCK branch reduced by proglumide.

Each branch is passed through a signed saturating nonlinearity,

    saturate(x) = x / (1 + |x|),

which keeps every effect inside the open interval from minus one to plus one. This is a phenomenological ceiling and floor: pain modulation is bounded, and doubling a drive does not double the effect once it is already large. The net signed effect is analgesia minus nocebo, producing a continuous landscape from maximal hyperalgesia, through a neutral crossover, to maximal analgesia. Because the analgesic branches read only the positive part of the cue and the nocebo branch only the negative part, the two never compete at a single point on the axis; the subtraction defines the global shape rather than a tug-of-war at one cue.

## Calibration

The calibration panel anchors the implementation to its own closed-form algebra rather than to noisy clinical numbers, which is the honest move for a static, unit-free model. It checks that balanced precision gives a prior weight of one half; that attention doubling sensory precision cancels a prior-precision advantage back to one half; that a neutral cue gives exactly zero placebo and zero nocebo; that the saturation maps a drive of two to two thirds; and that the net effect equals the saturated analgesia when no nocebo cue is present. Every predicted value is produced by the same functions the visualization calls, so a passing calibration certifies that the code reproduces the equations it claims to.

## Limitations

This is a small, static, pedagogical map, not a fitted clinical model. It omits temporal dynamics, conditioning over trials and its extinction, descending modulation through the periaqueductal gray and rostral ventromedial medulla, spinal gating, glial and neuroinflammatory signaling, and individual physiology. The pathway strengths are illustrative, not estimated from dose-response data. The cue-drug similarity axis is a one-dimensional summary of a richer context. The precision-weighting framing is itself contested in its details, and attention can both reduce and, in some framings, sharpen pain, so the single attentional sign here is a simplification. What the model does support is qualitative: how a precision balance, two analgesic mechanisms, one nocebo mechanism, and selective pharmacological blockade combine into the characteristic biphasic placebo-nocebo landscape.

## References

- Levine JD, Gordon NC, Fields HL (1978). The mechanism of placebo analgesia. Lancet.
- Benedetti F, et al. (1997, 2006, 2011). Opioid, CCK, and CB1 mechanisms of placebo analgesia and nocebo hyperalgesia.
- Eippert F, et al. (2009). Activation of the opioidergic descending pain control system underlies placebo analgesia. Neuron.
- Buchel C, Geuter S, Sprenger C, Eippert F (2014). Placebo analgesia: a predictive coding perspective. Neuron.
- Wager TD, Atlas LY (2015). The neuroscience of placebo effects. Nature Reviews Neuroscience.
- Fields HL (2004). State-dependent opioid control of pain. Nature Reviews Neuroscience.
