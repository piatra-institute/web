# One more cat: capacity, thresholds, and the systems view of accumulation

## Abstract

A recurring cultural image is the household that somehow arrives at dozens or hundreds of cats. Asked as a question about character, it invites judgment and explains little. Asked as a question about a dynamical system, it becomes tractable: a household is a small managed population whose size is set month by month by an accept-or-refuse decision, a reproduction process, and a rehoming process, all coupled through a single scarce resource, the caregiver's capacity for care. This companion documents the model behind the playground. Its central claim is that welfare is governed by a care-load ratio, not by an absolute count, and that a small number of feedback loops, together with an attachment-driven asymmetry between accepting and surrendering, is enough to produce single-cat homes, stable pairs, informal rescues, managed sanctuaries, and accumulation crises from the same equations.

## Background

Three literatures meet in this toy. The first is feline behavior. Cats solicit care through vocal and physical signals, and there is acoustic evidence that the domestic purr can carry an embedded high-frequency cry that taps a general mammalian sensitivity to distress (McComb et al., 2009). Cats also form attachment bonds to their caregivers that resemble the secure and insecure patterns seen in human infants and dogs (Vitale et al., 2019). These two findings motivate two model channels: solicitation raises the benefit of accepting a cat, and attachment raises the cost of giving one up.

The second literature is population biology. Free-roaming domestic cats reproduce quickly; one field study estimated a mean of 1.4 litters per fertile female per year with a median of three kittens per litter, though with high kitten mortality (Nutter et al., 2004). The model uses these as an explicit anchor, then lets the user scale reproduction intensity, kitten survival, and the sterilized share. Crucially, sterilization reduces future inflow but never removes the cats already present, which is part of why accumulation is easy to enter and hard to exit.

The third literature is animal welfare and hoarding. Shelter medicine frames the operative constraint as capacity for care rather than headcount (Association of Shelter Veterinarians, Guidelines for Standards of Care in Animal Shelters). Hoarding case series consistently report large populations coincident with failed care and impaired caregiver insight, with median counts on the order of tens of animals (Patronek, 1999; Tamimi et al., 2024) and a recognizable clinical picture across studies (Stumpf et al., 2023). Multi-cat density is itself a plausible stressor (Ramos et al., 2013). The model treats these as informing where a capacity threshold sits, not as defining a count above which a household is pathological.

## The model

### State

The household holds a cat count that updates monthly:

`n(t+1) = n(t) + accepted arrivals + births - rehomed - permanent exits`

The simulation runs in two modes. In the expected mode the flows are fractional means, giving a smooth deterministic trajectory. In the stochastic mode the same means parameterize integer random draws (Poisson for arrivals and births, binomial for acceptance), and an ensemble mode repeats the stochastic run two hundred times to produce quantile bands and event probabilities.

### The care-load ratio

The quantity that decides welfare is

`rho = required care load / effective care capacity`

Required load has a routinizable part with limited economies of scale, an irreducibly individual monitoring part, and multipliers that grow super-linearly once density, monitoring demand, or prior overload pass their thresholds. Effective capacity starts from a baseline cat-equivalent capacity and is raised modestly by organizational maturity and external support. When rho is below one there is slack; when it climbs above one, monitoring fails, disease is caught late, and the additional burden feeds back as still more load. The welfare and strain indices are built from care, space, monitoring, and disease adequacy. They are deliberately visible proxies rather than validated instruments.

### The one-more-cat decision

Each month the caregiver either accepts or refuses the next presented cat with probability

`P(accept) = logistic[2.7 (benefit - perceived cost)]`

Benefit combines a baseline caregiving pull, companionship and practical utility that is strongest for the very first cat, a second-cat bonus, rescue identity, direct solicitation, and a reputation term at larger counts. Actual marginal cost combines baseline friction, the increase in care load from one more cat, first-cat setup, existing overload, and density pressure, with a discount for the second cat. Perceived cost then departs from actual cost: habituation and cost underestimation pull it down ("one more bowl is cheap"), while recognized overload and intake discipline push it up. A sufficiently organized caregiver can impose an intake gate that closes before full overload.

### Referrals, rehoming, and hysteresis

Arrival opportunities are not fixed. When rescue identity and social referral feedback are both high, opportunities scale with the current population: a person known to take cats in is sent more cats. Rehoming depends on raw placement throughput, organizational and external networks, recognized overload, and a chaos penalty at severe overload, all gated by an attachment-driven surrender barrier. That barrier is the source of hysteresis. Refusing an unknown cat and relinquishing a named, attached cat are not symmetric acts, so the population resists falling even when the caregiver would prefer it to shrink.

## Regimes and thresholds

The model classifies the end state into regimes that are distinguished by the care-load ratio and organization, not by count alone.

| Regime | Rough signature |
| --- | --- |
| single / pair | small count, rho well below 1 |
| stable multi-cat | up to a handful, rho below 1 |
| rescue network | seven or more, still rho below 1 |
| managed sanctuary | twenty or more with high organization, rho below 1 |
| capacity overload | rho at or just above 1, little reserve |
| accumulation crisis | rho well above 1 or welfare collapsed |

The threshold scanner sweeps any single parameter across its range and reports where final population, peak load, and minimum welfare cross their landmarks, and it flags the largest cliff, the point of steepest change. The phase map does the same in two dimensions, coloring a grid of full simulations by regime or by a chosen metric. Together they show that the interesting behavior is rarely a smooth gradient; it is a set of relatively sharp boundaries between qualitatively different outcomes.

## Interventions

The intervention lab switches on a timed policy at a chosen month: added sterilization, added rehoming throughput, added capacity, and a stronger intake gate. The playground overlays a no-intervention counterfactual so the effect is legible. The general lesson, visible by moving the intervention month later and later, is that the same policy bends the curve far more when applied early. Once reproduction and referral feedback have driven the population up and attachment has locked it in, the same effort recovers much less. This is the practical face of the hysteresis built into the rehoming process.

## Limitations

This is a hypothesis generator, not a fitted predictive model, and not a diagnostic instrument.

- The coefficients are transparent modeling choices, not effects estimated from a population.
- The reproduction rate is anchored to a free-roaming study and should not be read as a universal household rate.
- Welfare and strain are proxies with no validated scale behind them.
- A single stochastic run is one sample; only the ensemble mode speaks to distributions, and even then only within the model's own assumptions.
- Solicitation is modeled as an influence on human decisions, not as conscious deception by the cat.

Most importantly, a high cat count is not by itself evidence of hoarding. Hoarding, in the clinical literature, is defined by failed care and impaired insight, not by number. The model mirrors that by sending organized high-count trajectories to a sanctuary regime rather than a crisis. Reading any high-count run as pathological would be a misuse of the toy.

## Calibration

Because the model is not fitted to data, the calibration panel does not claim empirical accuracy. It verifies that the engine reproduces the identities and the one literature rate it is supposed to encode: that an empty household has zero load, that effective capacity collapses to baseline when organization and support are zero, that the acceptance logistic passes through one half at indifference, that fertile-female and birth arithmetic are correct, that full sterilization removes all births, that the reproduction anchor evaluates to 4.2 surviving kittens per fertile female per year, and that the pairwise-relationship count behind the monitoring term is combinatorially correct. Agreement confirms the implementation, which is the honest limit of self-verification for a model of this kind.

## References

- McComb K, Taylor AM, Wilson C, Charlton BD. The cry embedded within the purr. Current Biology, 2009. DOI: 10.1016/j.cub.2009.05.033.
- Vitale KR, Behnke AC, Udell MAR. Attachment bonds between domestic cats and humans. Current Biology, 2019. DOI: 10.1016/j.cub.2019.08.036.
- Nutter FB, Levine JF, Stoskopf MK. Reproductive capacity of free-roaming domestic cats and kitten survival rate. JAVMA, 2004. PMID: 15552315.
- Ramos D, et al. Are cats from multi-cat households more stressed? Physiology and Behavior, 2013. PMID: 24021924.
- Patronek GJ. Hoarding of animals: an under-recognized public health problem. Public Health Reports, 1999. PMID: 9925176. Full text: https://pmc.ncbi.nlm.nih.gov/articles/PMC1308348/
- Stumpf BP, et al. Animal hoarding: a systematic review. Brazilian Journal of Psychiatry, 2023. DOI: 10.47626/1516-4446-2022-3003.
- Tamimi B, et al. A retrospective study of cat hoarding cases. Journal of Shelter Medicine and Community Animal Health, 2024. DOI: 10.56771/jsmcah.v3.92.
- Association of Shelter Veterinarians. Guidelines for Standards of Care in Animal Shelters, second edition.
