import type { ModelVersion } from '@/components/VersionSelector';
import type { ChangelogEntry } from '@/components/ModelChangelog';


export const versions: ModelVersion[] = [
    {
        id: 'claude-v1',
        llm: 'claude opus 4.8',
        date: 'November 2024',
        description:
            'first cut. a grid of rotating cellular circles whose boundary points bargain with their neighbours, moving value at a transaction cost. cells use neighbours as distributed memory. the build adds a noise-free deterministic core (value conservation, neighbour-pair counting, transaction friction) so the model\'s Coasean invariants can be checked exactly, plus calibration, assumptions, and a research companion.',
    },
];

export const changelog: ChangelogEntry[] = [
    {
        version: 'v1.0',
        date: 'November 2024',
        changes: [
            'tissue model: a rows-by-columns grid of circles, each holding points (endowments) and an energy budget; circles rotate as a developmental clock that brings points into the boundary cone.',
            'transaction rule: adjacent boundary points pair up and move one unit of value from one cell to the other, charging both cells\' energy by the transaction cost.',
            'distributed memory: a cell\'s next state depends on the points it shares with its neighbours rather than on a private store.',
            'deterministic core extracted from the stochastic live run: neighbour-pair counting, total-value conservation, and per-transaction energy friction.',
            'calibration: five structural invariants computed from the deterministic core (value conservation, 3x3 and 2x2 pair counts, unit-cost friction, cumulative friction) checked against their exact Coasean targets.',
            'framing kept honest: the economic agent and rotation-clock readings are marked contested or speculative; only conservation and transaction-cost friction are claimed as established.',
        ],
    },
];
