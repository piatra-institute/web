import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2026',
        description:
            'first cut. a two-field dynamical model of coalition formation: an exclusionary support share x and institutional trust t evolve under replicator dynamics with a perceived-threat feedback driven by seven parameters (stress, diversity, polarization, norms, contact, redistribution, elite opportunism). includes an interactive basin map, trajectory and phase-portrait views, a library of historical parameter presets, calibration of the deterministic core (fixed points, basin membership, threat saturation), and six assumptions that keep the mechanism apart from the illustrative presets.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2026',
        changes: [
            'state: two bounded fields, exclusionary share x and institutional trust t, both on [0, 1].',
            'dynamics: replicator update dx = dt * x(1-x)(piE - piI) plus a slow trust update; x = 0 and x = 1 are fixed points by construction.',
            'feedback: perceived threat as a clamped algebraic function of state and the seven parameters, with elite opportunism amplifying the existing exclusionary share.',
            'attractor classes: inclusive (x < 0.2), mixed (0.2 to 0.8), and exclusionary (x > 0.8), with a clickable basin map over initial conditions.',
            'presets: a library of historical regimes spanning ancient, nineteenth-century, and modern cases, set by hand to position each in parameter space.',
            'calibration: the deterministic, noise-free core is checked against boundary fixed points, inclusive and exclusionary basin membership, and threat saturation.',
            'framing kept honest: presets are illustrative parameter guesses, not data fits, and the calibration verifies only structural claims.',
        ],
    },
];
