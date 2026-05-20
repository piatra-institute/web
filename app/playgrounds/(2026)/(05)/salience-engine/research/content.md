# Salience Engine

## Abstract

This playground models how a neutral physical difference becomes a sign, how signs acquire motivational charge, and how attention can collapse around a single object until that object becomes the filter through which the whole world is read. It treats romantic love, limerence, addiction, and ordinary cognitive over-salience as settings of one engine rather than as separate phenomena. The model is a comparative instrument: it has no time axis and no biography, and the configuration alone is the model.

## Background

A recurring intuition is that love behaves like hypnosis. It narrows attention, increases suggestibility, and reorganises perception around one person. The better description is not hypnosis but reward-driven attention capture. Early-stage intense romantic love recruits reward and motivation circuitry, including dopamine-rich regions such as the ventral tegmental area and the caudate nucleus, and is plausibly framed as a mammalian mate-choice drive distinct from sexual desire and from stable attachment.

The phenomenology people describe as hypnotic is better named **cognitive over-salience**: one person becomes too prominent in the mind, taking up more attention, meaning, and interpretive weight than the evidence warrants. Their texts, pauses, and absences become absurdly meaningful. The beloved becomes a private oracle.

Three modelling families inform the engine.

**Reward learning.** A cue acquires expected value through prediction-error updating. Dopamine activity is widely modelled as a reward-prediction-error signal that also shapes attention to reward-predictive cues. In love, the beloved becomes a reward-predictive cue, and their name on a phone is no longer neutral information.

**Incentive salience.** Berridge and Robinson's incentive-sensitization theory separates wanting from liking. In addiction-like states, wanting can be amplified even when liking is not proportionally high. Romantic fixation can show the same dissociation: the motivational grip remains even when enjoyment has faded.

**Semiotics of constraint.** Terrence Deacon argues that a molecule does not become a sign because of its intrinsic properties. A physical property becomes semiotic only when it is taken up by an interpretive process organised around a constraint. The primitive structure is not *molecule produces meaning* but *molecule plus interpreting system plus constraint produces sign*.

## The ladder

The engine arranges these ideas as an eight-rung ladder. Each rung is a transformation, not a property hidden inside the object.

0. **Matter.** A physical difference exists: a molecule, a pulse, a gesture, a pattern of light.
1. **Constraint.** The difference matters because some self-maintaining system is organised around survival, repair, pursuit, or regulation.
2. **Proto-salience.** The system treats the difference as action-relevant before it becomes an explicit thought. Relevance precedes awareness.
3. **Sign.** The cue now stands for a hidden condition: nutrient, threat, reward, attachment, rejection.
4. **Value.** Reward learning gives the sign motivational force.
5. **Attention.** Attention is allocated toward the highest-salience objects, approximated by a softmax with a temperature parameter.
6. **Narrative.** The sign is bound into a self-story: future, identity, safety, worth.
7. **Over-salience.** The object dominates interpretation far beyond its evidential weight. It has become a world-filter. This is the limerent edge.

Love and limerence live around rungs five to seven, but they are built on the older rungs beneath them.

## Model description

The model has two parts: a set of objects and a salience field.

Each **object** carries an eight-dimensional intrinsic profile: physical difference, constraint relevance, proto-salience, sign function, incentive reward, affective charge, cognitive capture, and narrative meaning. Six reference objects span the space, from a dopamine molecule that is almost pure matter, through a glucose cue and a phone notification, to a shared song heavy with narrative binding, a possible rival, and the beloved person who scores high on every dimension.

The **salience field** is eight global weights: expected value, prediction error, uncertainty, attachment, narrative binding, habituation, reality correction, and attention temperature. The first five are accelerants, habituation and reality correction are brakes, and temperature controls how winner-takes-most the attention allocation becomes.

A **signal regime**, stable, ambiguous, or volatile, sets the intermittency of the cue. This replaces the explicit time-wave of the original prototype: rather than animating a trajectory, the regime is a parameter, and the configuration alone determines the result.

For each object the model computes a raw salience as the sum of a structural base (matter, constraint, proto-salience, sign) plus a weighted drive (value, prediction error, uncertainty, attachment, narrative) minus two brakes (habituation drag and reality correction). A softmax over raw salience with the temperature parameter yields the attention allocation across all six objects.

Six metrics summarise the focal object: salience, over-salience, attention share, attention concentration across the field, semiotic meaning, and stability. A four-tier status, ordinary to runaway, classifies the object by its salience band.

## Results

Three behaviours are worth observing directly.

**Salience is not liking.** A possible rival, with high cognitive capture and affective charge but low incentive reward, can still outrank a pleasant cue. An object you do not want can seize attention because threat and uncertainty keep the loop running. Wanting and liking come apart.

**Uncertainty as fuel.** Holding everything else fixed and moving the signal regime from stable to ambiguous to volatile raises over-salience for the beloved. The object is not liked more; it is harder to predict, and the prediction loop will not settle.

**Saturation under limerence.** Switch to the limerence preset and the beloved climbs every rung of the ladder. No single field weight pulls it back down: the sensitivity analysis flattens because the whole field, not one dial, is the cause. Lowering the loop takes the brakes and the temperature together.

## Limitations

The model is comparative, not predictive. The eight-by-eight parameterisation is a compression chosen for legibility, not derived from data. The softmax attention layer is a standard modelling device and is not a claim about neural implementation. The signal regime stands in for loop dynamics that a fuller model would render as an explicit trajectory. The calibration table compares the model's salience on each reference object to a reader-assigned expected value; agreement indicates that the model's shape matches a careful reading, not that it has been fitted to measurements.

## References

- Deacon, T. *How Molecules Became Signs* (2021).
- Berridge, K. and Robinson, T. *Liking, Wanting, and the Incentive-Sensitization Theory of Addiction* (2016).
- Schultz, W. *Dopamine Reward Prediction Error Coding* (2016).
- Fisher, H., Aron, A., and Brown, L. *Romantic Love: A Mammalian Brain System for Mate Choice* (2006).
- Tennov, D. *Love and Limerence* (1979).
- Strogatz, S. *Love Affairs and Differential Equations* (1988).
