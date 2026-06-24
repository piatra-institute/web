# The Uncare Engine

A research companion to the playground. This document describes what the model actually computes, separates the parts that are exact arithmetic from the parts that are interpretive framing, and states the limitations honestly.

## Abstract

The uncare engine is a comparative instrument for thinking about moral backlash. It asks a narrow question: given a person situated inside a morally saturated domain, what configuration of pressures pushes them from ordinary, proportional care toward defending the indefensible, and eventually toward taking pleasure in harming what others protect?

The model compresses that situation into six dials. From those six numbers it derives a single composite score it calls "madness," places that score into one of six ordered stages, and reports five additional metrics that describe the shape of the situation. The same engine runs over ten domains, from veganism to recommender-system engineering. The domain changes the story told around the numbers; it does not change the arithmetic.

This is a deliberately small model. It has no time axis, no biography, no individual psychology, and no political content. It is built to compare configurations, not to predict what any particular person will do.

## The six axes

Every input to the model is one of six axis values, each on a 0 to 100 scale. They are the entire state of the model. Everything else is a function of these six numbers.

- **moral load**: how much of ordinary life feels morally implicated in the person's frame. This is the perceived implication, not the objective one. Two people in the same supply chain can sit at very different load values without either being factually wrong about the chain.
- **public shame**: how much correction feels staged as humiliation rather than private repair.
- **available exit**: how easy it is to act better without total self-destruction. Higher means safer exits are available. This is the one axis where a high value is protective.
- **tribal reward for defiance**: how much the surrounding group rewards cruelty, defiance, and refusal as loyalty.
- **moral inflation**: how much language uses maximum-charge moral terms for ordinary mistakes.
- **isolation from private correction**: how rare low-stakes private correction is. Higher means correction only ever happens in public.

Because available exit is protective rather than corrosive, the scoring formulas use its inverse, written below as `exitInv = 100 - exit`.

## What the model computes (exact)

The following is arithmetic. Given the six axis values, these formulas produce the same numbers every time, and the playground reports exactly these.

**Madness** is a weighted sum, clamped to the 0 to 100 range:

```
madness = clamp(
    0.22 * load
  + 0.18 * shame
  + 0.20 * exitInv
  + 0.16 * tribe
  + 0.14 * inflation
  + 0.10 * isolation
)
```

The weights sum to one, so madness is a convex blend of the six pressures. Moral load carries the most weight, followed closely by the inverse of available exit. Isolation carries the least.

**Escape velocity** measures how easily a person could move back toward ordinary care. It rewards open exits and a calm, non-tribal, non-inflated environment:

```
escapeVelocity = clamp(
    0.48 * exit
  + 0.24 * (100 - tribe)
  + 0.18 * (100 - isolation)
  + 0.10 * (100 - inflation)
)
```

**Inversion pressure** measures the force pushing a person to reframe the indefensible as noble. It is driven by shame, tribe, and inflation:

```
inversionPressure = clamp(
    0.28 * shame
  + 0.28 * tribe
  + 0.22 * inflation
  + 0.12 * isolation
  + 0.10 * exitInv
)
```

**Monstrosity potential** is a second-order metric. It feeds the already-computed madness and inversion pressure back in, then adds tribe and isolation:

```
monstrosityPotential = clamp(
    0.45 * madness
  + 0.30 * inversionPressure
  + 0.15 * tribe
  + 0.10 * isolation
)
```

**Care capacity** is essentially the complement of madness, nudged by how far above or below the midpoint the available exit sits:

```
careCapacity = clamp(100 - 0.85 * madness + 0.20 * (exit - 50))
```

**Backlash risk** estimates the chance of a public refusal performance. It loads on load, shame, inflation, and the inverse of exit:

```
backlashRisk = clamp(
    0.28 * load
  + 0.30 * shame
  + 0.22 * inflation
  + 0.20 * exitInv
)
```

The madness score is then mapped into one of six stages by fixed numeric bands.

## The six stages (exact mapping, interpretive content)

The band boundaries are exact. A madness score falls into exactly one stage:

- **0 to 18**: ordinary moral load. Care is still proportional.
- **19 to 36**: moral saturation. Everything starts to accuse.
- **37 to 52**: defensive minimisation. The first escape hatch is to shrink the moral object.
- **53 to 68**: ressentiment switch. Accusation becomes identity threat.
- **69 to 84**: counter-moral inversion. The indefensible becomes noble.
- **85 to 100**: monstrous uncare. Refusal becomes appetite.

The boundaries are arithmetic; the names, descriptions, tells, interventions, and aphorisms attached to each stage are interpretive. They are the model's narrative layer, not a measurement. The stage you land in is computed. What that stage means is authored.

## The ten domains

The same engine runs over ten domains: veganism, climate, speech, politics, craft, institutions, migration, maintenance, reputation, and algorithm. Each domain ships with a canonical six-axis profile and an authored description of how the moral object gets shrunk, how the accusation gets inverted, and how refusal becomes identity.

The domain you select frames the reading and supplies the example objects, but it does not change the score. If two domains were given identical axis values they would produce identical madness, identical stage, and identical metrics. The configuration is the model; the domain is the story told around it.

## Calibration (what it does and does not show)

The model carries a calibration table. For each of the ten domains it scores the domain's canonical profile and compares the resulting madness against a reader-provided `expectedMadness`. For instance, the veganism canonical profile is authored to land near the defensive-minimisation band, while the reputation profile, with very high shame and inflation and very low exit, is authored to land in monstrous uncare.

A close match means one thing only: the model's emergent score on a domain's canonical profile agrees with a careful human reading of how that domain's backlash typically runs. It does not mean the model has met any particular person, predicted any real event, or been validated against field data. The expected values are scholarly intuitions anchored to the literature cited below, not measurements. The calibration is an internal consistency check between the scoring function and the authors' judgement, nothing more.

## Exact versus interpretive

To keep the two layers separate:

**Exact.** The six axis values, the six metric formulas, the convex weighting of madness, the stage band boundaries, the sensitivity sweep (each axis taken from 0 to 100 with the others held fixed), and the parameter sweep over any single axis. These are deterministic and reproducible.

**Interpretive.** The stage names and narratives, the per-domain stories, the authored expected-madness targets, the choice of six axes, the specific weights, and the very idea that these particular pressures are the ones that matter. None of these are derived from data. They are modeling choices made to render a philosophical argument legible and manipulable.

## Limitations

This model should not be mistaken for a theory of individual radicalisation. Several limitations are structural, not incidental.

There is no time. The model is a snapshot. It cannot represent a trajectory, a tipping point reached over years, or the difference between someone arriving at high madness slowly versus suddenly. The stage ordering is assumed to be monotonic in the single madness score, which is itself a strong and contested claim.

There is no person. There is no memory, no prior injury, no temperament, no relationship history. Two people with very different lives but the same six dial settings are identical to the model.

The axes are not independent in the world even though the model treats them as independently settable. Public shame and isolation, or tribe and exit, are entangled in real situations. The model lets you move them separately, which is useful for analysis but unfaithful to lived dynamics.

The weights are asserted, not fitted. No regression produced the 0.22 on load or the 0.20 on the exit inverse. They encode a judgement about relative importance, and a different judgement would yield different scores and different stage placements near the band edges.

The calibration is circular in the sense that the same authors chose both the canonical profiles and the expected madness values. Agreement is reassuring but not independent evidence.

Finally, the model takes no position on whether morality has cosmic authority. The engine is designed to run identically under species-local moral realism and under moral anti-realism. That is a feature for the argument the playground is making, but it means the model is silent on exactly the metaethical questions a reader might most want answered.

## What the model is for

Used carefully, the engine is a thinking tool. It makes a specific claim manipulable: that the same structure of overload, sealed exits, staged shame, tribal reward, inflated language, and absent private correction can turn proportional care into proud indifference, across very different domains. It lets you ask which dial is doing the work, which slack is unused, and what a single intervention might move. It is a comparative instrument, not a predictive one, and it is most honest when used to compare configurations rather than to diagnose people.

## References

- Braithwaite, J. (1989). *Crime, Shame and Reintegration.* On the difference between reintegrative and stigmatising shame.
- Haidt, J. (2012). *The Righteous Mind.* On moral intuition, tribalism, and the foundations of disagreement.
- Bicchieri, C. (2006). *The Grammar of Society.* On social norms and conditional cooperation.
- Greene, J. (2013). *Moral Tribes.* On in-group reward and intergroup moral conflict.
- Haslam, N. (2016). "Concept Creep: Psychology's Expanding Concepts of Harm and Pathology." On moral inflation.
- Korsgaard, C. (1996). *The Sources of Normativity.* On normativity without cosmic authority.
- Floridi, L. (2013). *The Ethics of Information.* On broadening moral patiency beyond sentience.
- Thaler, R., and Sunstein, C. (2008). *Nudge.* On the importance of low-friction paths and easy exits.
- Blee, K. (2002). *Inside Organized Racism.* On entry into and exit from extreme commitments.
- Singer, P. (1975). *Animal Liberation*; Foer, J. (2009). *Eating Animals.* Anchors for the veganism domain.
- Malm, A. (2016). *Fossil Capital*; Haltinner, K., and Sarathchandra, D. (2018), studies of climate scepticism. Anchors for the climate domain.
- Norris, P., and Inglehart, R. (2019). *Cultural Backlash*; Ronson, J. (2015). *So You've Been Publicly Shamed.* Anchors for the speech and reputation domains.
- Mason, L. (2018). *Uncivil Agreement.* Anchor for the politics domain.
- Sennett, R. (2008). *The Craftsman*; Pirsig, R. (1974). *Zen and the Art of Motorcycle Maintenance.* Anchors for the craft domain.
- Russell, A., and Vinsel, L. (2020). *The Innovation Delusion*; Jackson, S. (2014). "Rethinking Repair." Anchors for the maintenance domain.
- Zuboff, S. (2019). *The Age of Surveillance Capitalism*; Seaver, N. (2019). "Captivating Algorithms." Anchors for the algorithm domain.
