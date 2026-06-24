# Forbidden Edges: Morality as Constraint Geometry over a Multi-Scale Graph

## Abstract

This playground treats morality not as a property of objects or a substance in any node, but as a constraint structure on which transitions through a multi-scale graph of agents, harms, repairs, and institutions are allowed, repaired, or forbidden. A small set of agents and institutions is represented as a graph; each moral action is an edge that moves a six-dimensional state vector (trust, agency, harm, repair, domination, ecology); six contextual pressures (dopamine, empathy, institutional strength, scarcity, memory, ecology) modulate how strongly each edge moves the state; and five stylised value frames (medical, military, kin, legal, market) rate every action on a signed scale so that their disagreement can be measured as a sheaf-style consistency radius. A single scalar, viability, aggregates the state into a regime label. The substantive claim is that morality has the shape of a constraint over such a graph. The specific numbers are scaffolding chosen to make that shape visible, not measured ground truth, and this companion is careful to separate the two.

## What the model actually computes

The model is fully specified in the playground's logic folder and is small enough to describe exactly.

A moral state is six numbers in the range 0 to 100: trust, agency, harm, repair, domination, ecology. Every action is a base delta on these channels. Keeping a promise adds trust and repair and slightly lowers harm and domination. Betraying a promise sharply drops trust and raises harm. Coercing another agent collapses agency and raises domination and harm. Granting sanctuary lifts agency and dampens domination. Exploiting a resource drains ecology. Sharing knowledge nudges trust, repair, agency, and ecology upward. The eight actions are betray, keep, repair, coerce, sanctuary, punish, exploit, and share.

These base deltas are not applied directly. They pass through a pressure modulation step. Empathy scales harm deltas down by up to 45 percent and scales repair up. Scarcity scales harm and ecology deltas up. Dopamine amplifies trust and domination changes around a midpoint of 0.5. Institutional strength boosts repair and agency. Memory boosts trust and repair, encoding hysteresis. Ecological coupling amplifies ecology deltas. The modulated delta is then added to the state and clamped to the 0 to 100 box. This is what makes a forbidden edge contextual rather than absolute: the same exploit action costs more ecology under high scarcity, and the same betrayal costs more trust under high dopamine and memory.

Viability is a fixed weighted aggregate of the state,

```
V = 0.22 * trust + 0.24 * agency + 0.22 * (100 - harm) + 0.12 * repair + 0.14 * (100 - domination) + 0.06 * ecology.
```

It lands in three regimes: stable at 76 and above, contested between 52 and 76, fragile below 52. Each candidate action then has a delta-viability, the change in V it would produce from the current state, and that signed value is what the forbidden-edge heatmap displays. An edge is forbidden when traversing it sharply decreases V in the present state under the present pressures.

The five frames are independent rating functions, each mapping an action plus state plus pressures to a number between minus one and plus one. The kin frame loves promise-keeping and hates betrayal. The market frame rewards exploitation more as scarcity rises. The legal frame penalises knowledge-sharing more as institutional strength rises, which is how the model encodes a whistleblower being punished by a strong institution. For each action the model computes the mean rating across frames, the spread (max minus min), and the standard deviation of the ratings, which it labels the consistency radius after Robinson's sheaf formalism. A large consistency radius means the frames cannot be glued into a single global rating, which the playground reads as structural, not merely rhetorical, moral disagreement.

## Presets and trajectories

Five presets fix a pressure profile, an initial state, and a short pre-played sequence of actions. Broken trust pre-plays a betrayal. Tragedy of commons pre-plays two exploits under high scarcity, high dopamine, and weak institutions. Sanctuary asylum pre-plays a coercion followed by a sanctuary grant. Whistleblower pre-plays a knowledge-share under very high institutional pressure. War crime pre-plays coerce, punish, and exploit under high memory, producing high harm, low repair, and several frames flipping sign. The user then continues the trajectory by clicking actions, and the viewer plots the viability path, the obstruction matrix, and a sensitivity tornado over the six pressures.

## What is exact and what is interpretive

The exact parts are the arithmetic. Given a state, an action, and a pressure vector, the next state, the viability, the delta-viability of every candidate edge, and the five frame ratings with their mean, spread, and consistency radius are all deterministic and reproducible. The sensitivity bars are exact sweeps of single pressures from 0 to 1 holding the others fixed. The sweep panel is an exact scan of one pressure across 41 steps. None of these involve randomness.

The interpretive parts are the choices that turn arithmetic into a moral reading. The six metrics, the eight action deltas, the pressure modulation coefficients, the viability weights, and the five frame rating tables are all stipulated. They encode what the model looks for, not a measured fact about the world. The viability function is explicitly a heuristic, not a utilitarian welfare function derived from any axiom. Reading the consistency radius as a sheaf cohomology obstruction is a structural analogy: the rating spaces here are simple real intervals, not the pseudometric sheaves of Robinson's construction or the cellular sheaves of Hansen and Ghrist, so the cohomological language is a guiding picture rather than a computed invariant.

## Empirical anchors and calibration

The calibration panel compares the model's viability against six known cases with hand-assigned expected viabilities: Milgram obedience as fragile near 38, Ostrom commons cooperation as stable near 80, fishery collapse as fragile near 40, whistleblower under autocracy as contested near 58, truth and reconciliation as contested near 62, and a kept promise across generations as stable near 84. These targets are illustrative anchors drawn from the cited literature, not regression fits, and they exist to check that the regime labels land in the right band for paradigmatic cases rather than to validate the specific numbers.

Three empirical findings give the framing more weight than the arithmetic alone would. Schultz, Dayan, and Montague showed that dopamine signals a reward prediction error rather than carrying valence or goodness directly, which is why the model treats dopamine as a bias on graph traversal rather than as a moral signal. Crockett and colleagues found that healthy adults require more compensation to inflict pain on a stranger than on themselves, locating others' suffering inside the valuation graph. A follow-up showed that citalopram increases harm aversion while levodopa reduces it, so harm aversion is tunable by neurochemistry. These results support the model's central move: morality enters not through a special node but through the structure of which sufferings the valuation graph is built to include.

## Honest limitations

The model is a low-dimensional toy. Six metrics cannot capture the texture of any real moral situation, and the eight actions are a tiny vocabulary. The pressure modulation is linear and the coefficients were chosen to produce legible behaviour, not measured. The five frames are stylised stand-ins for value clusters that in reality are internally heterogeneous, historically contingent, and far more numerous. The viability weights are the single most consequential and least defensible choice in the model: shifting them moves the regime boundaries, and there is no ground truth that fixes them. The sheaf reading is the most speculative layer, structurally clean but empirically untested as applied here. Some morally significant actions are genuinely non-pairwise, binding three or more nodes at once, and reducing them to chains of binary edges discards information that the present graph does not represent. Finally, causal-emergence and top-down causation, which the framing invokes to justify treating macro labels like betrayal and debt as real causes, are themselves contested.

The defensible thesis is modest and graded. Morality can be fruitfully modelled as a constraint over a multi-scale graph of agents who can be harmed, where some transitions are forbidden in context, some are repairable, and some are partially irreversible because harm and domination accumulate faster than repair recovers. The arithmetic makes that shape visible. It does not measure it.

## References

- W. Schultz, P. Dayan, and P. R. Montague, "A neural substrate of prediction and reward," Science, 1997.
- M. J. Crockett, Z. Kurth-Nelson, J. Z. Siegel, P. Dayan, and R. J. Dolan, "Harm to others outweighs harm to self in moral decision making," PNAS, 2014.
- M. J. Crockett et al., "Dissociable effects of serotonin and dopamine on the valuation of harm in moral decision making," Current Biology, 2015.
- S. Milgram, "Behavioral study of obedience," Journal of Abnormal and Social Psychology, 1963.
- E. Ostrom, Governing the Commons, Cambridge University Press, 1990.
- B. Worm et al., "Impacts of biodiversity loss on ocean ecosystem services," Science, 2006.
- E. P. Hoel, L. Albantakis, and G. Tononi, "Quantifying causal emergence shows that macro can beat micro," PNAS, 2013.
- M. Robinson, "Assignments to Sheaves of Pseudometric Spaces," arXiv:1805.08927, 2018.
- J. Hansen and R. Ghrist, "Toward a Spectral Theory of Cellular Sheaves," Journal of Applied and Computational Topology, 2019.
- F. Battiston et al., "Networks beyond pairwise interactions: Structure and dynamics," Physics Reports, 2020.
- P. F. Strawson, "Freedom and Resentment," Proceedings of the British Academy, 1962.
