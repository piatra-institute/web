import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'March 2026',
        description:
            'first cut. builds the proto-metabolic threshold sandbox around the Lane hydrothermal-vent hypothesis: molecules are assigned roles, scattered across vent pores, and checked for a minimal four-edge Lane motif. exposes the closed-form expected-count law mu = p_A p_C p_B N^3 q^-2 lambda^4, a Monte-Carlo probability curve, log-log threshold fitting, a witness-compartment draw, calibration of the deterministic core against its own combinatorial derivation, six assumptions, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'March 2026',
        changes: [
            'role model: each molecule is an activator A, catalyst C or boundary precursor B with tunable probabilities, placed uniformly across q vent-pore compartments.',
            'motif rule: a compartment closes a proto-core when it holds at least one A, one C and one B and all four catalytic edges fire, each edge succeeding with probability lambda.',
            'closed-form core: expected motif count mu = p_A p_C p_B (N^3 / q^2) lambda^4, derived from independent role assignment and independent placement.',
            'Monte-Carlo estimator: ensemble probability curve P(H_L) vs N for several lambda values, with a seeded mulberry32 generator for reproducibility.',
            'threshold analysis: N* read off where P crosses a target probability, then a log-log power-law fit recovering the N* ~ lambda^(-4/3) scaling.',
            'witness draw: a single successful compartment configuration is surfaced so the abstract motif is made concrete.',
            'calibration: the deterministic mu function is checked case-by-case against a hand-written re-derivation, plus the cubic-in-N and lambda^(-4/3) scaling exponents.',
            'scope kept honest: no stoichiometry, energetics or kinetics; the model quantifies the sharpness of the possible-to-likely transition, not the chemistry.',
        ],
    },
];
