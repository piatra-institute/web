# Political Autoimmunity: Measuring Rights-Dependence Voting Misalignment Without Reducing Voters to "Interests"

## Abstract

Public commentary often describes some voters as "voting against their interests." The phrase is usually crude. It assumes a group has one true interest, treats an identity category as a monolith, and frequently smuggles in a partisan judgment. Yet there is a real empirical puzzle underneath it: members of rights-dependent, institutionally exposed, or materially vulnerable groups sometimes support candidates or coalitions whose likely policies weaken protections those groups disproportionately rely on. This companion develops **political autoimmunity** (academically, *rights-dependence voting misalignment*) as a measurable, falsifiable, non-moralizing construct, and documents the toy model behind the playground. Every number in the playground is synthetic and illustrative; the contribution is a structure for reasoning, not an empirical finding.

## 1. The puzzle and why the usual framing fails

"Voting against your interests" fails on contact with detail. It presupposes a single objective interest, when in fact voters carry plural and competing interests: material welfare, dependence on rights and institutions, stated preferences, expressive and symbolic motives, religious and cultural commitments, strategic protest, and informed acceptance of tradeoffs. A Latino small-business owner who dislikes a coalition's immigration rhetoric but prioritizes inflation and taxes is making a tradeoff, not a mistake. A religious voter who opposes abortion is not misaligned under their own subjective interest. The framing also collapses heterogeneous groups: "Latino," "Muslim," "women," and "LGBTQ" each span sharply different exposures and priorities.

So the question is reframed. Not "why are these voters clueless?" but: **under which assumptions, data sources, and definitions of interest does a vote become measurably misaligned with a group's exposure, institutional dependence, or stated priorities?** The label *political autoimmunity* is vivid for a public artifact; *rights-dependence voting misalignment* is the cleaner academic construct. The metaphor is that part of the body politic activates against the institutional immune system that protects it, but the metaphor is a hypothesis, not a diagnosis.

## 2. The construct

Political autoimmunity is a group-level pattern in which support from group g for coalition c rises despite evidence that c's likely policies increase adverse exposure for g in domains where g has high dependence on rights, institutions, redistribution, or protection. It is deliberately distinguished from neighbouring ideas:

- It is **not false consciousness**: the model lets voters knowingly trade rights for money, religion, status, or punishment.
- It is **not cognitive dissonance**: dissonance is a psychological state, autoimmunity is a measurable relation among exposure, policy risk, vote choice, awareness, and salience.
- It is **not class betrayal or pure irrationality**: many cases are rational under expressive, religious, coalition-entry, or punitive-protest utility.
- It is **not simple ignorance**: ignorance is only one subtype, separable from informed tradeoff and miscalculated protest.

## 3. The formal model

For group g, coalition c, and policy domain j, define per-domain adverse risk as a product of factors each scaled to [0, 1]:

```
R = exposure × dependence × hostility × implementation × magnitude
```

Foreseeable risk multiplies in awareness; priority risk multiplies in salience:

```
priorityRisk = R × awareness × salience
```

The protective benefit pairs hostility with protection (a coalition can be protective as well as adverse on a domain):

```
benefit = protection × implementation × magnitude
```

Net autoimmunity, under interest model m with domain weights W and tolerance τ, weighted by vote share V:

```
Autoimmunity = V × Σ_j  W(kind_j) × max(0, priorityRisk_j − benefit_j − τ)
```

The multiplicative form is a strong modelling choice: any single near-zero factor collapses a domain's contribution. A harm a coalition cannot or will not implement, or that a voter never sees coming, does not count the same as one that is certain and salient. The tolerance τ encodes how much net adverse exposure is shrugged off before it registers as misalignment at all.

### Gross versus net

Gross risk is raw priority risk: the group's exposure to adverse policy from the coalition it supports. It is not a claim of irrationality. Net contradiction subtracts benefit and tolerance and reweights by interest. A vote can be gross-contradictory yet net-aligned once benefits and competing priorities are counted. Keeping the two visibly separate is the model's main defence against overclaiming.

### Uncertainty

Each input should be a distribution, not a point. The playground draws every cell from a Beta around its value with a fixed concentration and propagates the draws through the score with a seeded, reproducible Monte Carlo, reporting a 90% interval. With real data each variable would carry a measured uncertainty; here the interval width is a design choice that shows how fragile a point estimate is.

## 4. Competing interest functions

The interest model is a weight profile over domain kinds. Six are provided: rights-dependence, material welfare, balanced, expressive/status, punitive protest, and long-run institutional. Switching the model reweights the domains, and the case ranking reorders. This is the heart of the instrument. A vote that looks like self-harm under rights-dependence becomes an informed tradeoff under a material or expressive model. The expressive and protest models treat symbolic belonging and punishment as real utility, which is the strongest single reason most apparent self-harm is not irrationality.

## 5. Illustrative cases

The playground ships three synthetic cases from the ideation's worked example, real groups against a generic coalition coded hostile on the listed domains:

- **LGBTQ voters**: high per-supporter rights exposure, small vote share. Leads under rights-dependence; its population-weighted score is held down by the small share.
- **Muslim voters**: entry and religious-bias exposure plus a high-salience foreign-policy protest domain. The punitive-protest model reframes that domain as intended action, lowering net contradiction.
- **Latino voters**: a large, heterogeneous bloc with lower per-supporter synthetic risk but a high population-weighted score. The material domain carries weight only under the material model.

These are coarse illustrations with no subgroup or intersectional structure, and they exist only to give the diagnostics something concrete to move.

## 6. The data plan a serious version would need

The synthetic cells stand in for what real estimation would require: vote choice and attitudes from large election surveys (CES/CCES, ANES, Pew validated-voter studies, AP VoteCast); group exposure and dependence from administrative and population data (ACS/CPS, MAP and Williams Institute for rights, FBI/EEOC/CRDC for enforcement, ICE/TRAC for immigration); and a candidate-policy hostility matrix coded on a +2 protective to −2 adverse scale from platforms, executive orders, agency rules, court filings, roll-call votes, and appointment records, with intercoder reliability and an LLM-assisted audit under human validation. Awareness and forecastability would combine the policy's prior enactment, explicit promises, platform inclusion, media coverage, and advocacy warnings with survey-reported voter awareness.

## 7. Falsifiable hypotheses

The framework generates testable claims, among them: rights-dependent groups show higher scores when coalition hostility is concentrated in civil-rights domains (H1); apparent contradiction declines when subjective-preference weights are added (H2); awareness separates informed tradeoff from low-information adverse-interest voting (H4); protest voters show higher post-election disillusionment when forecastable harms are implemented (H5); group-level rankings change substantially across interest functions (H10); and the sensitivity view reveals that most controversial claims rest on a small number of assumptions (H15). Each has a stated falsification condition.

## 8. Ethical safeguards

The instrument is built to resist becoming propaganda. It never labels a group clueless, irrational, or self-hating; it uses misalignment, tradeoff, exposure, and policy-risk acceptance. It always exposes the assumptions as sliders, always allows competing interest models, always separates gross from net and descriptive from normative, and always shows which assumption drives a result. The coalition is a generic object coded hostile on the domains, not a named person, and the metrics are symmetric: they depend only on the numbers, so the same forecast on either side of politics scores identically.

## 9. Limitations

This is a transparent sandbox over synthetic numbers. It omits subgroup heterogeneity and intersectionality, the cells are hand-set, counterfactuals are never scored as true or false, and the uncertainty band is illustrative rather than empirical. The multiplicative risk form, the linear weight profiles, and the fixed tolerance are all modelling choices a serious study would interrogate. The calibration panel checks only that the engine reproduces the worked example. The playground is most honest when read as a question generator: it shows you which assumption your conclusion is standing on, and invites you to change it.

## References

- Brennan, Geoffrey, and Loren Lomasky. *Democracy and Decision: The Pure Theory of Electoral Preference.* 1993.
- Downs, Anthony. *An Economic Theory of Democracy.* 1957.
- Fiorina, Morris P. *Retrospective Voting in American National Elections.* 1981.
- Tajfel, Henri, and John Turner. "An Integrative Theory of Intergroup Conflict." 1979.
- Mason, Lilliana. *Uncivil Agreement: How Politics Became Our Identity.* 2018.
- Jost, John T., and Mahzarin Banaji. "The Role of Stereotyping in System-Justification and the Production of False Consciousness." 1994.
- Crenshaw, Kimberlé. "Mapping the Margins: Intersectionality, Identity Politics, and Violence Against Women of Color." 1991.
- Taber, Charles S., and Milton Lodge. "Motivated Skepticism in the Evaluation of Political Beliefs." 2006.
