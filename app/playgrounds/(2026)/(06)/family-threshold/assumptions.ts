import type { Assumption } from '@/components/AssumptionPanel';


export const assumptions: Assumption[] = [
    {
        id: 'pomdp-framing',
        statement:
            'a child-protection institution is modelled as a partially-observable markov decision process: the family state is hidden, observations are noisy, the institution maintains a belief, chooses an action, and the family transitions.',
        citation:
            'standard POMDP formulation in decision theory; child-welfare predictive risk modelling reviews (Saxena et al., 2020).',
        confidence: 'contested',
        falsifiability:
            'evidence that real caseworkers do not behave as approximate POMDP solvers, but as rule-followers or status protectors, would weaken the framing. true at a high level of abstraction, debated as a positive theory.',
    },
    {
        id: 'expected-loss-minimisation',
        statement:
            'the institution chooses each step\'s action by minimising a single weighted expected loss over child safety, separation harm, rights, instability, cultural misclassification, and lost repair opportunities.',
        citation:
            'a constrained-optimisation interpretation of child-welfare guidance; loosely after Bufdir and ECtHR jurisprudence.',
        confidence: 'speculative',
        falsifiability:
            'a child-welfare decision corpus where caseworker choices systematically depart from any plausible expected-loss minimisation would falsify the optimiser framing.',
    },
    {
        id: 'seven-dim-hidden-state',
        statement:
            'the hidden family state collapses to seven scalars: actual harm risk, caregiver capacity, attachment, family integrity, trust, cultural distance, poverty. adding more dimensions does not change the qualitative regime structure.',
        citation: 'a modelling commitment. matches the original ideation prompt.',
        confidence: 'speculative',
        falsifiability:
            'a population where the seven-dim collapse mis-predicts the regime distribution compared with a richer model would falsify this.',
    },
    {
        id: 'positive-and-negative-evidence',
        statement:
            'belief updates use both signals of harm and signals of safety (positive attachment, family cooperation). missing positive-attachment or cooperation observations themselves count as evidence toward harm.',
        citation:
            'reflects the way caseworker checklists treat the absence of positive signals; empirically this is how most child-welfare risk instruments work.',
        confidence: 'contested',
        falsifiability:
            'instruments that ignore positive evidence and only weight harm signals could be modelled by setting the positive-attachment / cooperation weights to zero; comparing outcomes is direct.',
    },
    {
        id: 'cultural-and-poverty-bias',
        statement:
            'cultural distance and poverty raise the visibility of suspicion-triggering observations without raising true harm risk. this is a real source of false positives in child-welfare systems.',
        citation:
            'after research on cultural-mismatch and poverty / neglect conflation; OsloMet and ECtHR analyses of Norway Barnevernet.',
        confidence: 'established',
        falsifiability:
            'longitudinal evidence that cultural distance / poverty causally raise true harm at the same rate they raise observed suspicion would weaken this. unlikely on current evidence.',
    },
    {
        id: 'path-dependence',
        statement:
            'removal reduces attachment, trust, and family integrity. the reduced attachment then becomes evidence for further separation. this loop is the main mechanism by which the institution can lock into rupture.',
        citation:
            'matches ECtHR criticism of Norway: most violations concern post-removal contact restrictions, weak reunification effort, and premature setting aside of family life.',
        confidence: 'established',
        falsifiability:
            'evidence that attachment scores are unchanged after extended care placements would weaken this. unlikely; standard attachment research supports it.',
    },
    {
        id: 'support-effectiveness',
        statement:
            'home-based support, when offered, raises caregiver capacity, trust, attachment, and family integrity while lowering harm risk. supportEffect is a real lever the institution can pull.',
        citation:
            'after evidence that voluntary in-home support reduces later care orders in scandinavian child welfare; Bufdir guidance on the hierarchy of measures.',
        confidence: 'established',
        falsifiability:
            'a regime in which support produces no improvement in caregiver capacity or harm risk would falsify the supportEffect dial.',
    },
    {
        id: 'deterministic-rng',
        statement:
            'the simulation is deterministic given (params, scenario): the rng is seeded. results are reproducible. a single seed is one path through the noise distribution, not the distribution.',
        citation: 'modelling commitment, matches the audience-attractor sibling playground.',
        confidence: 'established',
        falsifiability:
            'this is a feature, not a hypothesis. a multi-seed extension would give distributions instead of single-seed metrics.',
    },
    {
        id: 'no-rights-constraints',
        statement:
            'the model treats rights as a soft weight (rightsCost), not as a hard constraint. real child-welfare law allows removal only above a high evidentiary threshold and requires reunification work; the simulation does not enforce these as constraints.',
        citation:
            'after Norway Bufdir / Child Welfare Act and ECtHR jurisprudence; standard rights-based critiques of pure expected-utility approaches.',
        confidence: 'speculative',
        falsifiability:
            'extending the model with constraint-based rules and showing it produces meaningfully different policy choices would update this assumption.',
    },
    {
        id: 'platform-agnostic',
        statement:
            'the structure (hidden state, observations, belief, action, transition) is platform-agnostic. it applies to barnevernet, to the UK family court system, to US child protective services, and to refugee-children case work. the institution is calibrated by where it sets its weights, not by which country it is in.',
        citation:
            'after comparative child-welfare research; Munro (2008) on systemic vs procedural failures in UK child protection.',
        confidence: 'contested',
        falsifiability:
            'a setting where institutional design differences (e.g. mandatory family-group conferencing) systematically break the seven-dim collapse would localise the model.',
    },
];
