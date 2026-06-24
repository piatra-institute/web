import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'June 2025',
        description:
            'phase-diagram playground for the real value of debt. an affine annual balance map B_{t+1} = (1 + r) B_t - P deflated by inflation, an interactive interest-vs-inflation phase plane whose diagonal r = i is the asset / liability boundary, six historical scenarios (Weimar, Volcker, post-WWII repression, Japan, ZIRP, 2022), closed-form helpers for the balance, fixed point, real value, and half-life, calibration that checks the iterative simulator against those closed forms, six assumptions, and a research companion.',
    },
];


export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'June 2025',
        changes: [
            'core model: annual affine balance map B_{t+1} = (1 + r) B_t - P, with the real value deflated by (1 + i)^t.',
            'phase plane: the interest-vs-inflation grid coloured by the sign of the real interest rate, with the diagonal r = i as the asset / liability boundary and a draggable marker.',
            'real value of debt charted over the chosen horizon, coloured green (decaying) or red (growing).',
            'six historical scenarios mapping real episodes onto representative (interest, inflation) pairs, with an inflation cap of 50% for scale.',
            'closed-form helpers added (nominal balance, nominal fixed point, real value, real half-life) so the iterative simulator can be checked analytically.',
            'calibration verifies the year-by-year loop against the closed forms (five cases, all exact), plus six labelled assumptions and a research companion page.',
        ],
    },
];
