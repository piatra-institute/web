# Playground Classification

Each playground is classified along three orthogonal dimensions: **time** (when it was created), **topics** (what disciplines it draws from), and **operations** (what intellectual move it makes). Together these form a navigable 3D taxonomy defined in `app/playgrounds/data.ts`.


## Time

Every playground has a `date` field in the format `"Month YYYY"` (e.g., `"February 2026"`). The filesystem mirrors this as nested route groups:

```
app/playgrounds/(2025)/(07)/entropy-cafe/
```

The parenthesized directories `(YYYY)` and `(MM)` are Next.js route groups — they organize files without affecting URLs. The playground above is accessed at `/playgrounds/entropy-cafe`.

Time is the simplest dimension. Always use the actual creation month. On the index page, year and month filters compose with topic and operation filters via AND: "landscape playgrounds from 2025" returns playgrounds tagged landscape whose date falls in 2025.


## Topics

Twelve academic disciplines, defined in the `TOPICS` constant:

| Topic | Description |
|---|---|
| mathematics | pure structures: algebra, topology, geometry, number theory |
| physics | matter, energy, and fundamental forces |
| chemistry | molecular structure, bonding, and reactions |
| biology | living systems, evolution, and development |
| neuroscience | brain, perception, and consciousness |
| computer-science | algorithms, computation, and information |
| economics | markets, incentives, and resource allocation |
| political-science | governance, power, and collective choice |
| psychology | mind, behavior, and cognition |
| sociology | social structures and collective dynamics |
| philosophy | logic, ethics, and epistemology |
| aesthetics | pattern, harmony, and form |

Each playground gets **1-3 topics**. Topics answer the question "what field(s) is this about?"

### Assignment guidelines

- **Pick the most specific discipline(s)**, not the broadest. A playground about knot invariants is `mathematics`, not `mathematics + physics + philosophy`.
- **Cross-disciplinary playgrounds get 2-3 topics.** Coasellular morphogenesis is `biology + economics` because it genuinely lives at that intersection — Coase's theorem applied to cellular development.
- **Never more than 3.** If a playground seems to touch four disciplines, two of them are probably peripheral. Choose the ones the playground actually engages with, not the ones it vaguely relates to.
- **Prefer the discipline where the core mechanism lives.** "Entropy caf\u00e9" uses a coffee metaphor but the mechanism is thermodynamics: `physics + chemistry`, not `aesthetics`.

### Why topics coexist with operations

The original classification essay (below) argues that discipline labels miss cross-disciplinary structure — and that's true. But topics answer a different question than operations. A user asking "show me the biology playgrounds" has a legitimate need that operations alone don't serve. The two dimensions are complementary: topics say what a playground is *about*, operations say what it *does*. Filtering by `biology + threshold` gives "biology playgrounds where something flips" — a very precise query that neither dimension achieves alone.


## Operations

The standard approach to topic filtering would use academic disciplines: mathematics, biology, economics, political science, etc. But discipline labels miss the most interesting thing about these playgrounds — they sit at disciplinary intersections and they share deep structural similarities that disciplines obscure.

"Hsp90 canalization" (genetics) and "polity coalition attractors" (political science) have almost nothing in common by discipline. But they do the same thing: they map a landscape of attractors and show how a system navigates valleys and basins. "Debt singularity" (economics) and "bifurcation speciation" (biology) both show how a system flips when a parameter crosses a critical value.

The question is not "what field is this playground in?" but "what kind of intellectual move does this playground make?"


### The Six Operations

Across all 60 playgrounds, six fundamental intellectual operations recur. Each playground performs one or two of these.


#### 1. Landscape

Mapping a possibility space, a state space, a morphospace, or a configuration space. The playground IS a map. The key question: "what does the terrain look like, and where are you in it?"

The word comes from Waddington's epigenetic landscape — the marble rolling through valleys — but the operation is general. Any playground that constructs a navigable space of possibilities and lets you locate a point within it is a landscape playground.

Covers: morphospaces, state spaces, phase spaces, attractor basins, spectra, function spaces, classification spaces.


#### 2. Threshold

Finding where a system changes character. Phase transitions, bifurcations, tipping points, regime boundaries, critical values. The key question: "when does it flip?"

The interesting thing is what happens at the boundary, not in the interior. A threshold playground shows that a smooth change in input produces a discontinuous change in behavior — the system isn't just "more of the same" on the other side.

Covers: phase transitions, bifurcation points, critical exponents, regime thresholds, filtering cutoffs, access barriers, gait transitions.


#### 3. Symmetry

Identifying what stays the same when you change everything else. Invariance under transformation, conservation laws, equivalence classes, group structure. The key question: "what is preserved?"

This is the algebraist's operation: strip away the accidental, find the essential. A symmetry playground shows that beneath apparent difference there is a persistent structure.

Covers: transformation groups, knot invariants, conservation laws, sheaf gluing, cobordism equivalence, self-similarity, frequency-domain duality.


#### 4. Morphogenesis

Showing how macro-level pattern arises from micro-level process. Emergence, self-organization, growth, development, pattern formation. The key question: "how does form arise?"

The word comes from D'Arcy Thompson and Turing — the study of how shape comes into being. A morphogenesis playground starts from local rules, initial conditions, or simple processes and shows that global structure is a consequence, not an input.

Covers: cellular automata, reaction-diffusion, developmental trajectories, self-sorting, semiotic emergence, narrative formation, fracture geometry.


#### 5. Anatomy

Revealing the internal structure of something by taking it apart. Decomposition, mechanism, causal structure, formalization. The key question: "what's inside?"

An anatomy playground opens the hood. It shows how something works by isolating its components, quantifying their contributions, or formalizing their relationships. The emphasis is on explanation through structure.

Covers: causal graphs, weighted factor models, pricing mechanisms, timing mechanisms, derivative relationships, precision weighting, attention kernels, structural leaks.


#### 6. Tension

Showing opposing forces acting on a system. Pressure, conflict, equilibrium, erosion, competition, resistance. The key question: "what pulls against what?"

A tension playground is about forces — not the trajectory through space (that's landscape) but the forces that create the trajectory. The system is pulled in incompatible directions, and the playground shows what determines which force wins.

Covers: game-theoretic conflict, suppression vs. expression, authority vs. freedom, fairness vs. self-interest, inclusion vs. exclusion, constriction vs. expansion, competition dynamics.


### Full Mapping

Each playground is assigned 1-2 operations. The primary operation is listed first.

| Playground | Operations | Reasoning |
|---|---|---|
| self-sorted arrays | morphogenesis | local swap rules produce global sorted order |
| estigrade | anatomy | decomposing estimation into weighted components |
| coasellular morphogenesis | morphogenesis, tension | cellular form emerges from competing transaction costs |
| fracqunx | landscape | distribution space through fractional branching |
| Halley window | landscape, symmetry | fractal boundary of convergence basins; self-similar structure |
| eyevolution | morphogenesis | developmental trajectory of visual systems |
| pacemaker accumulator | anatomy | timing mechanism decomposed into pacemaker and accumulator |
| CPT variance | symmetry | discrete symmetries: charge, parity, time reversal |
| refractive computation | anatomy, symmetry | frequency-domain logic mechanism with transform duality |
| metamaterials | morphogenesis | engineered emergence of life-like properties |
| lifesong | morphogenesis | musical pattern arising from biological process |
| vote no | tension | resistance forces in democratic systems |
| everything... relevant | landscape, symmetry | unified field theory as a landscape of fundamental invariants |
| Raupian morphospace | landscape | literally a morphospace — coiling parameter space |
| Hsp90 canalization | landscape, threshold | Waddington landscape with variation-release threshold |
| Lefebvrian conscience | landscape, anatomy | conscience mapped as algebraic space, decomposed into components |
| bifurcation speciation | threshold | speciation occurs at bifurcation points |
| stochastic justice | anatomy, tension | randomness as fairness mechanism against corruption pressure |
| trauma-eustress dynamics | landscape, tension | constriction/expansion terrain shaped by opposing forces |
| open source sustainability | tension, threshold | pressure dynamics with license transition tipping point |
| resentment against desire | tension, anatomy | fairness vs. self-interest decomposed in ultimatum game |
| debt singularity | threshold | debt undergoes phase transitions at critical economic values |
| entropy café | morphogenesis | complexity emerges from mixing dynamics |
| geometry becoming topology | symmetry, threshold | transformation reveals invariants; boundary between geometric and topological |
| crystallographic groups | symmetry | pure symmetry groups in 2D, 3D, 4D |
| story-suffering coherence | morphogenesis, tension | narrative form emerges from integration of suffering against fragmentation |
| ramsey ports | anatomy | pricing mechanism decomposed |
| expected free energy | landscape, anatomy | free energy landscape navigated by active inference mechanism |
| criticality | threshold, landscape | critical point within a parameter space |
| meaning autogenesis | morphogenesis | semiotic meaning emerges from molecular substrate |
| agency erosion | tension, threshold | identity under substitution pressure; erosion as a threshold phenomenon |
| berkshire engine | anatomy | insurance float mechanism decomposed |
| authoritarian paternalism | tension | authority vs. citizen autonomy |
| tuition resentment | tension, anatomy | blame attribution forces decomposed |
| truth-violence dynamics | tension | suppression pressure vs. truth-telling |
| neural cellular automaton | morphogenesis | neural structure emerges from cellular automaton rules |
| scarcity over technology | anatomy | economy formalized as derivative relationship |
| PLR harmony | symmetry | neo-Riemannian transformations between triads |
| ownership parity rule | anatomy | matching mechanism between equity and consumption |
| subconscious state space | landscape, threshold | state space with conscious-access threshold |
| social propagation | tension, anatomy | viral manipulation pressure decomposed into intervention points |
| placebo-nocebo dynamics | anatomy, tension | precision weighting mechanism under competing belief forces |
| space between algorithms | landscape, anatomy | policy manifold mapped; freedom within algorithms decomposed |
| algorithmic monodominance | threshold, tension | phase transition from concave to convex returns under competition |
| closedness adverse selection | threshold, tension | filtering threshold under institutional pressure |
| logical morphogenesis | morphogenesis, symmetry | truth-value patterns from self-referential structure |
| unknot studio | symmetry, landscape | knot invariants within the space of knots |
| Cipolla quadrant | landscape, anatomy | 2D classification space; behavioral typology decomposed |
| Chladni generator | morphogenesis, symmetry | standing wave patterns with modal symmetry |
| do-calculus | anatomy | causal structure decomposed via interventional framework |
| activation functions lab | landscape, anatomy | function space explored; activation mechanisms compared |
| geometry of fragmentation | morphogenesis, symmetry | fracture patterns as natural geometry; Platonic cube conjecture |
| descent & closure | symmetry, anatomy | sheaf gluing as invariance; local-to-global construction |
| kernel smoothing | anatomy, symmetry | attention decomposed as kernel; similarity mapping as invariant operation |
| nested observer windows | landscape, anatomy | oscillator coupling space; hierarchical consciousness mechanism |
| gait gambit | anatomy, threshold | gait selection mechanism with transition thresholds |
| polity coalition attractors | landscape, tension | attractor basins shaped by competing inclusion/exclusion forces |
| bordism to action | symmetry, anatomy | cobordism equivalence; TQFT vs. classical mechanics decomposition |
| order-theoretic ontology | anatomy, symmetry | structural leak detection in poset-based ontologies |
| hydride anomaly | anatomy, threshold | hydrogen bonding mechanism producing anomalous thermodynamic thresholds |
| trust-transaction spectrum | landscape, threshold | posture spectrum with regime thresholds |


### Distribution

| Operation | Count | Percentage |
|---|---|---|
| Anatomy | 30 | 50% |
| Tension | 18 | 30% |
| Landscape | 18 | 30% |
| Morphogenesis | 15 | 25% |
| Symmetry | 16 | 27% |
| Threshold | 16 | 27% |

Anatomy is the most common operation because explanation-through-decomposition is the default intellectual gesture of a playground — you build a model to show how something works. The others are more distinctive and revealing.


### What This Reveals

Categorization by operation exposes connections that discipline labels hide:

**Waddington's landscape appears everywhere.** Hsp90 canalization is the canonical case, but the same operation — mapping a terrain of attractors and showing a system navigating it — structures polity coalition attractors (political science), expected free energy (neuroscience), subconscious state space (consciousness studies), trauma-eustress dynamics (psychology), activation functions lab (machine learning), and Raupian morphospace (paleobiology). These playgrounds share more structure with each other than with playgrounds in their own disciplines.

**Phase transitions don't respect disciplinary boundaries.** Debt singularity (economics), bifurcation speciation (biology), algorithmic monodominance (technology), Hsp90 canalization (genetics), and subconscious state space (consciousness) all center on the same phenomenon: a smooth change in a control parameter produces a discontinuous change in system behavior. A user interested in threshold phenomena would want to see all five, but discipline labels scatter them across unrelated categories.

**The tension playgrounds form a coherent political-philosophical cluster.** Vote no, authoritarian paternalism, truth-violence dynamics, closedness adverse selection, resentment against desire, open source sustainability, agency erosion — these all explore what happens when a system is caught between incompatible forces. The tension label captures what makes them similar (structural conflict) rather than what makes them different (the domain in which the conflict occurs).

**Morphogenesis connects biology to logic to music.** Coasellular morphogenesis, neural cellular automaton, logical morphogenesis, Chladni generator, lifesong, and self-sorted arrays all show pattern arising from process. The disciplines are biology, computation, logic, physics, music, and algorithms. The intellectual operation is identical.


### Comparison with Discipline-Based Categories

A discipline-based taxonomy (mathematics, physics, biology, economics, political science, psychology, computer science, neuroscience) would:

- Put "coasellular morphogenesis" under biology OR economics, losing the other
- Put "Hsp90 canalization" and "polity coalition attractors" in separate categories despite identical structure
- Create a "music" category with exactly 2 entries (lifesong, PLR harmony)
- Fail to capture why "debt singularity" and "bifurcation speciation" feel related
- Force artificial choices for cross-disciplinary playgrounds

The operation-based taxonomy resolves all five problems. Cross-disciplinary playgrounds get two operation labels that both accurately describe what they do. Structurally similar playgrounds from different fields cluster together. No category is too small because the operations are fundamental and recur across all fields.


### Implementation Considerations

The six operation labels work as filter chips. Each playground gets 1-2 labels. The UI uses multi-select: clicking "landscape" and "threshold" shows all playgrounds tagged with either (union). This composes with the existing date filter (AND): "landscape playgrounds from 2025."

The labels are short enough for filter chips: landscape, threshold, symmetry, morphogenesis, anatomy, tension.


## How the Three Dimensions Interact

Topics and operations form a 2D classification grid. Time adds a third axis. Each playground occupies a point in this space: it was created at a specific time, belongs to 1-3 disciplines, and performs 1-2 intellectual operations.

On the index page, filters compose as follows:
- **Within a dimension** (e.g., selecting both "landscape" and "threshold"): **union** — shows playgrounds tagged with either.
- **Across dimensions** (e.g., "biology" topic + "threshold" operation + "2025"): **intersection** — shows playgrounds matching all selected dimensions.

This means a query like "biology + threshold + 2025" returns biology playgrounds from 2025 where something flips — currently Hsp90 canalization and bifurcation speciation. The three dimensions are genuinely orthogonal: knowing a playground's topic tells you nothing about its operation, and neither tells you when it was made.


## Assigning Classification to a New Playground

When registering a new playground in `app/playgrounds/data.ts`:

### Step 1: Date

Use the current month: `"Month YYYY"` (e.g., `"February 2026"`). Place the directory in the matching route group: `app/playgrounds/(YYYY)/(MM)/playground-name/`.

### Step 2: Topics (1-3)

Ask: **"What field(s) is this in?"**

- Identify the discipline(s) where the playground's core mechanism and subject matter live.
- Choose from the 12 topics in the `TOPICS` constant.
- If genuinely cross-disciplinary, use 2-3. If primarily one field with a passing reference to another, use 1.

### Step 3: Operations (1-2)

Ask: **"What intellectual move does this playground make?"** — not "what field is it in?" (that was step 2).

- Read the six operation definitions above. Which one(s) describe what the playground *does*?
- Does it map a space? → **landscape**
- Does it find where behavior changes? → **threshold**
- Does it show what's preserved under transformation? → **symmetry**
- Does it show pattern emerging from process? → **morphogenesis**
- Does it take something apart to show how it works? → **anatomy**
- Does it show opposing forces? → **tension**
- Most playgrounds get 1-2. List the primary operation first.
- Consult the full mapping table above to see how similar playgrounds have been classified.
