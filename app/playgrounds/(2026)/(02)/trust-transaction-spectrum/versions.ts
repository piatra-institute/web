import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'February 2026',
        description:
            'first cut of the trust-transaction spectrum: a weighted-factor transactionality index for small states, drawing factor selection from balance-of-threat, shelter, hedging, and weaponised-interdependence theory. nine linear factors plus two compounding interaction terms and a convex autonomy adjustment, mapped to four posture regimes, with a crisis weight reallocation, scenario save and compare, deterministic calibration against analytic identities, eight assumptions, and a research companion that keeps the contested reputation claim honest.',
    },
];


export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'February 2026',
        changes: [
            'transactionality index T = 100 * (sum of nine weighted normalised factors + two interaction terms) minus a convex leverage penalty plus a linear leverage boost, clamped to [0, 100].',
            'interaction terms: threat times alliance deficit (Walt) and rivalry times shelter deficit (Thorhallsson), capturing compounding pressure a purely additive model misses.',
            'crisis regime reallocates weight mass toward institutional shelter deficit (+0.02) and away from reputational capital deficit (-0.03).',
            'four posture regimes at score cuts 25 / 45 / 65, each with tagged more / less policy knobs and conditional suggestion vectors.',
            'scenario save and compare, top contributors, stabiliser breakdown, and five necessary exit conditions for de-escalation toward rules-based engagement.',
            'calibration added: five analytic identities (deficit floor, saturation ceiling, midpoint balance, full-autonomy boost, institutionalist preset) reproduced exactly by the model, with no hardcoded predicted values.',
            'framing kept honest: the reputation factor is marked as taking a side in the Press / Mercer versus Weisiger / Yarhi-Milo dispute, weights and thresholds are flagged as elicited rather than estimated, and sanctions endogeneity is documented.',
        ],
    },
];
